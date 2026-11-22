
from __future__ import annotations

import hashlib
import os
import re
import sys
from pathlib import Path

import psycopg

from app.config import ConfigurationError, validate_database_url


AI_SCHEMA = "ai_private"
EXPECTED_ROLE = "dds_ai_migrator"

# Stable PostgreSQL advisory-lock key for this migration system.
LOCK_KEY_1 = 73421
LOCK_KEY_2 = 1

MIGRATIONS_DIR = Path(__file__).resolve().parents[1] / "migrations"
MIGRATION_PATTERN = re.compile(r"^(\d{3,})_([a-z0-9_]+)\.sql$")



def discover_migrations() -> list[tuple[str, str, Path]]:
    migrations = []
    seen_versions = set()

    for path in MIGRATIONS_DIR.glob("*.sql"):
        match = MIGRATION_PATTERN.fullmatch(path.name)

        if not match:
            raise RuntimeError(f"Invalid migration filename: {path.name}")

        version, name = match.groups()

        if version in seen_versions:
            raise RuntimeError(f"Duplicate migration version: {version}")

        seen_versions.add(version)
        migrations.append((version, name, path))

    migrations.sort(key=lambda item: int(item[0]))

    return migrations

def file_checksum(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_migration_permissions(cursor) -> None:
    cursor.execute("SELECT current_user")
    current_user = cursor.fetchone()[0]
    if current_user != EXPECTED_ROLE:
        raise RuntimeError(
            f"Expected database role '{EXPECTED_ROLE}', "
            f"connected as '{current_user}'."
        )
    cursor.execute(
        "SELECT has_schema_privilege(current_user, %s, 'USAGE'), "
        "has_schema_privilege(current_user, %s, 'CREATE')",
        (AI_SCHEMA, AI_SCHEMA),
    )
    has_usage, has_create = cursor.fetchone()
    if not (has_usage and has_create):
        raise RuntimeError(
            f"Database role '{EXPECTED_ROLE}' lacks required privileges "
            f"on {AI_SCHEMA}."
        )


def main() -> int:
    try:
        database_url = validate_database_url(
            os.getenv("AI_MIGRATOR_DATABASE_URL"),
            "AI_MIGRATOR_DATABASE_URL",
            os.getenv("APP_ENV", "development").lower() == "production",
        )
    except ConfigurationError as error:
        print(f"ERROR: {error}")
        return 1

    if not MIGRATIONS_DIR.is_dir():
        print(f"ERROR: Migration directory not found: {MIGRATIONS_DIR}")
        return 1

    try:
        migrations = discover_migrations()

        with psycopg.connect(
            database_url,
            connect_timeout=10,
            autocommit=True,
        ) as connection:

            with connection.cursor() as cursor:
                verify_migration_permissions(cursor)

                cursor.execute(
                    "SELECT pg_advisory_lock(%s, %s)",
                    (LOCK_KEY_1, LOCK_KEY_2),
                )

                try:
                    with connection.transaction():
                        cursor.execute(
                            """
                            CREATE TABLE IF NOT EXISTS
                                ai_private.schema_migrations (
                                    version TEXT PRIMARY KEY,
                                    name TEXT NOT NULL,
                                    checksum CHAR(64) NOT NULL,
                                    applied_at TIMESTAMPTZ NOT NULL
                                        DEFAULT NOW()
                                )
                            """
                        )

                    cursor.execute(
                        """
                        SELECT version, checksum
                        FROM ai_private.schema_migrations
                        """
                    )
                    applied = dict(cursor.fetchall())

                    pending_count = 0

                    for version, name, path in migrations:
                        checksum = file_checksum(path)

                        if version in applied:
                            if applied[version].strip() != checksum:
                                raise RuntimeError(
                                    f"Migration {version} was modified "
                                    "after it was applied."
                                )

                            print(f"Already applied: {path.name}")
                            continue

                        sql = path.read_text(encoding="utf-8").strip()

                        if not sql:
                            raise RuntimeError(
                                f"Migration is empty: {path.name}"
                            )

                        with connection.transaction():
                            cursor.execute(sql, prepare=False)

                            cursor.execute(
                                """
                                INSERT INTO ai_private.schema_migrations
                                    (version, name, checksum)
                                VALUES (%s, %s, %s)
                                """,
                                (version, name, checksum),
                            )

                        pending_count += 1
                        print(f"Applied: {path.name}")

                    if pending_count == 0:
                        print("No pending migrations.")

                    print(
                        f"Migration check complete. "
                        f"{pending_count} migration(s) applied."
                    )

                finally:
                    cursor.execute(
                        "SELECT pg_advisory_unlock(%s, %s)",
                        (LOCK_KEY_1, LOCK_KEY_2),
                    )

        return 0

    except Exception as error:
        print(f"Migration failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

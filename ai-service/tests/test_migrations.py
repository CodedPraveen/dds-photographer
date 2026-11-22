
from pathlib import Path
import importlib.util

import pytest


SCRIPT_PATH = (
    Path(__file__).resolve().parents[1]
    / "scripts"
    / "migrate.py"
)

spec = importlib.util.spec_from_file_location(
    "migration_runner",
    SCRIPT_PATH,
)
migration_runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(migration_runner)


def test_migrations_are_sorted_numerically(tmp_path, monkeypatch):
    (tmp_path / "999_last.sql").write_text("SELECT 1;")
    (tmp_path / "1000_next.sql").write_text("SELECT 2;")
    (tmp_path / "001_first.sql").write_text("SELECT 3;")

    monkeypatch.setattr(
        migration_runner,
        "MIGRATIONS_DIR",
        tmp_path,
    )

    migrations = migration_runner.discover_migrations()

    versions = [item[0] for item in migrations]

    assert versions == ["001", "999", "1000"]


def test_duplicate_migration_versions_are_rejected(
    tmp_path,
    monkeypatch,
):
    (tmp_path / "001_first.sql").write_text("SELECT 1;")
    (tmp_path / "001_second.sql").write_text("SELECT 2;")

    monkeypatch.setattr(
        migration_runner,
        "MIGRATIONS_DIR",
        tmp_path,
    )

    with pytest.raises(RuntimeError, match="Duplicate migration version"):
        migration_runner.discover_migrations()


def test_checksum_changes_when_migration_file_changes(tmp_path):
    migration_file = tmp_path / "001_test.sql"

    migration_file.write_text("SELECT 1;")
    original_checksum = migration_runner.file_checksum(
        migration_file
    )

    migration_file.write_text("SELECT 2;")
    updated_checksum = migration_runner.file_checksum(
        migration_file
    )

    assert original_checksum != updated_checksum


def test_checksum_is_stable_for_unchanged_file(tmp_path):
    migration_file = tmp_path / "001_test.sql"
    migration_file.write_text("SELECT 1;")

    first_checksum = migration_runner.file_checksum(
        migration_file
    )
    second_checksum = migration_runner.file_checksum(
        migration_file
    )

    assert first_checksum == second_checksum


class FakeCursor:
    def __init__(self, role, privileges):
        self.role = role
        self.privileges = privileges
        self.calls = 0

    def execute(self, *_args):
        self.calls += 1

    def fetchone(self):
        return self.privileges


def test_migration_role_is_required():
    with pytest.raises(RuntimeError, match="Expected database role"):
        migration_runner.verify_migration_permissions(
            FakeCursor("postgres", ("postgres", False, False, False, False, False, 0, True, True))
        )


def test_migration_schema_privileges_are_required():
    with pytest.raises(RuntimeError, match="lacks required privileges"):
        migration_runner.verify_migration_permissions(
            FakeCursor("dds_ai_migrator", ("dds_ai_migrator", False, False, False, False, False, 0, True, False))
        )


def test_runtime_role_and_create_privileges_are_rejected(monkeypatch):
    from app import config
    from app.db.connection import verify_runtime_database

    monkeypatch.setattr(config.settings, "AI_RUNTIME_DATABASE_ROLE", "dds_ai_runtime")
    with pytest.raises(RuntimeError, match="Unexpected runtime"):
        verify_runtime_database(
            FakeCursor("postgres", ("postgres", False, False, False, False, False, 0, True, False))
        )
    with pytest.raises(RuntimeError, match="invalid ai_private"):
        verify_runtime_database(
            FakeCursor("dds_ai_runtime", ("dds_ai_runtime", False, False, False, False, False, 0, True, True))
        )

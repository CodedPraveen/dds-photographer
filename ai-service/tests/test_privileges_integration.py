import os
import uuid

import pytest
import psycopg
from psycopg import sql

from app.db.connection import verify_database_isolation


TEST_DATABASE_URL = os.getenv("AI_TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(
    not TEST_DATABASE_URL,
    reason="AI_TEST_DATABASE_URL is not configured for PostgreSQL integration tests",
)


def test_restricted_roles_have_effective_ai_private_boundary():
    suffix = uuid.uuid4().hex[:10]
    runtime = f"ai_runtime_test_{suffix}"
    migrator = f"ai_migrator_test_{suffix}"
    elevated = f"ai_elevated_test_{suffix}"
    outside_writer = f"ai_writer_test_{suffix}"
    ai_schema = f"ai_private_test_{suffix}"
    outside_schema = f"app_private_test_{suffix}"
    created_roles = []
    created_schemas = []

    with psycopg.connect(TEST_DATABASE_URL, autocommit=True) as connection:
        try:
            with connection.cursor() as cursor:
                for role, definition in (
                    (runtime, "NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT"),
                    (migrator, "NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT"),
                    (elevated, "NOLOGIN NOSUPERUSER CREATEDB NOCREATEROLE INHERIT"),
                    (outside_writer, "NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT"),
                ):
                    cursor.execute(
                        sql.SQL("CREATE ROLE {} " + definition).format(
                            sql.Identifier(role)
                        )
                    )
                    created_roles.append(role)
                for schema in (ai_schema, outside_schema):
                    cursor.execute(
                        sql.SQL("CREATE SCHEMA {} AUTHORIZATION CURRENT_USER").format(
                            sql.Identifier(schema)
                        )
                    )
                    created_schemas.append(schema)
                cursor.execute(sql.SQL("GRANT USAGE ON SCHEMA {} TO {}").format(sql.Identifier(ai_schema), sql.Identifier(runtime)))
                cursor.execute(sql.SQL("GRANT USAGE, CREATE ON SCHEMA {} TO {}").format(sql.Identifier(ai_schema), sql.Identifier(migrator)))
                cursor.execute(sql.SQL("GRANT CREATE ON SCHEMA {} TO {}").format(sql.Identifier(outside_schema), sql.Identifier(outside_writer)))

                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(runtime)))
                verify_database_isolation(cursor, runtime, False, ai_schema)
                cursor.execute("RESET ROLE")
                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(migrator)))
                verify_database_isolation(cursor, migrator, True, ai_schema)
                cursor.execute("RESET ROLE")

                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(runtime)))
                with pytest.raises(psycopg.errors.InsufficientPrivilege):
                    cursor.execute(sql.SQL("CREATE TABLE {}.blocked (id integer)").format(sql.Identifier(outside_schema)))
                cursor.execute("RESET ROLE")
                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(runtime)))
                verify_database_isolation(cursor, runtime, False, ai_schema)
                cursor.execute("RESET ROLE")

                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(migrator)))
                with pytest.raises(psycopg.errors.InsufficientPrivilege):
                    cursor.execute(sql.SQL("CREATE TABLE {}.blocked (id integer)").format(sql.Identifier(outside_schema)))
                cursor.execute("RESET ROLE")
                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(migrator)))
                verify_database_isolation(cursor, migrator, True, ai_schema)
                cursor.execute("RESET ROLE")

                cursor.execute(sql.SQL("GRANT {} TO {}").format(sql.Identifier(elevated), sql.Identifier(runtime)))
                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(runtime)))
                with pytest.raises(RuntimeError):
                    verify_database_isolation(cursor, runtime, False, ai_schema)
                cursor.execute("RESET ROLE")

                cursor.execute(sql.SQL("GRANT {} TO {}").format(sql.Identifier(outside_writer), sql.Identifier(runtime)))
                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(runtime)))
                with pytest.raises(RuntimeError):
                    verify_database_isolation(cursor, runtime, False, ai_schema)
                cursor.execute("RESET ROLE")
                cursor.execute(sql.SQL("GRANT {} TO {}").format(sql.Identifier(outside_writer), sql.Identifier(migrator)))
                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(migrator)))
                with pytest.raises(RuntimeError):
                    verify_database_isolation(cursor, migrator, True, ai_schema)
                cursor.execute("RESET ROLE")
        finally:
            with connection.cursor() as cursor:
                def cleanup(statement):
                    try:
                        cursor.execute(statement)
                    except psycopg.Error:
                        pass

                cleanup("RESET ROLE")
                memberships = (
                    (elevated, runtime),
                    (outside_writer, runtime),
                    (outside_writer, migrator),
                )
                for member, recipient in memberships:
                    if member in created_roles and recipient in created_roles:
                        cleanup(
                            sql.SQL("REVOKE {} FROM {}").format(
                                sql.Identifier(member), sql.Identifier(recipient)
                            )
                        )
                for schema in reversed(created_schemas):
                    cleanup(
                        sql.SQL("DROP SCHEMA {} CASCADE").format(
                            sql.Identifier(schema)
                        )
                    )
                for role in reversed(created_roles):
                    cleanup(
                        sql.SQL("DROP ROLE IF EXISTS {}").format(
                            sql.Identifier(role)
                        )
                    )

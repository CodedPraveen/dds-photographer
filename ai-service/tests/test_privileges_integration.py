import os
import uuid

import pytest
import psycopg
from psycopg import sql

from app.db.connection import verify_database_isolation


TEST_DATABASE_URL = os.getenv("AI_TEST_DATABASE_URL")


def raise_test_and_cleanup_errors(original_error, cleanup_failures):
    if original_error is not None and cleanup_failures:
        raise BaseExceptionGroup(
            "integration test and cleanup failed",
            [original_error, *cleanup_failures],
        )
    if cleanup_failures:
        raise BaseExceptionGroup("integration test cleanup failed", cleanup_failures)
    if original_error is not None:
        raise original_error


def cleanup_test_resources(cursor, created_roles, created_schemas):
    failures = []

    def cleanup(label, statement):
        try:
            cursor.execute(statement)
        except Exception as error:
            failures.append(RuntimeError(f"cleanup failed for {label}: {error}"))

    cleanup("RESET ROLE", "RESET ROLE")
    memberships = (
        ("elevated -> runtime", "ai_elevated_test_", "ai_runtime_test_"),
        ("outside-writer -> runtime", "ai_writer_test_", "ai_runtime_test_"),
        ("outside-writer -> migration", "ai_writer_test_", "ai_migrator_test_"),
        ("view-writer -> runtime", "ai_view_writer_test_", "ai_runtime_test_"),
        ("view-writer -> migration", "ai_view_writer_test_", "ai_migrator_test_"),
    )
    for label, member_prefix, recipient_prefix in memberships:
        member = next((role for role in created_roles if role.startswith(member_prefix)), None)
        recipient = next((role for role in created_roles if role.startswith(recipient_prefix)), None)
        if member and recipient:
            cleanup(
                label,
                sql.SQL("REVOKE {} FROM {}").format(
                    sql.Identifier(member), sql.Identifier(recipient)
                ),
            )
    for schema in reversed(created_schemas):
        cleanup(
            f"drop schema {schema}",
            sql.SQL("DROP SCHEMA {} CASCADE").format(sql.Identifier(schema)),
        )
    for role in reversed(created_roles):
        cleanup(
            f"drop role {role}",
            sql.SQL("DROP ROLE IF EXISTS {}").format(sql.Identifier(role)),
        )
    return failures


class FailingCleanupCursor:
    def __init__(self):
        self.calls = []

    def execute(self, statement):
        self.calls.append(statement)
        raise RuntimeError("synthetic cleanup failure")


def test_cleanup_reports_failures_and_continues():
    cursor = FailingCleanupCursor()
    failures = cleanup_test_resources(
        cursor,
        ["ai_runtime_test_x", "ai_migrator_test_x", "ai_elevated_test_x", "ai_writer_test_x"],
        ["ai_private_test_x", "app_private_test_x"],
    )
    assert len(failures) == len(cursor.calls)
    assert len(failures) >= 7
    assert any("RESET ROLE" in str(failure) for failure in failures)
    assert any("drop schema" in str(failure) for failure in failures)
    assert any("drop role" in str(failure) for failure in failures)


def test_exception_group_preserves_original_and_cleanup_failures():
    original = ValueError("original test failure")
    cleanup_failures = [RuntimeError("cleanup failure 1"), RuntimeError("cleanup failure 2")]

    with pytest.raises(BaseExceptionGroup) as raised:
        raise_test_and_cleanup_errors(original, cleanup_failures)

    assert list(raised.value.exceptions) == [original, *cleanup_failures]


def test_base_exception_group_preserves_system_exit_and_cleanup_failures():
    original = KeyboardInterrupt()
    cleanup_failures = [RuntimeError("cleanup failure")]

    with pytest.raises(BaseExceptionGroup) as raised:
        raise_test_and_cleanup_errors(original, cleanup_failures)

    assert isinstance(raised.value.exceptions[0], KeyboardInterrupt)
    assert raised.value.exceptions[1:] == tuple(cleanup_failures)


@pytest.mark.skipif(
    not TEST_DATABASE_URL,
    reason="AI_TEST_DATABASE_URL is not configured for PostgreSQL integration tests",
)
def test_restricted_roles_have_effective_ai_private_boundary():
    suffix = uuid.uuid4().hex[:10]
    runtime = f"ai_runtime_test_{suffix}"
    migrator = f"ai_migrator_test_{suffix}"
    elevated = f"ai_elevated_test_{suffix}"
    outside_writer = f"ai_writer_test_{suffix}"
    view_writer = f"ai_view_writer_test_{suffix}"
    ai_schema = f"ai_private_test_{suffix}"
    outside_schema = f"app_private_test_{suffix}"
    created_roles = []
    created_schemas = []

    with psycopg.connect(TEST_DATABASE_URL, autocommit=True) as connection:
        original_error = None
        try:
            with connection.cursor() as cursor:
                for role, definition in (
                    (runtime, "NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT"),
                    (migrator, "NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT"),
                    (elevated, "NOLOGIN NOSUPERUSER CREATEDB NOCREATEROLE INHERIT"),
                    (outside_writer, "NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT"),
                    (view_writer, "NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT"),
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
                cursor.execute(sql.SQL("CREATE TABLE {}.view_base (id integer, value integer)").format(sql.Identifier(outside_schema)))
                cursor.execute(sql.SQL("CREATE VIEW {}.updatable_view AS SELECT id, value FROM {}.view_base").format(sql.Identifier(outside_schema), sql.Identifier(outside_schema)))
                cursor.execute(sql.SQL("GRANT UPDATE ON TABLE {}.updatable_view TO {}").format(sql.Identifier(outside_schema), sql.Identifier(view_writer)))

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
                cursor.execute(sql.SQL("GRANT {} TO {}").format(sql.Identifier(view_writer), sql.Identifier(runtime)))
                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(runtime)))
                with pytest.raises(RuntimeError):
                    verify_database_isolation(cursor, runtime, False, ai_schema)
                cursor.execute("RESET ROLE")
                cursor.execute(sql.SQL("GRANT {} TO {}").format(sql.Identifier(view_writer), sql.Identifier(migrator)))
                cursor.execute(sql.SQL("SET ROLE {}").format(sql.Identifier(migrator)))
                with pytest.raises(RuntimeError):
                    verify_database_isolation(cursor, migrator, True, ai_schema)
                cursor.execute("RESET ROLE")
        except Exception as error:
            original_error = error
        finally:
            cleanup_failures = []
            try:
                with connection.cursor() as cursor:
                    cleanup_failures = cleanup_test_resources(
                        cursor, created_roles, created_schemas
                    )
            except Exception as error:
                cleanup_failures.append(
                    RuntimeError(f"cleanup cursor setup failed: {error}")
                )
            raise_test_and_cleanup_errors(original_error, cleanup_failures)

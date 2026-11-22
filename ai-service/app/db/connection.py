import psycopg

from app.config import ConfigurationError, settings


def verify_database_isolation(
    cursor,
    expected_role: str,
    require_ai_create: bool,
    approved_schema: str = "ai_private",
) -> None:
    cursor.execute(
        "WITH RECURSIVE effective_roles(oid) AS ("
        "SELECT oid FROM pg_roles WHERE rolname = current_user "
        "UNION SELECT m.roleid FROM pg_auth_members m "
        "JOIN effective_roles e ON e.oid = m.member) "
        "SELECT current_user, r.rolsuper, r.rolcreaterole, r.rolcreatedb, "
        "r.rolbypassrls, has_database_privilege(current_user, current_database(), 'CREATE'), "
        "has_database_privilege(current_user, current_database(), 'TEMP'), "
        "(SELECT COUNT(*) FROM effective_roles e JOIN pg_roles er ON er.oid = e.oid "
        "WHERE e.oid <> r.oid AND (er.rolsuper OR er.rolcreaterole OR er.rolcreatedb OR er.rolbypassrls)), "
        "(SELECT COUNT(*) FROM pg_namespace n "
        "WHERE n.nspname NOT IN (%s, 'pg_catalog', 'information_schema') "
        "AND (n.nspowner IN (SELECT oid FROM effective_roles) "
        "OR has_schema_privilege(current_user, n.oid, 'CREATE'))), "
        "(SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace "
        "WHERE n.nspname NOT IN (%s, 'pg_catalog', 'information_schema') "
        "AND c.relkind IN ('r', 'p', 'v', 'f', 'm') "
        "AND (c.relowner IN (SELECT oid FROM effective_roles) "
        "OR has_table_privilege(current_user, c.oid, 'INSERT') "
        "OR has_table_privilege(current_user, c.oid, 'UPDATE') "
        "OR has_table_privilege(current_user, c.oid, 'DELETE') "
        "OR has_table_privilege(current_user, c.oid, 'TRUNCATE') "
        "OR has_table_privilege(current_user, c.oid, 'REFERENCES'))), "
        "(SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace "
        "WHERE n.nspname NOT IN (%s, 'pg_catalog', 'information_schema') "
        "AND c.relkind = 'S' AND (c.relowner IN (SELECT oid FROM effective_roles) "
        "OR has_sequence_privilege(current_user, c.oid, 'USAGE') "
        "OR has_sequence_privilege(current_user, c.oid, 'UPDATE'))), "
        "has_schema_privilege(current_user, %s, 'USAGE'), "
        "has_schema_privilege(current_user, %s, 'CREATE') "
        "FROM pg_roles r WHERE r.rolname = current_user",
        (approved_schema, approved_schema, approved_schema, approved_schema, approved_schema),
    )
    (
        current_user, is_superuser, can_create_role, can_create_db, bypass_rls,
        can_create_database, can_create_temp, elevated_members, outside_schema_access,
        outside_table_access, outside_other_access, has_usage, has_create,
    ) = cursor.fetchone()
    if current_user != expected_role:
        raise RuntimeError("Unexpected database role")
    if any((is_superuser, can_create_role, can_create_db, bypass_rls,
            can_create_database, can_create_temp, elevated_members,
            outside_schema_access, outside_table_access, outside_other_access)):
        raise RuntimeError("Database role has effective privileges outside ai_private")
    if not has_usage or has_create != require_ai_create:
        raise RuntimeError(f"Database role has invalid {approved_schema} privileges")


def verify_runtime_database(cursor) -> None:
    verify_database_isolation(cursor, settings.AI_RUNTIME_DATABASE_ROLE, False, "ai_private")


def check_database_connection() -> bool:
    try:
        database_url = settings.database_url()
    except ConfigurationError as error:
        raise RuntimeError(str(error)) from error

    with psycopg.connect(
        database_url,
        connect_timeout=5,
    ) as connection:
        with connection.cursor() as cursor:
            verify_runtime_database(cursor)
            return True

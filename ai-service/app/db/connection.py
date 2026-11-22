import psycopg

from app.config import ConfigurationError, settings


def verify_runtime_database(cursor) -> None:
    cursor.execute(
        "SELECT current_user, rolsuper, rolcreaterole, rolcreatedb, "
        "rolbypassrls, has_database_privilege(current_user, current_database(), 'CREATE'), "
        "COUNT(*) FILTER (WHERE n.nspname NOT IN ('ai_private', 'pg_catalog', "
        "'information_schema') AND has_schema_privilege(current_user, n.oid, 'CREATE')), "
        "has_schema_privilege(current_user, 'ai_private', 'USAGE'), "
        "has_schema_privilege(current_user, 'ai_private', 'CREATE') "
        "FROM pg_roles r CROSS JOIN pg_namespace n "
        "WHERE r.rolname = current_user GROUP BY current_user, rolsuper, "
        "rolcreaterole, rolcreatedb, rolbypassrls"
    )
    current_user, is_superuser, can_create_role, can_create_db, bypass_rls, can_create_database, outside_create, has_usage, has_create = cursor.fetchone()
    if current_user != settings.AI_RUNTIME_DATABASE_ROLE:
        raise RuntimeError("Unexpected runtime database role")
    if any((is_superuser, can_create_role, can_create_db, bypass_rls, can_create_database, outside_create)) or not has_usage or has_create:
        raise RuntimeError("Runtime database role has invalid ai_private privileges")


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

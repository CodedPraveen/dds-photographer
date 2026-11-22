import psycopg

from app.config import ConfigurationError, settings


def verify_runtime_database(cursor) -> None:
    cursor.execute(
        "SELECT current_user, "
        "has_schema_privilege(current_user, 'ai_private', 'USAGE'), "
        "has_schema_privilege(current_user, 'ai_private', 'CREATE')"
    )
    current_user, has_usage, has_create = cursor.fetchone()
    if current_user != settings.AI_RUNTIME_DATABASE_ROLE:
        raise RuntimeError("Unexpected runtime database role")
    if not has_usage or has_create:
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

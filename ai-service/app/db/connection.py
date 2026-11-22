import psycopg

from app.config import settings


def check_database_connection() -> bool:
    if not settings.AI_DATABASE_URL:
        raise RuntimeError("AI_DATABASE_URL is not configured")

    with psycopg.connect(
        settings.AI_DATABASE_URL,
        connect_timeout=5,
    ) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            return cursor.fetchone()[0] == 1
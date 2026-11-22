import os
from urllib.parse import parse_qs, urlsplit


class ConfigurationError(ValueError):
    """Raised when a database configuration value is unsafe or invalid."""


def validate_database_url(value: str | None, name: str, production: bool) -> str:
    if not value or not value.strip():
        raise ConfigurationError(f"{name} is not configured")

    parsed = urlsplit(value)
    if parsed.scheme not in {"postgres", "postgresql"}:
        raise ConfigurationError(f"{name} must use a PostgreSQL URL")
    if not parsed.hostname or not parsed.path.strip("/"):
        raise ConfigurationError(f"{name} must include a host and database")
    if production:
        sslmode = parse_qs(parsed.query).get("sslmode", [""])[0]
        if sslmode not in {"require", "verify-ca", "verify-full"}:
            raise ConfigurationError(
                f"{name} must require TLS in production"
            )
    return value


class Settings:
    APP_NAME = os.getenv("APP_NAME", "DDS AI Service")
    APP_ENV = os.getenv("APP_ENV", "development")
    API_PREFIX = "/api/v1"

    AI_DATABASE_URL = os.getenv("AI_DATABASE_URL")
    AI_MIGRATOR_DATABASE_URL = os.getenv("AI_MIGRATOR_DATABASE_URL")
    AI_RUNTIME_DATABASE_ROLE = os.getenv(
        "AI_RUNTIME_DATABASE_ROLE", "dds_ai_runtime"
    )

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"

    def database_url(self) -> str:
        return validate_database_url(
            self.AI_DATABASE_URL, "AI_DATABASE_URL", self.is_production
        )

    def migrator_database_url(self) -> str:
        return validate_database_url(
            self.AI_MIGRATOR_DATABASE_URL,
            "AI_MIGRATOR_DATABASE_URL",
            self.is_production,
        )


settings = Settings()

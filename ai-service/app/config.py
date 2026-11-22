import os
from urllib.parse import parse_qsl, urlsplit


class ConfigurationError(ValueError):
    """Raised when a database configuration value is unsafe or invalid."""


def validate_database_url(value: str | None, name: str, production: bool) -> str:
    if not value or not value.strip():
        raise ConfigurationError(f"{name} is not configured")

    try:
        parsed = urlsplit(value)
        _ = parsed.port
    except ValueError as error:
        raise ConfigurationError(f"{name} is malformed") from error
    if parsed.scheme not in {"postgres", "postgresql"}:
        raise ConfigurationError(f"{name} must use a PostgreSQL URL")
    if not parsed.hostname or not parsed.path.strip("/"):
        raise ConfigurationError(f"{name} must include a host and database")
    try:
        query_pairs = parse_qsl(parsed.query, keep_blank_values=True, strict_parsing=True)
    except ValueError as error:
        raise ConfigurationError(f"{name} has a malformed query") from error
    sslmodes = [value for key, value in query_pairs if key == "sslmode"]
    if len(sslmodes) > 1 or any(key == "ssl" for key, _ in query_pairs):
        raise ConfigurationError(f"{name} has ambiguous SSL configuration")
    if production:
        sslmode = sslmodes[0] if sslmodes else ""
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

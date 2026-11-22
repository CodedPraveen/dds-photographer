import psycopg
import pytest

from app.api import health
from app.config import ConfigurationError, Settings, validate_database_url
from app.main import root


def test_root():
    assert root() == {"message": "DDS AI Service is running"}


def test_health():
    assert health.health_check() == {
        "status": "ok",
        "service": "dds-ai-service",
    }


def test_readiness_success(monkeypatch):
    monkeypatch.setattr(health, "check_database_connection", lambda: True)
    assert health.readiness_check() == {"status": "ok", "database": "connected"}


@pytest.mark.parametrize(
    "error", [RuntimeError("missing"), psycopg.OperationalError("secret-password")]
)
def test_readiness_failure_is_safe(monkeypatch, caplog, error):
    def fail():
        raise error

    monkeypatch.setattr(health, "check_database_connection", fail)
    with pytest.raises(Exception) as raised:
        health.readiness_check()
    assert raised.value.status_code == 503
    assert raised.value.detail == "Database unavailable"
    assert "secret-password" not in caplog.text


def test_missing_database_configuration():
    settings = Settings()
    settings.AI_DATABASE_URL = None
    with pytest.raises(ConfigurationError, match="not configured"):
        settings.database_url()


def test_invalid_database_url():
    with pytest.raises(ConfigurationError, match="PostgreSQL URL"):
        validate_database_url("https://example.test/db", "AI_DATABASE_URL", False)


def test_production_requires_tls():
    with pytest.raises(ConfigurationError, match="TLS"):
        validate_database_url(
            "postgresql://user:pass@db.example.test/db",
            "AI_DATABASE_URL",
            True,
        )

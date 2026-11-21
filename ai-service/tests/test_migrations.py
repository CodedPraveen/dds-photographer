
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

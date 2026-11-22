# AI Service Database Migrations

This directory contains SQL migrations for the `ai_private` PostgreSQL schema.

## Rules

- Use filenames like `001_initial_table.sql`.
- Migration versions must be unique and increasing.
- Every migration runs inside its own transaction.
- Schema objects must be explicitly qualified with `ai_private`.
- Never modify a migration after it has been applied.
- Add a new forward migration to correct an existing migration.
- Do not use Prisma migrations here.
- Do not modify Prisma-managed tables or schemas.
- Do not create face-search or biometric data structures without separate approval.

## Execution

Run the standalone runner using `AI_MIGRATOR_DATABASE_URL`.

The runner creates and maintains `ai_private.schema_migrations`.

Migrations are never executed automatically by FastAPI startup.

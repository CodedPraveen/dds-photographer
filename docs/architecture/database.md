# Database architecture

## Current schema — IMPLEMENTED

The authority for the current schema is `prisma/schema.prisma` and the migrations
under `prisma/migrations/`. Current models are `Gallery`, `GalleryMedia`, and
`GalleryVisitor`; relations cascade from gallery deletion to media and visitors.

`GalleryMedia.storageKey` is an internal key, not a public URL. The visitor
`consent` and `consentedAt` fields are gallery-entry consent only and must not be
used for face-search consent.

See [ERD](../diagrams/03-database-erd.mmd).

## Target and proposed changes

`PROPOSED` Future password, upload, processing, audit, and face-search-consent
records require separate approval and migrations. No admin, session, job, upload,
embedding, or face-consent model exists today.

`DECISION_REQUIRED` retention/deletion schedules, password rotation, backup expiry,
R2 object metadata, processing-job state, and face-data lifecycle.

Migration rules: add forward migrations only after approval; deploy with
`prisma migrate deploy`; verify backups and rollback/recovery before destructive
changes. Do not represent conceptual ERDs as current schema.

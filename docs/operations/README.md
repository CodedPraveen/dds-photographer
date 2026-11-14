# Operations and deployment

## Current configuration

`IMPLEMENTED CONFIGURATION` Docker defines a Node 22 standalone Next.js runtime,
PostgreSQL 16, a private Compose network, named database volume, non-root runtime,
and an opt-in Prisma migration service. Compose syntax has been verified; image
build, startup, migrations, connectivity, and HTTP smoke tests remain unverified.

Required configuration is `DATABASE_URL` for runtime, `DIRECT_URL` for Prisma CLI,
`GALLERY_TOKEN_SECRET` in production, and `NEXT_PUBLIC_SITE_URL` for metadata.
Secrets are supplied externally and must not be baked into images or committed.

See [deployment diagram](../diagrams/07-deployment-docker-architecture.mmd) and
the existing [deployment specification](../design-system/architecture/12-deployment.md).

## Testing and recovery

Run `npm run lint`, `npm test`, `npm run format:check`, and `npm run build` before
claiming local validation. Planned operations include encrypted backups, restore
tests, deletion/retention verification, monitoring, alerting, and incident
recovery. None should be described as deployed without evidence.

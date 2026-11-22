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

## Approved Phase 6 target — APPROVED / PLANNED

The target deployment is an AWS Lightsail VPS with a 4 GB RAM target, Nginx as
the reverse proxy, and Docker Compose managing the existing Next.js application
plus a separate photo-worker process/container from the same repository. The
Next.js application remains both frontend and backend. Supabase PostgreSQL
remains the database; Cloudflare R2 stores private originals and derivatives;
Upstash Redis is configured as the BullMQ TCP/TLS backend through the
server-only `UPSTASH_REDIS_URL`. Local connection configuration and factories
are implemented; deployed connectivity remains unverified.

Planned subdomains are `www.yourdomain.com`, `admin.yourdomain.com`, and
`api.yourdomain.com`. Nginx will route all three to the same Next.js application.
This target is not evidence that Lightsail, Nginx, DNS, R2, Upstash, BullMQ, or
the worker has been provisioned or deployed.

Production rollout requires environment and secret configuration, private R2
bucket/access-policy verification, Upstash/BullMQ deployed connectivity,
worker health checks and graceful shutdown, approved database migrations,
backups and restore verification, retention/deletion jobs, logging, monitoring,
alerting, and deployment/rollback checks.

## Testing and recovery

Run `npm run lint`, `npm test`, `npm run format:check`, and `npm run build` before
claiming local validation. Planned operations include encrypted backups, restore
tests, deletion/retention verification, monitoring, alerting, and incident
recovery. None should be described as deployed without evidence.

# DDS Photographer

DDS Photographer is a premium, single-photographer business website with a cinematic public portfolio and private wedding/event galleries. The repository currently contains the public website, camera-led motion experience, and first private-gallery foundation. Admin tools and the production media pipeline are planned work.

## Current implementation

- Next.js 16, React 19, JavaScript, and App Router under `src/app/`
- Tailwind CSS v4 and tokens in `src/styles/tokens.css`
- Responsive public site: Navbar, Hero, About, Portfolio, Services, Contact, and Footer
- Lazy React Three Fiber camera scene and GSAP/ScrollTrigger motion, with static fallback and reduced-motion support
- Private gallery at `/gallery/[token]`
- Signed 30-day gallery-link tokens and token-version revocation
- Server-validated visitor details and explicit gallery-entry consent
- Signed 12-hour HTTP-only, gallery-scoped visitor access cookie
- Gallery-scoped protected media route
- Prisma/PostgreSQL models: `Gallery`, `GalleryMedia`, `GalleryVisitor`,
  `AdminUser`, `AdminSession`, `AdminAuditEvent`
- Credential-free local adapter and development preview route

The current gallery foundation is not a finished admin or production media platform.
Admin authentication architecture is approved by ADR-001 (2026-11-14) and its
foundation is partially implemented: authentication, sessions, MFA, rate limiting,
audit writes, and protected dashboard routes exist. Password-change/security-reset
flows, audit review UI, uploads, R2 integration, background processing, QR
generation, video, and face search are not implemented.

## Product and technology decisions

| Area                | Direction                           | Status                                  |
| ------------------- | ----------------------------------- | --------------------------------------- |
| Guest password      | One shared password per wedding     | Selected; not implemented               |
| Gallery expiry      | Extendable                          | Selected; exact policy pending          |
| Photo storage       | Cloudflare R2                       | Selected; integration pending           |
| Background jobs     | Redis + BullMQ                      | Selected; integration pending           |
| Video               | Cloudflare Stream                   | On hold; photo-only scope               |
| Face detection      | YuNet                               | Selected; not integrated              |
| Face embeddings     | SFace ONNX + OpenCV                | Selected; not integrated              |
| Face-search service | FastAPI/Uvicorn                    | Selected; not integrated              |
| Embedding search    | PostgreSQL + pgvector              | Selected; not integrated              |
| Face-search consent | Separate, explicit, optional opt-in | Required before face-search processing  |

Installed dependencies do not prove that a feature is implemented. See `docs/design-system/architecture/17-tech-stack.md`.

## Local setup

1. Run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SITE_URL` to the absolute local URL.
4. Run `npm run dev` and open http://localhost:3000.

Without `DATABASE_URL` in local development, private galleries use an ignored file-backed adapter. Visit `/gallery/preview` for a sample gallery. The preview route is unavailable in production and when `DATABASE_URL` is set.

Production setup requires database and signing-secret configuration. Never commit production secrets.

## Docker (local production-like setup)

Prerequisites: Docker Engine with Docker Compose v2. This setup runs the existing
Next.js application and PostgreSQL only; it does not add R2, Redis, BullMQ,
uploads, admin authentication, or other planned infrastructure.

1. Copy `.env.docker.example` to `.env.docker` and replace the placeholder
   database password and `GALLERY_TOKEN_SECRET` (at least 32 characters).
2. Start PostgreSQL and wait for it to become healthy:

   ```bash
   docker compose up -d db
   ```

3. Apply the existing Prisma migrations explicitly:

   ```bash
   docker compose --profile tools run --rm migrate
   ```

4. Build and start the app:

   ```bash
   docker compose up -d --build
   ```

5. Open http://localhost:3000. The development-only `/gallery/preview` route is
   intentionally unavailable because the container runs with `NODE_ENV=production`.

Useful commands:

```bash
docker compose logs -f app
docker compose ps
docker compose down
```

`docker compose down` preserves the named PostgreSQL volume. Run
`docker compose down -v` only when you explicitly intend to delete local Docker
database data. The database has no host port mapping, so it is reachable only to
services on the Docker network.

For deployment, set the same required environment variables in your platform's
secret manager, run `prisma migrate deploy` as an explicit release step, use a
managed PostgreSQL service or protected persistent volume, and terminate HTTPS at
the platform or reverse proxy. Never bake `.env` files or real secrets into images.

## Validation

```bash
npm run lint
npm test
npm run format:check
npm run build
```

Do not mass-format unrelated legacy documentation when making focused edits.

## Project references

- `AGENTS.md` — implementation rules and architecture authority
- `docs/design-system/production/IMPLEMENTATION_STATUS.md` — current status
- `docs/design-system/production/IMPLEMENTED_FEATURES.md` — feature inventory
- `docs/design-system/architecture/13-roadmap.md` — roadmap
- `docs/design-system/architecture/17-tech-stack.md` — technology decisions
- `docs/design-system/architecture/01-system-architecture.md` — architecture
- `docs/ai/README.md` — AI-agent documentation entry point
- `docs/README.md` — repository documentation and architecture navigation

## Source of truth

Repository documentation is the mandatory architecture authority. Start at
`docs/README.md`, then use the architecture documents, Mermaid diagrams, ADRs,
roadmap, and implementation-status records. Verify implementation claims against
code, tests, migrations, and deployment configuration. Never describe planned
technology or conceptual models as implemented. If documentation and code
conflict, report the exact conflict instead of silently choosing.

# Photographer website — documentation update package

This package contains **append-only documentation updates** for the existing repository:

`CodedPraveen/dds-photographer`

## Important: preservation rule

These files are additions for the matching existing documents. **Do not replace the existing documents with these files.** Append each file's contents to the end of its matching document. Existing decisions, history, completed phases, and previous documentation remain intact.

No implementation is claimed as complete by this documentation package. Every new behavior is marked planned or not verified.

## Apply these append files

| Append file                       | Append to existing repository file                       |
| --------------------------------- | -------------------------------------------------------- |
| `13-roadmap.append.md`            | `docs/design-system/architecture/13-roadmap.md`          |
| `CURRENT_TASK.append.md`          | `docs/design-system/development/CURRENT_TASK.md`         |
| `IMPLEMENTATION_STATUS.append.md` | `docs/design-system/production/IMPLEMENTATION_STATUS.md` |
| `MOTION_GUIDELINES.append.md`     | `docs/design-system/design/MOTION_GUIDELINES.md`         |
| `HERO_SECTION.append.md`          | `docs/design-system/design/components/HERO_SECTION.md`   |

## Git safety

1. Create a separate branch before applying.
2. Review the diff and confirm the old content is still present.
3. Commit documentation changes separately from implementation.
4. Do not mark planned behaviors as implemented until verified in source and runtime.

This is an append package, not a replacement snapshot of the full repository documents. A GitHub permission error prevented direct repository writes, so no repository files were changed by creating this ZIP.

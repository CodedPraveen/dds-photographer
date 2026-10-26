# Implementation Status

> **Project:** DDS Photographer
> **Last verified against repository source:** 2026-10-26
> **Architecture authority:** Eraser workspace, as specified in `AGENTS.md`

## Current stage

The public website, camera-led motion experience, and first private-gallery foundation
are implemented. The next planned implementation phase is Phase 5 — Admin Dashboard
and Production Readiness. Phase 5 has not started.

## Implemented scope

### Foundation and public website
- Next.js 16, React 19, JavaScript, and App Router under `src/app/`.
- Tailwind CSS v4, global CSS, CSS Modules, and design tokens.
- Public homepage and `/contact`.
- Navbar, Hero, About, Portfolio, Services, Contact, and Footer components.
- Centralized replaceable development content and placeholder photography.

### Camera-led motion
- Lazy React Three Fiber camera scene using `public/cameras/camera.glb`.
- GSAP / ScrollTrigger choreography.
- Demand-rendered camera canvas.
- Reduced-motion/static fallback.
- Services interaction can update the camera composition.

### Private-gallery foundation
- Private gallery route at `/gallery/[token]`.
- Signed 30-day gallery-link token with nonce, gallery ID, and token version.
- Token-version validation supports revoking earlier links.
- Visitor entry form with server-side validation.
- Current gallery-entry consent capture.
- Signed 12-hour HTTP-only, gallery-scoped visitor access cookie.
- Gallery-scoped media route and authorization check.
- Prisma/PostgreSQL and local development repository adapters.
- Development preview route unavailable in production or when `DATABASE_URL` is set.

This is a foundation, not a complete production photo-delivery platform. The inspected
media route returns 503 for non-development storage keys because production storage
delivery is not implemented.

## Roadmap status

| Workstream | Status |
| --- | --- |
| Phase 0 — Architecture and baseline audit | Complete |
| Phase 1A / 1B — Application foundation | Complete |
| Phase 2 — Public marketing website | Complete |
| Phase 3 — Camera-led motion experience | Complete |
| Phase 4 — Private-gallery foundation | Complete |
| Phase 5 — Admin dashboard and production readiness | Not started |
| Production photo upload / processing pipeline | Not implemented |
| Face-search implementation | Evaluation only |
| Video | On hold |

Use `docs/design-system/architecture/13-roadmap.md` for the current detailed plan.

## Owner decisions

| Area | Direction | Status |
| --- | --- | --- |
| Wedding guest password | One shared password per wedding | Selected; not implemented |
| Gallery expiry | Extendable | Selected; policy details pending |
| Photo storage | Cloudflare R2 | Selected; not integrated |
| Background processing | Redis + BullMQ | Selected; not integrated |
| Video | Cloudflare Stream | On hold; photo-only scope |
| Face matching | SFace | Evaluation only |
| Face-search consent | Separate, explicit, optional opt-in | Required before processing |

## Current data model

`prisma/schema.prisma` currently defines:
- `Gallery`
- `GalleryMedia`
- `GalleryVisitor`

Do not describe future admin, upload-job, face-consent, embedding, or processing
models as existing.

The existing visitor consent fields are gallery-entry consent only. They must not be
used as face-search consent.

## Production requirements not yet completed

- Admin authentication and authorization.
- Gallery creation and management UI.
- Shared wedding password implementation, hashing, rate limiting, rotation.
- Extendable expiry controls and retention/deletion policy.
- Production PostgreSQL configuration, migrations, backups, restore testing.
- Cloudflare R2 private storage and authorized media delivery.
- Redis/BullMQ workers and processing pipeline.
- Upload verification, derivatives, monitoring, and operational recovery.
- Production face-search decision, consent flow, and data lifecycle (if approved).

## Verification notes

`package.json` defines:
- `npm run lint`
- `npm test` (`node --test`)
- `npm run format:check`
- `npm run build`

These scripts must be run to claim local validation. A successful Vercel preview
deployment does not prove lint, test, formatting, or build checks all passed.

For the PR head reviewed on 2026-10-26, GitHub returned a successful Vercel deployment
status and no GitHub Actions lint/test/format/build check-runs. Do not report full CI
as passing based on that result.

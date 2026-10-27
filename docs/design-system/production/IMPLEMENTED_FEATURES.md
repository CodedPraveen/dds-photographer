# Implemented Features

> **Last verified against repository source:** 2026-10-26
> **Evidence:** Current `system-design` branch source tree, Prisma schema, and routes.

## Implemented

### Foundation and public website
- Next.js 16 and React 19 App Router under `src/app/`.
- JavaScript application source.
- Tailwind CSS v4, CSS Modules, global styles, and central design tokens.
- Public homepage and `/contact`.
- Navbar, Hero, About, Portfolio, Services, Contact, and Footer components.
- Centralized public content data in `src/features/public-site/content/site-content.js`.
- Placeholder images and temporary business details remain in use.

### Camera-led motion experience
- Actual `public/cameras/camera.glb` model loaded by the existing R3F scene.
- React Three Fiber / Three.js rendering.
- GSAP / ScrollTrigger scroll choreography.
- Lazy camera loading and demand rendering.
- Reduced-motion path and static fallback.
- Service selection communicates with the camera scene.

### Private-gallery foundation
- `/gallery/[token]` route.
- Signed expiring gallery-link token with nonce, gallery ID, and token version.
- Gallery token-version check.
- Visitor entry form with name, mobile, email, and gallery-entry consent.
- Server-side input validation.
- Signed 12-hour HTTP-only visitor access cookie, scoped to `/gallery`.
- Gallery-scoped media lookup and authorization for non-cover media.
- Prisma/PostgreSQL repository adapter.
- Local development repository adapter.
- Development-only `/gallery/preview` route.

## Current database models

- `Gallery`
- `GalleryMedia`
- `GalleryVisitor`

See `prisma/schema.prisma` and `docs/design-system/architecture/02-database-erd.md`.

## Not implemented

- Phase 5 admin authentication, dashboard, gallery creation/editing, publishing,
  shared wedding password, and extendable expiry controls.
- Production uploads and Cloudflare R2 integration.
- Production private object delivery and CDN integration.
- Redis/BullMQ background processing.
- Upload validation, thumbnails, derivatives, and processing-job operations.
- QR-code generation.
- Face-search feature or production face recognition.
- Face-search consent model and derived face-data lifecycle.
- Video upload, storage, processing, or playback (on hold).
- Favorites, payments, multi-studio SaaS, and mobile apps.

## Status language

- Cloudflare R2 and Redis/BullMQ are selected future directions, not integrations.
- Cloudflare Stream is on hold; product scope is photo-only.
- SFace is evaluation-only, not production-approved.
- One shared password per wedding and extendable expiry are selected decisions,
  not implemented features.
- Gallery-entry consent is not face-search consent.

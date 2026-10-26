# DDS Photographer — Current State

> Verified against the `system-design` branch source tree on 2026-10-26.
> Update this file whenever implementation status changes.

## Status definitions

- **Implemented:** Present in source/schema/configuration and usable in the repository.
- **Selected — not implemented:** Owner-approved future direction, not integrated.
- **Evaluation only:** Research/prototype scope, not production-approved.
- **Deferred / on hold:** Do not implement until explicitly reopened.
- **Unknown / unverified:** Evidence is insufficient; do not infer success.

## Implemented

### Public website
- Next.js 16 App Router and React 19 JavaScript application.
- Homepage composition: Navbar, Hero, About, Portfolio, Services, Footer.
- Contact page at `/contact`.
- Central public content in `src/features/public-site/content/site-content.js`.
- Placeholder photography and temporary contact/business content remain in use.
- Responsive image delivery through `next/image` in the public site.

### Camera and motion
- Persistent camera experience in `src/features/motion/components/`.
- React Three Fiber / Three.js camera scene using `public/cameras/camera.glb`.
- GSAP / ScrollTrigger orchestration.
- Reduced-motion path and lazy camera loading.
- Services interaction communicates state to the camera scene.

### Private-gallery foundation
- Gallery page: `src/app/gallery/[token]/page.js`.
- Media handler: `src/app/gallery/[token]/media/[mediaId]/route.js`.
- Development preview: `src/app/gallery/preview/route.js`.
- Signed gallery-link token: 30-day expiry, nonce, gallery ID, token version.
- Token version check supports revoking older gallery links.
- Visitor access cookie: 12-hour expiry, HTTP-only, SameSite=Lax, `/gallery` path,
  Secure in production.
- Gallery entry captures name, mobile, email, and current gallery-entry consent.
- Media is resolved inside the validated gallery; non-cover media requires a
  gallery-scoped visitor grant.
- Prisma/PostgreSQL adapter and local development adapter.
- Non-development media storage delivery is not implemented; the inspected media
  route returns 503 for non-development storage keys.
- `/gallery/preview` is unavailable in production or when `DATABASE_URL` is set.

### Database
Current Prisma models:
- `Gallery`
- `GalleryMedia`
- `GalleryVisitor`

No production admin/user/face-search/job/upload model should be assumed to exist.

## Selected — not implemented

- One shared password per wedding.
- Extendable gallery expiry.
- Cloudflare R2 private photo storage.
- Redis + BullMQ photo-processing jobs.
- Admin dashboard, admin authentication, gallery creation/management UI.
- Production uploads and private media delivery pipeline.
- QR-code generation.

## Evaluation only

- SFace face-matching evaluation.
- No production face-search implementation or approval.

## Deferred / on hold

- Cloudflare Stream and all video features. Current scope is photos only.
- Payments, favorites, multi-studio SaaS, and mobile apps are not approved for the
  current scope.

## Important privacy distinction

`GalleryVisitor.consent` and `consentedAt` are current gallery-entry consent fields.
They must not be reused as face-search consent. Face-search requires a separate
purpose-specific optional affirmative choice, an unchecked-by-default control,
notice/version evidence, timestamp, withdrawal, and deletion lifecycle. Ordinary
gallery access must remain available to guests who decline face search.

## Known policy details still open

- Default and maximum gallery lifetime.
- Retention/deletion schedule and backup expiry.
- Shared password rotation policy and abuse thresholds.
- R2 bucket layout, upload authorization, derivatives, and lifecycle rules.
- BullMQ worker deployment, retries, idempotency, and monitoring.
- Face-search notice wording, data lifecycle, model/license review, thresholds,
  false-match handling, and deletion behavior.

## CI / verification snapshot

The reviewed PR head had a successful Vercel deployment status. No GitHub Actions
lint, test, formatting, or build check-runs were returned for that commit. This is
not equivalent to a passing full CI pipeline.

Package scripts currently include `lint`, `test` (`node --test`), `format:check`,
and `build`. Run them locally or add a CI workflow to obtain explicit results.

# Technology Stack and Decision Status

> Updated 2026-10-26. The Eraser workspace remains the primary approved architecture reference under `AGENTS.md`.

## Status vocabulary
- **Implemented:** Present in repository code and used.
- **Selected — not implemented:** Owner-approved future direction.
- **Evaluation only:** Research/prototype only; not production-approved.
- **Deferred / on hold:** Do not implement until reopened.

## Implemented stack

| Layer | Technology | Current evidence |
| --- | --- | --- |
| Framework | Next.js 16 | App Router under `src/app/` |
| UI | React 19 | Server/client components |
| Language | JavaScript | Application source |
| Styling | Tailwind CSS v4 + CSS | Global styles and tokens |
| 3D | Three.js + React Three Fiber | Persistent camera scene |
| Motion | GSAP + ScrollTrigger | Scroll choreography |
| Database | PostgreSQL | Prisma datasource and migration |
| ORM | Prisma 7 + PostgreSQL adapter | Gallery repository |
| Image library | Sharp | Dependency installed; no production upload pipeline |
| Tests | Node.js test runner | `node --test` |
| Quality | ESLint + Prettier | Repository scripts |
| Package manager | npm | Package manifest and lockfile |

An installed dependency is not proof of active runtime use. Verify imports before describing Framer Motion, Lenis, Drei, or other packages as part of a feature architecture. Framer Motion is not the approved primary animation engine; current motion uses GSAP and CSS.

## Selected future technology

| Area | Direction | Status / constraint |
| --- | --- | --- |
| Private photo object storage | Cloudflare R2 | Selected; integration not implemented |
| Background jobs | Redis + BullMQ | Selected; integration not implemented |
| Wedding guest password | One shared password per wedding | Selected; not implemented |
| Gallery expiry | Extendable | Selected; exact policy pending |
| Face matching | SFace | Evaluation only; no production approval |

## Deferred

### Video
Cloudflare Stream is on hold. The active product scope is photo-only. Do not add video upload, processing, playback, or billing until explicitly reopened.

### Face search
SFace may be evaluated but is not approved for production. Evaluation must cover model provenance/license, accuracy, false-positive/negative behavior, bias, security, retention, and deletion.

Face-search data must not be collected or processed without a separate, purpose-specific, affirmative, optional consent flow. General gallery-entry consent is not face-search consent.

## Application architecture
- Next.js App Router under `src/app/`.
- Server-first rendering.
- Server-only modules own secrets, authorization, and persistence.
- Route Handlers implement actual HTTP endpoints.
- Server Actions handle form mutations where implemented.
- Generic UI primitives live under `src/components/ui/`.
- Design tokens live in `src/styles/tokens.css`.

## Motion and 3D
- GSAP/ScrollTrigger drives the implemented camera scroll journey.
- React Three Fiber renders the persistent camera.
- The scene is lazy-loaded and demand-rendered.
- Static fallback and reduced-motion behavior must remain usable.
- Do not introduce a second animation system without an approved requirement.

## Data and storage boundaries

### PostgreSQL / Prisma
Current Prisma models are `Gallery`, `GalleryMedia`, and `GalleryVisitor`. Proposed future entities must not be described as existing.

### Cloudflare R2
Selected for future private photo storage. Keep credentials and object keys server-side. Scope upload authorization to a gallery/object, verify uploads, and authorize every private media delivery. Bucket layout, derivatives, and lifecycle rules require a detailed storage design.

### Redis + BullMQ
Selected for future asynchronous photo processing. Specify job payloads, idempotency, retry/backoff, worker deployment, failed-job handling, and monitoring before implementation.

## Privacy and security requirements
- Secrets remain server-only and out of source control.
- Gallery-link tokens and visitor access grants are separate credentials.
- Media authorization is checked in gallery context.
- Face-search consent is separate from gallery-entry consent.
- Face-search consent is optional, explicit, unchecked by default, and withdrawable.
- Do not capture a selfie or create embeddings before face-search consent.
- Do not condition basic gallery access on face-search opt-in.
- Define retention and deletion before production face-search work.

## Dependency policy
Before adding a package/service, confirm the feature is approved for the current phase, check existing alternatives, evaluate maintenance/security/license/cost, and document the reason. Do not install dependencies for deferred or evaluation-only work.

## Related documents
- `01-system-architecture.md`
- `02-database-erd.md`
- `09-storage.md`
- `10-security.md`
- `11-api.md`
- `12-deployment.md`
- `13-roadmap.md`
- `../production/IMPLEMENTATION_STATUS.md`
- `../production/IMPLEMENTED_FEATURES.md`

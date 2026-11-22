# Architecture overview

## Product boundary

`IMPLEMENTED` DDS Photographer is a single-photographer business website with a
public portfolio and a first private wedding/event gallery foundation. It is not a
multi-tenant SaaS product. The current product scope is photos only.

## Current implementation

- `IMPLEMENTED` Next.js App Router, React, JavaScript, Tailwind CSS v4.
- `IMPLEMENTED` Public pages and camera-led motion using React Three Fiber/Three.js
  and GSAP/ScrollTrigger.
- `IMPLEMENTED` `/gallery/[token]`, signed 30-day gallery-link tokens, token
  version checks, visitor-entry validation, and a signed 12-hour gallery cookie.
- `IMPLEMENTED` Prisma models `Gallery`, `GalleryMedia`, `GalleryVisitor`,
  `AdminUser`, `AdminSession`, and `AdminAuditEvent`.
- `IMPLEMENTED` Local development adapter and Prisma/PostgreSQL adapter.
- `IMPLEMENTED` Supabase PostgreSQL remains the database foundation; Phase 6
  schema additions are proposed only.
- `APPROVED / PLANNED` Phase 6 Photo Upload & Processing Pipeline. The current
  Next.js application remains both frontend and backend; a separate photo
  worker process/container from the same repository is planned.
- `SELECTED_NOT_INTEGRATED` Cloudflare R2 private photo storage.
- `SELECTED_NOT_INTEGRATED` BullMQ with Upstash Redis as the selected queue
  backend; Upstash/BullMQ compatibility must be verified before implementation.
- `APPROVED_NOT_IMPLEMENTED` Admin authentication architecture in
  [ADR-001](../development/decisions/ADR-001-admin-authentication.md); the admin
  dashboard and implementation remain Phase 5 work. Upload/processing pipeline,
  shared wedding password, and extendable expiry policy remain planned or
  decision-dependent.
- `SELECTED_NOT_INTEGRATED` YuNet + SFace ONNX + OpenCV face-search pipeline,
  served by FastAPI and backed by PostgreSQL + pgvector. No face-search feature
  is implemented.
- `ON_HOLD` Video/Cloudflare Stream.

No Fastify or separate backend API application is part of the approved Phase 6
architecture. Face matching is deferred from Phase 6 and remains a separate
future architecture. See the [Phase 6 product specification](../product/MEDIA_PIPELINE.md),
[storage and processing architecture](storage-and-processing.md),
[database proposal](database.md), [security architecture](security.md),
[upload workflow](../diagrams/06-photo-upload-storage-flow.mmd),
[system context](../diagrams/01-system-context.mmd), and
[application architecture](../diagrams/02-application-architecture.mmd).

## Change control

Owner-approved repository decisions and ADRs must be updated before implementation
of a new phase. ADR-001 was approved on 2026-11-14, but approval is architectural
and does not claim implementation. If documentation and code conflict, report the
exact conflict; do not silently promote an implementation status.

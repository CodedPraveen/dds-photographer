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
- `IMPLEMENTED` Prisma models `Gallery`, `GalleryMedia`, and `GalleryVisitor`.
- `IMPLEMENTED` Local development adapter and Prisma/PostgreSQL adapter.
- `SELECTED_NOT_INTEGRATED` Cloudflare R2 and Redis + BullMQ.
- `PLANNED` Admin, upload/processing pipeline, shared wedding password, and
  extendable expiry policy.
- `EVALUATION_ONLY` SFace face matching; no production face search.
- `ON_HOLD` Video/Cloudflare Stream.

See [system context](../diagrams/01-system-context.mmd), [application architecture](../diagrams/02-application-architecture.mmd), and the [database record](database.md).

## Change control

Owner-approved repository decisions and ADRs must be updated before implementation
of a new phase. If documentation and code conflict, report the exact conflict;
do not silently promote a proposal or rewrite architecture.

# Development Roadmap

> Reconciled with repository implementation and owner decisions on 2026-10-26.
> The Eraser workspace remains the primary approved architecture reference under `AGENTS.md`; this file does not replace it.

## Phase status

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Architecture and baseline audit | Complete |
| 1A | Application foundation, Part 1 | Complete |
| 1B | Application foundation, Part 2 | Complete |
| 2 | Public marketing website | Complete |
| 3 | Camera-led motion experience | Complete |
| 4 | First private-gallery foundation | Complete |
| 5 | Admin dashboard and production readiness | Not started |

See `../production/IMPLEMENTATION_STATUS.md` and `../production/IMPLEMENTED_FEATURES.md` for verified details.

## Phase 5 — Admin dashboard and production readiness

Planned, not implemented:
- Secure photographer/admin access and session lifecycle
- Dashboard and gallery/event management
- Gallery create/edit/activate/deactivate/revoke controls
- Gallery availability and extendable expiry controls
- Shared password management for each wedding
- Media metadata and ordering management
- Production database, migrations, monitoring, backups, and recovery
- Cloudflare R2 private photo storage integration

The shared wedding password is a product decision, not current functionality. Store only a modern password hash; support rate limiting, rotation, and revocation. It does not replace visitor consent or gallery-scoped authorization.

## Planned workstreams — phase assignment/order to be confirmed

### Photo uploads and processing
- Direct browser-to-R2 uploads using short-lived, gallery-scoped authorization
- Upload completion verification and gallery-scoped media records
- Redis + BullMQ workers for validation, metadata, thumbnails, and derivatives
- Idempotency, retries, partial-batch recovery, and failed-job visibility
- Authorized private photo delivery

R2 and Redis + BullMQ are selected directions; neither is integrated yet.

### Guest gallery lifecycle
- One shared password per wedding
- Extendable gallery expiry
- Admin extend/close/reopen/revoke controls
- QR-code generation
- Preserve per-visitor entry consent and gallery-scoped authorization

Default expiry, maximum lifetime, retention/deletion schedule, and password rotation policy remain to be specified. Distinguish gallery availability, gallery-link token expiry (currently 30 days), visitor cookie expiry (currently 12 hours), and permanent retention/deletion.

### Face-search evaluation and privacy
- Evaluate SFace; evaluation is not production approval
- Assess provenance/licensing, accuracy, false matches, bias, security, and operational suitability
- Design separate gallery-scoped face-search consent before collecting or processing any selfie, face crop, embedding, or match data
- Record notice/version, purpose, affirmative action, timestamp, and withdrawal
- Use a separate optional unchecked-by-default control
- Never make ordinary gallery access conditional on face-search opt-in
- Define deletion of source and derived face-search data

The existing gallery-entry consent is not face-search consent. No face-search functionality is currently implemented.

### Video
Cloudflare Stream is on hold. Current scope is photo-only. Do not implement video upload, storage, processing, playback, or billing until this decision is explicitly reopened.

### Later possibilities
Mobile apps, multi-studio support, payments, and SaaS/multi-tenant features are not approved for the current single-photographer product.

## Owner decisions recorded 2026-10-26

| Decision | Direction | Boundary |
| --- | --- | --- |
| Guest password | One shared password per wedding | Selected; implementation pending |
| Gallery expiry | Extendable | Selected; policy details pending |
| Photo storage | Cloudflare R2 | Selected; integration pending |
| Video | Cloudflare Stream | On hold; photo-only |
| Background jobs | Redis + BullMQ | Selected; integration pending |
| Face matching | SFace | Evaluation only |
| Face-search consent | Separate, explicit, optional opt-in | Required before processing |

## Change control
1. Implement only the current approved phase.
2. Verify implementation claims against source, tests, migrations, and deploy configuration.
3. Do not add future-phase dependencies or infrastructure early.
4. Record decisions with date, rationale, status, and affected documents.
5. If this roadmap conflicts with Eraser, stop and ask before implementation.

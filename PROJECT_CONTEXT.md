# DDS Photographer — Project Context

> Prepared 2026-10-26 from the `system-design` branch source tree and repository
> documentation. This is an AI working context; repository architecture records
> are the source of truth.

## 1. Product identity

DDS Photographer is a premium, single-photographer business website with a cinematic
public portfolio and private wedding/event galleries. The public experience emphasizes
photography, a camera-led hero, selected work, services, and contact information.

This is not currently an approved multi-studio, multi-tenant SaaS platform.

## 2. Architecture authority

`AGENTS.md` identifies repository architecture documents, Mermaid diagrams, and ADRs
as the primary approved architecture and planning reference. Before implementing a feature:

1. Read the relevant repository architecture document.
2. Review its associated Mermaid diagram.
3. Review the development roadmap.
4. Implement only the approved current phase.

Repository docs and code should be used to verify current implementation. If documentation,
repository documentation, and source disagree, stop and report the conflict; do not
silently select one or rewrite the approved architecture.

## 3. Implemented application shape

- Framework: Next.js 16 App Router under `src/app/`.
- UI: React 19, JavaScript.
- Styling: Tailwind CSS v4, global CSS, CSS Modules, design tokens.
- Public site: homepage and `/contact`.
- Motion: lazy React Three Fiber camera scene; GSAP/ScrollTrigger choreography.
- Accessibility: skip links, reduced-motion behavior, keyboard/pointer/touch
  interactions where implemented.
- Private gallery: `/gallery/[token]`, signed gallery-link token, visitor entry form,
  gallery-scoped visitor access cookie, gallery-scoped media route.
- Data: PostgreSQL with Prisma 7; current Prisma models are `Gallery`,
  `GalleryMedia`, `GalleryVisitor`, `AdminUser`, `AdminSession`, and
  `AdminAuditEvent`.
- Local gallery development: file-backed adapter and `/gallery/preview` when running
  in development without `DATABASE_URL`.

## 4. Product decisions

| Area | Decision | Status |
| --- | --- | --- |
| Guest password | One shared password per wedding | Selected; not implemented |
| Gallery expiry | Extendable | Selected; policy details pending |
| Photo storage | Cloudflare R2 | Selected; integration pending |
| Background processing | Redis + BullMQ | Selected; integration pending |
| Video | Cloudflare Stream | On hold; photo-only scope |
| Face detection | YuNet | Selected; not integrated |
| Face embeddings | SFace ONNX + OpenCV | Selected; not integrated |
| Face-search backend | FastAPI/Uvicorn | Selected; not integrated |
| Embedding search | PostgreSQL + pgvector | Selected; not integrated |
| Face-search consent | Separate, explicit, optional opt-in | Required before face-search processing |

A shared wedding password is a gallery-level gate, not unique guest authentication.
Never store plaintext passwords.

The following time windows are different and must remain distinct:
- Gallery availability (`opensAt`, `closesAt`).
- Gallery-link token expiry (currently 30 days).
- Visitor access cookie expiry (currently 12 hours).
- Actual retention and permanent deletion (policy not yet defined).

## 5. Privacy boundary

`GalleryVisitor.consent` and `consentedAt` represent current gallery-entry consent.
They do not authorize selfie collection, face crops, embeddings, face matching, or
face-search results.

Face search must have its own standalone notice and separate affirmative optional
choice, unchecked by default. Declining it must not block normal gallery access.
Record notice/version, purpose, affirmative action, timestamp, and withdrawal.
Do not collect or process face-search data before this flow and its lifecycle are
approved and implemented.

The face-recognition architecture is selected but not integrated. Do not represent
it as an implemented feature. MTCNN, PyTorch, and Torchvision are excluded from
the initial implementation.

## 6. Phase boundary

The roadmap in `docs/design-system/architecture/13-roadmap.md` is the current
repository roadmap, while repository architecture records remain the approved authority.

Repository implementation status:
- Foundation and public website: implemented.
- Camera-led motion experience: implemented.
- Private-gallery foundation: implemented, not a complete production delivery platform.
- Admin dashboard and production readiness: not started.
- Admin authentication architecture: approved in ADR-001 on 2026-11-14; admin
  authentication, sessions, MFA, rate limiting, audit logging, and dashboard
  routes are not implemented.

Phase 3 motion refinement remains partially implemented: the public motion code
has a curved reversible photo path, persistent camera return states, and a static
reduced-motion camera path. Runtime visual verification remains outstanding.
- R2, Redis/BullMQ, shared password, QR generation, SFace face search: future work.
- Video: on hold.

Approved admin-authentication policy is limited to one provisioned account, required
TOTP MFA, Argon2id passwords, one-time server-side CLI provisioning, hashed
database sessions, HTTP-only Secure-in-production SameSite=Lax admin cookies,
12-hour idle and 7-day absolute sessions, revocation on logout/password change/
security reset, progressive cooldown after five failed attempts per 15 minutes,
no permanent automatic lockout, server-side authorization, and one-year audit
retention. These policies do not change the separate gallery visitor cookie or
gallery-link token lifetimes.

## 7. Non-goals unless explicitly approved

- Video uploads or playback.
- Production face recognition/search.
- Favorites and payments.
- Multi-studio / multi-tenant SaaS.
- Mobile applications.
- Unrequested redesigns or architecture changes.

## 8. Validation

Use the repository scripts:
```bash
npm run lint
npm test
npm run format:check
npm run build
```

A script existing in `package.json` does not prove it passed. The current PR check
record reviewed on 2026-10-26 showed a successful Vercel deployment status, but no
GitHub Actions lint/test/format/build workflow checks. Report this distinction.

## 9. Key references

- `AGENTS.md`
- `README.md`
- `docs/design-system/architecture/13-roadmap.md`
- `docs/design-system/architecture/17-tech-stack.md`
- `docs/design-system/architecture/01-system-architecture.md`
- `docs/design-system/architecture/02-database-erd.md`
- `docs/design-system/architecture/10-security.md`
- `docs/design-system/architecture/11-api.md`
- `docs/design-system/production/IMPLEMENTATION_STATUS.md`
- `docs/design-system/production/IMPLEMENTED_FEATURES.md`

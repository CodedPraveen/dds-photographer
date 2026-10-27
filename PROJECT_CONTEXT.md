# DDS Photographer — Project Context

> Prepared 2026-10-26 from the `system-design` branch source tree and repository
> documentation. This is an AI working context, not a replacement for the Eraser
> architecture workspace.

## 1. Product identity

DDS Photographer is a premium, single-photographer business website with a cinematic
public portfolio and private wedding/event galleries. The public experience emphasizes
photography, a camera-led hero, selected work, services, and contact information.

This is not currently an approved multi-studio, multi-tenant SaaS platform.

## 2. Architecture authority

`AGENTS.md` explicitly identifies the Eraser workspace as the primary approved
architecture and planning reference. Before implementing a feature:

1. Read the relevant Eraser document.
2. Review its associated architecture canvas.
3. Review the development roadmap.
4. Implement only the approved current phase.

Repository docs and code should be used to verify current implementation. If Eraser,
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
  `GalleryMedia`, and `GalleryVisitor`.
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
| Face matching | SFace | Evaluation only; not production-approved |
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

SFace remains evaluation-only. Do not represent it as an integrated feature.

## 6. Phase boundary

The roadmap in `docs/design-system/architecture/13-roadmap.md` is the current
repository roadmap, while Eraser remains the approved architecture authority.

Repository implementation status:
- Foundation and public website: implemented.
- Camera-led motion experience: implemented.
- Private-gallery foundation: implemented, not a complete production delivery platform.
- Admin dashboard and production readiness: not started.
- R2, Redis/BullMQ, shared password, QR generation, SFace face search: future work.
- Video: on hold.

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

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
- Prisma/PostgreSQL models: `Gallery`, `GalleryMedia`, `GalleryVisitor`
- Credential-free local adapter and development preview route

The current gallery foundation is not a finished admin or production media platform. Admin authentication/dashboard, uploads, R2 integration, background processing, QR generation, video, and face search are not implemented.

## Product and technology decisions

| Area | Direction | Status |
| --- | --- | --- |
| Guest password | One shared password per wedding | Selected; not implemented |
| Gallery expiry | Extendable | Selected; exact policy pending |
| Photo storage | Cloudflare R2 | Selected; integration pending |
| Background jobs | Redis + BullMQ | Selected; integration pending |
| Video | Cloudflare Stream | On hold; photo-only scope |
| Face matching | SFace | Evaluation only; no production approval |
| Face-search consent | Separate, explicit, optional opt-in | Required before face-search processing |

Installed dependencies do not prove that a feature is implemented. See `docs/design-system/architecture/17-tech-stack.md`.

## Local setup
1. Run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SITE_URL` to the absolute local URL.
4. Run `npm run dev` and open http://localhost:3000.

Without `DATABASE_URL` in local development, private galleries use an ignored file-backed adapter. Visit `/gallery/preview` for a sample gallery. The preview route is unavailable in production and when `DATABASE_URL` is set.

Production setup requires database and signing-secret configuration. Never commit production secrets.

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

## Source of truth
The Eraser workspace remains the primary approved architecture reference as required by `AGENTS.md`. Verify implementation claims against code, tests, migrations, and deployment configuration. Never describe planned technology or conceptual models as implemented. If Eraser, repository docs, and code conflict, stop and report the conflict instead of silently choosing.

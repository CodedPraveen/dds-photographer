# Implemented Features

> **Last verified:** 2026-08-11
>
> **Evidence:** Current repository code

## Implemented

### Phases 1–4

- Next.js 16 and React 19 App Router foundation under `src/app/`
- Central design tokens, Manrope typography, reusable UI primitives, metadata,
  responsive layouts, visible focus, and reduced-motion defaults
- Public Navbar, Hero, About, Selected Work, Services, Contact, and Footer
  foundations with centralized replaceable development content
- One scoped GSAP/ScrollTrigger orchestration and one lazy, demand-rendered R3F
  camera scene
- Server-validated private gallery at `/gallery/[token]` with signed expiring
  links, consent capture, gallery-scoped access cookies, Prisma/PostgreSQL
  models, protected media delivery, and development-only adapters

### Phase 5 Marketing Website Finalization

- Actual `public/cameras/camera.glb` model normalized and rendered by the
  existing single R3F scene
- Camera entrance from distance, settled rear-LCD composition, visible Hero
  background, and camera persistence through the photo handoff
- First photo aligned to the LCD before moving upward and expanding into the
  Hero visual stage; no large marketing headline
- Existing About content preserved without inventing an Experience section
- Data-driven Selected Work gallery containing 20 replaceable development
  entries
- Natural image aspect ratios, responsive `next/image` delivery, lazy loading,
  one mobile column, two tablet columns, and four desktop columns
- GSAP/ScrollTrigger ending in which Selected Work exits left while Services
  enters from the right, with scoped cleanup
- Interactive Services state shared between each service control, its matching
  background image, and subtle camera composition
- Pointer hover, keyboard focus, click, and touch/tap support for every service
- Full Contact experience moved off the homepage to `/contact`
- Existing navbar architecture updated so Contact routes to `/contact`
- Static reduced-motion path that omits unnecessary 3D and scroll choreography
- Responsive verification at 390px, 768px, 1280px, and 1600px

### Temporary Development Content

- Centralized replaceable copy and link data in the public-site feature
- Reused local development photography under `public/placeholders/`
- Clearly marked temporary contact details and photography labels

## Not Implemented

- Phase 6 admin authentication, dashboard, gallery creation, uploads,
  publishing, QR generation, or visitor management UI
- Phase 7 AI or face recognition
- Phase 8 client photo downloads
- Phase 9 notifications or optional client authentication
- Favorites
- Payments
- Production private-storage provider or CDN integration

## Phase Status

- Phase 1: Complete
- Phase 2: Complete
- Phase 3: Complete
- Phase 4: Complete
- Phase 5: Complete
- Phase 6: Not started
- Phase 7: Not started
- Phase 8: Not started
- Phase 9: Not started

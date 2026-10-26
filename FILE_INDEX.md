# DDS Photographer — File Index

> High-signal map of the current `system-design` branch. This is a navigation aid,
> not an exhaustive manifest.

## Repository root

| Path | Responsibility |
| --- | --- |
| `AGENTS.md` | Agent rules and Eraser architecture authority |
| `README.md` | Setup, implementation summary, product decisions |
| `package.json` | Scripts and installed dependencies |
| `next.config.mjs` | Next.js and image configuration |
| `jsconfig.json` | JavaScript path aliases |
| `prisma/schema.prisma` | Current database schema |
| `prisma/migrations/` | Database migration history |
| `public/` | Static assets, camera models, placeholders |

## App routes

| Path | Responsibility |
| --- | --- |
| `src/app/page.js` | Public homepage composition |
| `src/app/contact/page.js` | Contact page |
| `src/app/layout.js` | Root layout, font, global metadata |
| `src/app/globals.css` | Global styles |
| `src/app/gallery/[token]/page.js` | Private gallery entry / gallery page |
| `src/app/gallery/[token]/media/[mediaId]/route.js` | Gallery-scoped media response |
| `src/app/gallery/[token]/error.js` | Gallery error boundary |
| `src/app/gallery/[token]/not-found.js` | Gallery not-found UI |
| `src/app/gallery/preview/route.js` | Development-only sample gallery |

## Feature modules

### Public site — `src/features/public-site/`
- `components/`: About, Contact, Footer, Hero, Navbar, Portfolio, Services.
- `content/site-content.js`: centralized public-site copy, links, portfolio and service data.

### Motion — `src/features/motion/`
- `components/MotionExperience.jsx`: client wrapper and camera lazy-loading.
- `components/MotionOrchestrator.jsx`: GSAP / ScrollTrigger choreography.
- `components/PersistentCamera.jsx`: React Three Fiber camera scene and model.

### Private gallery — `src/features/private-gallery/`
- `components/GalleryEntry.jsx`, `GalleryEntryForm.jsx`: visitor entry UI.
- `components/PrivateGallery.jsx`: gallery media grid.
- `validation.mjs`: server-side visitor input validation.
- `server/actions.js`: `submitGalleryEntry` Server Action.
- `server/gallery-access.js`: signed link and visitor access validation.
- `server/gallery-secret.js`: signing secret boundary.
- `server/secure-token.mjs`: HMAC token primitives.
- `server/gallery-repository.js`: repository adapter selection.
- `server/prisma-gallery-repository.js`: Prisma persistence.
- `server/local-gallery-repository.js`: local development persistence.
- `server/local-gallery-records.mjs`: local sample records.

## Shared UI and utilities

| Path | Responsibility |
| --- | --- |
| `src/components/ui/` | Reusable button, container, link, section, typography, visually-hidden components |
| `src/lib/ui/cn.js` | Class-name utility |
| `src/lib/url/is-external-url.js` | External URL helper |
| `src/config/site.js` | Site name, description, canonical URL |
| `src/styles/tokens.css` | Design tokens |

## Project documentation

| Path | Responsibility |
| --- | --- |
| `docs/design-system/architecture/` | Architecture, data, API, storage, security, roadmap |
| `docs/design-system/design/` | Visual language, design principles, components |
| `docs/design-system/development/` | Coding, testing, git, workflow notes |
| `docs/design-system/performance/` | Performance budgets and optimization guidance |
| `docs/design-system/production/` | Implementation status, API reference, deployment and security checklists |
| `docs/ai/README.md` | AI workspace entry point |

## Database and media assets

- `prisma/schema.prisma`: authoritative current Prisma model definitions.
- `prisma/migrations/`: SQL migrations.
- `public/cameras/camera.glb`: camera model referenced by the motion component.
- `public/cameras/environment.hdr`: environment lighting asset.
- `public/placeholders/`: temporary public-site imagery.

## Finding the owner of a behavior

- Public page layout: start at `src/app/`, then follow imports into `src/features/public-site/`.
- Camera behavior: start at `MotionExperience.jsx`, then `MotionOrchestrator.jsx` and `PersistentCamera.jsx`.
- Gallery entry: start at `GalleryEntryForm.jsx`, follow to `server/actions.js`.
- Gallery authorization: `server/gallery-access.js`.
- Gallery persistence: `server/gallery-repository.js` and its adapters.
- Media delivery: `src/app/gallery/[token]/media/[mediaId]/route.js`.
- Database shape: `prisma/schema.prisma`.

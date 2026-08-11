# Implementation Status

> **Project:** DDS Photographer
>
> **Current stage:** Phase 4 — Complete
>
> **Completed work:** Phase 1A, Phase 1B, Phase 2, Phase 3, and Phase 4
>
> **Last verified:** 2026-08-11

## Current Implementation

The repository includes the full Phase 1 foundation and the Phase 2 public
marketing website. The application uses Next.js 16, React 19, JavaScript,
Tailwind CSS v4, and the App Router under `src/app/`.

Phase 2 implements the public Navbar, Hero, About, Portfolio, Services,
Contact, and Footer sections. Phase 3 enhances those approved sections with a
lazy-loaded persistent camera scene, a GSAP/ScrollTrigger journey, the Hero
photo-stack reveal, restrained section and portfolio transitions, a contact
camera state, and a non-blocking shutter ending. Static content remains
server-rendered; browser-only motion is isolated in a small client feature.

Final production copy and photography were unavailable during implementation.
The existing local SVG media remains in use. A low-draw-call procedural R3F
camera provides the development 3D implementation, while the existing HTML
camera preserves a complete fallback when JavaScript, WebGL, or motion is
unavailable. Replacing these assets does not require changing the motion
boundary.

Phase 4 adds a simple private-gallery path at `/gallery/[token]`. The gallery
link or QR destination contains a signed, random-nonce token that is validated
on the server for signature, expiry, token version, gallery existence, and
gallery availability. It shows the gallery cover and requests name, mobile,
email, and explicit consent. Successful server validation upserts one visitor
per gallery and normalized email, then grants a signed, expiring,
gallery-scoped, HTTP-only cookie. This access cookie is a lightweight gallery
grant, not an authenticated user account.

PostgreSQL and Prisma remain the production persistence boundary. `Gallery`
owns `GalleryVisitor` records containing `galleryId`, `name`, `mobile`, `email`,
`consent`, `consentedAt`, and timestamps; an internal primary key supports the
relationship and access grant. `GalleryMedia` records are also gallery-scoped,
and their delivery route revalidates the gallery token and visitor grant before
serving non-cover media.

When production credentials are absent during development, Phase 4 uses an
ignored `.data/private-gallery/` file adapter and server-generated placeholder
media. The development-only `/gallery/preview` route creates a sample gallery
link; it returns `404` in production or whenever `DATABASE_URL` is configured.
The fallback never writes visitor data or private media into `public/`.

## Phase Status

| Phase                                       | Status      |
| ------------------------------------------- | ----------- |
| Phase 0 — Architecture and baseline audit   | Complete    |
| Phase 1A — Foundation, Part 1               | Complete    |
| Phase 1B — Foundation, Part 2               | Complete    |
| Phase 2 — Marketing website                 | Complete    |
| Phase 3 — Motion and interactive experience | Complete    |
| Phase 4 — Private gallery platform          | Complete    |
| Phase 5 — Admin dashboard and production    | Not started |

## Confirmed Decisions

- The approved application root is `src/app/`.
- The project is currently JavaScript-based.
- Manrope is the only approved font family; weights `400`, `500`, `600`, and
  `700` are loaded, with `600` used for semibold typography.
- Design tokens are centralized in `src/styles/tokens.css`.
- Generic UI primitives live under `src/components/ui/` and contain no feature
  logic.
- Foundation utilities live under `src/lib/`; site configuration lives under
  `src/config/`.
- `NEXT_PUBLIC_SITE_URL` is the only Phase 1 environment variable.
- ESLint, Prettier, EditorConfig, and import ordering are configured.
- The Eraser workspace defines future architecture and workflows; it does not
  prove those features are implemented.
- Actual implementation claims must be supported by repository code and Git
  history.
- Phase 3 uses one demand-rendered React Three Fiber canvas and one primary
  GSAP camera journey. Scoped ScrollTriggers handle the Hero stack, section
  reveals, contact emphasis, and shutter ending and are reverted on unmount.
- Framer Motion was not required. Existing CSS transitions remain the smaller
  and more appropriate mechanism for portfolio and service hover feedback.
- Reduced-motion users receive the complete static site without mounting the
  3D canvas or initializing GSAP choreography.
- The Phase 2 implementation does not contain an Experience section, so Phase
  3 does not invent one.
- Testimonials are explicitly excluded from the approved Phase 2 scope.
- Private gallery links use signed, unpredictable tokens with a 30-day expiry
  and gallery token-version revocation.
- Gallery access after consent uses a signed 12-hour HTTP-only, SameSite=Lax,
  gallery-scoped cookie. It is not account authentication.
- Visitor input is trimmed and validated on the server. Consent is required and
  records both `consent = true` and `consentedAt`.
- The `(galleryId, email)` database uniqueness constraint prevents duplicate
  visitor records while allowing the same email in different galleries.
- Private media IDs are resolved only inside the validated gallery context.

## Known Issues and Blockers

There are no known Phase 2 blockers. Final photography, biography, contact
details, and social links must replace the clearly marked temporary content
before production publishing.

A candidate untracked `public/cameras/camera.glb` appeared concurrently during
Phase 3 work and was preserved untouched. Read-only inspection reports 136,266
triangles, above the approved target of fewer than 100k, so it is not wired
into production rendering. Optimize and approve that model (and validate the
candidate environment map) before replacing the procedural camera through the
existing isolated component. Final photography, biography, contact details,
and social links also remain outstanding.

React Three Fiber currently emits an upstream `THREE.Clock` deprecation
warning with the installed Three.js version during development. It does not
affect rendering, linting, or the production build; there are no application
runtime errors.

The repository-wide Prettier check may report pre-existing formatting
differences across legacy documentation. Unrelated legacy files were not
rewritten.

Production Phase 4 deployment requires a PostgreSQL `DATABASE_URL`, a
server-only `GALLERY_TOKEN_SECRET` of at least 32 characters, `prisma migrate
deploy`, provisioned gallery/media records, and the approved private storage
provider behind the protected media route. The development adapter and
placeholder renderer are intentionally not production integrations.

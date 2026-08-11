# Implemented Features

> **Last verified:** 2026-08-11
>
> **Evidence:** Current repository code and Git history

## Implemented

### Phase 1A Foundation

- Next.js 16 and React 19 App Router scaffold under `src/app/`
- Tailwind CSS v4 global styling entry point
- Centralized design-token foundation
- Manrope font loading with weights `400`, `500`, `600`, and `700`
- Foundation-level focus, media, selection, and reduced-motion defaults
- Project implementation-status documentation

### Phase 1B Foundation

- Generic Container and Section layout primitives
- Generic Heading and Text typography primitives
- Accessible Button, Link, and VisuallyHidden primitives
- Class-name merging and external-URL detection utilities
- Centralized site URL and metadata configuration
- ESLint, Prettier, EditorConfig, and import-ordering foundation
- Safe `.env.example` containing only the current public site URL
- Developer setup and environment documentation

### Phase 2 Public Website

- Responsive floating Navbar with documented navigation items and mobile menu
- Static Phase 2 Hero with camera-inspired fallback composition and primary CTA
- Editorial About section using temporary neutral copy and local media
- Disciplined responsive portfolio wall with configurable local item data,
  ordered rendering, mixed aspect ratios, optimized images, lazy loading, and
  descriptive alt text
- Four-service presentation using temporary neutral content
- Accessible Contact section with clearly marked placeholder details
- Responsive Footer with navigation, services, contact, social-link previews,
  and a disabled newsletter UI that does not imply backend functionality
- Page-level metadata, skip navigation, semantic landmarks, visible focus, and
  reduced-motion support
- Mobile, tablet, desktop, and large-desktop responsive layouts

### Phase 3 Motion and Interactive Experience

- Single lazy-loaded, demand-rendered React Three Fiber canvas for the
  persistent camera story
- Lightweight procedural camera development model with front lens, rear LCD,
  studio lighting, responsive scale, and an HTML/WebGL failure fallback
- One GSAP/ScrollTrigger camera journey tied to document progress with scoped
  and cleaned-up section timelines
- Sticky Hero handoff from the existing camera/LCD image into a layered
  photo-stack reveal
- Curved, upward photo paths using transform-only horizontal and vertical
  keyframes, controlled stacking, and progressive opacity
- Camera handoff and persistent states across About, Portfolio, Services, and
  Contact without introducing an unapproved Experience section
- Accessible section reveals that keep content in the accessibility tree
- Restrained Portfolio lift/scale and Services spacing feedback using CSS
- Contact camera emphasis and a reversible, pointer-transparent shutter ending
- Mobile-scaled camera placement, reduced Hero travel, and verified responsive
  layouts at 390px, 768px, 1280px, and 1600px
- `prefers-reduced-motion` path that omits the 3D scene and GSAP choreography
  while preserving the complete static website

### Phase 4 Simple Private Gallery

- `/gallery/[token]` gallery-link and QR destination convention
- Signed gallery link with a cryptographic random nonce, expiry, gallery ID,
  and token version
- Server validation of token signature, expiry, gallery existence, active
  status, availability window, and token version
- Safe invalid-gallery, form-error, and unexpected-error states without
  internal details
- Private entry presentation with the first gallery photo, gallery identity,
  name, mobile, email, explicit consent, and pending feedback
- Server-side trimming, length limits, phone/email validation, and required
  consent validation
- Accessible form labels, input types, autocomplete metadata, visible focus,
  keyboard operation, checkbox behavior, and associated errors
- Prisma/PostgreSQL `Gallery`, `GalleryVisitor`, and `GalleryMedia` models plus
  a Phase 4 migration
- One-to-many Gallery-to-GalleryVisitor relationship with a unique
  `(galleryId, email)` constraint
- Duplicate visitor upsert that refreshes details and consent timestamp instead
  of creating a record on every submission
- Signed 12-hour HTTP-only gallery access cookie; no user authentication or
  account model
- Gallery-scoped visitor and media authorization that rejects URL, token,
  gallery, and media-ID tampering
- Protected media route with private no-store responses and no private media in
  `public/`
- Ignored private development persistence and server-generated media adapter
  for credential-free local verification
- Development-only preview-link route that is unavailable in production
- Responsive entry and gallery layouts at mobile, tablet, desktop, and large
  desktop widths

### Temporary Phase 2 Content

- Centralized replaceable copy and link data in the public-site feature
- Local neutral SVG assets under `public/placeholders/`
- Visible temporary labels that prevent placeholder details from being
  presented as verified business information
- Procedural development camera used until an approved optimized GLB and
  compressed textures are supplied

## Not Implemented

- Testimonials (explicitly excluded from Phase 2)
- Account authentication, login, signup, password, or OTP
- Admin dashboard
- Media uploads or processing pipeline
- Production private-storage provider or CDN integration
- QR-code delivery
- AI search or face recognition
- Notifications or sharing workflows
- Payments
- Analytics
- Approved sub-100k-triangle production camera GLB and validated environment
  texture (the concurrent candidate model exceeds the approved triangle budget)
- Framer Motion component animations (not required by the implemented Phase 3
  interactions)

## Deferred / Future

- Phase 5: admin dashboard, production hardening, analytics, and deployment

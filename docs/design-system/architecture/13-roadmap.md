# Development Roadmap

> Reconciled with repository implementation and owner decisions on 2026-10-26.
> The Eraser workspace remains the primary approved architecture reference under `AGENTS.md`; this file does not replace it.

## Phase status

| Phase | Scope                                    | Status      |
| ----- | ---------------------------------------- | ----------- |
| 0     | Architecture and baseline audit          | Complete    |
| 1A    | Application foundation, Part 1           | Complete    |
| 1B    | Application foundation, Part 2           | Complete    |
| 2     | Public marketing website                 | Complete    |
| 3     | Camera-led motion experience             | Complete    |
| 4     | First private-gallery foundation         | Complete    |
| 5     | Admin dashboard and production readiness | Not started |

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

| Decision            | Direction                           | Boundary                         |
| ------------------- | ----------------------------------- | -------------------------------- |
| Guest password      | One shared password per wedding     | Selected; implementation pending |
| Gallery expiry      | Extendable                          | Selected; policy details pending |
| Photo storage       | Cloudflare R2                       | Selected; integration pending    |
| Video               | Cloudflare Stream                   | On hold; photo-only              |
| Background jobs     | Redis + BullMQ                      | Selected; integration pending    |
| Face matching       | SFace                               | Evaluation only                  |
| Face-search consent | Separate, explicit, optional opt-in | Required before processing       |

## Change control

1. Implement only the current approved phase.
2. Verify implementation claims against source, tests, migrations, and deploy configuration.
3. Do not add future-phase dependencies or infrastructure early.
4. Record decisions with date, rationale, status, and affected documents.
5. If this roadmap conflicts with Eraser, stop and ask before implementation.

## Public experience refinement — cinematic camera-to-photograph journey

> **Documentation update:** 2026-11-13  
> **Status:** Planned refinement; no implementation is claimed by this section.  
> **Scope:** Public photographer website only. This does not replace or reopen completed phases.

Phase 3 remains **Complete** for the camera-led motion foundation already recorded above. The following is a follow-on experience refinement, not a reclassification of that completed work and not approval to replace the existing motion architecture.

### Experience direction

- Preserve the premium, minimal, editorial visual direction: predominantly black and white, restrained warm-gold/gray accents, large confident typography, and photography as the primary focus.
- Avoid gradients, glassmorphism, visual clutter, and decorative motion without a storytelling purpose.
- On entry, the camera makes a slow, controlled entrance, settles near the center, and shows the first featured photograph on its LCD.
- The first photograph should appear to originate from the LCD. As the visitor scrolls, it lifts out and travels upward along a soft curved, check-mark-like path, then settles into a layered composition.
- Subsequent photographs repeat the same visual story: the LCD previews the next image while earlier photographs remain layered in the composition. Avoid straight, mechanical, random, or abrupt movement.
- The camera must not permanently disappear after the hero sequence. It remains a visual companion across the site, changing scale, depth, position, or subtle orientation only when that supports the current section.
- About: camera may sit beside the content without competing with readability.
- Experience / portfolio: camera may react subtly while photography remains dominant.
- Services and testimonials: use restrained, editorial layouts and section transitions; do not introduce unnecessary animation.
- Contact: use a prominent camera-lens-inspired call to action.
- Footer: close the journey with a restrained shutter-inspired ending.

### Motion and implementation boundaries

- Keep the existing React Three Fiber / Three.js camera scene and GSAP / ScrollTrigger orchestration as the implementation baseline.
- Do not add a second animation engine or replace the existing architecture as part of this refinement.
- The intended LCD-to-photo origin should be based on the camera's actual LCD anchor projected into screen coordinates; the visual spawn point must remain aligned if the camera moves.
- Keep photographs as responsive HTML image elements where appropriate, with optimized loading, semantic alt text, and responsive behavior.
- Keep the camera persistent through section transitions; any temporary reduction in opacity or emphasis must be reversible and must not read as a permanent exit.
- Preserve reduced-motion support, keyboard/accessibility requirements, and a fully usable static experience.
- Motion should be slow, smooth, natural, and scroll-responsive. Do not block scrolling or make visitors wait for long sequences.

### Completion criteria for this refinement

- The first featured image visibly originates from the camera LCD.
- Each following image previews in the LCD and follows the same intentional reveal behavior.
- The curved upward path and layered landing read as physical printed photographs.
- The camera remains present as a companion throughout the public site, including the final contact/footer journey.
- Section content remains readable and photography remains the visual priority.
- Desktop, tablet, mobile, and reduced-motion experiences remain usable.
- Implementation is verified in code before any status document marks these items implemented.

### Sequencing

1. Finalize the LCD anchor and camera-to-screen coordinate contract.
2. Implement and verify the first LCD-to-photo reveal.
3. Extend the reveal to a repeatable sequence and layered landing.
4. Tune persistent camera placement and section-specific behavior.
5. Complete the contact lens CTA and footer shutter ending.
6. Verify responsive behavior, reduced motion, accessibility, and performance.

The above sequence is a planned work breakdown. It does not mark any of these follow-on behaviors as implemented.

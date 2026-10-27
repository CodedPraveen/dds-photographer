# Product Requirements — DDS Photographer

**Status:** Product specification  
**Scope:** Priority 3 — product clarity  
**Last reconciled:** 2026-10-27  
**Architecture authority:** Eraser workspace, as required by `AGENTS.md`

## 1. Product overview

DDS Photographer is a premium, single-photographer business website. It combines a cinematic public portfolio with private wedding/event photo galleries. The public website helps prospective clients understand the photographer's work, services, approach, and contact route. Private galleries let invited guests access photographs from a specific event.

This is not an approved multi-studio, multi-tenant SaaS product.

## 2. Product goals

1. Present the photographer's work through a refined, image-led public experience.
2. Make it easy for prospective clients to understand the service offering and contact the photographer.
3. Provide a private, gallery-scoped experience for wedding/event guests.
4. Give the photographer a future operational path to create and manage galleries and their media.
5. Protect private photographs and guest information through clear access boundaries.
6. Keep optional face-search separate from ordinary gallery access and do not launch it without a complete privacy lifecycle.

## 3. Users and actors

| Actor | Need | Current product boundary |
| --- | --- | --- |
| Public visitor / prospective client | Explore work, learn about services, contact photographer | Public website implemented |
| Gallery guest | Open an invited event gallery and view its photos | Private-gallery foundation implemented |
| Photographer / administrator | Create and manage event galleries and photos | Admin platform planned, not implemented |
| Face-search participant | Optionally use a future face-search feature | Evaluation only; no production feature |

There is one photographer/business owner in the current product model. A guest is not an admin account. A shared wedding password, once implemented, is a gallery-level gate and not unique guest identity.

## 4. Product scope

### In scope
- Public homepage and contact experience.
- Public portfolio, about, services, and photographer contact information.
- Camera-led cinematic storytelling and responsive motion.
- Private wedding/event galleries accessed through a signed gallery link.
- Guest entry details and gallery-entry consent.
- Gallery-scoped visitor authorization and protected media route.
- Future admin management, shared wedding password, extendable expiry, photo uploads, QR delivery, and private photo storage as selected/planned work.
- A separate optional face-search consent and deletion design before any face-search processing.

### Explicitly not in current scope
- Multi-studio or multi-tenant SaaS.
- Video upload/playback; Cloudflare Stream is on hold and current scope is photos only.
- Payments, favorites, mobile applications.
- Production face recognition/search. SFace is evaluation-only.
- Any feature not approved in the Eraser architecture or current roadmap.

## 5. Product status model

| Capability | Status | Meaning |
| --- | --- | --- |
| Public website | Implemented | Homepage, contact, public sections and content components exist |
| Camera-led motion | Implemented | R3F/Three.js camera and GSAP/ScrollTrigger choreography exist |
| Private gallery | Foundation implemented | Signed link, entry form, visitor cookie and scoped media route exist |
| Admin platform | Planned | Not implemented |
| R2 photo storage | Selected, not integrated | Future private photo storage direction |
| Redis + BullMQ | Selected, not integrated | Future background processing direction |
| Shared wedding password | Selected, not implemented | One shared password per wedding |
| Extendable gallery expiry | Selected, policy pending | Exact policy is an open decision |
| Face matching | Evaluation only | SFace is not production-approved |
| Video | On hold | Do not implement |

Installed packages, conceptual diagrams, or selected vendors do not establish implementation.

## 6. Primary journeys

### 6.1 Prospective client
1. Arrives at the public website.
2. Encounters the camera-led hero and image-focused storytelling.
3. Explores portfolio work and the photographer's approach.
4. Reviews available services.
5. Uses the contact route to make an inquiry.

The current contact details and photography are placeholder content and must be replaced with verified business content before public launch.

### 6.2 Gallery guest
1. Receives a private gallery link or QR code in a future delivery workflow.
2. Opens `/gallery/[token]`.
3. The server validates the signed link and gallery availability.
4. If not already authorized, the guest completes the gallery-entry form.
5. The server validates details and gallery-entry consent, records/updates the visitor, and issues a gallery-scoped access cookie.
6. The guest views only media belonging to that gallery.

A shared wedding password is selected but not yet implemented. The final guest flow must include it when the approved design is implemented. Do not describe the current form as password-protected.

### 6.3 Photographer/admin
1. Authenticates to a future admin area.
2. Creates or edits a wedding/event gallery.
3. Configures its availability and shared password.
4. Adds, orders, and publishes photos.
5. Shares a private link and/or QR code.
6. Extends, closes, reopens, or revokes access as permitted by the final lifecycle policy.

The admin journey is planned and must not be represented as currently usable.

## 7. Product-wide requirements

- Private gallery access must be scoped to the intended gallery.
- Invalid, expired, inactive, or revoked links must not expose private gallery content.
- Guest consent for gallery entry must be distinct from any future face-search consent.
- Declining optional face search must never block ordinary gallery access.
- Private media must not be exposed through public, guessable, or unrestricted storage URLs.
- User-facing errors should be clear and recoverable without exposing secrets or internals.
- Public and private experiences must remain usable on mobile and with reduced-motion preferences.
- Photography remains the primary visual focus; motion must support, not compete with, content.

## 8. Success measures

No numeric targets have been approved. Product review should assess:
- Visitors can identify the photographer's work and services.
- Visitors can reach the contact route without confusion.
- Gallery guests can enter and view only their intended gallery.
- Invalid/revoked/expired access does not reveal private media.
- Guests who decline face search can still use the normal gallery.
- Photographer workflows can be completed without manual database intervention once admin functionality exists.

## 9. Dependencies and constraints

- Eraser workspace is the primary approved architecture reference.
- Current implementation status is described in `docs/design-system/production/IMPLEMENTATION_STATUS.md`.
- Current Prisma models are `Gallery`, `GalleryMedia`, and `GalleryVisitor`.
- Cloudflare R2 and Redis + BullMQ are selected but not integrated.
- Exact gallery expiry, retention/deletion, password rotation, and face-data lifecycle remain open.

## 10. Open product decisions

| Question | Current state |
| --- | --- |
| Default and maximum gallery availability | Open |
| Whether shared password is required for every gallery or configurable | Selected as one shared password per wedding; enforcement details open |
| Password rotation cadence and failed-attempt policy | Open |
| Whether QR codes encode the signed link directly or use a redirect | Open |
| Exact gallery close/reopen behavior | Open |
| Retention period for photos, guest details, consent records, logs, backups | Open |
| Face-search launch decision, notice, eligible users, and data lifecycle | Not approved |
| Final public business copy, portfolio images, testimonials, contact details | Placeholder content remains |

Do not resolve these questions by inventing defaults. Record owner decisions and update this document plus the affected specifications.

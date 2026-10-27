# Product Acceptance Criteria — DDS Photographer

**Status:** Acceptance baseline for Priority 3  
**Last reconciled:** 2026-10-27

## 1. Purpose

This document defines observable product outcomes for the public website, private-gallery foundation, planned admin/media capabilities, privacy requirements, and lifecycle. It is a product acceptance checklist, not a substitute for engineering test plans.

Status labels:
- **Implemented baseline:** behavior exists in the current repository and should be regression-tested.
- **Planned acceptance:** required before the corresponding future feature is considered complete.
- **Open:** depends on an owner decision or policy not yet supplied.

## 2. Public website — implemented baseline

- [ ] Homepage loads and presents the approved public sections.
- [ ] Navigation reaches the intended page/section.
- [ ] Portfolio images and descriptions are meaningful and do not use placeholder content at launch.
- [ ] About content is accurate and owner-approved.
- [ ] Services shown match the photographer's actual offering.
- [ ] Contact details and social links are verified and functional.
- [ ] Layout adapts to mobile, tablet, and desktop.
- [ ] Keyboard users can navigate links and controls.
- [ ] Focus indicators are visible.
- [ ] Reduced-motion preference leaves the site usable.
- [ ] If WebGL/camera rendering is unavailable, meaningful fallback content remains.
- [ ] Motion does not trap or block scrolling.
- [ ] Images have appropriate alternative text.
- [ ] Page metadata and semantic headings are reviewed.

## 3. Camera and motion — implemented baseline

- [ ] Camera scene loads lazily and does not prevent core content from rendering.
- [ ] Camera and scroll choreography remain visually coherent.
- [ ] Service interaction updates the camera scene as designed.
- [ ] Reduced-motion mode avoids the full motion sequence and preserves content.
- [ ] Mobile behavior remains performant and usable.
- [ ] Motion does not obscure text or make photographs difficult to inspect.
- [ ] No unnecessary bounce, random motion, or blocking transition is introduced.

The detailed storyboard beats in the supplied Design Finalization Workflow should be verified against the actual approved storyboard and running implementation; do not mark them complete from the prompt alone.

## 4. Private gallery — implemented baseline

### Link and gallery validation
- [ ] A valid signed link for an active gallery opens the correct gallery.
- [ ] Invalid signature is rejected.
- [ ] Expired link is rejected.
- [ ] Token-version mismatch is rejected.
- [ ] Inactive gallery is unavailable.
- [ ] Gallery before `opensAt` is unavailable.
- [ ] Gallery at/after `closesAt` is unavailable.
- [ ] One gallery's token cannot access another gallery.

### Guest entry
- [ ] Entry requires name, mobile, email, and gallery-entry consent.
- [ ] Missing/invalid fields produce clear field-level feedback.
- [ ] Email normalization is consistent.
- [ ] Visitor record is scoped to the gallery.
- [ ] Re-entry/upsert behavior does not create unintended duplicate visitor records for the same gallery/email.
- [ ] Successful entry issues a signed 12-hour HTTP-only, SameSite=Lax cookie scoped to `/gallery`, Secure in production.
- [ ] Cookie for one gallery cannot authorize another gallery.
- [ ] Missing, malformed, or expired visitor cookie is rejected.
- [ ] Existing gallery-entry consent is never treated as face-search consent.

### Media access
- [ ] Media ID is resolved only within the token's gallery.
- [ ] Non-cover media requires a valid visitor grant.
- [ ] Unauthorized requests do not reveal whether a media ID exists in another gallery.
- [ ] Private responses do not become publicly cacheable.
- [ ] Production storage failure is handled safely; current non-development media delivery returns 503 and is not production-ready.
- [ ] Development preview is unavailable in production and when `DATABASE_URL` is configured.

## 5. Shared wedding password — planned acceptance

- [ ] Each gallery uses the approved shared-password behavior.
- [ ] Password is verified server-side.
- [ ] Plaintext password is never stored, returned, logged, or placed in a URL.
- [ ] Incorrect attempts receive safe feedback and abuse controls.
- [ ] Password rotation takes effect according to the approved policy.
- [ ] Revoked/rotated credentials cannot continue to grant new access.
- [ ] Password gate remains distinct from visitor details, gallery-entry consent, and visitor authorization.
- [ ] Exact requirement for whether every gallery must have a password is resolved.

## 6. Admin platform — planned acceptance

- [ ] Only authenticated and authorized photographer/admin can access admin routes.
- [ ] Unauthenticated and unauthorized requests cannot read or mutate gallery management data.
- [ ] Photographer can create and edit a gallery.
- [ ] Photographer can configure approved availability settings.
- [ ] Photographer can set/change the wedding password without retrieving its plaintext.
- [ ] Photographer can add, order, set cover, publish, and remove photos.
- [ ] Photographer can copy/share a private link and generate a QR code.
- [ ] Photographer can extend, close, reopen, deactivate, and revoke according to approved lifecycle rules.
- [ ] Destructive operations require confirmation and provide clear results.
- [ ] Access-affecting admin actions are auditable.
- [ ] Draft/publish states and exact dashboard metrics are resolved before implementation.

## 7. Photo pipeline — planned acceptance

- [ ] Supported formats and file/volume limits are documented in the UI.
- [ ] Unsupported, corrupt, or over-limit files are rejected with actionable feedback.
- [ ] Per-file upload and processing states are visible.
- [ ] Partial batch success is preserved.
- [ ] Upload completion is verified before media is published.
- [ ] Processing is safe and recoverable.
- [ ] Retrying a failed operation does not create duplicate media records or duplicate published assets.
- [ ] Cover and ordering changes are reflected consistently.
- [ ] Originals/derivatives remain in private storage.
- [ ] Guest delivery checks gallery authorization for every photo.
- [ ] Metadata handling and guest download behavior follow the approved policy.
- [ ] Video is not accepted while the product remains photo-only.

## 8. Face-search privacy — launch gate

- [ ] Face search remains unavailable until explicit production approval.
- [ ] A standalone plain-language notice appears before any face-related collection/processing.
- [ ] Consent is separate from gallery-entry consent.
- [ ] Opt-in is optional, affirmative, and unchecked by default.
- [ ] Declining face search does not block gallery access or ordinary photo browsing.
- [ ] Notice/version, purpose, scope, timestamp, and affirmative action are recorded.
- [ ] SFace license/provenance, accuracy, false matches, and bias are evaluated.
- [ ] Results are communicated as possible matches, not guaranteed identity.
- [ ] Withdrawal prevents further processing.
- [ ] Source and derived face-search data deletion is implemented and verifiable.
- [ ] Cross-gallery search is prohibited unless separately approved.
- [ ] Legal/privacy/security review is complete.

## 9. Retention and lifecycle — planned acceptance

- [ ] Gallery availability, link expiry, visitor-cookie expiry, and retention are distinct.
- [ ] Default/max availability and extension policy are approved.
- [ ] Closing/revoking a gallery prevents future private-media access.
- [ ] Reopening behavior for links, passwords, and visitor grants is explicit.
- [ ] Deletion covers originals, derivatives, metadata, visitor data, and relevant processing records.
- [ ] Backup expiry and restore behavior are documented and tested.
- [ ] Consent evidence retention is purpose-specific.
- [ ] Guest-facing expiry/deletion communication follows approved policy.

## 10. Release readiness

A feature is not accepted merely because its UI exists. Before release:
- [ ] Product behavior matches the approved Eraser architecture and product specification.
- [ ] Current implementation status is accurately documented.
- [ ] Security/privacy review is complete for affected data and access paths.
- [ ] Mobile and accessibility checks pass.
- [ ] Error, empty, loading, and recovery states are covered.
- [ ] Tests cover positive, negative, cross-gallery, expiry, and revocation cases as applicable.
- [ ] Required engineering/operational readiness is documented separately in Priority 4 specifications.
- [ ] No open product decision is silently converted into a default.

## 11. Known open acceptance dependencies

Numeric gallery retention periods, default/max expiry, file limits, supported formats, password rotation, admin authentication, face-search production approval, and backup policy remain open. Acceptance checks depending on these decisions cannot be marked complete until the owner resolves them.

# Private Gallery — Product Specification

**Status:** Foundation implemented; production delivery incomplete  
**Last reconciled:** 2026-10-27

## 1. Purpose

A private gallery gives invited guests access to photographs from one wedding or event. A guest must only see media belonging to the gallery they are authorized to enter.

The current implementation is a foundation, not a complete production gallery platform.

## 2. Actors

- **Gallery guest:** receives a private link and views event photos.
- **Photographer/admin:** future actor who creates, configures, publishes, extends, closes, and revokes galleries.
- **System:** validates link/access, records visitor entry, and serves gallery-scoped media.

## 3. Access model and current behavior

### Implemented
- Route: `/gallery/[token]`.
- Signed gallery-link token includes gallery ID, random nonce, token version, issue time, and expiry.
- Link token duration is currently 30 days.
- Token validation checks signature, expiry, gallery availability, active state, and token version.
- Token-version mismatch supports revocation of previously issued links.
- A guest without a valid gallery-scoped visitor cookie sees the entry form.
- Entry form collects name, mobile, email, and gallery-entry consent.
- Server validates input, normalizes email, upserts visitor by gallery/email, and grants access.
- Visitor access cookie is signed, HTTP-only, SameSite=Lax, scoped to `/gallery`, Secure in production, and lasts 12 hours.
- Non-cover media requires a valid gallery-scoped visitor grant.
- Media is resolved inside the validated gallery; IDs from another gallery must not be accepted.

### Selected but not implemented
- One shared password per wedding.
- Extendable gallery expiry.
- Photographer/admin controls for gallery creation and lifecycle.
- QR-code generation and distribution workflow.
- Production private media storage/delivery through Cloudflare R2.

Do not describe the current gallery entry form as already password-protected. The shared wedding password is selected future functionality.

## 4. Intended guest journey

1. Guest opens a gallery link or scans a future QR code.
2. System validates link signature, token expiry, gallery state, and token version.
3. If the gallery requires its shared password, guest enters it; password handling is not yet implemented.
4. Guest completes the gallery-entry form and accepts the gallery-entry notice/consent.
5. Server validates fields and consent.
6. Server records or updates the visitor in the context of that gallery.
7. Server issues a signed gallery-scoped visitor grant.
8. Guest views the gallery and opens authorized photos.
9. When the visitor grant expires, the guest must re-enter through the approved access flow.

The exact ordering of password and visitor-details collection is a product decision to confirm during the admin/security design. Whichever order is selected, password verification and visitor authorization must remain distinct checks.

## 5. Gallery content experience

- Gallery content is photo-only in the current scope.
- Guests can view only photos assigned to the current gallery.
- Cover media may be available before visitor authorization as currently implemented; non-cover media requires the visitor grant. Preserve this behavior only if it remains consistent with the approved product design.
- Media ordering is represented by `sortOrder`; cover state by `isCover`.
- Gallery media must not expose internal storage keys or unrestricted object URLs.
- Loading, empty, and failure states should be understandable and recoverable.
- Video is out of scope; Cloudflare Stream is on hold.

## 6. Visitor information and consent

Current required entry fields:
- Name
- Mobile number
- Email address
- Explicit gallery-entry consent

Current validation limits are implemented in `src/features/private-gallery/validation.mjs`: name 80 characters, mobile 24 characters, email 254 characters, with server-side validation. The product spec does not add further mandatory personal-data fields.

The current `GalleryVisitor.consent` and `consentedAt` fields are gallery-entry consent only. They must never authorize selfie collection, face crops, embeddings, matching, or face-search results.

Face-search consent is a separate optional affirmative choice and must not be required for gallery access.

## 7. Access failure states

The product must handle:
- Invalid or malformed link.
- Expired link.
- Revoked link / token-version mismatch.
- Gallery inactive or outside its availability window.
- Incorrect shared password (once implemented).
- Missing or expired visitor grant.
- Media not found in this gallery.
- Temporary service/storage failure.
- Empty gallery or no published photos.

Messages must not disclose whether unrelated gallery IDs, visitors, or storage objects exist. Provide a safe retry or contact-photographer path where appropriate.

## 8. Gallery lifecycle

Gallery availability (`opensAt`, `closesAt`), link-token expiry (currently 30 days), visitor cookie expiry (currently 12 hours), and data retention/permanent deletion are separate concepts.

Extendable expiry is selected, but default duration, maximum lifetime, extension rules, and retention schedule remain open. Extending gallery availability must not silently extend an already-issued token or cookie unless that behavior is explicitly approved and designed.

## 9. Privacy and security requirements

- Every gallery and media read is scoped to the validated gallery.
- Link revocation must prevent old token versions from granting access.
- Visitor grants must be gallery-scoped and time-limited.
- Shared password must be stored as a secure hash, never plaintext.
- Password attempts must have abuse controls and not leak into logs/URLs.
- Face-search is optional and separate; declining it cannot block ordinary access.
- Define deletion/retention for visitor records and media before production launch.
- Do not use public object URLs for private photographs.

## 10. Open decisions

- Exact shared-password prompt order relative to visitor details.
- Whether all galleries require the shared password.
- Password rotation, recovery, and failed-attempt policy.
- Default/max gallery availability and extension permissions.
- Guest re-entry behavior after cookie expiry.
- Cover visibility before visitor entry.
- QR destination/redirect behavior.
- Gallery close/reopen semantics.
- Retention/deletion and backup-expiry schedule.
- Guest-facing support/contact path.

# API Reference

> **Status:** Current implementation only
> **Last reconciled:** 2026-10-26
>
> This is a reference for verified App Router routes and one Server Action, not a promise of a stable public REST API.

## GET /gallery/[token]
**Source:** `src/app/gallery/[token]/page.js`

Opens a private gallery using its signed link token.
- Validates signature, type, expiry, nonce, gallery ID, availability, and token version.
- Invalid or unavailable galleries render not-found.
- Without a valid gallery-scoped visitor cookie, the entry form is shown.
- With a valid grant, the private gallery is shown.
- Metadata disables indexing and caching.

Possession of a valid link token is required; full gallery access also requires the visitor grant created by the entry flow.

## Gallery entry Server Action
**Source:** `src/features/private-gallery/server/actions.js`

**Action:** `submitGalleryEntry(token, previousState, formData)`

This is a Next.js Server Action, not a standalone REST endpoint.

Fields: `name`, `mobile`, `email`, `consent`.

Behavior:
- Trims and validates visitor details; normalizes email.
- Requires explicit gallery-entry consent.
- Resolves the gallery token again on the server.
- Upserts visitor using the gallery/email unique key.
- Issues signed 12-hour HTTP-only SameSite=Lax cookie scoped to `/gallery`.
- Redirects to the gallery page on success.

Failure states include field validation errors, invalid/unavailable gallery, and safe generic server error. Internal exception details are not returned.

The consent here is gallery-entry consent only. It does not permit face-search, selfie capture, face embeddings, or matching.

## GET /gallery/[token]/media/[mediaId]
**Source:** `src/app/gallery/[token]/media/[mediaId]/route.js`

Delivers one gallery-scoped media item.

Authorization:
- Revalidates the signed gallery token.
- Resolves `mediaId` only inside the validated gallery.
- Requires a valid visitor access cookie for non-cover media.

Responses:
- `200`: Authorized development placeholder SVG.
- `404`: Invalid token, unknown media ID, or missing visitor grant.
- `503`: Non-development storage key; production storage delivery is not implemented.

Uses private no-store, `X-Content-Type-Options: nosniff`, and `X-Robots-Tag: noindex, nofollow, noarchive` headers. Development SVG also uses a restrictive Content Security Policy.

## GET /gallery/preview
**Source:** `src/app/gallery/preview/route.js`

Creates/reuses a local sample gallery, creates a signed preview link, and redirects to `/gallery/[token]`.

Development only. Returns `404` if `NODE_ENV=production` or `DATABASE_URL` is configured. Never enable this route in production.

## Current credential lifetimes

| Credential | Current behavior |
| --- | --- |
| Gallery-link token | Signed, random nonce, 30-day expiry, gallery ID and token version |
| Visitor access cookie | Signed, 12-hour expiry, HTTP-only, SameSite=Lax, path `/gallery`, Secure in production |
| Revocation | Incrementing gallery `tokenVersion` invalidates previously issued link tokens |

The visitor cookie is a lightweight gallery-scoped grant, not account authentication. The current implementation does not include admin login, guest accounts, or the selected shared wedding-password gate.

## Planned APIs — not implemented
Admin authentication, gallery CRUD, shared wedding-password management, expiry extension/revocation, R2 upload authorization/completion, Redis/BullMQ processing status/retry, QR generation, and face-search consent/search are not current endpoints. Cloudflare Stream/video endpoints are on hold because the current scope is photo-only.

Do not document invented endpoint paths, payloads, response contracts, or error codes. Add them only after API design approval and implementation.

## Related documents
- `../architecture/11-api.md`
- `../architecture/10-security.md`
- `../architecture/13-roadmap.md`
- `IMPLEMENTATION_STATUS.md`
- `IMPLEMENTED_FEATURES.md`

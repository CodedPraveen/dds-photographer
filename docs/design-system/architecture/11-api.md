# API and Route Contract

> Updated 2026-10-26. Lists routes verified in current App Router source. Admin, upload, video, and face-search APIs are not implemented.

## 1. Implemented routes

| Method | Path | Implementation | Behavior |
| --- | --- | --- | --- |
| GET | `/gallery/[token]` | App Router page | Validates signed link; shows entry form or authorized gallery |
| Server Action | Gallery entry form on `/gallery/[token]` | `submitGalleryEntry` | Validates visitor data/consent, upserts visitor, grants cookie, redirects |
| GET | `/gallery/[token]/media/[mediaId]` | Route Handler | Revalidates token and visitor access where required; serves protected media |
| GET | `/gallery/preview` | Route Handler | Development-only sample gallery redirect; 404 in production or when DATABASE_URL is set |

The form mutation is a Next.js Server Action, not a stable public REST endpoint.

## 2. GET /gallery/[token]
- Validates token signature, type, expiry, nonce, gallery ID, availability, and token version on the server.
- Invalid/unavailable gallery renders not-found.
- Without a valid gallery-scoped visitor cookie, renders the entry form.
- With a valid visitor grant, renders the private gallery.
- Metadata disables indexing and caching.

## 3. Gallery entry Server Action
Source: `src/features/private-gallery/server/actions.js`.

Current fields: name, mobile, email, and explicit gallery-entry consent. Server trims and validates values, normalizes email, requires consent, re-resolves the gallery token, upserts visitor by gallery/email, issues a signed 12-hour HTTP-only SameSite=Lax cookie scoped to `/gallery`, and redirects on success. Errors are returned as safe form state.

This is gallery-entry consent only. It does not authorize face search, selfie capture, embeddings, or matching.

## 4. GET /gallery/[token]/media/[mediaId]
- Revalidates gallery-link token.
- Resolves media ID only inside that gallery.
- Requires visitor grant for non-cover media.
- Returns 404 for invalid token, unknown media, or missing visitor grant.
- Uses private no-store, anti-sniffing, and no-index headers.
- Current development media is generated as SVG server-side.
- Non-development storage keys currently return 503 because production storage delivery is not integrated.

Never expose raw storage keys, bucket credentials, or unrestricted object URLs to guests.

## 5. GET /gallery/preview
Creates/reuses local sample gallery and redirects to a signed gallery link. Returns 404 in production or whenever `DATABASE_URL` is configured. Keep it unavailable in production.

## 6. Planned API surfaces — not implemented
Admin authentication/session, gallery CRUD, shared wedding-password management, expiry extension/revocation, R2 upload authorization/completion, processing status/retry, QR generation, and face-search consent/search are future work. Do not invent endpoint paths or payloads before their API designs are approved.

Face-search APIs must not be implemented before separate consent, retention, deletion, and security design is complete.

## 7. Contract maintenance
When a route or Server Action changes, update `../production/API_REFERENCE.md` and this document together. Verify method, path, authorization, validation, response, and error behavior against source.

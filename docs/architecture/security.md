# Security and privacy

## Current controls — IMPLEMENTED

Signed gallery-link tokens contain gallery ID, nonce, token version, and 30-day
expiry. Visitor access is a signed HTTP-only cookie with 12-hour lifetime,
SameSite=Lax, `/gallery` scope, and Secure in production. Media IDs are resolved
inside the validated gallery; non-cover media requires a gallery-scoped grant.
Private responses use no-store/no-index protections. No admin authentication,
guest password, rate limiter, audit system, or face-search processing exists.

## Requirements — APPROVED / PLANNED

The shared wedding password must be hashed, server-verified, rate-limited,
rotatable, revocable, and never logged or placed in URLs. Face-search consent must
be separate, optional, affirmative, unchecked by default, purpose-specific, and
withdrawable; declining it must not block ordinary gallery access.

Admin authentication remains a proposal in [ADR-001](../development/decisions/ADR-001-admin-authentication.md).

See [auth flow](../diagrams/04-auth-authorization-flow.mmd) and [gallery flow](../diagrams/05-private-gallery-access-flow.mmd).

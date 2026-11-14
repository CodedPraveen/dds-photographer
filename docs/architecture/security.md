# Security and privacy

## Current controls — IMPLEMENTED

Signed gallery-link tokens contain gallery ID, nonce, token version, and 30-day
expiry. Visitor access is a signed HTTP-only cookie with 12-hour lifetime,
SameSite=Lax, `/gallery` scope, and Secure in production. Media IDs are resolved
inside the validated gallery; non-cover media requires a gallery-scoped grant.
Private responses use no-store/no-index protections. The Phase 5 admin foundation
now includes database-backed authentication, TOTP verification, session cookies,
rate limiting, audit-event writes, and protected dashboard routes. Password-change
and security-reset flows, audit review UI, guest password, and face-search
processing remain unimplemented.

## Requirements — APPROVED / PLANNED

The shared wedding password must be hashed, server-verified, rate-limited,
rotatable, revocable, and never logged or placed in URLs. Face-search consent must
be separate, optional, affirmative, unchecked by default, purpose-specific, and
withdrawable; declining it must not block ordinary gallery access.

Admin authentication architecture is approved in [ADR-001](../development/decisions/ADR-001-admin-authentication.md)
and partially implemented. The approved target requires one provisioned admin with
TOTP MFA, Argon2id passwords, one-time CLI provisioning, hashed database sessions,
HTTP-only Secure-in-production SameSite=Lax admin cookies, 12-hour idle and 7-day
absolute session limits, revocation on logout/password change/security reset,
five failed attempts per 15 minutes with progressive cooldown, no permanent
automatic lockout, server-side authorization, and one-year audit retention.

These admin policies are distinct from the implemented 30-day gallery-link token
and 12-hour gallery visitor cookie policies. The remaining admin gaps are secure
recovery/reset authority and production scheduling/verification of expired-session
cleanup. TOTP encryption, password change, audit review, and the cleanup script
are implemented locally but still require deployment verification.

See [auth flow](../diagrams/04-auth-authorization-flow.mmd) and [gallery flow](../diagrams/05-private-gallery-access-flow.mmd).

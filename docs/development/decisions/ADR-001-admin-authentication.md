# ADR-001: Admin authentication

Status: `APPROVED` — owner approval recorded 2026-11-14. This ADR approves the
target architecture and security policy; it does not mean authentication is
implemented or authorize changes outside the approved implementation scope.

## Context

The project needs future photographer/admin access for gallery management. No admin
authentication, user model, session model, dashboard, or admin route is currently
implemented.

## Approved decision

Use one provisioned photographer-admin account with no public registration,
database-backed authentication, Argon2id password hashing, required TOTP
authenticator-app MFA, database-backed sessions, and server-side authorization for
every protected operation.

Initial provisioning must use a one-time server-side CLI command. Session records
must store only cryptographic hashes of session tokens. Admin cookies must be
HTTP-only, Secure in production, SameSite=Lax, and scoped to admin routes.

Admin sessions have a 12-hour idle timeout and a 7-day absolute lifetime. Logout
revokes the current session. Password changes and administrator security resets
revoke all active sessions.

Login permits five failed attempts per 15-minute window, followed by progressive
cooldown. There is no permanent automatic account lockout. Admin security and
management audit events are retained for one year.

## Rejected alternative

Use an external authentication provider for identity, credential recovery, session
management, MFA, and abuse controls, integrating only the application roles and
gallery authorization locally.

## Trade-offs

The local proposal minimizes vendor dependency and can fit a single photographer,
but makes credential recovery, secure provisioning, session invalidation, MFA,
monitoring, and maintenance the application's responsibility. An external provider
reduces those operational burdens and may improve MFA/recovery, but adds vendor
cost, integration complexity, availability dependence, and privacy/data-transfer
review.

## Implementation boundary

The approved architecture does not create an admin user, session model, MFA flow,
rate limiter, audit log, dashboard route, dependency, environment variable, or
Prisma migration. Those remain implementation work for Phase 5 and must be
verified against source before being described as implemented.

Shared wedding-password policy, gallery expiry policy, R2, Redis/BullMQ, uploads,
processing, and other production-readiness decisions remain separate from this
ADR and retain their existing statuses.

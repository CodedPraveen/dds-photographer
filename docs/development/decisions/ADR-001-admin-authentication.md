# ADR-001: Admin authentication proposal

Status: `PROPOSED` — owner approval required. This ADR does not authorize
implementation or Prisma schema changes.

## Context

The project needs future photographer/admin access for gallery management. No admin
authentication, user model, session model, dashboard, or admin route is currently
implemented.

## Proposal

Evaluate a single provisioned admin account with database-backed authentication,
Argon2id password hashing, database-backed sessions, HTTP-only cookies, Secure
cookies in production, SameSite protection, server-side authorization, login rate
limiting, audit logging, secure initial provisioning, password recovery, and session
revocation.

## Alternative

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

## Unresolved decisions

- Approve local authentication, an external provider, or another design.
- Required MFA and account recovery policy.
- Provisioning channel and secret rotation.
- Session lifetime, revocation behavior, and audit retention.
- Provider, region, cost, and data-processing requirements if external.

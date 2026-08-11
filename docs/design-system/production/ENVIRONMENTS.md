# Environments

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Development / Production  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines the environments used throughout the Photographer Business Website.

Each environment has a specific purpose, configuration, and deployment process to ensure development remains predictable, stable, and production-ready.

## Phase 1 Foundation

The current codebase requires one public environment variable:

```text
NEXT_PUBLIC_SITE_URL
```

It must be an absolute URL. Local development defaults to
`http://localhost:3000` through `.env.example`. No database, storage, API,
analytics, feature-flag, or secret environment variable is implemented in
Phase 1.

---

# Philosophy

Every environment should be:

- Isolated
- Reproducible
- Consistent
- Secure
- Easy to deploy

Code should behave the same regardless of where it runs.

---

# Environment Overview

The project uses four primary environments.

| Environment | Purpose                   |
| ----------- | ------------------------- |
| Local       | Development               |
| Development | Team integration          |
| Staging     | Pre-production validation |
| Production  | Live website              |

---

# Local Environment

## Purpose

Used for day-to-day development.

Characteristics

- Fast iteration
- Hot Reload
- Debugging
- Local assets
- Mock data (when appropriate)

Developers are free to experiment without affecting shared environments.

---

# Development Environment

## Purpose

Used for integrating new features.

Characteristics

- Shared environment
- Latest development branch
- Internal testing
- Feature validation

The development environment should closely resemble production.

---

# Staging Environment

## Purpose

Used before production deployment.

Characteristics

- Production-like infrastructure
- Final testing
- Performance validation
- Browser testing
- Mobile testing

Only reviewed and approved changes should reach staging.

---

# Production Environment

## Purpose

Serves the live website.

Characteristics

- Stable
- Optimized
- Monitored
- Secure
- Highly available

Only tested code should be deployed to production.

---

# Environment Flow

```text
Local

↓

Development

↓

Staging

↓

Production
```

Every deployment should follow this progression.

---

# Environment Responsibilities

## Local

- Development
- Debugging
- Component creation
- Testing
- Experimentation

---

## Development

- Feature integration
- Team collaboration
- API validation
- Early QA

---

## Staging

- Final QA
- Accessibility review
- Performance testing
- Client review
- Deployment rehearsal

---

## Production

- Public access
- Monitoring
- Analytics
- Error reporting

---

# Configuration

Every environment should have its own configuration.

Examples

```text
.env.local

.env.development

.env.staging

.env.production
```

Environment-specific values should never be hardcoded.

---

# Environment Variables

Implemented in Phase 1:

```text
NEXT_PUBLIC_SITE_URL
```

All other environment variables must be introduced by the phase that actually
implements their owning feature.

Never commit secrets to the repository.

---

# Secrets Management

Sensitive values include:

- API Keys
- Database Credentials
- Access Tokens
- Cloud Storage Keys
- SMTP Credentials

Secrets should be stored using the deployment platform's secure environment management.

---

# Feature Flags

Feature flags are deferred. Phase 1 defines no feature-flag variables.

Future phases may introduce narrowly scoped flags when an implemented feature
requires them. Do not add flags to `.env.example` in advance.

Examples

```text
ENABLE_3D_CAMERA

ENABLE_EXPERIMENTAL_GALLERY

ENABLE_DEBUG_OVERLAY
```

Feature flags should be removed after features become stable.

---

# Build Configuration

Each environment may use different build settings.

Example

Local

- Source maps enabled
- Debug logging enabled

Production

- Minified assets
- Optimized images
- Disabled debug tools

---

# Logging

## Local

Verbose logging is acceptable.

---

## Development

Important application logs only.

---

## Staging

Production-like logging.

---

## Production

Minimal logging.

Only actionable errors should be recorded.

Sensitive information must never appear in logs.

---

# Error Reporting

Production should include centralized error reporting.

Examples

- Runtime errors
- Failed API requests
- Rendering failures
- Unexpected exceptions

Development environments should prioritize readable debugging output.

---

# Database Strategy

Each environment should use an independent database.

```text
Local Database

↓

Development Database

↓

Staging Database

↓

Production Database
```

Production data should never be used during local development.

---

# Asset Strategy

Local

- Local assets

Development

- Shared development storage

Staging

- Production-like assets

Production

- CDN optimized assets

---

# Image Strategy

Images may differ by environment.

Local

- Placeholder images

Development

- Optimized samples

Staging

- Production-quality samples

Production

- Final optimized assets

---

# Three.js Assets

Large 3D assets should be versioned consistently.

Requirements

- Same file structure
- Same naming
- Optimized builds
- Version compatibility

Avoid changing model names between environments.

---

# Analytics

Development

- Disabled or Debug Mode

Staging

- Test Property

Production

- Live Analytics

Development activity should never pollute production analytics.

---

# Performance Monitoring

Production should monitor:

- Core Web Vitals
- Lighthouse
- Errors
- Uptime
- Asset loading
- Response times

Development environments prioritize debugging over metrics.

---

# Security

Every environment should enforce:

- HTTPS (except localhost)
- Secure headers
- CSP
- Environment isolation
- Secret protection

---

# Deployment Rules

Only deploy:

Local → Development

Development → Staging

Staging → Production

Avoid skipping environments unless handling emergency hotfixes.

---

# Rollback Strategy

Every production deployment should support rollback.

Requirements

- Version tagging
- Deployment history
- Backup configuration
- Database migration strategy

Recovery should be predictable and fast.

---

# Maintenance

Regularly review:

- Environment variables
- Expired secrets
- Old feature flags
- Build settings
- Deployment configuration

Remove obsolete configurations.

---

# Environment Checklist

Before deployment verify:

- Correct environment variables
- Secrets configured
- Database connected
- Assets available
- Analytics configured
- Monitoring enabled
- Build successful
- Performance verified

---

# Anti-Patterns

Avoid:

- Sharing production credentials
- Hardcoded URLs
- Committing `.env` files
- Testing directly in production
- Reusing production databases locally
- Debug logging in production
- Environment-specific code scattered throughout the application

---

# Success Criteria

The environment strategy is successful when:

- Developers can work independently.
- Deployments are predictable.
- Production remains stable.
- Secrets remain secure.
- Configuration is easy to maintain.
- Rollbacks are straightforward.

---

# Guiding Question

Before introducing a new configuration, ask:

> **Does this belong to a specific environment, or should it behave consistently across all environments?**

If it varies between environments, manage it through configuration rather than hardcoded logic.

---

# Related Documents

- TECHNOLOGY_STACK.md
- DEPLOYMENT.md
- GIT_WORKFLOW.md
- BRANCH_STRATEGY.md
- PERFORMANCE_BUDGET.md
- CORE_WEB_VITALS.md
- TESTING.md
- SECURITY.md

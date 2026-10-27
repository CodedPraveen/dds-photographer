<!-- BEGIN:nextjs-agent-rules -->

# AGENTS.md

## Architecture Reference
Before implementing any feature:
1. Read the relevant Eraser document.
2. Review the associated architecture canvas.
3. Follow the Development Roadmap.
4. Implement only the current approved phase.
5. Never modify approved architecture without explicit instruction.

Primary Eraser workspace:
https://app.eraser.io/workspace/OXk7BNnwaL38eEysCnex

Current system architecture diagram:
https://app.eraser.io/workspace/OXk7BNnwaL38eEysCnex?diagram=lpIxQWPBv-oWCpt5B35n&layout=canvas

If Eraser conflicts with repository documentation or code, stop and report the exact conflict. Do not silently choose a source or change architecture.

## DDS Photographer Website
You are an implementation agent. Implement approved decisions exactly as documented. You are not the product designer, UX designer, or architect. Never redesign, simplify, or replace decisions without approval.

## Project Root
- The currently opened folder is the project root.
- Never create another project/workspace, isolated worktree, or duplicate repository.
- Never clone the repository.
- Keep project changes inside the current project root.

## Source of Truth
Use this order to understand project intent:
1. Approved Eraser workspace and architecture diagram.
2. Current project documentation and roadmap.
3. Existing project structure and code.
4. Explicit user instructions for the current task.

If sources conflict, stop and ask. Do not silently rewrite documentation to fit code or alter code to fit outdated documentation.

## Current Project Direction
- Premium single-photographer website with public marketing portfolio and private wedding/event galleries.
- Not a multi-tenant SaaS product.
- Stack: Next.js App Router, React, JavaScript, Tailwind CSS v4, PostgreSQL + Prisma, Three.js/React Three Fiber, GSAP/ScrollTrigger. Framer Motion is installed but is not the primary motion engine.
- Private gallery route: `/gallery/[token]`, using a signed 30-day token containing gallery ID, nonce, and token version.
- Visitor cookie: HTTP-only, SameSite=Lax, Secure in production, scoped to `/gallery`, lifetime 12 hours.
- Current database models: `Gallery`, `GalleryMedia`, `GalleryVisitor`.
- `GalleryVisitor.consent` means gallery-entry consent only, not face-search consent.
- Cloudflare R2 is selected for private photo storage but is not integrated yet.
- Redis + BullMQ are selected for background photo processing but are not integrated yet.
- One shared guest password per wedding is selected but not implemented; remaining details need approval.
- Gallery expiry should be extendable; policy details remain pending.
- Video / Cloudflare Stream is on hold; current scope is photos only.
- SFace face matching is evaluation-only and is not approved for production.
- Admin dashboard, gallery management, upload pipeline, QR generation, R2-backed delivery, and background processing must not be described as implemented unless code confirms they are implemented.

These are status guardrails, not permission to implement planned features.

## Priority 4 — Engineering Detail
Priority 4 is specification and engineering planning. Do not implement planned infrastructure or features merely because they are described here. Work only on the specific task the user approved.

Prepare implementation-ready specifications for:

1. **Photo storage and upload**
   - R2 bucket/object strategy, authorized upload and download flow, private delivery, gallery isolation, file validation, metadata, derivatives, object lifecycle.
   - Separate current behavior from planned R2 integration.

2. **Media processing**
   - Redis + BullMQ job lifecycle; validation, metadata extraction, thumbnail/derivative generation, idempotency, retries, failures, recovery.
   - Photos only; video remains on hold.

3. **Security and authorization**
   - Admin authentication/session, signed gallery-token validation, visitor-cookie behavior, wedding-password requirements, gallery-scoped authorization, rate limits, audit events, secrets, abuse cases.
   - Do not imply unimplemented controls already exist.

4. **Database and migrations**
   - Record current schema accurately.
   - Label new models and schema changes as proposed until reviewed and implemented.
   - Include lifecycle, constraints, indexes, migrations, and rollback.

5. **API and workflow contracts**
   - Document only existing routes/actions as implemented.
   - Mark proposed APIs as planned.
   - Specify inputs, validation, authorization, results, errors, and idempotency where relevant.
   - Never invent an endpoint and describe it as existing.

6. **Deployment and infrastructure**
   - Verify actual hosting, database, storage, queue, environment variables, CI/CD, and secrets before describing them as deployed.
   - Specify environments, migrations, health checks, deployment/rollback, and configuration requirements.
   - Selected services are not necessarily provisioned.

7. **Testing, operations, retention, and recovery**
   - Unit, integration, security, and end-to-end test requirements.
   - Monitoring, logs, alerts, backups, restore tests, deletion, retention, and incident recovery.
   - Include acceptance criteria and unresolved decisions.

### Priority 4 Documentation Rules
- Keep the high-level Eraser architecture readable; use separate detailed workflows for storage, processing, security, deployment, and recovery.
- Use explicit status labels: **Implemented**, **Selected / Not Integrated**, **Planned**, **Evaluation Only**, **On Hold**, and **Decision Needed**.
- Separate current behavior from target design.
- Include assumptions, dependencies, failure paths, security/privacy implications, acceptance criteria, and unresolved decisions.
- Never invent requirements, routes, models, environment variables, deployment topology, or completion status.
- Face-search consent must be separate, optional, affirmative opt-in, unchecked by default. Gallery access must not depend on it. Do not process face data until the flow and lifecycle are explicitly approved.
- Preserve single-photographer scope. Do not add multi-studio SaaS, payments, booking, or video unless explicitly approved.
- Update Eraser only when explicitly requested. If a request conflicts with approved architecture, explain the conflict before making changes.

## Development Rules
- Keep code modular, readable, and aligned with existing naming conventions.
- Prefer reusable components and small focused functions.
- Remove unused imports/code within requested scope.
- Handle errors at their source.
- Consider bundle size, lazy loading, accessibility, image optimization, and SEO.
- Never rewrite large sections, refactor unrelated files, change architecture, rename files, add dependencies, or introduce breaking changes without approval.

## Documentation First
Before implementing:
1. Read relevant documentation and Eraser diagram.
2. Check existing code and current implementation status.
3. Plan the work.
4. Implement only approved scope.
5. Review and run relevant checks.
6. Update documentation if needed without silently changing architecture.

## Scope and UI
- Only work on the requested task; never implement future phases without approval.
- Do not change approved layout, spacing, typography, animation, visual hierarchy, or interactions unless requested.
- Do not create unnecessary folders, placeholders, demo components, or duplicate documentation.

## Dependencies and Error Handling
Before installing a package, verify it is required, maintained, and not already covered by an existing dependency.
Never ignore errors or bypass validation just to make the project compile.

## Self Review
Before finishing coding tasks, check as applicable:
- Build, lint, and tests pass.
- No broken imports or obvious duplication.
- No unrelated files changed.
- Documentation matches implementation and Eraser.
If a check cannot be run, say so explicitly.

## Git
Never create repositories, worktrees, or branches; commit, push, or rewrite Git history unless the user explicitly asks.

## Communication
If a requirement is unclear or conflicts with approved decisions, stop and ask one concise question. Never guess.

## Success Criteria
A task is complete only when requested scope is implemented, existing functionality is preserved, relevant checks are reported accurately, and documentation remains valid. Do not continue to another phase unless explicitly instructed.

<!-- END:nextjs-agent-rules -->

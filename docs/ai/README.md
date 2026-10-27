# AI Workspace

This directory is the entry point for AI coding agents working on DDS Photographer.

Read the context files below before making changes. Then inspect only the source files
and project documentation directly relevant to the requested task.

## Required reading order

1. [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) — product boundaries, architecture authority, decisions.
2. [`CURRENT_STATE.md`](../../CURRENT_STATE.md) — implemented, selected, evaluation-only, deferred.
3. [`FILE_INDEX.md`](../../FILE_INDEX.md) — where relevant code and docs live.
4. [`DEPENDENCY_MAP.md`](../../DEPENDENCY_MAP.md) — verified feature relationships and boundaries.
5. [`PROMPT_GUIDE.md`](../../PROMPT_GUIDE.md) — task workflow and prompt templates.

## Project identity

DDS Photographer is a premium single-photographer business website with a cinematic
public website and private wedding/event galleries. It is not a generic portfolio
template or a multi-tenant SaaS product.

## Actual application stack

- Next.js 16 App Router
- React 19
- JavaScript (not TypeScript)
- Tailwind CSS v4 and CSS Modules
- Three.js / React Three Fiber for the camera scene
- GSAP / ScrollTrigger for scroll choreography
- PostgreSQL and Prisma 7 for the private-gallery data foundation
- Node.js built-in test runner (`node --test`)
- ESLint and Prettier

Do not describe installed packages as active architecture unless the source imports
and uses them. GSAP and CSS are the implemented motion approach; Framer Motion is
not the primary motion engine.

## Architecture authority

`AGENTS.md` says the Eraser workspace is the primary approved architecture reference.
Review the relevant Eraser document/canvas before implementation. Repository docs and
source code are evidence for implementation status, not permission to silently change
approved architecture. If Eraser, docs, and code conflict, stop and report the conflict.

## Working rules

- Keep the application JavaScript-based unless the owner explicitly changes that decision.
- Preserve the existing design language, responsive behavior, accessibility, and reduced-motion path.
- Prefer existing components and feature modules over duplicates.
- Keep secrets, persistence, and authorization in server-only modules.
- Do not implement selected future technologies before their phase is approved.
- Do not treat gallery-entry consent as face-search consent.
- Do not collect selfies or create face embeddings before a separate, optional,
  affirmative face-search consent flow has been approved and implemented.
- Do not condition ordinary gallery access on face-search opt-in.
- Do not mass-format unrelated legacy documentation.
- Do not claim tests, CI checks, deployments, or production readiness without evidence.

## Before finishing a task

1. State the scope and relevant source files.
2. Check the applicable Eraser architecture reference and repository docs.
3. Inspect current implementation before proposing changes.
4. Make the smallest focused change.
5. Run the relevant checks available in `package.json`.
6. Report exactly what was changed and which checks actually passed.

# DDS Photographer — AI Prompt Guide

## 1. Start with the project context

For every task, read:
1. `AGENTS.md`
2. `PROJECT_CONTEXT.md`
3. `CURRENT_STATE.md`
4. The relevant Eraser architecture document/canvas.
5. The relevant repository documentation.
6. Only then inspect the source files directly involved.

Do not scan unrelated folders.

## 2. State the task boundary

Before editing, identify:
- Requested outcome.
- Current phase and whether the work is approved for it.
- Exact files likely to change.
- Existing implementation to preserve.
- Dependencies and data/security boundaries affected.
- Tests or verification commands relevant to the change.

If the requested change conflicts with Eraser or an owner decision, stop and ask.

## 3. Implementation constraints

- Keep JavaScript; do not convert files to TypeScript.
- Use existing Next.js App Router and feature-module conventions.
- Reuse existing UI components and design tokens.
- Keep server-only secrets, authorization, and persistence on the server.
- Avoid new dependencies unless necessary and approved.
- Preserve accessibility, responsive behavior, and reduced-motion support.
- Do not mass-format unrelated legacy documentation.
- Keep implemented, selected, evaluation-only, and deferred work clearly separated.
- Do not implement Cloudflare Stream while video remains on hold.
- Do not integrate R2, Redis/BullMQ, shared passwords, or SFace ahead of approval
  for the relevant implementation phase.

## 4. Privacy-specific rules

- Existing `GalleryVisitor.consent` is gallery-entry consent only.
- Never reuse it as face-search consent.
- Face-search requires a standalone purpose-specific notice and a separate
  optional affirmative choice, unchecked by default.
- A guest declining face search must still be able to access the ordinary gallery.
- Do not collect selfies, face crops, embeddings, or match results before the
  consent flow, retention, withdrawal, and deletion behavior are approved.
- SFace is evaluation-only, not production-approved.

## 5. Suggested task prompt

```text
Task:
[Describe one requested outcome.]

Project context:
Read AGENTS.md, PROJECT_CONTEXT.md, CURRENT_STATE.md, and the relevant Eraser
architecture document/canvas first.

Constraints:
- Stay within the approved current phase.
- Preserve existing architecture and design language.
- Keep JavaScript and existing folder conventions.
- Do not change unrelated files.
- Do not describe planned work as implemented.

Before editing:
1. Identify the relevant existing implementation.
2. List the exact files expected to change.
3. Explain dependencies and risks.
4. Identify verification commands.

After editing:
1. Summarize changed files and behavior.
2. Report commands run and their actual results.
3. List any unverified behavior or follow-up work.
```

## 6. Documentation-only prompt

```text
Update the requested documentation using repository source as evidence.
Keep implemented, selected, evaluation-only, deferred, and unknown items separate.
Do not invent routes, models, APIs, environment variables, tests, or integrations.
Preserve the Eraser workspace as the primary architecture authority.
Do not reformat unrelated documents.
List each file changed and any remaining source-of-truth conflicts.
```

## 7. Review checklist

- [ ] Relevant Eraser design reviewed.
- [ ] Existing source inspected before edits.
- [ ] Work belongs to the approved phase.
- [ ] No architecture/product decision silently changed.
- [ ] No unrelated files modified.
- [ ] No new dependency without rationale.
- [ ] Authorization and privacy boundaries preserved.
- [ ] Accessibility and reduced motion preserved where relevant.
- [ ] Lint, tests, formatting, and build run as applicable.
- [ ] Only verified checks reported as passing.
- [ ] Documentation status matches code and migrations.

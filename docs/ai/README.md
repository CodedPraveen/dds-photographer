# AI Workspace

This directory exists to help AI coding agents (Cursor, Claude Code, Codex, Gemini CLI, etc.) understand the project without repeatedly scanning the entire repository.

## Objective

Before implementing any feature, always use this directory as the primary project context.

Do not scan unrelated folders unless additional information is required.

Only inspect files that are directly related to the current task.

---

# Project

DDS Photographer

Premium business website for a professional photography studio.

This is NOT a personal portfolio.

The website should feel premium, cinematic, elegant, modern, and minimal.

The camera experience and photography work are always the primary focus.

---

# Technology

- Next.js App Router
- React
- Tailwind CSS
- Framer Motion
- TypeScript (if applicable)
- Three.js / React Three Fiber (if applicable)

---

# Documentation

Project documentation is inside:

docs/design-system/

Use these documents before making architectural decisions.

Architecture

docs/design-system/architecture/

Design

docs/design-system/design/

Development

docs/design-system/development/

Production

docs/design-system/production/

---

# AI Rules

Always prefer existing components instead of creating duplicates.

Follow existing folder structure.

Keep naming consistent.

Avoid unnecessary dependencies.

Avoid changing unrelated files.

Preserve current design language.

Do not redesign completed sections unless requested.

---

# Implementation Rules

Before implementing:

1. Understand the task.

2. Read only the documentation related to that task.

3. Read only the files that must be modified.

4. Implement the feature.

5. Do not refactor unrelated code.

6. Keep changes minimal.

---

# Example

If the task is:

"Improve Hero animation"

Read:

- docs/design-system/design/components/HERO_SECTION.md

Then inspect only:

- Hero component
- animation utilities
- related styles

Do not scan:

- admin
- footer
- gallery
- APIs
- unrelated components

---

# Future AI Files

As the project grows, these files may be generated automatically:

PROJECT_CONTEXT.md

FILE_INDEX.md

DEPENDENCY_MAP.md

CURRENT_STATE.md

PROMPT_GUIDE.md

These files are secondary.

This README is the primary entry point for every AI agent.

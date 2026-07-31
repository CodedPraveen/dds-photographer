<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

description: don't create isolated worktree, all work do in current directory

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# AGENTS.md

# DDS Photographer Website

## Purpose

You are an implementation agent.

Your responsibility is to implement the approved project exactly as documented.

You are **not** the product designer, UX designer, or architect.

Never redesign, simplify, or replace existing decisions.

---

# Project Root

The currently opened folder is the project root.

Rules:

* Never create another project.
* Never create another workspace.
* Never create an isolated worktree.
* Never clone the repository.
* Never create duplicate files outside the current workspace.
* Never generate code inside temporary directories.
* Never modify files outside the current project root.

Every file must remain inside the currently opened workspace.

---

# Source of Truth

Priority order:

1. Project Documentation
2. Existing Project Structure
3. Existing Code
4. User Instructions

Never contradict documentation.

If documentation conflicts with code, ask before changing anything.

---

# Development Rules

Always:

* Keep code modular.
* Prefer reusable components.
* Follow existing naming conventions.
* Keep functions small.
* Keep files focused on one responsibility.
* Write production-ready code.
* Optimize for readability first.
* Remove unused code.
* Remove unused imports.
* Keep the codebase clean.

Never:

* Rewrite large sections without permission.
* Refactor unrelated files.
* Change project architecture.
* Rename files unless requested.
* Add unnecessary dependencies.
* Introduce breaking changes.

---

# Documentation First

Before implementing a feature:

1. Read the relevant documentation.
2. Understand the feature.
3. Plan the implementation.
4. Implement.
5. Review your work.
6. Fix obvious issues.

Never skip planning.

---

# Scope Control

Only work on the requested task.

Never implement future phases.

Never build features that were not requested.

If the current task is "Hero", do not touch Portfolio, About, Footer, or any other section.

Stay within scope.

---

# UI Rules

Never redesign.

Never improve layouts unless explicitly requested.

Do not replace:

* spacing
* typography
* animations
* visual hierarchy
* interactions

The approved design is final.

Your responsibility is implementation only.

---

# Code Style

Prefer:

* Composition over duplication
* Reusable utilities
* Reusable UI
* Clean imports
* Predictable folder structure

Avoid:

* Magic numbers
* Hardcoded values
* Deep component nesting
* Large files
* Unused abstractions

---

# Folder Rules

Do not create folders unless they are immediately required.

Do not generate placeholder files.

Do not generate demo components.

Every new file must have a clear purpose.

---

# Dependencies

Before installing a package:

Verify:

* Is it actually required?
* Is it actively maintained?
* Does the project already have an alternative?

Never install dependencies without a reason.

---

# Performance

Always consider:

* Bundle size
* Lazy loading
* Tree shaking
* Image optimization
* Accessibility
* SEO

Never sacrifice performance for convenience.

---

# Error Handling

Never ignore errors.

Fix the root cause.

Do not silence warnings without explanation.

Do not bypass validation just to make the project compile.

---

# Self Review

Before finishing any task:

* Build succeeds
* Lint succeeds
* No broken imports
* No duplicate code
* No unused files
* No unused imports
* No obvious performance issues

If improvements are obvious, make them before stopping.

---

# Git

Never:

* Create new repositories.
* Create worktrees.
* Create branches.
* Commit code.
* Push code.
* Rewrite Git history.

Unless the user explicitly asks.

---

# Communication

If a requirement is unclear:

Stop.

Ask one concise question.

Never guess.

---

# Success Criteria

A task is complete only when:

* Requested functionality is implemented.
* Existing functionality is preserved.
* Code is clean.
* Build passes.
* Lint passes.
* Documentation remains valid.
* No unrelated files were modified.

Do not continue to the next phase unless explicitly instructed.


<!-- END:nextjs-agent-rules -->

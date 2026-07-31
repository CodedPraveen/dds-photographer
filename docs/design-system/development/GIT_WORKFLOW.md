# Git Workflow

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Development  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines the Git workflow for the Photographer Business Website.

A consistent Git workflow ensures that:

- Changes are easy to understand.
- Collaboration remains predictable.
- Releases remain stable.
- History tells the story of the project.

Git history is considered part of the project's documentation.

---

# Philosophy

Every commit should represent **one logical change**.

Git should answer three questions:

- What changed?
- Why did it change?
- When did it change?

A clean history is more valuable than a large history.

---

# Branch Strategy

The project follows a **branch-based development workflow**.

```text
main
│
├── feature/*
├── fix/*
├── refactor/*
├── docs/*
├── performance/*
├── release/*
└── hotfix/*
```

Each branch has a single responsibility.

---

# Branch Responsibilities

## main

Production-ready code.

Rules

- Always stable.
- Always deployable.
- Protected branch.
- No direct commits.

---

## feature/*

Used for new functionality.

Examples

```text
feature/hero-animation

feature/portfolio-gallery

feature/contact-form

feature/navigation
```

---

## fix/*

Bug fixes.

Examples

```text
fix/mobile-navbar

fix/image-loading

fix/scroll-animation
```

---

## refactor/*

Internal improvements.

Examples

```text
refactor/portfolio-service

refactor/folder-structure

refactor/camera-controller
```

No new features.

---

## docs/*

Documentation changes.

Examples

```text
docs/design-system

docs/architecture

docs/performance
```

---

## performance/*

Performance optimization.

Examples

```text
performance/image-loading

performance/lighthouse

performance/lazy-loading
```

---

## release/*

Release preparation.

Examples

```text
release/v1.0

release/v1.1
```

---

## hotfix/*

Critical production fixes.

Examples

```text
hotfix/broken-homepage

hotfix/contact-form
```

Merge back into `main` immediately after verification.

---

# Development Flow

Every feature follows the same lifecycle.

```text
Issue

↓

Create Branch

↓

Development

↓

Self Review

↓

Testing

↓

Pull Request

↓

Code Review

↓

Merge

↓

Delete Branch
```

---

# Creating a Branch

Create branches from the latest `main`.

Example

```bash
git checkout main
git pull origin main

git checkout -b feature/hero-animation
```

Always begin with the latest production code.

---

# Commit Philosophy

A commit should represent **one logical step**.

Good examples:

- Add hero camera animation
- Implement portfolio grid
- Improve image optimization

Avoid combining unrelated changes into one commit.

---

# Commit Message Format

Use the imperative mood.

Structure

```text
<type>: <short description>
```

Examples

```text
feat: add portfolio image reveal

fix: resolve mobile navigation overlap

refactor: simplify camera controller

docs: add motion guidelines

perf: optimize hero image loading

style: improve button spacing

test: add portfolio component tests

chore: update project dependencies
```

---

# Commit Types

| Type | Purpose |
|--------|----------|
| feat | New feature |
| fix | Bug fix |
| refactor | Internal improvements |
| docs | Documentation |
| perf | Performance improvements |
| style | Formatting or styling |
| test | Testing |
| chore | Maintenance |

---

# Commit Size

Preferred

- Small
- Focused
- Reviewable

Avoid commits that modify dozens of unrelated files.

---

# Pull Requests

Every Pull Request should contain one objective.

Good examples

- Hero animation
- Portfolio redesign
- Camera optimization

Avoid

```text
Everything completed
```

---

# Pull Request Template

Every PR should answer:

## Summary

What changed?

---

## Reason

Why was it needed?

---

## Testing

How was it tested?

---

## Notes

Anything reviewers should know?

---

# Merge Strategy

Preferred

**Squash and Merge**

Benefits

- Cleaner history
- Easier releases
- Simpler rollback
- Better readability

---

# Code Review

Review the implementation, not the developer.

Focus on:

- Readability
- Maintainability
- Performance
- Accessibility
- Consistency
- Architecture

Avoid subjective style debates.

---

# Before Creating a Pull Request

Verify:

- Project builds successfully.
- Lint passes.
- No unused files.
- No console logs.
- No commented-out code.
- Documentation updated if required.

---

# Merge Requirements

Before merging:

- Code reviewed
- Tests passed
- No conflicts
- Documentation updated
- Performance unaffected
- Accessibility maintained

---

# Version Tags

Releases should be tagged.

Examples

```text
v1.0.0

v1.1.0

v1.2.0
```

Follow Semantic Versioning.

---

# Semantic Versioning

```
MAJOR.MINOR.PATCH
```

Example

```text
1.0.0
│ │ │
│ │ └── Bug Fix
│ └──── Feature
└────── Breaking Change
```

---

# Release Process

```text
Development

↓

Testing

↓

Documentation

↓

Release Branch

↓

Final Review

↓

Merge

↓

Tag

↓

Deploy
```

---

# Hotfix Process

```text
Production Issue

↓

hotfix/*

↓

Review

↓

Merge

↓

Deploy

↓

Tag
```

Critical fixes should bypass normal feature scheduling.

---

# Conflict Resolution

Resolve conflicts as early as possible.

Do not allow long-lived branches to drift significantly from `main`.

Rebase or merge regularly if a branch remains active for an extended period.

---

# Branch Cleanup

After merging:

- Delete local branch.
- Delete remote branch.
- Keep repository clean.

Merged branches should not remain active.

---

# Git Ignore

Never commit:

- Environment files
- Build output
- Cache
- Logs
- Temporary files
- Editor configuration (unless shared)

---

# Large Files

Avoid committing:

- Raw videos
- PSD files
- Large exports
- Backup archives

Use dedicated asset storage when appropriate.

---

# Documentation Updates

Update documentation whenever changes affect:

- Architecture
- Folder Structure
- Development Process
- Design System
- Public APIs

Documentation should evolve with the project.

---

# Rollback Strategy

Every release should be reversible.

If a deployment introduces critical issues:

1. Revert the change.
2. Restore the previous stable version.
3. Investigate the root cause.
4. Release a corrected fix.

Never patch directly in production without version control.

---

# Git Checklist

Before every commit:

- Code builds successfully.
- Lint passes.
- No unnecessary files.
- Clear commit message.
- Related documentation updated.
- Feature works as expected.

---

# Anti-Patterns

Avoid:

- Direct commits to `main`
- Generic commit messages
- Massive commits
- Mixing unrelated changes
- Long-lived feature branches
- Force pushing shared branches
- Committing secrets
- Committing generated files
- Skipping code review

---

# Success Criteria

The Git workflow is successful when:

- Every commit has a clear purpose.
- Branches remain organized.
- Pull Requests are easy to review.
- Releases are predictable.
- Rollbacks are straightforward.
- Git history clearly documents the evolution of the project.

---

# Guiding Question

Before creating a commit, ask:

> **Will someone understand what changed and why by reading only this commit message and its diff?**

If not, consider splitting the work into smaller commits or improving the commit message.

---

# Related Documents

- CODING_STANDARDS.md
- FOLDER_CONVENTIONS.md
- TECHNOLOGY_STACK.md
- SYSTEM_ARCHITECTURE.md
- PERFORMANCE_BUDGET.md
- RELEASE_PROCESS.md
```
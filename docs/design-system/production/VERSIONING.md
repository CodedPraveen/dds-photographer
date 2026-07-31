# Versioning

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Production  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines the versioning strategy for the Photographer Business Website.

A consistent versioning system makes releases predictable, simplifies deployment, improves rollback procedures, and provides a clear history of project evolution.

Every production release should receive a unique version.

---

# Philosophy

Version numbers communicate change.

They should answer three questions:

- Is this a major release?
- Is anything breaking?
- Is this a bug fix?

Version numbers should be meaningful rather than arbitrary.

---

# Versioning Standard

This project follows **Semantic Versioning (SemVer)**.

```text
MAJOR.MINOR.PATCH
```

Example

```text
1.4.2
```

---

# Version Structure

```text
1.4.2
│ │ │
│ │ └── PATCH
│ └──── MINOR
└────── MAJOR
```

---

# Major Version

Format

```text
2.0.0
```

Increase the **Major** version when:

- Breaking architecture changes
- Large redesign
- Major feature overhaul
- Incompatible API changes
- Complete technology migration

Examples

```text
1.0.0 → 2.0.0
```

---

# Minor Version

Format

```text
1.5.0
```

Increase the **Minor** version when:

- New features
- New sections
- New animations
- Portfolio improvements
- UI enhancements
- New integrations

Examples

```text
1.4.0 → 1.5.0
```

---

# Patch Version

Format

```text
1.5.3
```

Increase the **Patch** version when:

- Bug fixes
- Performance improvements
- Security fixes
- Small UI fixes
- Documentation updates (if included in release)

Examples

```text
1.5.2 → 1.5.3
```

---

# First Release

The first public release should begin with

```text
1.0.0
```

Avoid releasing

```text
0.0.1
```

for production unless the project is intentionally marked as pre-release software.

---

# Pre-Release Versions

Before production releases, use pre-release identifiers.

Examples

```text
1.0.0-alpha.1

1.0.0-alpha.2

1.0.0-beta.1

1.0.0-beta.2

1.0.0-rc.1
```

---

# Alpha Releases

Purpose

Internal development.

Characteristics

- Incomplete
- Experimental
- Frequent changes

Example

```text
1.0.0-alpha.3
```

---

# Beta Releases

Purpose

Feature complete.

Characteristics

- Testing
- Bug fixing
- Performance tuning

Example

```text
1.0.0-beta.2
```

---

# Release Candidate

Purpose

Production candidate.

Characteristics

- Stable
- Fully tested
- Awaiting approval

Example

```text
1.0.0-rc.1
```

---

# Stable Release

Example

```text
1.0.0
```

A stable release is:

- Production ready
- Fully tested
- Approved
- Documented

---

# Version Lifecycle

```text
Alpha

↓

Beta

↓

Release Candidate

↓

Stable

↓

Patch

↓

Minor

↓

Major
```

---

# Release Examples

### Initial Launch

```text
1.0.0
```

---

### Bug Fix

```text
1.0.1
```

---

### Performance Improvements

```text
1.0.2
```

---

### New Gallery Feature

```text
1.1.0
```

---

### New Hero Experience

```text
1.2.0
```

---

### Major Website Redesign

```text
2.0.0
```

---

# Git Tags

Every production release should receive a Git tag.

Format

```text
v1.0.0

v1.1.0

v1.2.4

v2.0.0
```

Tags create permanent release references.

---

# Release Notes

Every version should include release notes.

Minimum information

- Version
- Release date
- Summary
- New features
- Improvements
- Bug fixes
- Breaking changes (if any)

---

# Breaking Changes

Major releases must document:

- Removed functionality
- Changed behavior
- Migration requirements
- Deprecated features

Users should understand what changed before upgrading.

---

# Deprecation Policy

Deprecated features should:

- Be documented
- Include alternatives
- Remain supported temporarily
- Be removed only in a future major release

Avoid immediate removal when possible.

---

# Hotfix Versions

Critical production fixes should increment the patch version.

Example

```text
1.2.1
```

Hotfixes should contain only the required fixes.

---

# Documentation Version

Documentation should evolve alongside the project.

Major documentation changes should accompany the relevant software release.

Document version

```text
Document Version: 1.0
```

Software version

```text
Website Version: 1.3.0
```

Keep these independent.

---

# Asset Versioning

Version static assets when appropriate.

Examples

```text
camera-v2.glb

portfolio-v3.json

hero-video-v2.mp4
```

Or use hashed filenames during the build process.

---

# Database Version

If a database is introduced later:

- Track schema migrations
- Version migration files
- Document migration history

Database versions should align with application releases.

---

# Rollback

Every release should support rollback.

Requirements

- Tagged releases
- Deployment history
- Previous build available
- Backup configuration

Rollback should restore the previous stable version.

---

# Version History

Maintain a changelog.

Example

```text
v1.0.0

Initial public release

--------------------

v1.1.0

Portfolio improvements

--------------------

v1.2.0

Hero camera redesign

--------------------

v1.2.1

Performance fixes
```

A complete history improves maintainability.

---

# Checklist

Before releasing a new version:

- Version number updated
- Git tag created
- Release notes written
- Documentation updated
- Testing completed
- Deployment approved

---

# Anti-Patterns

Avoid:

- Skipping version numbers
- Reusing version numbers
- Untagged releases
- Breaking changes in patch releases
- New features in hotfix releases
- Inconsistent version naming

---

# Success Criteria

The versioning strategy is successful when:

- Every release is uniquely identifiable.
- Version numbers accurately communicate change.
- Rollbacks are straightforward.
- Release history is easy to follow.
- Developers and stakeholders understand the impact of each release.

---

# Guiding Question

Before publishing a release, ask:

> **Does this version number accurately represent the scope and impact of the changes included?**

If the answer is **No**, choose a more appropriate version.

---

# Related Documents

- RELEASE_PROCESS.md
- DEPLOYMENT.md
- DEPLOYMENT_CHECKLIST.md
- GIT_WORKFLOW.md
- BRANCH_STRATEGY.md
- TESTING.md
- CHANGELOG.md
# Code Review

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Development  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines the code review standards for the Photographer Business Website.

Code reviews exist to improve the quality of the project, reduce bugs, share knowledge, and maintain consistency.

The goal is to improve the code—not to criticize the developer.

---

# Philosophy

Every review should answer one question:

> **Does this change improve the project?**

Code reviews should be:

- Constructive
- Respectful
- Objective
- Consistent
- Solution-focused

---

# Goals

A successful code review should:

- Improve code quality
- Detect bugs early
- Maintain consistency
- Protect architecture
- Improve performance
- Encourage knowledge sharing
- Ensure maintainability

---

# Review Principles

Review the implementation, not the person.

Focus on:

- Correctness
- Simplicity
- Readability
- Maintainability
- Performance
- Accessibility
- Security

Avoid personal preferences unless they improve the project.

---

# Review Workflow

```text
Development

↓

Self Review

↓

Pull Request

↓

Automated Checks

↓

Code Review

↓

Changes Requested (if needed)

↓

Approval

↓

Merge
```

Every change should follow this workflow.

---

# Before Requesting a Review

The author should verify:

- Project builds successfully
- Lint passes
- Tests pass
- No unnecessary files
- No debug code
- Documentation updated (if applicable)
- Feature works as expected

The reviewer should not discover avoidable issues.

---

# Review Scope

Reviewers should examine:

- Architecture
- Folder placement
- Naming
- Readability
- Logic
- Performance
- Accessibility
- Error handling
- Security
- Documentation

---

# Architecture Review

Verify that the implementation follows:

- SYSTEM_ARCHITECTURE.md
- FOLDER_STRUCTURE.md
- DATA_FLOW.md
- STATE_MANAGEMENT.md

New code should not violate established architecture.

---

# Naming Review

Check that names are:

- Clear
- Consistent
- Descriptive
- Meaningful

Good

```javascript
loadPortfolioImages()
```

Avoid

```javascript
run()

handle()

data()

temp()
```

---

# Component Review

Every component should have one responsibility.

Verify:

- Small scope
- Clear props
- Reusable where appropriate
- No business logic
- No unnecessary complexity

---

# State Review

Check:

- State is minimal
- No duplicate state
- Correct ownership
- Derived values are not stored
- Local state remains local

Refer to:

STATE_MANAGEMENT.md

---

# Performance Review

Verify:

- Unnecessary renders avoided
- Images optimized
- Heavy components lazy loaded
- Efficient loops
- Minimal bundle impact

Optimize only when justified by measurement.

---

# Accessibility Review

Check:

- Semantic HTML
- Keyboard navigation
- Focus management
- Alt text
- ARIA attributes (when required)
- Sufficient contrast

Accessibility is required, not optional.

---

# Security Review

Verify:

- Input validation
- Output sanitization
- Secrets not exposed
- Safe API usage
- Secure environment variable usage

Never trust user input.

---

# Error Handling

Every failure path should be considered.

Check:

- Validation
- Error messages
- Recovery
- Logging
- User feedback

Avoid silent failures.

---

# Readability Review

Ask:

- Can another developer understand this quickly?
- Is the intent obvious?
- Is the implementation simpler than alternatives?

Readable code is easier to maintain.

---

# Code Duplication

Look for:

- Repeated logic
- Repeated components
- Repeated utilities

Prefer reuse over duplication.

---

# Folder Review

Verify that new files follow:

- FOLDER_STRUCTURE.md
- FOLDER_CONVENTIONS.md

Files should have an obvious location.

---

# Dependency Review

Before approving a new dependency, ask:

- Is it necessary?
- Is it actively maintained?
- Can existing tools solve the problem?
- Does it increase bundle size significantly?

Avoid unnecessary dependencies.

---

# Documentation Review

Confirm documentation is updated if changes affect:

- Architecture
- Public APIs
- Folder Structure
- Development Process
- Design System

Documentation should evolve with the codebase.

---

# Pull Request Review Checklist

Before approving a Pull Request, verify:

- Purpose is clear
- Scope is focused
- Architecture is respected
- Naming follows conventions
- No duplicate logic
- Performance remains acceptable
- Accessibility is maintained
- Error handling is complete
- Documentation updated
- No unnecessary complexity

---

# Review Comments

Comments should:

- Explain the issue
- Explain why it matters
- Suggest an improvement when possible

Good

> This logic could be moved into a reusable hook because it is duplicated in two components.

Avoid

> This is wrong.

Constructive feedback improves collaboration.

---

# Approval Criteria

Approve only when:

- Code meets project standards
- Architecture remains consistent
- No blocking issues remain
- The implementation is maintainable
- The feature behaves correctly

Approval indicates confidence in the change.

---

# Common Review Questions

Before approving, ask:

- Is this the simplest solution?
- Is the code easy to understand?
- Does it introduce technical debt?
- Can it scale?
- Is there unnecessary complexity?
- Would I be comfortable maintaining this code in one year?

---

# Things to Avoid

Avoid reviewing based solely on:

- Personal coding style
- Preferred formatting
- Unrelated improvements
- Hypothetical future requirements

Focus on the current change.

---

# Anti-Patterns

Avoid:

- Large, unfocused Pull Requests
- Mixing unrelated changes
- Hidden breaking changes
- Unused code
- Dead code
- Console logs
- Commented-out code
- Duplicate implementations
- Ignoring documentation updates

---

# Review Checklist

Before approving:

- ✅ Builds successfully
- ✅ Lint passes
- ✅ Tests pass (if applicable)
- ✅ Naming is clear
- ✅ Architecture respected
- ✅ Folder structure followed
- ✅ Performance acceptable
- ✅ Accessibility verified
- ✅ Error handling complete
- ✅ Documentation updated
- ✅ No unnecessary complexity

---

# Success Criteria

The review process is successful when:

- Bugs are caught before release.
- Architecture remains consistent.
- Knowledge is shared.
- Code quality improves over time.
- Every merge increases confidence in the project.

---

# Guiding Question

Before approving a change, ask:

> **Would I be comfortable maintaining this implementation six months from now without rewriting it?**

If the answer is **No**, request improvements before approval.

---

# Related Documents

- CODING_STANDARDS.md
- GIT_WORKFLOW.md
- BRANCH_STRATEGY.md
- FOLDER_STRUCTURE.md
- FOLDER_CONVENTIONS.md
- STATE_MANAGEMENT.md
- DATA_FLOW.md
- TECHNOLOGY_STACK.md
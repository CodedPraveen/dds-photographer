# Coding Standards

> **Document Version:** 1.0
> **Status:** Active
> **Category:** Development
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines the coding standards for the Photographer Business Website.

The objective is to ensure that every part of the codebase is:

- Consistent
- Readable
- Maintainable
- Scalable
- Predictable

Code should be written for people first and computers second.

---

# Development Philosophy

The project follows these principles:

- Simplicity over cleverness
- Readability over shortcuts
- Consistency over personal preference
- Composition over duplication
- Performance by default
- Accessibility by default

Every contributor should follow the same conventions.

---

# General Principles

Always write code that is:

- Easy to understand
- Easy to modify
- Easy to test
- Easy to remove
- Easy to review

If an implementation requires extensive explanation, consider simplifying it.

---

# Code Style

The project uses a consistent formatting style.

Requirements

- ESLint
- Prettier
- Consistent indentation
- Consistent spacing
- Consistent naming

Formatting should be handled automatically whenever possible.

---

# File Organization

Every file should have a single responsibility.

Good

```
camera-controller.js

portfolio-grid.jsx

image-loader.js
```

Avoid

```
helpers.js

utils.js

common.js

misc.js
```

File names should describe their purpose.

---

# File Size

Recommended limits

| File Type | Recommended Size |
|------------|------------------|
| Component | ≤ 300 lines |
| Hook | ≤ 150 lines |
| Utility | ≤ 150 lines |
| Service | ≤ 250 lines |

If a file becomes difficult to navigate, split it into smaller modules.

---

# Naming Conventions

## Components

Use PascalCase.

```
HeroSection.jsx

PortfolioGrid.jsx

CameraModel.jsx
```

---

## Hooks

Use camelCase and always start with `use`.

```
useScroll.js

useGallery.js

useCamera.js
```

---

## Utilities

Use kebab-case.

```
image-loader.js

format-date.js

motion-helper.js
```

---

## Constants

Use UPPER_SNAKE_CASE.

```
MAX_IMAGES

CAMERA_SPEED

SECTION_PADDING
```

---

## Variables

Use descriptive camelCase.

Good

```
selectedImage

activeCategory

scrollProgress
```

Avoid

```
data

temp

obj

item

x
```

---

## Functions

Function names should describe actions.

Examples

```
loadPortfolio()

filterImages()

startCameraAnimation()

validateContactForm()
```

Avoid vague names.

```
run()

handle()

doWork()

process()
```

---

# Component Standards

Each component should have one responsibility.

Good

```
PortfolioCard

↓

Displays one portfolio item
```

Avoid

```
PortfolioCard

↓

Displays UI

↓

Fetches data

↓

Handles routing

↓

Controls animation

↓

Tracks analytics
```

Keep components focused.

---

# Component Structure

Recommended order

```javascript
Imports

Constants

Component

Hooks

State

Derived Values

Effects

Handlers

Render

Export
```

Maintain the same order across the project.

---

# Props

Props should be:

- Minimal
- Explicit
- Predictable

Avoid passing large objects when only a few values are required.

---

# Hooks

Hooks should contain reusable logic.

They should never render UI.

Good

```
useScrollProgress()
```

Bad

```
usePortfolioCard()
```

if it mixes UI and logic unnecessarily.

---

# Services

Business logic belongs inside services.

Examples

```
portfolio-service.js

image-service.js

contact-service.js
```

Services should not depend on React.

---

# Utilities

Utilities should be:

- Pure
- Reusable
- Independent

Avoid utilities with hidden side effects.

---

# Comments

Write self-explanatory code first.

Use comments only when they explain **why**, not **what**.

Good

```javascript
// Delay image loading to improve Largest Contentful Paint.
```

Avoid

```javascript
// Increment counter
counter++;
```

---

# Error Handling

Handle errors gracefully.

Never leave silent failures.

Preferred flow

```
Validate

↓

Try

↓

Catch

↓

Log

↓

Friendly Response
```

Users should never see raw error messages.

---

# Async Code

Prefer async/await.

Good

```javascript
const data = await getPortfolio();
```

Avoid deeply nested Promise chains.

---

# State Management

Rules

- Keep state local.
- Avoid duplicate state.
- Derive values whenever possible.
- Lift state only when necessary.

Refer to:

`STATE_MANAGEMENT.md`

---

# Styling

Use Tailwind CSS.

Avoid inline styles unless required.

Prefer reusable utility patterns over repeated class lists.

---

# Accessibility

Every component should support:

- Keyboard navigation
- Visible focus states
- Semantic HTML
- Proper ARIA attributes when necessary

Accessibility is a default requirement.

---

# Performance

Write efficient code.

Guidelines

- Avoid unnecessary re-renders.
- Lazy load heavy components.
- Memoize expensive calculations only when beneficial.
- Optimize images.
- Minimize bundle size.

Measure performance before optimizing prematurely.

---

# Imports

Import order

```javascript
React

↓

Third-party Libraries

↓

Internal Components

↓

Hooks

↓

Services

↓

Utilities

↓

Styles
```

Maintain a consistent order.

---

# Constants

Avoid magic numbers.

Good

```javascript
const HERO_ANIMATION_DELAY = 500;
```

Avoid

```javascript
setTimeout(..., 500);
```

without context.

---

# Reusability

Before writing new code, ask:

- Does something similar already exist?
- Can an existing component be reused?
- Can this logic become a hook?
- Can this become a utility?

Prefer reuse over duplication.

---

# Folder Responsibilities

Follow the folder conventions defined in:

`FOLDER_STRUCTURE.md`

Do not place files in arbitrary locations.

---

# Git Practices

Every commit should represent one logical change.

Good commit messages

```
Add camera intro animation

Improve portfolio image loading

Refactor navigation component
```

Avoid

```
update

fix

changes

final
```

Commit history should tell the story of the project.

---

# Pull Requests

Each pull request should:

- Solve one problem.
- Be easy to review.
- Include a clear description.
- Avoid unrelated changes.

Smaller pull requests are easier to maintain.

---

# Code Review Checklist

Before merging code, verify:

- Does it follow naming conventions?
- Is the logic easy to understand?
- Is there unnecessary duplication?
- Is the component focused?
- Are errors handled?
- Is accessibility considered?
- Does it follow the folder structure?
- Is performance acceptable?

---

# Anti-Patterns

Avoid:

- God Components
- God Services
- Massive utility files
- Deep prop drilling
- Duplicate logic
- Hardcoded values
- Circular dependencies
- Premature optimization
- Commented-out code
- Dead code

---

# Success Criteria

The codebase is successful when:

- Every file has one responsibility.
- New developers understand the code quickly.
- Features are easy to modify.
- Components remain reusable.
- Bugs are easier to isolate.
- Refactoring is safe.

---

# Guiding Question

Before writing code, ask:

> **Will another developer understand this implementation six months from now without additional explanation?**

If the answer is **No**, simplify the implementation.

---

# Related Documents

- TECHNOLOGY_STACK.md
- FOLDER_STRUCTURE.md
- DATA_FLOW.md
- STATE_MANAGEMENT.md
- DESIGN_PRINCIPLES.md
- PERFORMANCE_BUDGET.md
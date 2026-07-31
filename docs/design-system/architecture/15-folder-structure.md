# Folder Structure

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Architecture  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines the official folder structure for the Photographer Business Website.

A predictable folder structure makes the project:

- Easier to understand
- Easier to scale
- Easier to maintain
- Easier for new developers to contribute

Every new file should follow these conventions unless there is a strong architectural reason not to.

---

# Philosophy

The project follows a **feature-oriented architecture** rather than grouping everything by file type.

Instead of thinking:

```
components/
hooks/
utils/
```

We think:

```
camera/
portfolio/
gallery/
contact/
```

Each feature owns its own components, hooks, logic, and utilities whenever practical.

---

# Architecture Principles

The folder structure follows these principles:

- Separation of Concerns
- Feature First
- Reusable Components
- Single Responsibility
- Scalable Growth
- Predictable Locations

Every folder should have one clear responsibility.

---

# High Level Structure

```text
project/

├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── public/
├── styles/
├── docs/
├── scripts/
├── types/
└── config/
```

---

# Folder Responsibilities

---

## app/

Purpose

Application routing.

Contains:

- Layouts
- Pages
- Route Groups
- Loading UI
- Error UI
- Metadata

Example

```text
app/

layout.js

page.js

about/

portfolio/

contact/
```

Do NOT place reusable UI here.

---

## components/

Purpose

Reusable UI components shared across multiple features.

Examples

```text
components/

Button/

Navbar/

Footer/

Section/

Container/

Heading/

Loader/
```

A component should exist here only if multiple features use it.

---

## features/

Purpose

Feature-specific implementation.

Each feature owns its:

- Components
- Hooks
- Services
- Animations
- Utilities

Example

```text
features/

camera/

portfolio/

gallery/

contact/

services/
```

This prevents unrelated code from becoming mixed together.

---

## hooks/

Purpose

Reusable custom React hooks.

Examples

```text
useScroll

useMediaQuery

useIntersection

useMouse

useWindowSize
```

Feature-specific hooks should remain inside their feature folder.

---

## lib/

Purpose

Shared application logic.

Examples

```text
constants/

helpers/

animations/

utils/

validation/

api/

storage/
```

Never place React components here.

---

## public/

Purpose

Static assets.

Examples

```text
images/

fonts/

icons/

models/

videos/

favicons/
```

These files are served directly by the web server.

---

## styles/

Purpose

Global styling.

Examples

```text
globals.css

variables.css

animations.css
```

Component-specific styling should stay close to the component whenever possible.

---

## docs/

Purpose

Project documentation.

Contains:

- Architecture
- Design
- Development
- Production
- Performance

Documentation is considered part of the project.

---

## scripts/

Purpose

Development scripts.

Examples

```text
generate-assets.js

optimize-images.js

generate-sitemap.js
```

Scripts should never contain application logic.

---

## types/

Purpose

Shared type definitions.

Reserved for future TypeScript adoption.

---

## config/

Purpose

Application configuration.

Examples

```text
site.js

navigation.js

seo.js

theme.js
```

Configuration should remain centralized.

---

# Feature Structure

Each feature should follow a consistent structure.

Example

```text
features/

portfolio/

components/

hooks/

services/

utils/

animations/

constants/
```

Not every feature requires every folder.

Create folders only when needed.

---

# Component Structure

Each reusable component should have its own folder.

Example

```text
Button/

index.jsx

button.jsx

button.test.js

button.stories.jsx
```

Documentation may also be included when necessary.

---

# Naming Conventions

Folders

Use:

```
kebab-case
```

Examples

```
image-stack

contact-form

camera-controls
```

Avoid

```
ImageStack

image_stack

imagestack
```

---

# File Naming

React Components

```
PascalCase
```

Example

```
Camera.jsx

PortfolioGrid.jsx

Navbar.jsx
```

Hooks

```
camelCase
```

Example

```
useScroll.js

useCursor.js
```

Utilities

```
kebab-case
```

Example

```
image-loader.js

motion-helper.js
```

Documentation

```
UPPERCASE.md
```

Example

```
DESIGN_PRINCIPLES.md
```

---

# Import Rules

Prefer absolute imports.

Example

```javascript
import Navbar from "@/components/Navbar";
```

Avoid deeply nested relative imports.

```javascript
../../../../../Navbar
```

Absolute imports improve readability.

---

# Dependency Direction

Dependencies should move downward.

```
App

↓

Features

↓

Components

↓

Utilities
```

Lower layers should never depend on higher layers.

---

# Separation of Concerns

Avoid mixing responsibilities.

Example

Bad

```
Portfolio Component

↓

Database Query

↓

Animation

↓

Validation

↓

Analytics
```

Good

```
Portfolio Component

↓

Portfolio Service

↓

Animation Module

↓

Utility Functions
```

Each layer has one responsibility.

---

# Asset Organization

Images

```text
public/images/
```

Icons

```text
public/icons/
```

Fonts

```text
public/fonts/
```

3D Models

```text
public/models/
```

Videos

```text
public/videos/
```

Never mix unrelated assets.

---

# Animation Organization

Animations should remain modular.

Example

```text
features/

camera/

animations/

enter.js

idle.js

scroll.js

exit.js
```

Avoid placing all animations in one large file.

---

# Future Growth

The structure should support future additions without major refactoring.

Examples

```
admin/

cms/

client/

dashboard/

analytics/
```

New features should integrate naturally.

---

# Anti-Patterns

Avoid:

- Large utility folders
- Huge component files
- Deep folder nesting
- Circular dependencies
- Duplicate components
- Generic "misc" folders
- Random helper files

Every file should have a clear home.

---

# Folder Checklist

Before creating a new folder, ask:

- Does it have one responsibility?
- Can an existing folder be reused?
- Will other developers understand its purpose?
- Does it improve maintainability?
- Will it scale?

If the answer is **No**, reconsider the structure.

---

# Success Criteria

The folder structure is successful when:

- Every file has an obvious location.
- Features remain isolated.
- Components are reusable.
- Imports remain clean.
- New developers can understand the project quickly.
- The project scales without major reorganization.

---

# Guiding Question

Before creating a new folder, ask:

> Does this improve organization, or does it simply create another level of nesting?

Choose the simplest structure that remains scalable.

---

# Related Documents

- SYSTEM_ARCHITECTURE.md
- TECHNOLOGY_STACK.md
- DATA_FLOW.md
- STATE_MANAGEMENT.md
- CODING_STANDARDS.md
- FOLDER_CONVENTIONS.md
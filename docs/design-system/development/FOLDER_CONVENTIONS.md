# Folder Conventions

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Development  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines the folder conventions for the Photographer Business Website.

Folder conventions ensure that every developer organizes files consistently, making the project easier to navigate, maintain, and scale.

These conventions complement the project architecture defined in **FOLDER_STRUCTURE.md** by focusing on **how folders should be created and used**.

---

# Philosophy

A folder should exist because it represents a clear responsibility, not because files need a place to live.

Good folder organization should make it easy to answer:

- Where should a new file go?
- Where can I find existing code?
- Who owns this feature?

The answer should always be obvious.

---

# Core Principles

Every folder should follow these principles:

- Single Responsibility
- Predictable Structure
- Consistent Naming
- Minimal Nesting
- Feature Ownership
- Scalability

---

# Folder Ownership

Every folder must have one clear owner.

Examples

```
camera/

↓

Everything related to the camera experience.
```

```
portfolio/

↓

Everything related to the portfolio.
```

Avoid folders that combine unrelated features.

---

# Feature First

Features own their own implementation.

Preferred

```text
features/

camera/

portfolio/

gallery/

about/

contact/
```

Avoid

```text
components/

hooks/

animations/

services/

utils/
```

when they contain feature-specific code.

Shared resources belong in shared directories.

---

# Shared vs Feature

Use shared folders only for reusable code.

Shared

```text
components/

Button/

Navbar/

Footer/

Section/
```

Feature

```text
features/

portfolio/

PortfolioGrid/

PortfolioCard/

PortfolioFilter/
```

If code is used only by one feature, keep it inside that feature.

---

# Maximum Folder Depth

Avoid excessive nesting.

Preferred

```text
portfolio/

components/

PortfolioGrid.jsx
```

Acceptable

```text
portfolio/

components/

cards/

PortfolioCard.jsx
```

Avoid

```text
portfolio/

components/

cards/

desktop/

animations/

v2/

PortfolioCard.jsx
```

Deep nesting makes navigation difficult.

---

# Empty Folders

Do not create folders in anticipation of future use.

Bad

```text
hooks/

store/

graphql/

workers/

middleware/
```

if they contain no files.

Create folders only when they are needed.

---

# Folder Naming

All folder names use:

```
kebab-case
```

Examples

```text
image-stack

camera-controls

contact-form

scroll-effects
```

Avoid

```text
ImageStack

imageStack

image_stack

imagestack
```

---

# Feature Folder Template

Each feature follows the same structure.

```text
feature/

components/

hooks/

services/

animations/

utils/

constants/
```

Create only the folders required by the feature.

Do not force unused directories.

---

# Component Folder Template

Reusable components should have their own directory.

Example

```text
Button/

Button.jsx

index.js
```

Larger components may include:

```text
Button/

Button.jsx

Button.test.js

Button.stories.jsx

index.js
```

---

# Animation Organization

Animations belong to the feature they support.

Good

```text
camera/

animations/

intro.js

idle.js

exit.js
```

Avoid

```text
animations/

camera.js

portfolio.js

hero.js

gallery.js
```

A single animation folder quickly becomes difficult to maintain.

---

# Service Organization

Services should be grouped by business domain.

Good

```text
services/

portfolio-service.js

contact-service.js

gallery-service.js
```

Avoid

```text
services/

helper.js

misc.js

common.js
```

---

# Utility Organization

Utilities should remain focused.

Good

```text
utils/

format-date.js

calculate-grid.js

image-loader.js
```

Avoid

```text
utils.js

helpers.js

functions.js
```

---

# Asset Organization

Assets should remain categorized.

```text
public/

images/

icons/

fonts/

videos/

models/
```

Avoid mixing unrelated assets.

---

# Documentation Organization

Documentation should follow the project structure.

```text
docs/

architecture/

design/

development/

performance/

production/
```

Do not store documentation outside the `docs/` directory.

---

# Configuration Files

Configuration belongs in one location.

```text
config/

navigation.js

site.js

seo.js

theme.js
```

Avoid duplicating configuration across multiple files.

---

# Constants

Constants should live close to where they are used.

Feature-specific constants

```text
portfolio/

constants/
```

Global constants

```text
lib/constants/
```

---

# Hooks

Shared hooks

```text
hooks/

useScroll.js

useMediaQuery.js
```

Feature-specific hooks

```text
portfolio/

hooks/

usePortfolioFilter.js
```

---

# Index Files

Use `index.js` only when it improves imports.

Good

```javascript
import Button from "@/components/Button";
```

Avoid creating index files that simply add unnecessary indirection.

---

# Co-location

Keep related files together.

Example

```text
PortfolioCard/

PortfolioCard.jsx

PortfolioCardSkeleton.jsx

PortfolioCard.test.js
```

Developers should not search across the project for closely related files.

---

# Archive Policy

Unused files should be removed.

Do not keep:

- old/
- backup/
- final/
- new/
- temp/

Version control already provides history.

---

# Folder Growth

When a folder grows beyond roughly **15–20 files**, evaluate whether it should be split into meaningful subfolders.

Split by responsibility, not arbitrarily.

---

# Import Boundaries

Features should not directly access files inside another feature unless they are part of that feature's public API.

Preferred

```text
portfolio/

index.js
```

Avoid

```javascript
import "../../../portfolio/components/internal/file";
```

Respect feature boundaries.

---

# Checklist

Before creating a folder, ask:

- Does it represent one responsibility?
- Will another developer immediately understand its purpose?
- Can an existing folder be reused?
- Is the nesting necessary?
- Will it remain useful as the project grows?

If the answer is **No**, reconsider.

---

# Anti-Patterns

Avoid:

- Generic folders (`misc`, `common`, `temp`)
- Deep nesting
- Duplicate folders
- Empty folders
- Feature code inside shared folders
- Shared code inside feature folders
- Files with unclear ownership

---

# Success Criteria

Folder conventions are successful when:

- Every file has an obvious home.
- Features remain isolated.
- Navigation is predictable.
- Imports remain clean.
- The project scales without restructuring.

---

# Guiding Question

Before creating a folder, ask:

> **Will this folder make the project easier to understand one year from now?**

If not, it probably should not exist.

---

# Related Documents

- FOLDER_STRUCTURE.md
- CODING_STANDARDS.md
- TECHNOLOGY_STACK.md
- DATA_FLOW.md
- STATE_MANAGEMENT.md
- COMPONENT_GUIDELINES.md
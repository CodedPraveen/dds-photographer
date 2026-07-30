# State Management

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Architecture  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines how application state is managed throughout the Photographer Business Website.

A predictable state architecture improves maintainability, performance, scalability, and debugging.

Every feature should follow the same state management strategy.

---

# Philosophy

The project follows a **minimal state philosophy**.

> **Only store state when absolutely necessary.**

If something can be derived from existing data, it should **not** become new state.

---

# State Management Goals

The architecture should be:

- Simple
- Predictable
- Performant
- Easy to Debug
- Scalable
- Easy to Maintain

---

# State Priority

Whenever state is required, always follow this order.

```
Server Data

↓

URL State

↓

Local Component State

↓

Shared Context

↓

Global Store
```

Use the simplest solution first.

---

# Types of State

The application contains five different types of state.

---

# 1. Server State

Server State is the primary source of truth.

Examples

- Portfolio
- Photographer Information
- Services
- Gallery
- Site Settings

Source

```
Database

CMS

JSON

Markdown
```

Rules

- Never duplicate server state.
- Fetch on the server whenever possible.
- Keep server data immutable inside UI components.

---

# 2. URL State

The URL should represent the current page state.

Examples

```
/portfolio

/portfolio?category=wedding

/gallery?image=15

/services

/contact
```

Store filters, sorting, search parameters, and navigation in the URL whenever possible.

Benefits

- Shareable links
- Browser history
- Refresh persistence
- Better SEO

---

# 3. Local Component State

Local UI behavior belongs inside the component.

Examples

```
Menu Open

Accordion

Modal

Hover

Selected Image

Carousel Index

Current Tab
```

Preferred Hook

```
useState()
```

Rules

Keep local state local.

Do not move it into Context unnecessarily.

---

# 4. Shared State

Shared state is used when multiple components require the same data.

Examples

- Theme
- Navigation
- Loading Overlay
- Cursor
- Camera Controller

Preferred Solution

```
React Context
```

Rules

Context is for shared UI state.

Not application data.

---

# 5. Global State

Global state should remain minimal.

Current Version

No global store required.

Future

```
Zustand
```

Possible Use Cases

- Camera Controller
- Shared Animation Timeline
- Global Cursor
- User Preferences

Avoid putting all application data into a global store.

---

# State Ownership

Every state should have one owner.

Example

```
Portfolio Filter

↓

Portfolio Page
```

```
Navigation Open

↓

Navbar
```

```
Current Camera Mode

↓

Camera Controller
```

Never allow multiple owners for the same state.

---

# State Lifecycle

Every state follows this lifecycle.

```
Create

↓

Read

↓

Update

↓

Destroy
```

Unused state should be removed.

---

# Data vs UI State

Separate application data from UI behavior.

Good

```
Portfolio Data

↓

Server
```

```
Gallery Open

↓

Local State
```

Bad

```
Portfolio Data

↓

Context
```

Keep data and interface concerns separate.

---

# State Update Flow

```
User

↓

Interaction

↓

State Update

↓

Render

↓

Animation

↓

Idle
```

State should always update before animation begins.

---

# Camera State

The camera has multiple visual states.

Example

```
Loading

↓

Entering

↓

Hero

↓

Reveal

↓

Floating

↓

Background

↓

Footer

↓

Exit
```

These represent visual behavior, not separate pages.

---

# Animation State

Animation should react to state.

Never use animation as application state.

Correct

```
State

↓

Animation
```

Avoid

```
Animation

↓

Business Logic
```

Animations are consumers of state.

---

# Form State

Each form owns its own state.

Examples

```
Input Values

Validation

Errors

Submitting

Success
```

Do not place form state into Context.

---

# Error State

Every feature should manage errors consistently.

```
Loading

↓

Success

↓

Error
```

Display friendly messages.

Log technical details separately.

---

# Loading State

Every async operation should clearly define its loading state.

Possible states

```
Idle

Loading

Success

Empty

Error
```

Avoid ambiguous loading behavior.

---

# Derived State

If a value can be calculated, do not store it.

Bad

```
Products

Filtered Products

Visible Products
```

Good

```
Products

↓

Filter()

↓

Visible Products
```

Store less.

Compute more.

---

# State Isolation

Each feature should own its own state.

Example

```
Portfolio

↓

Portfolio State
```

```
Gallery

↓

Gallery State
```

Avoid unrelated features sharing state.

---

# State Persistence

Persist only what improves the user experience.

Good Candidates

- Theme
- Preferred View
- Recently Viewed
- Language

Avoid persisting temporary UI state.

---

# State Naming

Use descriptive names.

Good

```
isMenuOpen

selectedImage

currentCategory

activeSection
```

Avoid

```
value

temp

data

flag

state
```

Names should describe intent.

---

# Performance

Keep state updates efficient.

Guidelines

- Update only what changed.
- Avoid unnecessary re-renders.
- Memoize expensive calculations.
- Avoid deeply nested state.
- Prefer immutable updates.

---

# Future Global Store

If a global store becomes necessary, keep it modular.

Example

```
store/

camera/

navigation/

cursor/

preferences/
```

Avoid creating one large store.

---

# State Management Rules

Always

- Keep state close to where it is used.
- Lift state only when necessary.
- Prefer server state.
- Prefer URL state over duplicated filters.
- Prefer local state over Context.
- Prefer Context over Global Store.

---

# Anti-Patterns

Avoid

- Duplicate state
- Global state for everything
- Business logic inside Context
- Multiple sources of truth
- Unnecessary Context Providers
- Deep prop drilling without reason
- State synchronized manually between components

---

# State Checklist

Before introducing new state, ask:

- Can this be derived?
- Can this stay local?
- Can the URL represent it?
- Does another component actually need it?
- Is Context necessary?
- Is a global store really required?

If the answer is **No**, do not create new state.

---

# Success Criteria

State management is successful when:

- State is easy to locate.
- Every state has one owner.
- Components remain simple.
- Updates are predictable.
- Performance remains high.
- Debugging is straightforward.

---

# Guiding Question

Before creating any new state, ask:

> **What is the smallest scope that can own this state?**

If a smaller scope can manage it, keep it there.

---

# Related Documents

- SYSTEM_ARCHITECTURE.md
- TECHNOLOGY_STACK.md
- FOLDER_STRUCTURE.md
- DATA_FLOW.md
- API.md
- DEVELOPMENT/CODING_STANDARDS.md
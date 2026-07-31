# Three.js Guide

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Performance / Development  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines how Three.js should be used throughout the Photographer Business Website.

The website uses Three.js to create a premium cinematic experience centered around a realistic camera that guides visitors through the portfolio.

Three.js should enhance storytelling without overwhelming performance or usability.

---

# Philosophy

Three.js is an enhancement.

It is **not** the website.

The website must remain functional even if the 3D experience cannot be rendered.

---

# Primary Goal

Three.js exists to create:

- Premium first impression
- Cinematic storytelling
- Smooth section transitions
- Visual continuity
- Brand identity

It should never distract from the photography itself.

---

# Design Principles

The 3D experience should be:

- Elegant
- Minimal
- Responsive
- Lightweight
- Cinematic
- Predictable

---

# Technology Stack

The project uses:

| Technology | Purpose |
|------------|----------|
| Three.js | Rendering Engine |
| React Three Fiber | React Renderer |
| Drei | Utilities |
| GSAP | Animation Timeline |
| ScrollTrigger | Scroll Control |
| GLTF/GLB | Camera Model |
| Draco | Model Compression |
| KTX2 | Texture Compression |

---

# Architecture

```text
User Scroll

↓

GSAP ScrollTrigger

↓

Camera Timeline

↓

React Three Fiber

↓

Three.js Scene

↓

WebGL Renderer
```

Three.js should react to application state rather than controlling it.

---

# Scene Structure

Only one primary scene should exist.

```text
Canvas
│
├── Camera
├── Lights
├── Environment
├── Camera Model
├── Effects
└── Helpers (Development Only)
```

Avoid multiple canvases unless absolutely necessary.

---

# Canvas Rules

The application should use:

- One `<Canvas>`
- Shared renderer
- Shared scene
- Shared camera

Avoid mounting and unmounting the canvas during navigation.

---

# Camera Rules

The camera is the central visual element.

Requirements

- Single camera
- GSAP controlled
- Smooth interpolation
- No sudden jumps
- Consistent movement

The camera should tell the story.

---

# Model Guidelines

Use GLB models.

Requirements

- Optimized geometry
- Clean hierarchy
- Proper naming
- Centered origin
- Correct scale

Recommended polygon budget

```text
< 100k triangles
```

---

# Texture Guidelines

Use compressed textures.

Preferred formats

```
KTX2

↓

WebP

↓

JPEG

↓

PNG
```

Guidelines

- Keep resolutions reasonable
- Reuse textures
- Compress aggressively

---

# Lighting

Keep lighting simple.

Recommended

- Environment Light
- Directional Light
- Ambient Light

Avoid excessive shadow-casting lights.

---

# Shadows

Only use shadows when they improve realism.

Guidelines

- Soft shadows
- Limited shadow casters
- Low shadow resolution on mobile

Disable expensive shadows where appropriate.

---

# Materials

Reuse materials whenever possible.

Avoid

- Duplicate materials
- Unnecessary transparency
- Complex shaders

Shared materials improve performance.

---

# Animations

Three.js should animate:

- Camera
- Camera Details
- Lens
- Minor Elements

Avoid excessive object animation.

---

# Scroll Integration

Scroll controls:

- Camera position
- Camera rotation
- Object visibility
- Section transitions

Business logic should never depend on scroll position.

---

# React Three Fiber

Use React Three Fiber for:

- Scene management
- Components
- Hooks
- Lifecycle

Avoid direct DOM manipulation.

---

# Drei

Use Drei for:

- Environment
- OrbitControls (development only)
- useGLTF
- useTexture
- Html
- Float (sparingly)
- ContactShadows (when appropriate)

Avoid unnecessary helper components in production.

---

# Model Loading

Recommended flow

```text
Canvas

↓

Environment

↓

Placeholder

↓

Load GLB

↓

Load Textures

↓

Compile Materials

↓

Fade Model In
```

Never block the page while loading the model.

---

# Asset Loading

Use:

- Suspense
- Progressive loading
- Preloading
- Lazy loading

Large assets should never block rendering.

---

# Performance Budget

Target

| Metric | Target |
|----------|---------|
| FPS | 60 |
| Draw Calls | <100 |
| Triangles | <100k |
| Textures | Compressed |
| Memory | Stable |

---

# Resource Management

Dispose unused:

- Geometry
- Materials
- Textures
- Render targets

Avoid memory leaks.

---

# Rendering Strategy

Render only when necessary.

Examples

- User scroll
- Timeline updates
- Resize
- Interaction

Avoid continuous rendering for static scenes.

---

# Responsive Strategy

Desktop

- Full experience

Tablet

- Reduced effects

Mobile

- Simplified rendering
- Lower resolution
- Reduced post-processing

---

# Post Processing

Use sparingly.

Allowed

- Bloom (minimal)
- Tone Mapping
- Color Correction

Avoid

- Heavy blur
- Multiple passes
- Expensive shaders

---

# Error Handling

If WebGL fails:

Fallback to

- Static Hero
- Hero Image
- CSS Animations

The website must remain usable.

---

# Accessibility

Three.js should never interfere with:

- Keyboard navigation
- Screen readers
- Focus order
- Reduced motion preferences

The 3D experience is decorative.

---

# Development Helpers

Allowed during development

- AxesHelper
- GridHelper
- OrbitControls
- Stats

Remove all helpers before production.

---

# Folder Structure

```text
features/
└── camera/
    ├── components/
    ├── hooks/
    ├── models/
    ├── materials/
    ├── animations/
    ├── utils/
    ├── loaders/
    └── index.js
```

Keep Three.js isolated from general UI components.

---

# Code Organization

Separate:

- Rendering
- Animation
- Loading
- Utilities
- Scene setup

Avoid monolithic scene files.

---

# Monitoring

Measure using:

- Chrome DevTools
- React Profiler
- Three.js Inspector
- Spector.js
- FPS Meter

Optimize based on measurements.

---

# Checklist

Before release:

- One Canvas
- One Camera
- GLB optimized
- Textures compressed
- Draw calls minimized
- Memory stable
- Helpers removed
- Mobile tested
- WebGL fallback verified
- Reduced motion supported

---

# Anti-Patterns

Avoid:

- Multiple canvases
- Multiple active cameras
- Huge GLB files
- Uncompressed textures
- Continuous rendering
- Memory leaks
- Heavy post-processing
- Dozens of lights
- Multiple environments
- Business logic inside Three.js

---

# Success Criteria

The Three.js implementation is successful when:

- The camera feels cinematic.
- Scrolling remains smooth.
- Photography remains the primary focus.
- Performance is consistent across devices.
- The website gracefully falls back if WebGL is unavailable.
- The 3D experience enhances rather than dominates the website.

---

# Guiding Question

Before adding any Three.js feature, ask:

> **Does this make the storytelling more immersive without reducing performance or distracting from the photography?**

If the answer is **No**, simplify or remove it.

---

# Related Documents

- MOTION_GUIDELINES.md
- ANIMATION_PERFORMANCE.md
- PERFORMANCE_BUDGET.md
- LOADING_STRATEGY.md
- IMAGE_OPTIMIZATION.md
- TECHNOLOGY_STACK.md
- SYSTEM_ARCHITECTURE.md
- CODING_STANDARDS.md
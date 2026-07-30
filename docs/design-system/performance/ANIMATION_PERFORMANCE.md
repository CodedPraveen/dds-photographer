# Animation Performance

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Performance  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines the animation performance standards for the Photographer Business Website.

The website relies heavily on cinematic motion, scroll-driven storytelling, and a persistent 3D camera. These animations should feel premium while maintaining excellent performance across all supported devices.

Performance is always more important than visual complexity.

---

# Philosophy

Motion should never reduce usability.

Animations should feel:

- Smooth
- Natural
- Intentional
- Responsive
- Efficient

Visitors should notice the experience—not performance problems.

---

# Performance Goals

Animations should provide:

- Consistent frame rate
- Smooth scrolling
- Immediate interaction
- Low CPU usage
- Minimal GPU stress
- Stable rendering

---

# Performance Targets

| Metric | Target |
|----------|---------|
| Animation FPS | 60 FPS |
| Minimum FPS (Mobile) | 50 FPS |
| Animation Delay | < 16 ms/frame |
| Input Response | < 100 ms |
| Scroll Jank | None |
| Dropped Frames | Minimal |

These targets should be verified during development.

---

# Animation Principles

The project follows these principles:

- Animate only when meaningful.
- Animate GPU-friendly properties.
- Avoid unnecessary calculations.
- Pause inactive animations.
- Minimize simultaneous effects.
- Respect user preferences.

---

# Animation Priority

Animations should be prioritized based on importance.

```text
Hero Camera

↓

Hero Content

↓

Portfolio Reveal

↓

Image Transitions

↓

Hover Effects

↓

Decorative Motion
```

Decorative animations should never affect core interactions.

---

# GPU-Friendly Properties

Preferred animation properties:

- transform
- opacity
- filter (limited usage)

Avoid animating:

- width
- height
- top
- left
- right
- bottom
- margin
- padding
- border-radius (large animations)

Layout-triggering properties should be minimized.

---

# Transform Usage

Preferred transforms:

```text
translateX()

translateY()

translate3d()

scale()

rotate()

rotateX()

rotateY()
```

Using transforms reduces layout recalculations.

---

# Opacity

Opacity transitions should be used for:

- Fade in
- Fade out
- Reveal
- Image transitions
- Section transitions

Opacity is inexpensive compared to layout changes.

---

# Scroll Performance

Scroll-driven animations should remain lightweight.

Guidelines

- Use requestAnimationFrame indirectly through animation libraries.
- Minimize scroll event listeners.
- Avoid expensive calculations during scrolling.
- Batch updates when possible.

Scrolling should remain smooth even during complex scenes.

---

# GSAP Guidelines

Use GSAP for:

- Timeline orchestration
- ScrollTrigger
- Complex sequencing
- Camera movement

Avoid:

- Creating unnecessary timelines
- Nested timelines without purpose
- Duplicate ScrollTriggers

Destroy timelines when no longer needed.

---

# ScrollTrigger Guidelines

Rules

- Register only required triggers.
- Remove inactive triggers.
- Refresh only when necessary.
- Scope triggers to their sections.

Too many active ScrollTriggers increase overhead.

---

# Framer Motion Guidelines

Use Framer Motion for:

- Component entry
- Hover states
- UI transitions
- Shared layout animations

Avoid using Framer Motion for:

- Long scroll storytelling
- Continuous animations
- Large timeline orchestration

Choose the right tool for the task.

---

# Three.js Animation

3D animation should remain efficient.

Requirements

- Reuse objects
- Reuse materials
- Dispose unused resources
- Pause rendering when off-screen
- Reduce draw calls
- Compress textures

Rendering should only occur when necessary.

---

# Camera Animation

The camera is the central animation.

Guidelines

- One primary timeline
- Smooth interpolation
- Predictable movement
- No abrupt jumps
- Avoid competing camera controllers

Camera movement should feel cinematic rather than mechanical.

---

# Image Animation

Images should animate using:

- Fade
- Scale
- Translate
- Mask reveal

Avoid excessive rotation or distracting effects.

Photography should remain the visual focus.

---

# Hover Animation

Hover interactions should be subtle.

Preferred effects

- Slight scale
- Soft opacity
- Gentle elevation
- Cursor feedback

Avoid dramatic hover animations.

---

# Section Transitions

Sections should transition using:

- Fade
- Vertical movement
- Progressive reveal

Avoid:

- Flashing
- Full-page wipes
- Abrupt transitions

---

# Timing Guidelines

Recommended durations

| Animation | Duration |
|-----------|----------|
| Hover | 150–250 ms |
| Button | 150–200 ms |
| Card | 250–400 ms |
| Section | 500–900 ms |
| Hero | 800–1500 ms |
| Camera | 1000–3000 ms |

Timing should support the narrative without feeling slow.

---

# Easing

Preferred easing

- ease-out
- ease-in-out
- Custom cubic-bezier for cinematic motion

Avoid:

- Linear motion (unless intentional)
- Bounce
- Elastic
- Overshoot effects

Motion should remain elegant.

---

# Staggering

Use staggering for:

- Portfolio cards
- Text reveals
- Image grids
- Gallery thumbnails

Keep stagger values subtle.

Avoid long cascading delays.

---

# Animation Lifecycle

Each animation should follow:

```text
Initialize

↓

Wait for Trigger

↓

Play

↓

Complete

↓

Pause

↓

Destroy (if no longer needed)
```

Avoid keeping inactive animations alive.

---

# Animation Cleanup

Always clean up:

- Timelines
- ScrollTriggers
- Event listeners
- requestAnimationFrame loops
- Observers

Prevent memory leaks.

---

# Visibility Optimization

Animations should pause when:

- Element leaves viewport
- Tab becomes inactive
- Section unmounts
- Animation is no longer relevant

Do not consume resources for invisible content.

---

# Responsive Motion

Animations should adapt to device capabilities.

Desktop

- Full cinematic experience

Tablet

- Moderate complexity

Mobile

- Reduced movement
- Smaller distances
- Fewer simultaneous effects

Performance takes priority over consistency.

---

# Reduced Motion

Respect the user's operating system preferences.

When `prefers-reduced-motion` is enabled:

- Remove parallax
- Simplify transitions
- Reduce camera movement
- Disable decorative animations

Core functionality must remain intact.

---

# Performance Monitoring

Monitor animation performance using:

- Chrome DevTools Performance
- FPS Meter
- Lighthouse
- React Profiler
- GSAP DevTools (during development)

Measure before optimizing.

---

# Animation Checklist

Before merging:

- 60 FPS maintained
- No layout shifts
- GPU-friendly properties used
- Timelines cleaned up
- Scroll remains smooth
- Animations pause when inactive
- Reduced motion supported
- Mobile performance verified

---

# Anti-Patterns

Avoid:

- Animating layout properties
- Excessive ScrollTriggers
- Infinite animations without purpose
- Multiple competing timelines
- Heavy JavaScript in animation callbacks
- Large simultaneous reveals
- Memory leaks
- Excessive parallax
- Autoplay animations that distract users

---

# Success Criteria

Animation performance is successful when:

- Motion feels smooth on supported devices.
- Scrolling remains responsive.
- Camera movement is cinematic.
- Animations never block interaction.
- Mobile devices maintain fluid performance.
- Performance remains consistent as the website grows.

---

# Guiding Question

Before adding any animation, ask:

> **Does this animation improve the storytelling enough to justify its performance cost?**

If the answer is **No**, simplify or remove it.

---

# Related Documents

- PERFORMANCE_BUDGET.md
- MOTION_GUIDELINES.md
- LOADING_STRATEGY.md
- THREEJS_PERFORMANCE.md
- IMAGE_OPTIMIZATION.md
- TECHNOLOGY_STACK.md
- TESTING.md
# Performance Budget

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Performance  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines the performance budget for the Photographer Business Website.

A performance budget establishes measurable limits that help maintain a fast, responsive, and enjoyable experience throughout the lifetime of the project.

Performance is treated as a feature, not an afterthought.

---

# Philosophy

Every design decision, animation, image, and dependency has a performance cost.

Before adding anything to the project, ask:

> **Is the visual or functional benefit worth the performance cost?**

If not, the feature should be reconsidered.

---

# Performance Goals

The website should feel:

- Instant
- Responsive
- Lightweight
- Smooth
- Reliable

Users should never feel that the website is slow because of unnecessary visual effects.

---

# Performance Principles

The project follows these principles:

- Performance First
- Mobile First
- Progressive Enhancement
- Lazy by Default
- GPU-Friendly Animations
- Image Optimization
- Minimal JavaScript
- Efficient Rendering

---

# Core Web Vitals

Target values for production.

| Metric | Target |
|---------|---------|
| Largest Contentful Paint (LCP) | ≤ 2.5 s |
| Interaction to Next Paint (INP) | ≤ 200 ms |
| Cumulative Layout Shift (CLS) | ≤ 0.1 |
| First Contentful Paint (FCP) | ≤ 1.8 s |
| Time to First Byte (TTFB) | ≤ 800 ms |

These metrics should be monitored continuously.

---

# Lighthouse Targets

Minimum production targets.

| Category | Target |
|----------|---------|
| Performance | 95+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Development builds are not used for performance evaluation.

---

# JavaScript Budget

Target values.

| Resource | Target |
|-----------|---------|
| Initial JavaScript | ≤ 180 KB (gzipped) |
| Route-specific JavaScript | ≤ 100 KB |
| Third-party JavaScript | Keep minimal |
| Unused JavaScript | 0 KB whenever practical |

Every dependency should justify its cost.

---

# CSS Budget

Target values.

| Resource | Target |
|-----------|---------|
| Initial CSS | ≤ 60 KB (gzipped) |
| Unused CSS | Minimal |
| Global CSS | Keep small and reusable |

Avoid unnecessary utility duplication.

---

# Image Budget

Photography is the primary content, so images must be optimized carefully.

Rules

- Serve responsive image sizes.
- Use modern formats where supported (WebP, AVIF).
- Lazy load below-the-fold images.
- Compress without noticeable quality loss.
- Avoid oversized images.

Every image should have a defined purpose.

---

# Image Loading Strategy

Priority

1. Hero Image
2. Above-the-fold Images
3. Portfolio Preview
4. Remaining Gallery Images

Never load the entire gallery on the first page render.

---

# Video Budget

Videos should be used sparingly.

Rules

- Compress aggressively.
- Do not autoplay with sound.
- Lazy load when outside the viewport.
- Use poster images.

Videos should support storytelling rather than replace photography.

---

# 3D Performance Budget

The camera model is an important visual element and must remain efficient.

Guidelines

- Optimize geometry.
- Minimize polygon count.
- Compress textures.
- Reuse materials.
- Dispose of unused resources.
- Pause rendering when not visible.

The 3D experience should not reduce responsiveness.

---

# Animation Budget

Animations should remain lightweight.

Rules

- Use `transform` and `opacity` whenever possible.
- Avoid animating layout properties.
- Avoid unnecessary repainting.
- Limit simultaneous animations.
- Keep animation timelines efficient.

Smooth motion is more important than complex motion.

---

# Scroll Performance

Scrolling should remain smooth.

Guidelines

- Avoid heavy scroll listeners.
- Prefer `Intersection Observer`.
- Batch updates.
- Throttle or debounce expensive operations.
- Keep work outside the critical scroll path.

---

# Network Budget

Reduce unnecessary requests.

Guidelines

- Combine assets where appropriate.
- Cache static resources.
- Compress responses.
- Preload critical resources only.
- Remove unused requests.

Every request should have a purpose.

---

# Font Budget

Guidelines

- Limit the number of font families.
- Limit font weights.
- Use `font-display: swap`.
- Preload only critical fonts.

Typography should not delay rendering.

---

# Dependency Budget

Before adding a dependency, ask:

- Is it actively maintained?
- Can native APIs solve the problem?
- Is the bundle size acceptable?
- Will it still be useful in the future?

Avoid dependencies that provide minimal value.

---

# Rendering Budget

Keep rendering efficient.

Guidelines

- Prefer Server Components where appropriate.
- Minimize client-side JavaScript.
- Avoid unnecessary re-renders.
- Memoize expensive calculations only when beneficial.
- Virtualize large lists if needed.

---

# Mobile Performance

Mobile devices define the baseline.

Requirements

- Fast interactions
- Lightweight animations
- Optimized images
- Responsive layouts
- Minimal battery impact

Desktop should enhance—not redefine—the experience.

---

# Caching Strategy

Use caching whenever appropriate.

Examples

- Static assets
- Optimized images
- Fonts
- Configuration
- Generated pages

Caching should improve speed without introducing stale content issues.

---

# Loading Experience

Loading should feel intentional.

Preferred techniques

- Skeleton screens
- Blur placeholders
- Progressive image loading
- Streaming (where appropriate)

Avoid long loading spinners whenever possible.

---

# Accessibility & Performance

Accessibility and performance should complement each other.

Examples

- Respect `prefers-reduced-motion`.
- Maintain readable loading states.
- Avoid blocking interactions.
- Preserve keyboard usability during asynchronous operations.

---

# Monitoring

Performance should be measured regularly.

Recommended tools

- Lighthouse
- Chrome DevTools
- WebPageTest
- Vercel Analytics
- Real User Monitoring (RUM)

Measure before optimizing.

---

# Continuous Performance Checks

Performance should be verified:

- Before releases
- After major UI changes
- After adding dependencies
- After introducing animations
- After adding large media assets

Performance regression should be treated as a bug.

---

# Performance Checklist

Before merging, verify:

- Images optimized
- Animations GPU-friendly
- No unnecessary dependencies
- Bundle size acceptable
- Lighthouse targets maintained
- Core Web Vitals unaffected
- Mobile performance verified

---

# Anti-Patterns

Avoid:

- Loading every gallery image at once
- Large unoptimized assets
- Blocking JavaScript
- Heavy scroll handlers
- Excessive animations
- Multiple font families
- Autoplaying media with sound
- Unused dependencies
- Layout-shifting content

---

# Performance Review Process

For every significant feature, evaluate:

1. What is the performance cost?
2. Can the implementation be simplified?
3. Does it affect Core Web Vitals?
4. Is there a measurable user benefit?
5. Can the feature be deferred or lazy loaded?

---

# Success Criteria

Performance is successful when:

- Navigation feels immediate.
- Animations remain smooth.
- Images load progressively.
- Scrolling remains fluid.
- Mobile users have an excellent experience.
- Lighthouse and Core Web Vitals consistently meet project targets.

---

# Guiding Question

Before adding any feature, ask:

> **Does this improve the visitor's experience more than it impacts loading time, rendering, or interaction performance?**

If the answer is **No**, reconsider the implementation.

---

# Related Documents

- MOTION_GUIDELINES.md
- TECHNOLOGY_STACK.md
- CODING_STANDARDS.md
- TESTING.md
- DEPLOYMENT.md
- SYSTEM_ARCHITECTURE.md
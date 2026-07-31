# Core Web Vitals

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Performance  
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines the Core Web Vitals standards for the Photographer Business Website.

Core Web Vitals measure the real-world user experience of the website, focusing on loading speed, responsiveness, and visual stability.

Maintaining strong Core Web Vitals ensures that visitors experience a fast, responsive, and premium website regardless of device or network conditions.

---

# Philosophy

Performance is part of the user experience.

Beautiful animations and high-quality photography are valuable only when they remain fast, responsive, and stable.

Every new feature should preserve or improve Core Web Vitals.

---

# Goals

The project aims to:

- Load meaningful content quickly
- Respond immediately to user interactions
- Prevent unexpected layout shifts
- Maintain smooth scrolling
- Deliver a consistent experience across devices

---

# Core Web Vitals Overview

Google currently evaluates three primary metrics.

| Metric | Measures |
|---------|-----------|
| LCP | Loading Performance |
| INP | Interaction Responsiveness |
| CLS | Visual Stability |

Additional supporting metrics are also monitored.

---

# Largest Contentful Paint (LCP)

## Purpose

Measures how quickly the largest visible content appears.

Usually this is:

- Hero Image
- Hero Heading
- Main Photography
- Featured Portfolio Image

---

## Target

```text
Excellent ≤ 2.5 seconds

Needs Improvement
2.5–4.0 seconds

Poor > 4.0 seconds
```

Project Target

```text
≤ 2.0 seconds
```

---

## Improve LCP

Prioritize:

- Hero image
- Critical CSS
- Fast server response
- Optimized fonts
- Optimized images

Avoid:

- Large blocking JavaScript
- Heavy Hero animations
- Oversized images
- Multiple priority images

---

# Interaction to Next Paint (INP)

## Purpose

Measures how quickly the interface responds after user interaction.

Examples

- Button clicks
- Navigation
- Gallery opening
- Portfolio filtering
- Menu interaction

---

## Target

```text
Excellent ≤ 200 ms

Needs Improvement
200–500 ms

Poor > 500 ms
```

Project Target

```text
≤ 150 ms
```

---

## Improve INP

Reduce:

- Long JavaScript tasks
- Heavy event handlers
- Expensive rendering
- Large synchronous work

Use:

- Code splitting
- Lazy loading
- Efficient React rendering
- Debouncing when appropriate

---

# Cumulative Layout Shift (CLS)

## Purpose

Measures unexpected layout movement.

Visitors should never lose their reading position because content shifts unexpectedly.

---

## Target

```text
Excellent ≤ 0.1

Needs Improvement
0.1–0.25

Poor > 0.25
```

Project Target

```text
≤ 0.05
```

---

## Improve CLS

Always define:

- Image dimensions
- Video dimensions
- Component heights
- Font loading strategy

Avoid:

- Injecting content above existing elements
- Late-loading advertisements
- Layout-changing animations

---

# Supporting Metrics

Although not official Core Web Vitals, these metrics remain important.

---

## First Contentful Paint (FCP)

Measures the first visible content.

Target

```text
≤ 1.5 seconds
```

Users should receive immediate visual feedback.

---

## Time to First Byte (TTFB)

Measures server response speed.

Target

```text
≤ 800 ms
```

Server rendering should begin quickly.

---

## Speed Index

Measures how quickly visible content appears.

Target

```text
≤ 3 seconds
```

The page should progressively reveal itself rather than remaining blank.

---

# Project Performance Targets

| Metric | Target |
|----------|---------|
| LCP | ≤ 2.0 s |
| INP | ≤ 150 ms |
| CLS | ≤ 0.05 |
| FCP | ≤ 1.5 s |
| TTFB | ≤ 800 ms |
| Lighthouse Performance | 95+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

---

# Hero Optimization

The Hero section is the largest contributor to LCP.

Requirements

- Optimized image
- Responsive sizing
- Priority loading
- Minimal blocking scripts
- Stable layout

Only one Hero asset should receive loading priority.

---

# Image Strategy

Images should:

- Use modern formats
- Be responsive
- Load progressively
- Use lazy loading below the fold
- Preserve aspect ratios

Photography quality must not compromise loading speed.

---

# JavaScript Strategy

Reduce JavaScript impact by:

- Server Components where appropriate
- Dynamic imports
- Lazy loading
- Route-based code splitting
- Removing unused dependencies

Only critical JavaScript belongs in the initial bundle.

---

# CSS Strategy

Keep CSS:

- Small
- Modular
- Reusable
- Critical-first

Avoid unused styles and excessive global rules.

---

# Font Strategy

Guidelines

- Use limited font families
- Preload primary font
- Use `font-display: swap`
- Limit font weights

Fonts should never block rendering.

---

# Animation Strategy

Animations should:

- Use transforms and opacity
- Start after critical content
- Avoid layout changes
- Respect reduced-motion preferences

Smooth motion should not delay usability.

---

# Three.js Strategy

The 3D camera is a progressive enhancement.

Requirements

- Load after Hero content
- Do not delay LCP
- Pause when inactive
- Optimize models and textures

The Hero remains functional even if WebGL is unavailable.

---

# Mobile Performance

Mobile devices define the minimum acceptable performance.

Requirements

- Smaller images
- Reduced animations
- Lightweight rendering
- Optimized interactions

Desktop enhancements should never reduce the mobile experience.

---

# Monitoring Tools

Monitor performance using:

- Lighthouse
- Chrome DevTools
- PageSpeed Insights
- WebPageTest
- Vercel Analytics
- Real User Monitoring (RUM)

Use both lab data and real user data.

---

# Performance Reviews

Review Core Web Vitals:

- Before releases
- After new animations
- After adding dependencies
- After changing Hero content
- After introducing new media

Performance regressions should be treated as defects.

---

# Optimization Workflow

```text
Measure

↓

Identify Bottleneck

↓

Optimize

↓

Retest

↓

Deploy

↓

Monitor Real Users
```

Optimization should always be data-driven.

---

# Checklist

Before deployment, verify:

- Hero optimized
- Images compressed
- LCP within target
- INP within target
- CLS stable
- Fonts optimized
- JavaScript minimized
- CSS optimized
- Lighthouse score acceptable
- Mobile performance verified

---

# Anti-Patterns

Avoid:

- Oversized Hero images
- Blocking JavaScript
- Multiple priority resources
- Layout-shifting content
- Unoptimized fonts
- Large synchronous tasks
- Heavy initial bundles
- Excessive third-party scripts

---

# Success Criteria

Core Web Vitals are considered successful when:

- The Hero appears quickly.
- User interactions feel immediate.
- Layouts remain stable.
- Animations remain smooth.
- Mobile users experience excellent responsiveness.
- Lighthouse scores consistently meet project targets.

---

# Guiding Question

Before introducing any new feature, ask:

> **Will this improve the visitor's experience without negatively affecting Core Web Vitals?**

If the answer is **No**, redesign or optimize the feature before implementation.

---

# Related Documents

- PERFORMANCE_BUDGET.md
- IMAGE_OPTIMIZATION.md
- LOADING_STRATEGY.md
- ANIMATION_PERFORMANCE.md
- THREEJS_GUIDE.md
- TECHNOLOGY_STACK.md
- TESTING.md
- DEPLOYMENT.md
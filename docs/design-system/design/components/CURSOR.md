# Cursor Component

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Design Component  
> **Component:** Cursor

---

# Purpose

The Cursor enhances interaction throughout the Photographer Business Website by providing subtle visual feedback that reinforces the premium and cinematic experience.

Rather than acting as a decorative element, the cursor should help visitors understand what is interactive while strengthening the overall brand identity.

The cursor should feel like an extension of the photographer's creative style.

---

# Design Philosophy

The Cursor should feel:

- Elegant
- Premium
- Minimal
- Responsive
- Intentional

It should never become more noticeable than the photography.

---

# Design Principles

The Cursor should:

- Improve usability
- Guide interaction
- Feel lightweight
- Support storytelling
- Blend naturally with the interface

Every movement should have a purpose.

---

# Component Role

The Cursor is responsible for:

- Interaction feedback
- Hover indication
- Navigation guidance
- Image exploration
- Premium micro-interactions

It should never distract from the content.

---

# Cursor Structure

The cursor consists of two elements.

```text
Outer Cursor

↓

Inner Cursor
```

The inner cursor tracks precisely.

The outer cursor follows with slight smoothing to create a premium feel.

---

# Default State

When idle:

- Small size
- Neutral color
- Smooth movement
- High responsiveness

The default cursor should remain unobtrusive.

---

# Hover States

The cursor should adapt depending on the element.

Examples

Navigation

- Slight enlargement

Buttons

- Soft scale
- Stronger contrast

Portfolio Images

- Expand slightly
- Display subtle interaction feedback

Gallery Images

- Indicate view action

Interactive Cards

- Gentle highlight

Hover states should clearly communicate interactivity.

---

# Image Hover

When hovering photography:

Possible behaviors

- Slight enlargement
- Soft border
- "View" indicator
- Cursor expansion

Photography should remain the primary focus.

---

# Navigation Hover

Navigation interactions should feel precise.

Examples

- Smooth scale
- Opacity adjustment
- Gentle transition

Avoid flashy effects.

---

# Button Hover

Buttons may trigger:

- Cursor expansion
- Soft magnetic movement
- Slight opacity change

Interaction should feel tactile.

---

# Text Hover

While hovering text:

- Maintain simple cursor
- Avoid excessive animation

Reading should never be interrupted.

---

# Scroll Feedback

Optional enhancements

- Slight cursor compression
- Directional response
- Motion smoothing

Scroll behavior should remain subtle.

---

# Motion Guidelines

Allowed animations

- Scale
- Opacity
- Position interpolation
- Soft transitions

Avoid

- Bounce
- Spin
- Flashing
- Rapid scaling
- Random movement

The cursor should feel calm and controlled.

---

# Speed

Cursor movement should be:

- Responsive
- Smooth
- Slightly eased

Never introduce noticeable delay.

---

# Magnetic Interaction

Optional.

Interactive elements may attract the cursor slightly.

Examples

- Buttons
- Portfolio cards
- Gallery items

Magnetic movement should remain minimal.

---

# Blend Modes

If blend modes are used:

- Ensure readability
- Preserve image quality
- Maintain accessibility

Use only when they improve the visual experience.

---

# Visibility

Hide the custom cursor when:

- Touch devices
- Small screens
- Accessibility settings require it

Fallback to the system cursor when appropriate.

---

# Accessibility

Respect accessibility preferences.

Requirements

- Reduced motion support
- Keyboard accessibility
- System cursor fallback
- No essential information conveyed solely through the cursor

The interface should remain fully usable without the custom cursor.

---

# Responsive Behavior

Desktop

- Full cursor experience

Tablet

- Optional simplified version

Mobile

- Disabled

Touch interactions replace cursor interactions.

---

# Performance

Cursor animations should remain lightweight.

Requirements

- GPU-friendly transforms
- Minimal DOM updates
- Efficient event handling
- Stable frame rate

Cursor performance should never affect scrolling.

---

# Layering

Recommended hierarchy

```text
Content

↓

Cursor
```

The cursor should always remain visible without obscuring important information.

---

# Usage Guidelines

Use the Cursor to:

- Indicate interaction
- Enhance premium feel
- Guide exploration
- Support navigation

Avoid using it as a decorative animation.

---

# Do

- Keep interactions subtle
- Maintain smooth movement
- Support usability
- Optimize performance
- Preserve accessibility

---

# Don't

- Add unnecessary effects
- Use distracting animations
- Hide the system cursor without a replacement
- Delay interaction feedback
- Compete with photography

---

# Checklist

Before implementation verify:

- Smooth movement
- Hover feedback
- Button interaction
- Image interaction
- Responsive behavior
- Accessibility support
- Stable performance
- System cursor fallback

---

# Success Criteria

The Cursor is successful when:

- Interaction feels premium.
- Hover states are intuitive.
- Movement remains smooth.
- Photography remains the visual focus.
- Users barely notice the cursor—but immediately feel the improved experience.

---

# Guiding Question

Before adding a new cursor interaction, ask:

> **Does this interaction improve usability and reinforce the premium cinematic experience without distracting from the photography?**

If the answer is **No**, remove or simplify the interaction.

---

# Related Documents

- BUTTON.md
- CARD.md
- GALLERY.md
- PORTFOLIO.md
- HERO_SECTION.md
- CAMERA.md
- MOTION_GUIDELINES.md
- USER_EXPERIENCE.md
- DESIGN_PRINCIPLES.md
- VISUAL_LANGUAGE.md
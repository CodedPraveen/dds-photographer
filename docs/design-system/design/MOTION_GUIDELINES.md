# Motion Guidelines

> **Document Version:** 1.0
> **Status:** Active
> **Category:** Design System
> **Last Updated:** YYYY-MM-DD

---

# Purpose

This document defines how motion behaves throughout the Photographer Business Website.

Motion is not decoration.

Motion is a communication tool that guides attention, tells stories, improves usability, and creates a memorable experience.

Every animation must follow these guidelines to ensure consistency across the product.

---

# Motion Philosophy

The website should never feel animated.

It should feel alive.

Motion should feel:

- Natural
- Calm
- Intentional
- Elegant
- Cinematic
- Premium

The user should notice the experience, not the animation itself.

---

# Motion Goals

Motion should:

- Guide the user's attention
- Explain relationships between elements
- Create visual continuity
- Support storytelling
- Improve interaction feedback
- Build emotional connection

Motion should never exist simply to impress.

---

# Core Principles

## 1. Motion Has Purpose

Every animation must answer at least one question.

- What is changing?
- Why is it changing?
- What should the user notice?

If no purpose exists, the animation should not be implemented.

---

## 2. Story Before Animation

The website tells one continuous story.

Motion connects sections together.

Users should feel they are moving through one experience instead of navigating independent pages.

---

## 3. Smooth Over Fast

Motion should feel controlled.

Avoid sudden movements.

Preferred characteristics:

- Smooth acceleration
- Smooth deceleration
- Gentle transitions
- Natural movement

---

## 4. Less Is More

The strongest animation is often the one users barely notice.

Avoid excessive movement.

Let photography remain the visual focus.

---

## 5. Motion Supports Photography

Motion should highlight photographs.

It should never compete with them.

Photography always remains the hero.

---

# Motion Characteristics

The visual feeling should be:

- Slow
- Soft
- Confident
- Elegant
- Lightweight
- Continuous

Avoid energetic or playful motion.

---

# Camera Philosophy

The camera is not a decoration.

The camera represents the storyteller.

It introduces the journey.

It guides visitors through the experience.

It remains part of the website instead of disappearing after the Hero section.

---

# Camera Behavior

The camera may:

- Enter
- Rotate slightly
- Float gently
- React to scrolling
- Become secondary
- Return to focus
- End the experience

The camera should never behave randomly.

Every movement must feel intentional.

---

# Scroll Experience

Scrolling should feel like progressing through a story.

Never create abrupt scene changes.

Transitions should feel continuous.

Visitors should always understand where they are.

---

# Section Transitions

Transitions should connect sections naturally.

Examples:

Hero

↓

About

↓

Portfolio

↓

Services

↓

Testimonials

↓

Footer

Every transition should prepare the user for the next section.

---

# Reveal Animations

Content should appear naturally.

Preferred:

- Fade
- Slide
- Scale
- Image Reveal
- Mask Reveal

Avoid:

- Bounce
- Shake
- Flash
- Spin
- Random rotation

---

# Scroll Animations

Scroll animations should:

- Reveal information
- Build curiosity
- Maintain flow

Avoid making users wait for long animations before accessing content.

---

# Hover Animations

Hover effects should communicate interactivity.

Good hover effects:

- Slight elevation
- Gentle scaling
- Opacity changes
- Cursor feedback

Avoid dramatic hover animations.

---

# Loading Experience

Loading should feel premium.

Instead of showing technical loading indicators whenever possible:

Prefer:

- Skeletons
- Progressive image loading
- Soft fade-in
- Blur placeholders

Avoid distracting loading animations.

---

# Timing

Motion should remain consistent.

Recommended timing philosophy:

| Type | Feel |
|------|------|
| Hover | Fast |
| Button | Fast |
| Reveal | Medium |
| Camera | Slow |
| Section Transition | Slow |
| Hero Sequence | Cinematic |

Exact durations will be defined during implementation.

---

# Easing

Animations should feel natural.

Preferred easing:

- Ease Out
- Ease In Out
- Smooth Curves

Avoid:

- Linear motion
- Abrupt stopping
- Robotic movement

---

# Staggering

Groups of elements should appear progressively.

Examples:

- Portfolio Grid
- Gallery Images
- Service Cards
- Testimonials

The delay should feel subtle rather than obvious.

---

# Parallax

Parallax should be minimal.

Purpose:

- Add depth
- Improve immersion

Avoid excessive movement that distracts from content.

---

# Camera Motion Rules

Allowed:

- Small rotation
- Small position shifts
- Smooth scaling
- Gentle floating

Avoid:

- Continuous spinning
- Fast movement
- Large rotations
- Sudden direction changes

---

# Scroll Speed

Animations should never slow down scrolling.

Scrolling remains under the user's control.

Motion follows the user.

Motion never blocks the user.

---

# Animation Priority

Priority order:

1. Photography
2. Content
3. Motion
4. Decoration

If motion reduces readability or usability, remove it.

---

# Performance

Motion must remain lightweight.

Requirements:

- GPU-friendly transforms
- Minimal layout shifts
- Avoid unnecessary repainting
- Avoid expensive filters
- Lazy initialize complex animations

Performance is more important than visual effects.

---

# Accessibility

Motion must respect user preferences.

Support:

- prefers-reduced-motion
- Keyboard users
- Screen readers
- Reduced animation mode

If users disable animations, the website must remain fully functional.

---

# Mobile Motion

Mobile animations should remain lighter than desktop.

Reasons:

- Battery
- Performance
- Smaller screens
- Touch interaction

Simplify motion where appropriate.

---

# Animation Consistency

The same interaction should always behave the same way.

Examples:

Buttons

↓

Same hover

Cards

↓

Same reveal

Images

↓

Same loading

Navigation

↓

Same transition

Consistency builds familiarity.

---

# Things We Avoid

The project intentionally avoids:

- Bounce effects
- Flashing animations
- Random floating elements
- Infinite unnecessary animations
- Large rotations
- Excessive scaling
- Rapid movement
- Long blocking animations
- Motion without purpose

---

# Motion Checklist

Before implementing any animation, verify:

- Does it have a purpose?
- Does it improve usability?
- Does it support storytelling?
- Does it guide attention?
- Is it smooth?
- Is it accessible?
- Is it performant?
- Is it consistent?

If any answer is **No**, redesign the animation.

---

# Success Criteria

Motion is successful when users:

- Feel guided naturally.
- Never feel distracted.
- Experience smooth transitions.
- Focus on the photography.
- Remember the journey instead of individual animations.

---

# Guiding Question

Before adding motion, ask:

> Does this movement help the user understand, feel, or experience something better?

If not, it should not exist.

---

# Related Documents

- DESIGN_PRINCIPLES.md
- VISUAL_LANGUAGE.md
- CONTENT_DIRECTION.md
- USER_EXPERIENCE.md
- OVERALL_LOOK.md
- HERO.md
- CAMERA.md
- PORTFOLIO.md
# Card Component

> **Document Version:** 1.0  
> **Status:** Active  
> **Category:** Design Component  
> **Component:** Card

---

# Purpose

Cards are used to present related information in a clean, structured, and visually balanced way throughout the Photographer Business Website.

They group content without distracting from the photography and help create a premium browsing experience.

Cards should organize information—not become the focus.

---

# Design Philosophy

Cards should feel:

- Premium
- Elegant
- Minimal
- Spacious
- Purposeful

Photography should always remain the dominant visual element.

---

# Design Principles

Cards should:

- Create clear content hierarchy
- Improve readability
- Maintain generous spacing
- Blend naturally with the layout
- Support the overall visual language

Every card should feel intentional.

---

# Visual Style

Characteristics

- Clean layout
- Soft corners
- Minimal borders
- Subtle depth
- Balanced spacing

Avoid heavy decoration.

---

# Card Types

## Portfolio Card

Purpose

Display featured photography.

Examples

- Wedding
- Portrait
- Fashion
- Landscape

Characteristics

- Large image
- Minimal text
- Strong visual emphasis

---

## Information Card

Purpose

Present supporting information.

Examples

- Services
- Experience
- Process
- About

Characteristics

- Balanced layout
- Text-first
- Simple structure

---

## Feature Card

Purpose

Highlight important features.

Examples

- Premium Editing
- Fast Delivery
- Creative Direction

Characteristics

- Icon
- Heading
- Description

---

## Gallery Card

Purpose

Represent a photo collection.

Characteristics

- Image dominant
- Hover interaction
- Simple metadata

---

## Statistics Card

Purpose

Display achievements.

Examples

- Projects
- Clients
- Years of Experience

Characteristics

- Large number
- Small description
- Strong typography

---

# Layout

Cards should follow a predictable structure.

```text
Image

↓

Title

↓

Description

↓

Optional Action
```

Every card should maintain consistent spacing.

---

# Spacing

Maintain generous spacing.

Internal

- Comfortable padding
- Balanced whitespace

External

- Consistent grid spacing
- Equal alignment

Avoid crowded layouts.

---

# Typography

Use the project's typography system.

Hierarchy

- Title
- Supporting text
- Metadata

Typography should remain readable and elegant.

---

# Colors

Cards should inherit colors from the design system.

Recommended

- Neutral backgrounds
- High contrast text
- Subtle borders

Avoid introducing new colors.

---

# Border Radius

Cards should use the global radius token.

Appearance

- Soft corners
- Consistent curvature

Avoid inconsistent corner styles.

---

# Shadows

Use subtle elevation only.

Preferred

- Soft shadow
- Minimal depth

Avoid

- Heavy shadows
- Multiple shadow layers
- Glow effects

---

# Images

Images are the primary content.

Requirements

- High quality
- Responsive
- Proper aspect ratio
- Optimized loading

Images should never appear stretched.

---

# Hover State

Hover should communicate interactivity.

Examples

- Slight lift
- Shadow adjustment
- Image scale
- Border transition

Hover effects should remain subtle.

---

# Active State

When selected:

- Clear visual feedback
- Immediate response
- Consistent transition

Avoid dramatic animations.

---

# Focus State

Interactive cards must provide:

- Visible focus outline
- Keyboard accessibility
- Clear navigation

Focus should never be removed.

---

# Loading State

Loading cards should:

- Preserve layout
- Use skeleton placeholders
- Avoid layout shifts

Loading should feel seamless.

---

# Motion Guidelines

Allowed animations

- Fade
- Opacity
- Scale (very subtle)
- Translate Y
- Image reveal

Avoid

- Bounce
- Spin
- Flashing
- Rotation
- Oversized scaling

Motion should feel cinematic.

---

# Responsive Behavior

Cards should adapt across devices.

Mobile

- Single-column layout
- Comfortable spacing

Tablet

- Two-column grid where appropriate

Desktop

- Flexible multi-column layout

Maintain visual balance across all breakpoints.

---

# Accessibility

Cards must:

- Maintain readable contrast
- Support keyboard interaction
- Include descriptive image alt text
- Preserve logical reading order

Interactive cards should be fully accessible.

---

# Usage Guidelines

Use cards for:

- Portfolio previews
- Featured projects
- Services
- Gallery collections
- Photographer information
- Statistics

Avoid using cards for simple text blocks.

---

# Do

- Keep layouts consistent
- Prioritize imagery
- Maintain spacing
- Use subtle interactions
- Follow the design system

---

# Don't

- Overcrowd content
- Use excessive shadows
- Add unnecessary decorations
- Mix multiple card styles
- Distract from photography

---

# Checklist

Before implementation verify:

- Correct spacing
- Consistent typography
- Responsive layout
- Optimized images
- Hover state
- Focus state
- Loading state
- Accessibility compliance

---

# Success Criteria

The card system is successful when:

- Content is easy to scan.
- Photography remains the primary focus.
- Layouts feel balanced.
- Cards remain visually consistent.
- Interactions feel smooth and premium.

---

# Guiding Question

Before creating a new card, ask:

> **Does this card improve content organization while preserving the premium, minimal aesthetic of the website?**

If the answer is **No**, simplify the design.

---

# Related Documents

- DESIGN_PRINCIPLES.md
- VISUAL_LANGUAGE.md
- USER_EXPERIENCE.md
- MOTION_GUIDELINES.md
- PORTFOLIO.md
- GALLERY.md
- BUTTON.md
- SECTION.md
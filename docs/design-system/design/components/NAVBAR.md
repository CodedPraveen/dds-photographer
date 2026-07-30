# Pebble-Inspired Navbar Design

The navigation bar follows a **Pebble-inspired floating glass design**, emphasizing simplicity, elegance, and minimal distraction. It should complement the cinematic hero section rather than compete with it.

The navbar always feels lightweight, premium, and modern, allowing the interactive 3D camera to remain the primary focus.

---

## Desktop Layout

```text
                    LOGO

          ╭──────────────────────────────╮
          │ Home Portfolio About Contact │
          ╰──────────────────────────────╯
```

The navigation is centered horizontally inside a floating pill-shaped container.

The logo remains simple and clean, while the navigation items are evenly spaced for visual balance.

---

## Initial State (Hero Section)

When the page first loads:

- Transparent glass background
- Soft backdrop blur
- Thin semi-transparent white border
- Rounded pill shape (9999px radius)
- White navigation text
- Floating approximately 24–32px from the top
- No heavy shadows

The navigation almost disappears into the hero, creating a clean and immersive first impression.

---

## Scroll State

Once the visitor scrolls beyond the hero section, the navbar subtly adapts.

Changes include:

- Slightly darker glass background
- Increased backdrop blur
- Reduced vertical padding
- Soft shadow for better separation
- Smooth transition (250–300ms)

The navigation becomes easier to read without feeling heavy or intrusive.

---

## Navigation Items

Navigation links remain clean and minimal.

```text
Home   Portfolio   About   Contact
```

Each item has generous horizontal spacing to maintain an uncluttered appearance.

Typography should use a modern sans-serif font with medium weight.

---

## Hover Interaction

Hover effects should remain subtle.

On hover:

- Text brightness increases slightly
- Thin underline grows smoothly from the center
- Cursor changes to pointer
- No large scaling or bouncing animations

The interaction should feel refined rather than attention-grabbing.

---

## Active Navigation

The currently active section is indicated with a minimal visual cue.

Example:

```text
Home

──────
```

or

```text
Home ●
```

Avoid thick borders or filled backgrounds.

The active state should blend naturally with the minimalist design.

---

## Glass Styling

The glass effect should feel premium and lightweight.

Suggested appearance:

- Background opacity: 10–18%
- Backdrop blur: 16–24px
- Thin white border with low opacity
- Soft shadow with very low intensity

The goal is to create depth without overpowering the page content.

---

## Responsive Behavior

### Tablet

The floating pill becomes slightly narrower while maintaining the same visual style.

Navigation spacing decreases proportionally.

---

### Mobile

Replace the navigation links with a menu button.

```text
LOGO                         ☰
```

When opened, a full-screen overlay menu appears with a smooth fade and slide animation.

```text
────────────────────────

              ✕

Home

Portfolio

About

Contact

────────────────────────
```

The overlay uses a dark translucent background with generous spacing and large typography for comfortable touch interaction.

---

## Animation

The navbar should animate smoothly throughout the experience.

Transitions include:

- Fade on initial page load
- Smooth blur changes while scrolling
- Soft hover transitions
- Gentle entrance and exit for the mobile menu

Every animation should feel calm, polished, and consistent with the cinematic storytelling of the website.

---

## Design Principles

- Minimal and distraction-free
- Floating glass aesthetic
- Premium editorial appearance
- Smooth micro-interactions
- Excellent readability
- Responsive across all devices
- Supports the hero section without competing for attention

The Pebble-inspired navbar should feel like a natural extension of the website's storytelling—quiet, elegant, and always allowing the photography to remain the center of attention.
# Portfolio Section — Design & Interaction Specification

## 1. Purpose

The Portfolio section is the main visual showcase of the photographer business website.

It must feel like a premium, editorial photography wall inspired by the **visual discipline of Pinterest masonry**, but it must **not copy Pinterest's UI or interaction design**.

The section should communicate:

- High-quality photography
- Variety of professional work
- Premium visual presentation
- A strong photography-business identity
- A smooth cinematic scrolling experience

The portfolio is not a personal photographer profile. It represents the **photography business/studio and its client work**.

---

## 2. Core Experience

The portfolio follows this sequence:

```text
PORTFOLIO START
       │
       ↓
MASONRY GALLERY
       │
       ↓
USER SCROLLS
       │
       ↓
IMAGES REVEAL FROM BOTTOM → TOP
       │
       ↓
MORE ROWS / LINES APPEAR
       │
       ↓
PORTFOLIO CONTENT COMPLETES
       │
       ↓
PORTFOLIO SLIDES LEFT
       │
       └──────────────→ FOOTER ENTERS FROM RIGHT
```

The user should feel that they are exploring a continuously revealed photography collection, not scrolling through a conventional card grid.

---

## 3. Masonry Layout

### 3.1 Pinterest-inspired visual discipline

Use a disciplined masonry layout similar to Pinterest's image arrangement:

```text
┌────────┐       ┌───────────┐
│        │       │           │
│ Photo  │       │   Photo   │
│        │       │           │
└────────┘       │           │
                 └───────────┘


┌──────────┐       ┌───────┐
│          │       │       │
│  Photo   │       │ Photo │
│          │       │       │
└──────────┘       └───────┘
```

The important rule is **line/column discipline**.

Images should form visually organized columns and rows while still creating an organic masonry rhythm.

Do not randomly scatter images around the screen.

### 3.2 Image size

Image items do not need to have the same dimensions.

Supported visual ratios include:

- `1:1`
- `2:3`
- `16:9`
- Other source aspect ratios may be preserved when appropriate.

The layout must accommodate portrait, square, and landscape photography naturally.

### 3.3 Spacing

Maintain consistent:

- Column gaps
- Row gaps
- Section padding
- Image corner treatment
- Alignment rules

The masonry layout should look intentional and premium.

---

## 4. Media Types

Portfolio items must support:

- Images
- Videos

Videos should behave as first-class portfolio media, not as a separate unrelated section.

A video item can occupy the same masonry positions as an image.

Video behavior should remain subtle and premium:

- Autoplay only when appropriate and technically safe
- Muted by default if autoplay is used
- Loop where appropriate
- Avoid intrusive controls inside the main masonry presentation unless required
- Respect reduced-motion preferences

---

## 5. Admin-Controlled Portfolio Content

Portfolio media must **not be hard-coded inside the frontend**.

Do not hard-code:

- Image URLs
- Video URLs
- Image filenames
- Portfolio item count
- Portfolio ordering
- Portfolio content

The portfolio content must come from the application's admin-managed data.

### Admin must be able to:

1. Add a portfolio item.
2. Select/upload an image or video.
3. Set the media type.
4. Change the display/order position.
5. Enable/disable an item.
6. Control how many portfolio items are displayed.
7. Replace/update portfolio media without changing frontend code.
8. Remove portfolio items.

The frontend should automatically render the currently active portfolio items from the data source.

### Quantity

The number of visible portfolio items must be configurable by the admin.

Example:

```text
Admin selects:
Portfolio items to display = 12

Frontend:
Render 12 active items.
```

If the admin changes it to:

```text
Portfolio items to display = 20
```

the frontend should render 20 active items without code changes.

The implementation must not depend on a fixed number such as 8, 12, or 16.

---

## 6. Image Reveal Animation

The portfolio should reveal content progressively during scrolling.

### Direction

Images enter from **bottom → top**.

```text
       ┌──────────┐
       │  Photo   │
       └──────────┘
            ↑
            │
            │
       appears here
            │
            │
       ────────────
```

The reveal should feel like the next line of photographs is coming upward into the viewport.

### Important

Do not make every individual image randomly fly into the screen.

The animation should work in **organized lines/rows**.

Example:

```text
Line 1
┌──────┐   ┌────────┐   ┌──────┐
│      │   │        │   │      │
└──────┘   └────────┘   └──────┘


Line 2 enters from bottom
┌────────┐   ┌──────┐   ┌────────┐
│        │   │      │   │        │
└────────┘   └──────┘   └────────┘
       ↑
       ↑
       ↑
```

As the user scrolls:

- Existing line moves upward naturally.
- The next line reveals from below.
- More lines follow.
- The movement remains continuous.

---

## 7. Animation Quality

The animation must feel:

- Smooth
- Fast enough to feel responsive
- Cinematic
- Controlled
- Premium
- Natural

### Do NOT use

- Slow-motion feeling
- Excessive easing
- Bounce
- Elastic effects
- Random rotations
- Random directions
- Large unnecessary scaling
- Excessive blur
- Flashy effects

The user should feel that the gallery is moving naturally with their scroll.

### Transition timing

The portfolio reveal should have a **responsive scroll-linked feel**, not a slow standalone animation.

The user must remain in control through scrolling.

---

## 8. Portfolio Completion

Once all configured portfolio items have been revealed, the portfolio section reaches its completed state.

Do not immediately jump to the footer.

Instead, trigger the portfolio exit transition.

```text
PORTFOLIO COMPLETE
       │
       ↓
PORTFOLIO MOVES LEFT
       │
       └──────────────→
                         FOOTER ENTERS FROM RIGHT
```

---

## 9. Portfolio → Footer Transition

This is a major transition and must feel intentional.

### Direction

Portfolio:

```text
← exits to the left
```

Footer:

```text
→ enters from the right
```

Conceptually:

```text
┌──────────────────┐
│                  │
│    PORTFOLIO     │  → → →
│                  │
└──────────────────┘

                         ┌──────────────┐
                         │              │
                         │    FOOTER    │
                         │              │
                         └──────────────┘
```

During the transition:

```text
┌──────────────────┐   ┌──────────────────┐
│    PORTFOLIO     │ → │      FOOTER      │
│                  │   │                  │
└──────────────────┘   └──────────────────┘
```

Final state:

```text
┌─────────────────────────────────────────┐
│                                         │
│                  FOOTER                 │
│                                         │
└─────────────────────────────────────────┘
```

### Transition characteristics

The transition must be:

- Smooth
- Clean
- Relatively quick
- Responsive to scroll
- Directionally obvious
- Premium

**Do not use a slow-motion cinematic slide.**

It should feel like one section naturally replaces another.

---

## 10. Footer Context

The footer is a simple business footer.

It should not become another large content section.

The footer can contain:

- Business logo
- Phone number
- WhatsApp
- Instagram
- Address
- Basic navigation
- Copyright

No booking system is required.

No booking form is required.

No pricing section is required.

No testimonial section is required.

No FAQ is required.

No customer journey section is required.

---

## 11. Responsive Behavior

The masonry system must adapt to viewport size.

### Desktop

Use multiple disciplined columns.

Example:

```text
┌──────┐  ┌────────┐  ┌──────┐  ┌────────┐
│      │  │        │  │      │  │        │
│      │  │        │  │      │  │        │
└──────┘  └────────┘  └──────┘  └────────┘
```

### Tablet

Reduce the number of columns while preserving masonry rhythm.

### Mobile

Use fewer columns, typically 1–2 depending on the final visual design.

Do not simply shrink the desktop layout.

The mobile layout must be deliberately composed.

The bottom-to-top reveal behavior must remain understandable on mobile.

The portfolio-to-footer transition must remain smooth on touch devices.

---

## 12. Data Architecture Requirements

The design must remain compatible with an admin-driven portfolio system.

Recommended conceptual portfolio item data:

```text
PortfolioItem
├── id
├── title
├── mediaType       // IMAGE | VIDEO
├── mediaUrl
├── thumbnailUrl    // optional for video
├── altText
├── sortOrder
├── isActive
└── createdAt
```

The exact database/schema implementation should follow the project's existing architecture and conventions.

Do not introduce a duplicate portfolio data system if an existing content/media architecture already exists.

---

## 13. Frontend Rules

The frontend must:

- Fetch portfolio items from the application data source.
- Render only active items.
- Respect admin ordering.
- Respect admin-controlled quantity.
- Support image and video items.
- Preserve appropriate aspect ratios.
- Use optimized media loading.
- Avoid hard-coded media URLs.
- Avoid hard-coded portfolio item counts.
- Keep animation logic independent from media content.

Adding or removing portfolio items from admin must not require frontend code changes.

---

## 14. Accessibility & Performance

Images must have meaningful alt text where appropriate.

Decorative media should not create unnecessary accessibility noise.

Videos should not create unexpected sound.

Respect:

```text
prefers-reduced-motion
```

When reduced motion is enabled:

- Keep the masonry layout.
- Reduce/remove large movement.
- Use simple opacity or minimal positional transitions.
- Do not break the portfolio experience.

Lazy-load media where appropriate.

Avoid loading the entire portfolio's full-resolution media immediately.

Use responsive image sizes.

Do not allow animations to cause horizontal page overflow.

---

## 15. Design Principle

The portfolio should feel like:

> A carefully curated photography wall that reveals itself as the visitor scrolls.

It should NOT feel like:

- A normal image grid
- A social media feed
- A Pinterest clone
- A random floating-image animation
- A slow slideshow
- A personal photographer resume

The final experience should communicate:

**Premium photography business + disciplined masonry + cinematic scroll interaction.**

---

## 16. Final Interaction Summary

```text
PORTFOLIO START
       │
       ↓
DISCIPLINED MASONRY WALL
       │
       ↓
USER SCROLLS
       │
       ↓
NEXT LINE ENTERS FROM BOTTOM
       │
       ↓
MORE PHOTOS
       │
       ↓
MORE LINES
       │
       ↓
ALL ADMIN-CONFIGURED ITEMS SHOWN
       │
       ↓
PORTFOLIO COMPLETE
       │
       ↓
PORTFOLIO EXITS LEFT  ← ← ←
       │
       │
       └──────────────→ FOOTER ENTERS RIGHT
                              │
                              ↓
                           FOOTER
```

This interaction is part of the approved visual direction for the Portfolio section.

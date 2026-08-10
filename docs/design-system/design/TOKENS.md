# Foundation Design Tokens

> **Status:** Active
>
> **Phase:** Phase 1A — Foundation
>
> **Implementation:** `src/styles/tokens.css`

## Purpose

These tokens are the single foundation for DDS Photographer styling. Future
phases must reuse them instead of introducing section-specific palettes,
spacing scales, breakpoints, or motion timings.

## Colors

| Token              | Value     |
| ------------------ | --------- |
| Background         | `#F7F6F2` |
| Foreground         | `#171717` |
| Muted              | `#6B6B6B` |
| Surface            | `#FFFFFF` |
| Border             | `#E5E2DC` |
| Inverse background | `#171717` |
| Inverse foreground | `#F7F6F2` |
| Focus              | `#171717` |
| Error              | `#B42318` |
| Success            | `#027A48` |
| Warning            | `#B54708` |

No accent color or gradient is part of the Phase 1A system.

## Typography

The only approved font family is Manrope. The application loads weights `400`,
`500`, `600`, and `700` through `next/font`; semibold typography uses `600`.

| Role    | Size                       | Line height |
| ------- | -------------------------- | ----------- |
| Display | `clamp(48px, 7vw, 112px)`  | `0.95`      |
| H1      | `clamp(40px, 6vw, 80px)`   | `1`         |
| H2      | `clamp(32px, 4.5vw, 64px)` | `1.05`      |
| H3      | `clamp(24px, 3vw, 40px)`   | `1.1`       |
| Body    | `16px`                     | `1.5`       |
| Small   | `14px`                     | `1.5`       |
| Caption | `12px`                     | `1.4`       |

Heading letter spacing is restrained at `-0.02em`.

## Spacing

The spacing scale uses a 4px base:

```text
4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128, 160px
```

## Responsive Foundation

Breakpoints:

```text
640, 768, 1024, 1280, 1536px
```

The page container has a `1440px` maximum width. Horizontal padding is `20px`
on mobile, `32px` from tablet, `40px` from desktop, and `48px` on large
desktop.

## Radius and Shadows

Radius scale:

```text
0, 2, 4, 8, 12, 9999px
```

Shadow scale:

```text
none
0 1px 2px rgb(0 0 0 / 0.06)
0 8px 30px rgb(0 0 0 / 0.08)
```

## Layering

| Layer   | Value |
| ------- | ----- |
| Base    | `0`   |
| Content | `10`  |
| Sticky  | `20`  |
| Overlay | `40`  |
| Modal   | `50`  |
| Toast   | `60`  |

## Motion

| Token  | Value   |
| ------ | ------- |
| Fast   | `150ms` |
| Normal | `300ms` |
| Slow   | `500ms` |

Approved easing values are `ease-out` and `ease-in-out`. Phase 1A defines
motion tokens and reduced-motion behavior only; it implements no animations.

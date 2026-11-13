# DDS Films --- Website Color System

> **Status:** Proposed website color guide\
> **Brand reference:** Client-provided DDS Films logo\
> **Purpose:** Define the website color palette and exactly where each
> color belongs.

This guide is for the **website UI**, not for changing or recoloring the
client's logo. The brown wooden surface visible behind the supplied logo
is part of that logo photograph/presentation and is **not** a website
brand color.

------------------------------------------------------------------------

## 1. Design direction

The DDS Films website uses a **premium cinematic black-and-gold
identity**.

-   Black and charcoal form the main interface foundation.
-   Photography provides most of the visual richness and color.
-   Gold is the primary brand accent and the main call-to-action color.
-   Red and emerald are supporting logo accents only. Use them
    sparingly.
-   White and muted gray provide readable typography and interface
    contrast.

**Do not use walnut brown (`#3B2921`) as a website background color.**
It is intentionally excluded from the website palette.

## 2. Approved color tokens

  --------------------------------------------------------------------------------
  Token                      Hex               Role              Priority
  -------------------------- ----------------- ----------------- -----------------
  `--color-bg`               `#090909`         Main page         Primary
                                               background        

  `--color-surface`          `#171717`         Cards, panels,    Secondary
                                               alternate dark    
                                               sections          

  `--color-surface-raised`   `#222222`         Hovered/raised    Supporting
                                               cards, menus,     
                                               popovers          

  `--color-gold`             `#E5A900`         Main brand        Primary accent
                                               accent, primary   
                                               buttons, active   
                                               states            

  `--color-gold-hover`       `#F2BC24`         Hover/focus       Interaction
                                               accent for gold   
                                               controls          

  `--color-red`              `#D71932`         Rare              Limited
                                               logo-inspired     
                                               accent            

  `--color-emerald`          `#078C75`         Rare              Limited
                                               logo-inspired     
                                               accent            

  `--color-text`             `#F5F5F5`         Main text on dark Primary text
                                               surfaces          

  `--color-text-muted`       `#B8B8B8`         Supporting text   Secondary text
                                               and descriptions  

  `--color-text-subtle`      `#858585`         Metadata and      Tertiary text
                                               low-priority      
                                               labels            

  `--color-border`           `#303030`         Dividers, subtle  Structure
                                               borders           

  `--color-white`            `#FFFFFF`         High-contrast     Utility
                                               text or clean     
                                               light surfaces    
  --------------------------------------------------------------------------------

### Color swatches

-   **Main background:** `#090909` --- near-black, not pure black.
-   **Dark surface:** `#171717` --- separates cards and sections from
    the page.
-   **Raised surface:** `#222222` --- use only when another layer needs
    distinction.
-   **Gold:** `#E5A900` --- warm, confident accent.
-   **Red:** `#D71932` --- use only for rare emphasis or brand details.
-   **Emerald:** `#078C75` --- use only for rare emphasis or brand
    details.
-   **Main text:** `#F5F5F5` --- softer than pure white.
-   **Muted text:** `#B8B8B8` --- readable supporting copy.

## 3. Where each color goes

### Global page and section backgrounds

  Website area           Background
  ---------------------- ----------------------------------------------------------
  Body / entire site     `#090909`
  Navbar                 `#090909` (transparent over hero is allowed)
  Hero                   `#090909`
  About                  `#090909` or `#171717` for a clear section change
  Portfolio              `#090909`
  Services               `#171717` for cards; section itself can remain `#090909`
  Testimonials           `#090909`
  Contact                `#090909`
  Footer                 `#090909`
  Dropdowns / overlays   `#171717` or `#222222`

Do not alternate every section between many colors. Keep the page
cohesive and use photography, spacing, and layout to create section
variety.

### Navigation

-   Header background: `#090909`, optionally transparent over the hero.
-   Logo: use the client's original logo asset without recoloring it.
-   Default nav text: `#F5F5F5`.
-   Muted nav text: `#B8B8B8`.
-   Hover and active nav state: `#E5A900`.
-   Header divider, if needed: `#303030`.
-   Primary booking button: gold background `#E5A900`, dark text
    `#090909`.

### Hero section

-   Background: `#090909`.
-   Main heading: `#F5F5F5`.
-   Highlight one short word or phrase in `#E5A900`.
-   Supporting copy: `#B8B8B8`.
-   Primary CTA: `#E5A900` background with `#090909` text.
-   Secondary CTA: transparent background, `#E5A900` border and text.
-   Camera and photography assets should retain their natural colors. Do
    not apply a gold tint to every image.

### About section

-   Background: `#090909` or one contained `#171717` panel.
-   Heading: `#F5F5F5`.
-   Small eyebrow label / decorative line: `#E5A900`.
-   Paragraph: `#B8B8B8`.
-   Statistics: numbers in `#E5A900`, labels in `#B8B8B8`.
-   Photographer imagery: natural color treatment.

### Portfolio section

-   Section background: `#090909`.
-   Heading: `#F5F5F5`.
-   Category filters: `#B8B8B8`.
-   Active filter: `#E5A900`.
-   Image cards: no colored overlay by default.
-   Image captions: `#F5F5F5`; supporting metadata: `#B8B8B8`.
-   Hover border or small indicator: `#E5A900`.
-   Use the photographs themselves as the main source of color.

### Services section

-   Section background: `#090909`.
-   Individual service cards: `#171717`.
-   Card hover: `#222222`.
-   Icons and small top accents: `#E5A900`.
-   Service title: `#F5F5F5`.
-   Service description: `#B8B8B8`.
-   Card borders: `#303030`, used subtly.

### Testimonials section

-   Background: `#090909`.
-   Quote text: `#F5F5F5`.
-   Client name: `#F5F5F5`.
-   Role / event type: `#B8B8B8`.
-   Small quote mark or active carousel indicator: `#E5A900`.
-   Client photographs remain natural.

### Contact section

-   Background: `#090909`.
-   Main heading: `#F5F5F5`.
-   Highlight or small label: `#E5A900`.
-   Supporting copy: `#B8B8B8`.
-   Contact icons: `#E5A900`.
-   Contact details: `#F5F5F5`.
-   Input background: `#171717`.
-   Input text: `#F5F5F5`.
-   Placeholder: `#858585`.
-   Input border: `#303030`.
-   Focus border: `#E5A900`.
-   Submit button: `#E5A900` background with `#090909` text.

### Footer

-   Background: `#090909`.
-   Main footer text: `#F5F5F5`.
-   Supporting text: `#B8B8B8`.
-   Links on hover: `#E5A900`.
-   Divider: `#303030`.
-   Shutter animation may use a brief gold highlight, but should not
    become a large gold-colored footer panel.

## 4. Accent color rules

### Gold --- primary accent

Use gold for: - Main CTA buttons. - Active navigation and portfolio
filters. - Small section labels and decorative rules. - Important
statistics. - Focus indicators and selected states. - Small camera/lens
animation highlights.

Avoid: - Large gold background sections. - Gold body text for long
paragraphs. - Gold overlays on all photography. - Using gold for every
icon and every border at once.

### Red --- limited accent

Use red for: - A rare logo-inspired detail. - A small notification or
special highlight when semantically appropriate. - A tiny decorative
moment in a brand animation.

Do not use red for: - Main CTA buttons. - Large section backgrounds. -
Default links or all headings. - Error states unless it is also being
used as a clear error color with accessible text.

### Emerald --- limited accent

Use emerald for: - A rare logo-inspired detail. - A small
success/confirmation state when appropriate. - A tiny decorative moment
in a brand animation.

Do not use emerald for: - Main CTA buttons. - Large section
backgrounds. - Default navigation or repeated card accents. - Any use
that makes the interface look like a green-themed website.

**Rule:** Gold leads. Red and emerald are occasional supporting accents,
not equal primary colors.

## 5. Suggested visual balance

Use this as a visual guideline, not a rigid pixel calculation:

  Color family                                 Approximate share
  -------------------------------------- -----------------------
  Black background `#090909`                             65--70%
  Dark surfaces `#171717` / `#222222`                     8--12%
  Photography and natural image colors                   15--20%
  Text and white details                                   5--8%
  Gold                                                     3--5%
  Red and emerald combined                 Under 1% in normal UI

The actual photographs may contain many colors. Do not desaturate or
recolor them just to match the UI palette.

## 6. Typography and accessibility

-   Use `#F5F5F5` for important text on dark backgrounds.
-   Use `#B8B8B8` for supporting paragraphs and descriptions.
-   Use `#858585` only for secondary metadata; do not use it for
    essential small text.
-   Use dark text (`#090909`) on gold buttons.
-   Never communicate active, error, success, or selected state by color
    alone. Add text, icons, or shape changes.
-   Keep keyboard focus clearly visible, using a gold outline or ring.
-   Check contrast for every final text/background pairing, especially
    small text and button labels.
-   Do not place long paragraphs in gold, red, or emerald.

## 7. CSS variables

Add these tokens to the project's existing global theme/token file. Do
not create a second competing token system if equivalent variables
already exist; merge these names and values into the existing source of
truth.

``` css
:root {
  /* Backgrounds */
  --color-bg: #090909;
  --color-surface: #171717;
  --color-surface-raised: #222222;

  /* Brand accents */
  --color-gold: #E5A900;
  --color-gold-hover: #F2BC24;
  --color-red: #D71932;
  --color-emerald: #078C75;

  /* Text */
  --color-text: #F5F5F5;
  --color-text-muted: #B8B8B8;
  --color-text-subtle: #858585;
  --color-white: #FFFFFF;

  /* Structure and interaction */
  --color-border: #303030;
  --color-focus: #E5A900;
}
```

Example usage:

``` css
body {
  background: var(--color-bg);
  color: var(--color-text);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.button-primary {
  color: var(--color-bg);
  background: var(--color-gold);
}

.button-primary:hover {
  background: var(--color-gold-hover);
}
```

## 8. Do not use these styles

-   Do not use `#3B2921` / walnut brown as the website's main or
    secondary background.
-   Do not use wood textures as a site-wide background.
-   Do not make red and emerald equal in importance to gold.
-   Do not use gradients or glassmorphism as part of this visual
    direction.
-   Do not put gold text on every section heading.
-   Do not add gold overlays to every photograph.
-   Do not recolor, distort, or rebuild the client's original logo as
    part of applying the website theme.
-   Do not replace existing design tokens blindly; inspect the current
    token file and update the source of truth carefully.

## 9. Implementation checklist

-   [ ] Confirm the original client logo asset is used unchanged.
-   [ ] Set the global page background to `#090909`.
-   [ ] Set cards and panels to `#171717`.
-   [ ] Use `#222222` only for raised/hovered surfaces.
-   [ ] Use `#E5A900` as the primary accent and CTA color.
-   [ ] Use `#F5F5F5` for primary text and `#B8B8B8` for supporting
    text.
-   [ ] Keep red and emerald rare.
-   [ ] Remove any unintended walnut-brown website backgrounds.
-   [ ] Check every section: Navbar, Hero, About, Portfolio, Services,
    Testimonials, Contact, Footer.
-   [ ] Check mobile, tablet, and desktop layouts.
-   [ ] Check hover, focus, active, disabled, error, and success states.
-   [ ] Verify text contrast and keyboard focus.
-   [ ] Preserve natural photography colors and existing motion
    architecture.

------------------------------------------------------------------------

**Final design rule:** The website is a black cinematic canvas.
Photography brings the emotion, gold brings the DDS Films identity, and
red/emerald appear only as subtle reminders of the original logo.

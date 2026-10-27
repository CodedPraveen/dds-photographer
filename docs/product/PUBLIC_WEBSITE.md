# Public Website — Product Specification

**Status:** Implemented foundation; content finalization remains  
**Last reconciled:** 2026-10-27

## 1. Purpose

The public website is the photographer's primary marketing presence. It should communicate the quality and style of the work, establish trust, explain services, and make contact easy.

The experience is premium, minimal, editorial, image-led, and cinematic. Photography remains the hero; written content supports clarity and trust.

## 2. Experience principles

- Luxury, minimal, cinematic, editorial presentation.
- Black, white, subtle warm-gold accent, and soft gray; avoid bright decorative colors and visual clutter.
- Large confident typography, generous negative space, short copy, and strong hierarchy.
- Photography should communicate more than text.
- Motion is purposeful, calm, smooth, and continuous; no bounce, random animation, or motion that blocks scrolling.
- The camera represents the storyteller and should remain part of the broader experience rather than being discarded after the hero.
- Mobile experience is first-class, not a reduced desktop layout.
- Respect keyboard navigation, screen readers, contrast, focus states, and `prefers-reduced-motion`.

## 3. Story and page structure

The intended public journey is a connected visual story:

1. **Hero** — camera-led first impression and primary photographic image.
2. **About** — introduce the photographer and approach in an editorial layout.
3. **Portfolio** — image-dominant presentation of selected work.
4. **Services** — concise explanation of photography services.
5. **Contact** — clear invitation and verified contact routes.
6. **Footer** — navigation and approved social/contact links.

The existing homepage includes Navbar, Hero, About, Portfolio, Services, and Footer components. Contact is available as a dedicated `/contact` route as well as the contact section/component where wired. The exact final composition must follow the approved Eraser/design-system references.

Testimonials are described in design direction material but are not confirmed as a current implemented public section. Treat them as content to be approved and implemented only when included in the approved page design.

## 4. Hero and camera storytelling

The supplied Design Finalization Workflow describes the intended visual concept:
- A realistic DSLR camera enters and settles centrally.
- The camera LCD displays the opening hero photograph.
- As the visitor scrolls, photographs appear from behind/through the first image, suggesting memories being released from the camera.
- Revealed photographs follow a soft curved upward path rather than random fade-ins or rigid straight movement.
- The camera remains present as a companion through the experience, sometimes foregrounded and sometimes secondary.
- The experience ends with a camera/shutter motif.

The workflow names `https://camera-webgi.vercel.app/` as a visual reference. It also notes that Google Stitch should be used to design screens/layouts, while camera motion, photo reveals, and transitions are implemented later with the project's motion stack. A storyboard image was referenced in that prompt but was not present in the supplied text attachment; do not infer storyboard-specific frames from its absence.

Current repository implementation has a persistent camera experience using React Three Fiber/Three.js and GSAP/ScrollTrigger, with lazy loading and reduced-motion/static fallback. Do not claim every described storyboard beat is implemented without verifying the actual running experience.

## 5. Portfolio

- Photography is the primary content.
- Use a premium gallery/masonry/editorial presentation as approved by the design system.
- Keep captions and metadata minimal and useful.
- Portfolio content may include project name, category, location, year, and optional short description when approved.
- Avoid long case-study copy unless it adds real value.
- Images need meaningful alt text when informative; decorative images should not create redundant screen-reader output.
- Current repository portfolio data uses generated placeholder SVG assets and temporary study labels. Replace these with approved real photography and metadata before launch.

## 6. Services

Current content model includes:
- Wedding Photography
- Portrait Photography
- Event Photography
- Commercial Photography

These labels and descriptions are temporary content and must be confirmed by the photographer. Service descriptions should explain what is offered, who it is for, and what the client receives, using concise honest language. Do not invent prices, packages, availability, credentials, or guarantees.

## 7. About and brand content

About content should build trust through the photographer's real biography, experience, philosophy, and approach. Current copy explicitly identifies itself as temporary. Final biography and claims require owner approval.

Brand voice:
- Calm, professional, friendly, honest, respectful, creative.
- Avoid salesy, exaggerated, generic, or overly corporate copy.
- Short headlines and paragraphs; one idea per paragraph.
- No unsupported superlatives or fabricated client outcomes.

## 8. Contact and inquiries

The website must make contact easy and low-pressure. The current content file contains placeholder email, phone, location, and social URLs. These must be replaced with verified details.

A dedicated contact form, CRM integration, booking calendar, payment flow, or inquiry-management backend is not established by the reviewed product sources. Do not promise these capabilities until separately specified and implemented.

## 9. SEO, accessibility, and performance

- Human-first page titles, descriptions, and semantic heading hierarchy.
- Descriptive link and button labels.
- Keyboard-operable navigation and interactions.
- Visible focus states and appropriate contrast.
- Meaningful image alternatives.
- Reduced-motion/static fallback.
- Responsive layout and touch targets.
- Optimized image delivery and lazy loading for heavy visual assets.
- Avoid long blocking sequences; scrolling remains under visitor control.
- Preserve usability if WebGL or advanced motion cannot run.

## 10. Content readiness checklist

- [ ] Final approved hero and portfolio photographs supplied.
- [ ] Photographer biography and approach approved.
- [ ] Service list and descriptions confirmed.
- [ ] Contact email, phone, location, and social links verified.
- [ ] Any testimonials are authentic and approved for publication.
- [ ] Placeholder assets and temporary copy removed.
- [ ] Mobile, keyboard, reduced-motion, and screen-reader review completed.
- [ ] SEO metadata reviewed.
- [ ] Visual storytelling verified against the current approved storyboard/design references.

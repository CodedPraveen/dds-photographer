### Hero Interaction Concept

The hero section should make visitors feel like they are interacting with a real camera in a photographer's studio. The interactions should be subtle, smooth, and realistic without overwhelming the user.

- **Mouse Movement:** As the cursor moves, the camera gently follows the pointer with a small amount of rotation and parallax. The movement should feel soft and natural rather than directly tracking the cursor.

- **Drag Interaction:** Users can click/touch and drag the camera to explore it from different angles. Rotation should be limited so the camera always remains in a natural viewing position.

- **Scroll Interaction:** While the user continues scrolling vertically, the camera remains fixed within the hero section. Instead of moving away, it slowly rotates horizontally, creating the feeling that the user is viewing the camera from different perspectives. This interaction should blend naturally with the page content without turning into a horizontal scrolling section.

- **Hover over the Shutter Button:** When the cursor hovers over the shutter button, it gently depresses to provide realistic tactile feedback.

- **Click the Shutter Button:** Pressing the shutter button triggers a quick camera flash, accompanied by a smooth transition that reveals the portfolio/gallery section, as if the visitor has just taken the first photograph.

### Design Goal

The objective is not to showcase the camera as a product but to use it as a storytelling element that represents photography. Every interaction should feel premium, responsive, and intuitive while encouraging visitors to explore the photographer's work.

# Follow-on Cinematic Refinement — LCD-to-Photo Journey

> **Added:** 2026-11-13  
> **Status:** Design specification; implementation not verified.

This section refines the existing hero concept without deleting or replacing the earlier hero decisions.

## Camera entrance and first frame

- The camera enters slowly, with a slight natural rotation, and settles near the center of the hero.
- The first featured photograph is visible on the camera LCD.
- The camera and photograph form one clear focal point. Keep the composition minimal and give the image room to breathe.

## Photograph emergence

- The first photograph must visually originate from the LCD screen.
- As scrolling begins, it lifts out of the LCD and follows a smooth upward curved, check-mark-like path.
- It settles above / behind the preceding photograph in a layered printed-memory composition.
- The LCD then previews the next photograph. Each subsequent image repeats this behavior.
- The movement should feel like physical photographs being revealed, not unrelated images sliding into the viewport.
- Keep the camera LCD as the source of each new photograph throughout the sequence.

## Camera continuity after the hero

The camera must not permanently disappear when the hero animation finishes. It remains a companion throughout the public website:

- About: camera beside the content, balanced against text.
- Experience / portfolio: subtle camera response while photographs remain dominant.
- Services and Testimonials: camera may move into a supporting foreground or background position without obstructing content.
- Contact: a large camera-lens-inspired call to action.
- Footer: a restrained shutter-inspired closing animation.

The camera may reduce emphasis during a transition, but it must remain part of the continuing visual story and return to view.

## Visual and motion direction

- Premium editorial minimalism inspired by high-end photography equipment and magazine layouts.
- Black / white foundation with restrained warm-gold and gray accents.
- Large typography, generous negative space, strong photography, and clear hierarchy.
- No gradients, glassmorphism, or decorative visual clutter.
- Slow, smooth, cinematic, natural movement. No bounce, fast/random movement, or over-designed transitions.

## Implementation contract

- Preserve the existing React Three Fiber / Three.js camera and GSAP / ScrollTrigger motion architecture.
- Use the actual LCD anchor's projected screen coordinate as the photo spawn point; keep it synchronized with camera transforms.
- Keep the camera and photo layers coordinated without embedding the whole photo stack into the 3D model unless separately approved.
- Use responsive, optimized HTML images for the photo layer where appropriate.
- Preserve reduced-motion behavior and a fully usable static fallback.
- Treat these as planned requirements, not implemented claims. Confirm behavior in code and across responsive viewports before changing implementation status.

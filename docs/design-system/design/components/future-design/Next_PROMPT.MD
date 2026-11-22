# Photographer Website — Complete Frontend Animation: Steps 1–5

Repository: `CodedPraveen/dds-photographer`

Branch: `frontend-portfolio`

Primary design reference: Attached image — **PHOTOGRAPHER WEBSITE – FINAL DESIGN FLOW**

Additional inspiration: https://camera-webgi.vercel.app/

## 1. Project Objective

Implement the first five steps of the attached storyboard as a complete, polished, cinematic camera-to-memories experience.

This is the initial frontend milestone.

The goal is to make the visitor feel that a real camera is capturing and releasing photographs as they scroll.

This must not feel like a collection of unrelated scroll animations.

The entire first experience should behave like one continuous visual story.

**STRICT SCOPE: IMPLEMENT ONLY STEPS 1–5.**

Do not implement Steps 6–11 or the final shutter animation as part of this task. Those belong to later milestones.

## 2. Mandatory First Step — Inspect Existing Architecture

Before changing code, inspect:

- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- `README.md`
- `docs/README.md`
- Current architecture and implementation status documentation.
- Existing motion architecture and relevant ADRs.
- `PersistentCamera.jsx`
- `MotionExperience.jsx`
- `MotionOrchestrator.jsx`
- `Hero.jsx`
- `Hero.module.css`
- Related camera model, assets, components and tests.

Understand how the existing camera, LCD screen, hero images, scroll progress and GSAP timelines currently work.

Do not assume that existing code is incomplete without inspecting it.

Prepare a short implementation plan based on the actual repository.

The repository documentation is the architecture authority. Do not require Eraser.

## 3. Technical Architecture — Preserve Existing Stack

Use the existing architecture:

- Next.js App Router
- React
- JavaScript
- Tailwind CSS v4
- Three.js
- React Three Fiber
- GSAP
- GSAP ScrollTrigger

Important rules:

- Keep the existing persistent camera architecture.
- Keep the existing GLB camera model.
- Reuse existing camera nodes and LCD screen references.
- Keep the existing GSAP animation architecture.
- Do not introduce Framer Motion or another animation engine.
- Do not replace the camera with a static image or video.
- Do not unnecessarily rebuild existing components.
- Do not duplicate animation controllers.
- Keep animations performant and responsive.
- Use semantic, maintainable code.

The camera should remain a real Three.js object, not a CSS image pretending to be a 3D camera.

---

# 4. IMPLEMENTATION — EXACTLY FIVE STEPS

## STEP 1 — Website Opens: Camera Entrance

### Expected visual result

When the website first loads:

1. A cinematic dark/neutral background appears.
2. The camera starts away from its final position.
3. The camera smoothly enters the scene.
4. It rotates slightly during the entrance.
5. It settles in the center of the viewport.
6. Its LCD display is clearly visible.

### Animation requirements

- Smooth entrance.
- Subtle rotation.
- Natural deceleration.
- No bounce.
- No sudden position changes.
- No excessive spinning.
- No distracting movement.

Use GSAP for the entrance and existing Three.js camera/model transforms.

The camera must settle at a position that makes its LCD screen usable as the origin of the photo animation.

### Acceptance criteria

- Camera loads without a visible jump.
- Camera entrance looks intentional and cinematic.
- Camera is correctly centered.
- LCD screen is visible.
- No horizontal page overflow.
- Desktop and mobile layouts work.

## STEP 2 — Camera LCD Connects to First Hero Image

### Expected visual result

The first photograph should appear inside the physical camera LCD.

The photo must look like it is genuinely displayed by the camera.

As the camera is rendered in 3D and the photograph is an HTML element, their positions must remain synchronized.

### Implementation requirements

1. Find the actual LCD screen node in the GLB model.
2. Project its world position into browser viewport coordinates.
3. Account for camera perspective and viewport size.
4. Calculate the projected LCD dimensions, not only its center point.
5. Position and size the first photograph to align with the LCD.
6. Update coordinates during camera movement and viewport resize.
7. Handle screen visibility correctly.

### Important synchronization requirements

The anchor system must not lose its initial event.

Do not rely on an event being dispatched before the Hero listener has attached.

Use a reliable initialization strategy, such as shared anchor state or an explicit ready handshake.

When the LCD becomes invisible or invalid:

- Hide the photo preview appropriately.
- Clear stale positioning state.
- Do not leave the photo floating at an old coordinate.

Check X, Y and Z projection bounds.

Account for the actual projected screen rectangle and its orientation as accurately as practical.

### Acceptance criteria

- First photo aligns with the camera LCD.
- No visible gap or incorrect scaling.
- No delayed appearance caused by missed events.
- Alignment survives camera movement and resizing.
- No stale coordinates when the LCD leaves the viewport.

## STEP 3 — Scroll: Photographs Come Out of the Camera

### Expected visual result

When the user starts scrolling:

- The first photograph starts emerging from the camera LCD.
- Additional photographs appear from behind the first one.
- They move upward as though the camera is releasing printed memories.
- Previous photographs remain visible.
- New photographs emerge sequentially.

This is the most important storytelling moment.

### Photo sequence

Implement a controlled sequence using the existing portfolio image content or suitable existing image assets.

Do not invent new photography content or replace real project content unnecessarily.

Each photo should have:

- Its own image.
- Its own animation timing.
- Its own depth/layer.
- A consistent origin at the camera LCD.
- A controlled final position.

### Animation behavior

For every photograph:

1. Begin at the LCD origin.
2. Start behind the preceding photo.
3. Scale naturally from its LCD preview size.
4. Move upward.
5. Become visible progressively.
6. Settle into its final position.
7. Remain in the composition while subsequent photos appear.

The first photograph must establish the visual connection between the physical LCD and the HTML photo sequence.

### Important

Do not simply fade images in.

Do not make photographs appear randomly around the screen.

Do not use unrelated CSS animations.

The photographs must look like they physically emerge from the camera.

### Acceptance criteria

- At least several photographs appear in sequence using available assets.
- Every photograph begins at the LCD.
- Previous photos remain visible.
- Timing feels continuous and natural.
- No flicker, overlap glitches or sudden jumps.
- Scroll direction and progress control the animation consistently.

## STEP 4 — Smooth Curved ✓-Shaped Photo Path

### Expected visual result

Every photograph follows the curved upward movement illustrated in Step 4 of the storyboard.

Conceptually:

Start: ↓

Curve: ↗

Finish: ↑

The path should feel like a smooth checkmark shape.

### Implementation requirements

Do not approximate the path using random X/Y keyframes.

Create a consistent path-based motion system.

Use GSAP-compatible motion techniques, such as a carefully controlled custom path or equivalent implementation using the existing GSAP stack.

Each photograph should:

1. Start at the LCD.
2. Move slightly downward/outward as it emerges.
3. Curve upward.
4. Travel along the intended checkmark-shaped trajectory.
5. Settle into a stable position.

### Visual quality

- Smooth curved movement.
- Premium cinematic pacing.
- Natural spacing.
- Controlled image depth.
- Consistent direction.
- No abrupt direction changes.
- No random floating.
- No unnecessary rotations.
- No excessive scaling.

The path must be visually consistent across all photographs.

Earlier photographs should remain composed while later photographs follow the same motion language.

### Acceptance criteria

- Motion visibly follows the intended checkmark curve.
- Every photo follows a consistent trajectory.
- No sudden position changes.
- Photo cards do not collide unpredictably.
- Final composition looks intentional.

## STEP 5 — Camera Fades While Photos Continue

### Expected visual result

At the appropriate point in the photo animation:

- The camera gradually becomes transparent.
- The camera becomes very light in the background.
- Photographs continue their movement.
- The photos become the primary visual focus.

This is a controlled fade, not an abrupt disappearance.

### Implementation requirements

- Synchronize camera opacity with the photo sequence.
- Use a smooth GSAP transition.
- Ensure the photo animation continues independently.
- Avoid camera flicker.
- Avoid unexpected camera removal.
- Preserve the camera model and scene architecture.

The Step 5 storyboard describes the camera becoming very light in the background.

Do not implement the later camera-return behavior from Step 7 as part of this task.

### Acceptance criteria

- Camera fades at the correct time.
- Photographs continue animating.
- Camera does not disappear suddenly.
- Final visual state matches Step 5 of the storyboard.

---

# 5. Scroll Animation Architecture

The five steps must feel like one connected timeline.

Use the existing MotionOrchestrator and GSAP ScrollTrigger architecture where appropriate.

Review the current implementation carefully.

In particular:

- Avoid using the entire document's scroll progress as the only controller for the initial camera journey.
- Use the initial hero experience as the appropriate animation boundary.
- Keep the animation progress predictable.
- Make the sequence reversible when scrolling upward.
- Avoid conflicting ScrollTriggers.
- Use `invalidateOnRefresh` and refresh handling where necessary.
- Ensure resizing does not break the animation.
- Clean up GSAP contexts and event listeners correctly.

Avoid unnecessary React re-renders on every animation frame.

Use refs, GSAP-managed values, or the existing event architecture for high-frequency animation updates.

The camera and photo sequence must not fight over transforms or opacity.

Define clear ownership of animated properties.

# 6. Photo Assets and Composition

Use the existing project images wherever possible.

Requirements:

- Preserve image quality.
- Use appropriate object-fit behavior.
- Maintain consistent photo aspect ratios.
- Avoid stretching.
- Avoid blurry images.
- Use optimized image loading where practical.
- Avoid layout shifts during animation.
- Keep photo layers visually separated.

Do not introduce random stock photographs simply to fill the sequence.

If the project lacks enough suitable images, identify the missing assets and report them instead of silently inventing content.

# 7. Responsive Behavior

The animation must work across:

### Desktop

- Camera centered correctly.
- Large LCD-to-photo transition.
- Full curved photo path.
- Natural spacing.

### Tablet

- Adjust camera scale.
- Adjust path dimensions.
- Maintain photo spacing.
- Avoid clipping.

### Mobile

- Camera fits the viewport.
- LCD remains readable.
- Photo path adapts to the narrow screen.
- No horizontal scrolling.
- Photo cards remain visible.
- Animation remains understandable.

Do not just scale desktop coordinates down.

Create responsive positioning and trajectory calculations.

# 8. Accessibility and Reduced Motion

Respect `prefers-reduced-motion`.

When reduced motion is enabled:

- Do not force the user through the full 3D camera entrance.
- Provide a meaningful static camera/photo presentation.
- Ensure the primary visual content remains accessible.
- Do not leave content invisible because GSAP did not initialize.

The website must remain usable without the cinematic animation.

# 9. Performance Requirements

Optimize the existing implementation.

Check:

- GLB loading.
- Texture loading.
- Image loading.
- ScrollTrigger count.
- Animation frame updates.
- Event listener cleanup.
- Memory leaks.
- Excessive React renders.
- Mobile GPU performance.

Avoid unnecessary rendering and animation work.

Do not add dependencies unless genuinely necessary and justified.

# 10. Testing and Visual Verification

Do not mark this task complete merely because the code compiles.

Run all relevant existing tests and checks.

At minimum:

- Lint.
- Tests.
- Production build.
- Type/syntax checks where applicable.
- Existing repository formatting checks.

Test the experience in a real browser if browser testing is available.

Capture or inspect these states:

1. Initial camera entrance.
2. Camera settled with the first photo on its LCD.
3. First photograph emerging.
4. Several photographs emerging sequentially.
5. Photographs following the curved path.
6. Camera fading while photos continue.
7. Final Step 5 composition.
8. Mobile layout.
9. Reduced-motion layout.
10. Scrolling backward through the animation.

Check for:

- Incorrect LCD alignment.
- Camera jumps.
- Photo flicker.
- Unexpected clipping.
- Broken stacking order.
- Scroll jumps.
- Horizontal overflow.
- Console errors.
- WebGL errors.

If browser testing is unavailable, explicitly report that visual verification remains outstanding.

Do not claim tests passed unless they were actually executed.

# 11. Strict Scope Restrictions

This task implements ONLY Steps 1–5.

Do not implement:

- Step 6: Hero section ending.
- Step 7: Camera returning beside About Photographer.
- Step 8: Experience/Achievements section animation.
- Step 9: Portfolio section animation.
- Step 10: Services/Behind the Scenes section animation.
- Step 11: Contact section animation.
- Final shutter closing sequence.
- Admin dashboard.
- Gallery functionality changes.
- Authentication changes.
- Database schema changes.
- Cloudflare R2.
- Redis/BullMQ.
- Video functionality.
- Face recognition.

Do not redesign the entire website.

Do not change unrelated features.

# 12. Documentation and Project Status

After implementation:

- Update the relevant architecture/design documentation if the implementation changes any documented behavior.
- Update implementation status with only verified results.
- Record any remaining limitations.
- Keep future steps clearly marked as not implemented.
- Do not mark Steps 1–5 complete if visual acceptance criteria are still failing.

# 13. Git Safety

Work only on the existing `frontend-portfolio` branch.

Preserve existing uncommitted changes.

Do not:

- Merge the PR.
- Push changes.
- Create commits.
- Rewrite Git history.
- Delete unrelated files.
- Perform mass formatting of unrelated files.

# 14. Final Report

When finished, provide:

1. What was already implemented before your changes.
2. What you implemented.
3. Files changed and why.
4. How Steps 1–5 now behave.
5. Tests and commands executed.
6. Browser/device verification results.
7. Remaining visual or technical issues.
8. Missing assets, if any.
9. Whether each Step 1–5 acceptance criterion passed.

Use this status table:

| Step                 | Status | Evidence |
| -------------------- | ------ | -------- |
| 1. Camera entrance   |        |          |
| 2. LCD → first photo |        |          |
| 3. Photos emerge     |        |          |
| 4. Curved ✓ path     |        |          |
| 5. Camera fade       |        |          |

Final rule:

**The goal is not to add more animations. The goal is to reproduce the attached storyboard as a polished, connected, cinematic frontend experience.**

Do not start Steps 6–11.

# Hero Section (100vh)

When the website loads, the visitor immediately sees a clean, minimal hero section where nothing competes with the camera.

```text
────────────────────────────────────

              LOGO


                   📷
           (Interactive Camera)

        [Hero Image on LCD Screen]


        Premium Photographer
      Wedding • Portrait • Events


        Scroll Indicator

────────────────────────────────────
```

The camera occupies approximately **40–50% of the viewport**, making it the primary visual focus.

The LCD screen displays the photographer's best image, creating an immediate emotional connection.

---

## Landing

The page loads into a clean, premium black background.

The camera slowly enters from the bottom of the screen with a subtle floating animation.

It settles perfectly in the center.

The camera immediately becomes the focus.

The LCD screen is already displaying the photographer's best image.

Nothing feels rushed.

The page breathes.

---

# Mouse Movement

As the visitor moves the cursor, the camera gently reacts.

```text
Cursor →

         📷
       ↖
```

The camera rotates only a few degrees, creating a subtle parallax effect.

At the same time, the image displayed on the LCD screen shifts slightly, giving the impression that the photograph exists behind the glass rather than being a flat texture.

---

# Drag Interaction

Visitors can click (or touch) and drag the camera.

```text
      📷

Rotate

     ↺
```

The camera rotates naturally within a limited range.

The LCD image always remains perfectly aligned with the display, reinforcing the illusion that it is part of the physical camera.

---

# Scroll Begins

This is where the storytelling starts.

Instead of simply fading photographs onto the page...

```text
📷

↓

Image
```

...the first photograph begins inside the LCD screen.

```text
Frame 1

        📷
 ┌─────────────┐
 │ Wedding     │
 └─────────────┘
```

---

# Small Scroll

As the visitor scrolls, the photograph slowly begins lifting out of the LCD screen.

```text
        📷

    ┌─────────────┐
    │ Wedding     │
    └─────────────┘
```

The photograph still overlaps the display, making it feel connected to the camera.

---

# Continued Scroll

The photograph completely leaves the LCD screen.

```text
        📷


       ╲

        ╲

   ┌─────────────┐
   │ Wedding     │
   └─────────────┘
```

Rather than moving in a straight line, the photograph follows a soft curved path that feels natural and cinematic.

---

# The Next Memory

Once the first photograph has left the display, the LCD becomes empty for a brief moment.

Immediately afterward, the next photograph appears inside the screen.

```text
        📷

 ┌─────────────┐
 │ Portrait    │
 └─────────────┘
```

The LCD is now previewing the next memory.

---

# Scroll Again

As scrolling continues, the Portrait image leaves the LCD screen.

```text
Portrait


        📷

 LCD now shows

Landscape
```

The camera is already preparing the next photograph.

---

# Continuous Storytelling

Each new photograph follows the same journey.

```text
Landscape


Portrait


      📷

LCD shows Event
```

Eventually, multiple photographs begin building a layered composition.

```text
Event


Landscape


Portrait


Wedding


      📷
```

Instead of random images appearing, every photograph clearly originates from the camera itself.

---

# Why This Works

The LCD screen never becomes irrelevant.

It continuously previews the **next photograph**, making the visitor understand that the camera is revealing memories one by one.

The experience feels intentional and connected rather than a collection of unrelated animations.

---

# Final Hero Composition

After four or five photographs have been revealed, the hero section reaches its final composition.

```text
       Photo 5


   Photo 4


Photo 3


      📷


Photo 2


Photo 1
```

The camera remains visible as the centerpiece, surrounded by the collected photographs.

Once the final photograph settles into place, the hero animation is complete.

From this point onward, the website scrolls naturally.

# Physical Photograph Feeling

To make the experience more authentic, every photograph should feel like a real printed photo.

Instead of perfectly aligned rectangles:

```text
Photo 1    0°

Photo 2   -2°

Photo 3    3°

Photo 4   -1°
```

Each photograph has:

- Tiny random rotation
- Slight depth variation
- Soft realistic shadows
- Gentle overlapping

This creates the feeling of printed memories naturally accumulating around the camera.

---

# How It's Built

The hero interaction is built using **two separate rendering layers**.

```text
Layer 1
────────────
3D Camera (React Three Fiber / Three.js Canvas)

Layer 2
────────────
HTML Images (Next.js / next/image)
```

The **camera** is rendered inside a Three.js canvas.

The **photographs** are standard HTML elements (`<img>` or `next/image`) positioned above the canvas and animated using **GSAP** or **Framer Motion**.

This approach keeps the 3D scene lightweight while making the image animations responsive, SEO-friendly, and easy to manage.

---

# Animation Flow

Instead of embedding the photographs inside the 3D model, every image originates from the camera's LCD screen.

The workflow is:

1. Determine the LCD screen's position in the 3D scene.
2. Convert that 3D world position into a 2D screen coordinate.
3. Spawn the HTML image at that exact location.
4. Animate the image outward along a smooth path until it reaches its destination.

```text
Camera LCD

↓

Screen Position

↓

Create Image

↓

Animate Up

↓

Settle Into Final Position
```

This creates the illusion that every photograph is emerging directly from the camera.

---

# Why Use HTML Images Instead of 3D Planes?

Using HTML images provides several advantages:

- Supports dozens or even hundreds of photographs efficiently.
- Responsive across all screen sizes.
- Native lazy loading.
- Optimized image delivery with `next/image`.
- Easier hover effects and UI interactions.
- Better SEO and accessibility.
- Simpler long-term maintenance.

The camera remains the visual anchor, while the photographs are managed using standard web technologies.

---

# Synchronizing the Camera and Images

Every frame, the image spawn point is synchronized with the LCD screen.

```text
Camera Rotates

↓

LCD Screen Position Updates

↓

Image Spawn Point Updates Automatically
```

Because the spawn point is calculated in real time, the effect remains accurate even if the user rotates or drags the camera before scrolling.

---

# Recommended Architecture

```text
React Three Fiber
        │
        ▼
   3D Camera
        │
        ▼
 LCD Screen Anchor
        │
        ▼
Screen Coordinates
        │
        ▼
      GSAP
        │
        ▼
  HTML Images
```

This architecture combines the strengths of both worlds:

- Interactive 3D camera built with React Three Fiber.
- Lightweight, responsive HTML image animations.
- No Blender dependency for this feature.
- Easy to extend with additional image sequences, transitions, and interactive effects.

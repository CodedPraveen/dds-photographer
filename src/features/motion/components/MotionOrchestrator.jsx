"use client";

import { useEffect } from "react";

const CAMERA_PROGRESS_EVENT = "dds:camera-progress";

export function MotionOrchestrator() {
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let cleanupMotion;
    let isCancelled = false;
    const stopMotionForPreference = () => {
      if (reducedMotionQuery.matches) {
        isCancelled = true;
        cleanupMotion?.();
      }
    };

    reducedMotionQuery.addEventListener("change", stopMotionForPreference);

    if (reducedMotionQuery.matches) {
      window.dispatchEvent(
        new CustomEvent(CAMERA_PROGRESS_EVENT, { detail: { progress: 0 } }),
      );
      return () =>
        reducedMotionQuery.removeEventListener(
          "change",
          stopMotionForPreference,
        );
    }

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([gsapModule, scrollTriggerModule]) => {
        if (isCancelled) return;

        const gsap = gsapModule.gsap;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        const context = gsap.context(() => {
          const cameraStage = document.querySelector("[data-camera-stage]");
          const hero = document.querySelector("[data-motion-hero]");
          const heroCopy = document.querySelector("[data-motion-hero-copy]");
          const cameraFallback = document.querySelector(
            "[data-motion-camera-fallback]",
          );
          const photoCards = gsap.utils.toArray("[data-motion-photo]");
          const revealItems = gsap.utils.toArray("[data-motion-reveal]");
          const shutter = document.querySelector("[data-motion-shutter]");
          const shutterIris = document.querySelector(
            "[data-motion-shutter-iris]",
          );

          if (cameraStage) gsap.set(cameraStage, { autoAlpha: 0 });

          const cameraJourney = { progress: 0 };
          gsap.to(cameraJourney, {
            progress: 1,
            ease: "none",
            onUpdate: () => {
              window.dispatchEvent(
                new CustomEvent(CAMERA_PROGRESS_EVENT, {
                  detail: { progress: cameraJourney.progress },
                }),
              );
            },
            scrollTrigger: {
              end: "bottom bottom",
              scrub: 1,
              start: "top top",
              trigger: document.documentElement,
            },
          });

          if (hero && photoCards.length > 1) {
            gsap.set(photoCards.slice(1), {
              autoAlpha: 0,
              scale: 0.9,
              xPercent: -10,
              yPercent: 72,
            });

            const heroTimeline = gsap.timeline({
              defaults: { ease: "power2.inOut" },
              scrollTrigger: {
                end: "bottom top",
                scrub: 1,
                start: "top top",
                trigger: hero,
              },
            });

            if (heroCopy) {
              heroTimeline.to(
                heroCopy,
                { autoAlpha: 0.3, duration: 0.28, yPercent: -8 },
                0.08,
              );
            }

            photoCards.slice(1).forEach((card, index) => {
              const direction = index % 2 === 0 ? 1 : -1;
              heroTimeline.to(
                card,
                {
                  autoAlpha: 1,
                  duration: 0.42,
                  keyframes: {
                    scale: [0.9, 0.97, 1],
                    xPercent: [-10, direction * 8, direction * (6 + index * 3)],
                    yPercent: [72, 18, -18 - index * 20],
                  },
                },
                0.16 + index * 0.18,
              );
            });

            if (cameraFallback) {
              heroTimeline
                .to(
                  cameraFallback,
                  { autoAlpha: 0.28, duration: 0.22, scale: 0.94 },
                  0.34,
                )
                .to(
                  cameraFallback,
                  { autoAlpha: 0, duration: 0.2, scale: 0.9 },
                  0.8,
                );
            }

            if (cameraStage) {
              heroTimeline.to(
                cameraStage,
                { autoAlpha: 0.58, duration: 0.24 },
                0.7,
              );
            }
          } else if (cameraStage) {
            gsap.to(cameraStage, {
              autoAlpha: 1,
              duration: 1.2,
              ease: "power2.out",
            });
          }

          if (cameraStage) {
            gsap.fromTo(
              cameraStage,
              { opacity: 0.58 },
              {
                immediateRender: false,
                opacity: 0.92,
                scrollTrigger: {
                  end: "center center",
                  scrub: 1,
                  start: "top bottom",
                  trigger: "#contact",
                },
              },
            );
          }

          revealItems.forEach((item) => {
            gsap.fromTo(
              item,
              { opacity: 0, y: 36 },
              {
                duration: 0.8,
                ease: "power2.out",
                opacity: 1,
                scrollTrigger: {
                  once: true,
                  start: "top 88%",
                  trigger: item,
                },
                y: 0,
              },
            );
          });

          if (shutter && shutterIris) {
            gsap.set(shutter, { autoAlpha: 0, visibility: "visible" });
            gsap
              .timeline({
                scrollTrigger: {
                  end: "bottom bottom",
                  scrub: 1,
                  start: "top 78%",
                  trigger: "footer",
                },
              })
              .to(shutter, { autoAlpha: 0.84, duration: 1 }, 0)
              .to(
                shutterIris,
                { duration: 0.78, ease: "power2.inOut", scale: 0.3 },
                0,
              )
              .to(shutter, { autoAlpha: 0, duration: 0.22 }, 0.78);
          }
        });

        cleanupMotion = () => context.revert();
        ScrollTrigger.refresh();
      })
      .catch((error) => {
        console.error("Motion enhancement failed to initialize.", error);
      });

    return () => {
      isCancelled = true;
      cleanupMotion?.();
      reducedMotionQuery.removeEventListener("change", stopMotionForPreference);
    };
  }, []);

  return null;
}

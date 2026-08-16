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
          const photoCards = gsap.utils.toArray("[data-motion-photo]");
          const revealItems = gsap.utils.toArray("[data-motion-reveal]");
          const portfolio = document.querySelector("[data-motion-portfolio]");
          const services = document.querySelector("[data-motion-services]");
          const contact = document.querySelector("#contact");
          const shutter = document.querySelector("[data-motion-shutter]");
          const shutterIris = document.querySelector(
            "[data-motion-shutter-iris]",
          );

          if (cameraStage) {
            gsap.fromTo(
              cameraStage,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.8, ease: "power2.out" },
            );
          }

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

          if (hero && photoCards.length > 0) {
            const firstPhoto = photoCards[0];
            const laterPhotos = photoCards.slice(1);
            const finalPhotoScale = () => {
              const width = firstPhoto.getBoundingClientRect().width || 1;
              return Math.max(2.8, (window.innerWidth * 0.9) / width);
            };

            gsap.set(firstPhoto, {
              autoAlpha: 1,
              scale: 0.66,
              xPercent: 0,
              yPercent: 4,
            });
            gsap.set(laterPhotos, {
              autoAlpha: 0,
              scale: 0.58,
              xPercent: 0,
              yPercent: 8,
            });

            const heroTimeline = gsap.timeline({
              defaults: { ease: "power2.inOut" },
              scrollTrigger: {
                end: "bottom top",
                invalidateOnRefresh: true,
                scrub: 1,
                start: "top top",
                trigger: hero,
              },
            });

            heroTimeline
              .to(
                firstPhoto,
                {
                  autoAlpha: 1,
                  duration: 0.24,
                  scale: 0.92,
                  xPercent: -6,
                  yPercent: -34,
                },
                0.1,
              )
              .to(
                firstPhoto,
                {
                  duration: 0.34,
                  scale: finalPhotoScale,
                  xPercent: 0,
                  yPercent: -12,
                },
                0.34,
              );

            laterPhotos.forEach((card, index) => {
              const direction = index % 2 === 0 ? 1 : -1;
              heroTimeline.to(
                card,
                {
                  autoAlpha: 0.92,
                  duration: 0.38,
                  keyframes: {
                    scale: [0.58, 0.86, 1.08],
                    xPercent: [0, direction * 34, direction * (54 + index * 8)],
                    yPercent: [8, -48, -126 - index * 30],
                  },
                },
                0.24 + index * 0.14,
              );
            });

            if (cameraStage) {
              heroTimeline.to(
                cameraStage,
                { autoAlpha: 0.34, duration: 0.16 },
                0.84,
              );
            }
          }

          if (portfolio && services) {
            gsap
              .timeline({
                scrollTrigger: {
                  end: "top 18%",
                  scrub: 1,
                  start: "top 92%",
                  trigger: services,
                },
              })
              .to(
                portfolio,
                { autoAlpha: 0.42, ease: "none", xPercent: -18 },
                0,
              )
              .fromTo(
                services,
                { xPercent: 18 },
                { ease: "none", xPercent: 0 },
                0,
              );
          }

          if (cameraStage && contact && !hero) {
            gsap.fromTo(
              cameraStage,
              { opacity: 0.35 },
              {
                immediateRender: false,
                opacity: 0.92,
                scrollTrigger: {
                  end: "center center",
                  scrub: 1,
                  start: "top bottom",
                  trigger: contact,
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

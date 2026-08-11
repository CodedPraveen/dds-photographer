"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import styles from "./MotionExperience.module.css";
import { MotionOrchestrator } from "./MotionOrchestrator";

const PersistentCamera = dynamic(
  () => import("./PersistentCamera").then((module) => module.PersistentCamera),
  { ssr: false },
);

export function MotionExperience() {
  const [shouldRenderCamera, setShouldRenderCamera] = useState(false);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const updatePreference = () =>
      setShouldRenderCamera(!reducedMotionQuery.matches);

    updatePreference();
    reducedMotionQuery.addEventListener("change", updatePreference);

    return () =>
      reducedMotionQuery.removeEventListener("change", updatePreference);
  }, []);

  return (
    <>
      <div aria-hidden="true" className={styles.cameraStage} data-camera-stage>
        {shouldRenderCamera ? <PersistentCamera /> : null}
      </div>
      <div aria-hidden="true" className={styles.shutter} data-motion-shutter>
        <span className={styles.shutterIris} data-motion-shutter-iris />
      </div>
      <MotionOrchestrator />
    </>
  );
}

"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef } from "react";
import { Box3, DoubleSide, Vector3 } from "three";

const CAMERA_MODEL_URL = "/cameras/camera.glb";
const CAMERA_PROGRESS_EVENT = "dds:camera-progress";
const SERVICE_STATE_EVENT = "dds:service-state";
const CAMERA_STOPS = [
  { position: [0, -0.08, 0], rotation: [0.02, 0, 0], scale: 0.98 },
  { position: [0, 0.04, 0], rotation: [0, 0.08, 0], scale: 1 },
  { position: [1.9, -0.08, 0], rotation: [0.02, 0.32, -0.02], scale: 0.76 },
  { position: [2.45, -0.3, 0], rotation: [0, -0.38, 0.02], scale: 0.62 },
  { position: [2.05, 0, 0], rotation: [0, 0.08, 0], scale: 0.92 },
  { position: [0.4, -0.16, 0], rotation: [0, -0.12, 0], scale: 0.78 },
];

export function PersistentCamera() {
  return (
    <CameraErrorBoundary>
      <Canvas
        camera={{ fov: 34, position: [0, 0, 8] }}
        dpr={[1, 1.35]}
        frameloop="demand"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={1.35} />
        <hemisphereLight args={["#fff7e8", "#17191d", 2.1]} />
        <directionalLight intensity={3.2} position={[4, 5, 6]} />
        <directionalLight intensity={1.4} position={[-4, 1, 4]} />
        <pointLight color="#d8c5a5" intensity={7} position={[0, -2, 4]} />
        <CameraRig />
      </Canvas>
    </CameraErrorBoundary>
  );
}

function CameraRig() {
  const groupRef = useRef(null);
  const latestProgressRef = useRef(0);
  const serviceIndexRef = useRef(0);
  const introCompleteRef = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  const viewportWidth = useThree((state) => state.viewport.width);

  useEffect(() => {
    let animationFrame;
    const introStartedAt = performance.now();
    const introDuration = 1400;

    const getResponsiveScale = () =>
      viewportWidth < 4 ? 0.46 : viewportWidth < 6 ? 0.72 : 1;

    const applyCameraState = (progress) => {
      const group = groupRef.current;
      if (!group) return;

      const scaledProgress = progress * (CAMERA_STOPS.length - 1);
      const startIndex = Math.min(
        CAMERA_STOPS.length - 2,
        Math.floor(scaledProgress),
      );
      const localProgress = scaledProgress - startIndex;
      const start = CAMERA_STOPS[startIndex];
      const end = CAMERA_STOPS[startIndex + 1];
      const horizontalScale =
        viewportWidth < 4 ? 0.14 : viewportWidth < 6 ? 0.54 : 1;
      const horizontalOffset = viewportWidth < 4 ? -0.1 : 0;
      const serviceOffset = serviceIndexRef.current * 0.035;

      group.position.set(
        mix(start.position[0], end.position[0], localProgress) *
          horizontalScale +
          horizontalOffset,
        mix(start.position[1], end.position[1], localProgress) - serviceOffset,
        mix(start.position[2], end.position[2], localProgress),
      );
      group.rotation.set(
        mix(start.rotation[0], end.rotation[0], localProgress),
        mix(start.rotation[1], end.rotation[1], localProgress) +
          serviceOffset * 2.4,
        mix(start.rotation[2], end.rotation[2], localProgress),
      );

      const scale =
        mix(start.scale, end.scale, localProgress) *
        getResponsiveScale() *
        (1 - serviceIndexRef.current * 0.018);
      group.scale.setScalar(scale);
      invalidate();
    };

    const animateEntrance = (now) => {
      const group = groupRef.current;
      if (!group) return;

      const progress = Math.min(1, (now - introStartedAt) / introDuration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const responsiveScale = getResponsiveScale();

      group.position.set(0, mix(0.45, -0.08, eased), mix(-5.5, 0, eased));
      group.rotation.set(
        mix(-0.18, 0.02, eased),
        mix(0.6, 0, eased),
        mix(-0.08, 0, eased),
      );
      group.scale.setScalar(mix(0.08, 0.98 * responsiveScale, eased));
      invalidate();

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateEntrance);
      } else {
        introCompleteRef.current = true;
        applyCameraState(latestProgressRef.current);
      }
    };

    const updateCamera = (event) => {
      latestProgressRef.current = Math.min(
        1,
        Math.max(0, event.detail?.progress ?? 0),
      );
      if (introCompleteRef.current) {
        applyCameraState(latestProgressRef.current);
      }
    };

    const updateServiceState = (event) => {
      serviceIndexRef.current = Math.max(0, Number(event.detail?.index) || 0);
      if (introCompleteRef.current) {
        applyCameraState(latestProgressRef.current);
      }
    };

    window.addEventListener(CAMERA_PROGRESS_EVENT, updateCamera);
    window.addEventListener(SERVICE_STATE_EVENT, updateServiceState);
    animationFrame = requestAnimationFrame(animateEntrance);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener(CAMERA_PROGRESS_EVENT, updateCamera);
      window.removeEventListener(SERVICE_STATE_EVENT, updateServiceState);
    };
  }, [invalidate, viewportWidth]);

  return (
    <group ref={groupRef}>
      <CameraModel />
    </group>
  );
}

function CameraModel() {
  const { scene } = useGLTF(CAMERA_MODEL_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z) || 1;

    clone.position.sub(center);
    clone.scale.setScalar(3.6 / largestDimension);
    clone.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = false;
        object.receiveShadow = false;
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => {
          if (!material) return;
          material.side = DoubleSide;
          material.needsUpdate = true;
        });
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={model} />;
}

function mix(start, end, progress) {
  return start + (end - start) * progress;
}

class CameraErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

useGLTF.preload(CAMERA_MODEL_URL);

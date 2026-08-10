"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Component, useEffect, useRef } from "react";

const CAMERA_PROGRESS_EVENT = "dds:camera-progress";
const CAMERA_STOPS = [
  {
    position: [1.6, 0, 0],
    rotation: [0.02, 0.08, 0],
    scale: 1,
  },
  {
    position: [2.15, -0.1, 0],
    rotation: [0.02, 0.08, -0.03],
    scale: 0.82,
  },
  {
    position: [2.65, -0.5, 0],
    rotation: [0, -0.42, 0.02],
    scale: 0.64,
  },
  {
    position: [-2.2, 0, 0],
    rotation: [-0.02, 0.38, -0.02],
    scale: 0.74,
  },
  {
    position: [2.05, 0, 0],
    rotation: [0, 0.04, 0],
    scale: 0.96,
  },
  { position: [0, -0.2, 0], rotation: [0, 0, 0], scale: 0.78 },
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
        <ambientLight intensity={1.2} />
        <directionalLight intensity={2.8} position={[4, 5, 6]} />
        <directionalLight intensity={0.8} position={[-4, 1, 3]} />
        <CameraRig />
      </Canvas>
    </CameraErrorBoundary>
  );
}

function CameraRig() {
  const groupRef = useRef(null);
  const lensRef = useRef(null);
  const invalidate = useThree((state) => state.invalidate);
  const viewportWidth = useThree((state) => state.viewport.width);

  useEffect(() => {
    const updateCamera = (event) => {
      if (!groupRef.current) return;

      const progress = Math.min(1, Math.max(0, event.detail?.progress ?? 0));
      const scaledProgress = progress * (CAMERA_STOPS.length - 1);
      const startIndex = Math.min(
        CAMERA_STOPS.length - 2,
        Math.floor(scaledProgress),
      );
      const localProgress = scaledProgress - startIndex;
      const start = CAMERA_STOPS[startIndex];
      const end = CAMERA_STOPS[startIndex + 1];
      const group = groupRef.current;
      const horizontalScale =
        viewportWidth < 4 ? 0.12 : viewportWidth < 6 ? 0.52 : 1;
      const horizontalOffset =
        viewportWidth < 4 ? -0.42 : viewportWidth < 6 ? -0.15 : 0;

      group.position.set(
        mix(start.position[0], end.position[0], localProgress) *
          horizontalScale +
          horizontalOffset,
        mix(start.position[1], end.position[1], localProgress),
        mix(start.position[2], end.position[2], localProgress),
      );
      group.rotation.set(
        mix(start.rotation[0], end.rotation[0], localProgress),
        mix(start.rotation[1], end.rotation[1], localProgress),
        mix(start.rotation[2], end.rotation[2], localProgress),
      );

      const responsiveScale =
        viewportWidth < 4 ? 0.38 : viewportWidth < 6 ? 0.68 : 1;
      const scale =
        mix(start.scale, end.scale, localProgress) * responsiveScale;
      group.scale.setScalar(scale);

      if (lensRef.current) lensRef.current.rotation.z = progress * 0.55;
      invalidate();
    };

    window.addEventListener(CAMERA_PROGRESS_EVENT, updateCamera);
    updateCamera({ detail: { progress: 0 } });

    return () =>
      window.removeEventListener(CAMERA_PROGRESS_EVENT, updateCamera);
  }, [invalidate, viewportWidth]);

  return (
    <group ref={groupRef}>
      <CameraModel lensRef={lensRef} />
    </group>
  );
}

function CameraModel({ lensRef }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[3.35, 2.05, 1.15]} />
        <meshStandardMaterial
          color="#171717"
          metalness={0.72}
          roughness={0.34}
        />
      </mesh>
      <mesh position={[-1.48, -0.15, 0.1]}>
        <boxGeometry args={[0.52, 1.48, 1.2]} />
        <meshStandardMaterial
          color="#0d0d0d"
          metalness={0.42}
          roughness={0.75}
        />
      </mesh>
      <mesh position={[0.3, 1.18, -0.02]}>
        <boxGeometry args={[1.48, 0.42, 0.82]} />
        <meshStandardMaterial
          color="#202020"
          metalness={0.68}
          roughness={0.34}
        />
      </mesh>
      <mesh position={[0.3, 0.08, 0.92]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.92, 1.04, 1.22, 48]} />
        <meshStandardMaterial
          color="#111111"
          metalness={0.84}
          roughness={0.22}
        />
      </mesh>
      <mesh
        position={[0.3, 0.08, 1.58]}
        ref={lensRef}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.68, 0.78, 0.18, 48]} />
        <meshPhysicalMaterial
          clearcoat={1}
          color="#29434b"
          emissive="#0b1518"
          emissiveIntensity={0.45}
          metalness={0.55}
          roughness={0.08}
        />
      </mesh>
      <mesh position={[0.3, 0.08, -0.59]}>
        <boxGeometry args={[2.12, 1.25, 0.08]} />
        <meshStandardMaterial
          color="#050505"
          metalness={0.22}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[1.18, 1.17, 0.18]}>
        <cylinderGeometry args={[0.23, 0.23, 0.16, 32]} />
        <meshStandardMaterial
          color="#2b2b2b"
          metalness={0.8}
          roughness={0.28}
        />
      </mesh>
    </group>
  );
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

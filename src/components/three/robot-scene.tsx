"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import type { PointerState } from "@/lib/use-pointer-tracking";

// Ported directly from a Claude Design build of this exact robot, geometry,
// materials, and proportions carried over as-is, not reinterpreted.
//
// One specific fix preserved from that build, worth keeping as a comment
// since it's a real, non-obvious bug: the visor uses MeshBasicMaterial,
// not an emissive MeshStandardMaterial. An emissive material still
// receives specular highlights from scene lights on top of its own glow,
// and under ACES tone mapping that stacked to pure white, the "white-out"
// bug. MeshBasicMaterial ignores scene lighting entirely, so it always
// reads as clean teal regardless of what's lighting the rest of the scene.
const CHROME_COLOR = "#060607";
const TEAL = "#3ed6c4";

function chromeMaterial() {
  return (
    <meshPhysicalMaterial
      color={CHROME_COLOR}
      metalness={1}
      roughness={0.09}
      clearcoat={1}
      clearcoatRoughness={0.06}
      envMapIntensity={1.8}
    />
  );
}

function tealMaterial() {
  return <meshBasicMaterial color={TEAL} toneMapped={false} />;
}

function Head() {
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!headRef.current) return;
    const targetY = THREE.MathUtils.clamp(state.pointer.x * 0.5, -0.5, 0.5);
    const targetX = THREE.MathUtils.clamp(-state.pointer.y * 0.3, -0.3, 0.3);
    headRef.current.rotation.y += (targetY - headRef.current.rotation.y) * 0.08;
    headRef.current.rotation.x += (targetX - headRef.current.rotation.x) * 0.08;
  });

  return (
    <group ref={headRef} position={[0, 3.35, 0]}>
      <mesh>
        <sphereGeometry args={[0.45, 40, 40]} />
        {chromeMaterial()}
      </mesh>
      <mesh>
        <sphereGeometry
          args={[0.452, 40, 24, Math.PI * 0.05, Math.PI * 0.9, Math.PI * 0.36, Math.PI * 0.3]}
        />
        {tealMaterial()}
      </mesh>
    </group>
  );
}

function Arm({ side }: { side: 1 | -1 }) {
  const s = side;
  return (
    <>
      <mesh position={[0.62 * s, 2.75, 0]}>
        <sphereGeometry args={[0.22, 28, 28]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[0.63 * s, 2.32, 0]}>
        <capsuleGeometry args={[0.15, 0.55, 10, 24]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[0.64 * s, 1.98, 0]}>
        <sphereGeometry args={[0.155, 24, 24]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[0.65 * s, 1.62, 0]}>
        <capsuleGeometry args={[0.13, 0.5, 10, 24]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[0.66 * s, 1.28, 0]}>
        <sphereGeometry args={[0.145, 24, 24]} />
        {chromeMaterial()}
      </mesh>
    </>
  );
}

function Leg({ side }: { side: 1 | -1 }) {
  const s = side;
  return (
    <>
      <mesh position={[0.34 * s, 1.05, 0]}>
        <capsuleGeometry args={[0.19, 0.6, 10, 24]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[0.34 * s, 0.66, 0]}>
        <sphereGeometry args={[0.19, 24, 24]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[0.34 * s, 0.28, 0]}>
        <capsuleGeometry args={[0.16, 0.58, 10, 24]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[0.34 * s, -0.03, 0.09]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.85]}>
        <capsuleGeometry args={[0.15, 0.24, 8, 20]} />
        {chromeMaterial()}
      </mesh>
    </>
  );
}

function Robot({ pointer }: { pointer: React.RefObject<PointerState> }) {
  const rootRef = useRef<THREE.Group>(null);
  const lastInteraction = useRef<number | null>(null);

  // eslint-disable-next-line react-hooks/immutability, react-hooks/purity
  useFrame((state, delta) => {
    if (!rootRef.current) return;
    if (lastInteraction.current === null) lastInteraction.current = Date.now();

    if (pointer.current.dragging) {
      rootRef.current.rotation.y += pointer.current.dragDeltaX * 0.008;
      // eslint-disable-next-line react-hooks/immutability
      pointer.current.dragDeltaX = 0;
      // eslint-disable-next-line react-hooks/immutability
      pointer.current.dragDeltaY = 0;
      lastInteraction.current = Date.now();
    } else if (Date.now() - lastInteraction.current > 1400) {
      rootRef.current.rotation.y += delta * 0.192;
    }
  });

  return (
    <group ref={rootRef} position={[0, -1.85, 0]}>
      <mesh position={[0, 1.55, 0]} scale={[1, 0.75, 0.85]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        {chromeMaterial()}
      </mesh>

      <mesh position={[0, 2.35, 0]} castShadow>
        <capsuleGeometry args={[0.5, 0.75, 12, 32]} />
        {chromeMaterial()}
      </mesh>

      <mesh position={[0, 2.42, 0.52]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        {tealMaterial()}
      </mesh>

      <mesh position={[0, 3.02, 0]}>
        <cylinderGeometry args={[0.16, 0.19, 0.22, 24]} />
        {chromeMaterial()}
      </mesh>

      <Arm side={1} />
      <Arm side={-1} />
      <Leg side={1} />
      <Leg side={-1} />

      <Head />
    </group>
  );
}

function CameraLookAt() {
  const { camera } = useThree();
  camera.lookAt(0, -0.1, 0);
  return null;
}

export function RobotScene({ pointer }: { pointer: React.RefObject<PointerState> }) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 11.5], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[3.5, 5, 4]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={2.0} color="#3ed6c4" />
      <directionalLight position={[-2, -1, 3]} intensity={0.5} color="#ffffff" />
      <spotLight position={[0, 8, 2]} intensity={3.0} angle={0.5} penumbra={0.4} color="#ffffff" />
      <Suspense fallback={null}>
        <CameraLookAt />
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.3}>
          <Robot pointer={pointer} />
        </Float>
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}

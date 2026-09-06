"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { PointerState } from "@/lib/use-pointer-tracking";

// Geometry, materials, and the overall silhouette are an original pass on
// top of the earlier build, redesigned for a cleaner, more "product" look:
// rounder head-to-body ratio, a visible chest core, banded joints, and a
// grounding contact shadow instead of a robot that just floats in void.
//
// The studio reflections come from an in-scene Lightformer rig rather than
// drei's `Environment preset=".."`, which fetches an external HDR from a
// CDN. Building the environment out of Lightformers keeps this fully
// offline/self-contained (no network dependency, no flash-of-unlit-chrome
// while an HDR downloads) while still giving the chrome real reflections.
//
// One specific fix preserved from the earlier build, worth keeping as a
// comment since it's a real, non-obvious bug: the visor/accents use
// MeshBasicMaterial, not an emissive MeshStandardMaterial. An emissive
// material still receives specular highlights from scene lights on top of
// its own glow, and under ACES tone mapping that stacked to pure white, the
// "white-out" bug. MeshBasicMaterial ignores scene lighting entirely, so it
// always reads as clean teal regardless of what's lighting the rest of the
// scene.
const CHROME_COLOR = "#0a0b0f";
const TEAL = "#3ed6c4";
const BRASS = "#e4b343";

function chromeMaterial() {
  return (
    <meshPhysicalMaterial
      color={CHROME_COLOR}
      metalness={1}
      roughness={0.14}
      clearcoat={1}
      clearcoatRoughness={0.1}
      envMapIntensity={1.4}
    />
  );
}

function tealMaterial() {
  return <meshBasicMaterial color={TEAL} toneMapped={false} />;
}

function brassMaterial() {
  return <meshBasicMaterial color={BRASS} toneMapped={false} />;
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
    <group ref={headRef} position={[0, 3.42, 0]}>
      <mesh>
        <sphereGeometry args={[0.5, 44, 44]} />
        {chromeMaterial()}
      </mesh>
      {/* visor: a flattened lens bulging off the face, not a partial-sphere
          sliver — a shape this simple can't accidentally render edge-on or
          get lost inside the head's own surface. Positioned so its front
          face clears the head's own radius (0.5) by a visible margin,
          rather than sitting just inside it and never showing at all. */}
      <mesh position={[0, 0.02, 0.36]} scale={[0.9, 0.55, 0.5]}>
        <sphereGeometry args={[0.4, 32, 24]} />
        {tealMaterial()}
      </mesh>
      {/* thin brass headband ringing the head at its widest point, clear of
          the torso (whose rounded cap actually reaches almost to the head,
          which is why an accent ring down at the "neck" is invisible —
          swallowed by that cap. Up here, on the bare head sphere, there's
          nothing to hide behind. */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.505, 0.018, 8, 40]} />
        {brassMaterial()}
      </mesh>
      {/* small antenna nub, breaks the perfect-sphere silhouette */}
      <mesh position={[0, 0.52, -0.05]}>
        <cylinderGeometry args={[0.02, 0.03, 0.14, 12]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[0, 0.6, -0.05]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        {tealMaterial()}
      </mesh>
    </group>
  );
}

function Arm({ side }: { side: 1 | -1 }) {
  const s = side;
  return (
    <>
      <mesh position={[0.66 * s, 2.78, 0]}>
        <sphereGeometry args={[0.24, 28, 28]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[0.67 * s, 2.34, 0]}>
        <capsuleGeometry args={[0.155, 0.55, 10, 24]} />
        {chromeMaterial()}
      </mesh>
      {/* elbow joint accent ring */}
      <mesh position={[0.675 * s, 2.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.145, 0.02, 8, 24]} />
        {tealMaterial()}
      </mesh>
      <mesh position={[0.68 * s, 1.62, 0]}>
        <capsuleGeometry args={[0.13, 0.5, 10, 24]} />
        {chromeMaterial()}
      </mesh>
      {/* hand */}
      <mesh position={[0.69 * s, 1.24, 0]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        {chromeMaterial()}
      </mesh>
    </>
  );
}

function Leg({ side }: { side: 1 | -1 }) {
  const s = side;
  return (
    <>
      <mesh position={[0.36 * s, 1.05, 0]}>
        <capsuleGeometry args={[0.2, 0.6, 10, 24]} />
        {chromeMaterial()}
      </mesh>
      {/* knee joint accent ring */}
      <mesh position={[0.36 * s, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.022, 8, 24]} />
        {tealMaterial()}
      </mesh>
      <mesh position={[0.36 * s, 0.28, 0]}>
        <capsuleGeometry args={[0.165, 0.58, 10, 24]} />
        {chromeMaterial()}
      </mesh>
      {/* foot, widened + flattened for a more grounded silhouette than a bare capsule cap */}
      <mesh position={[0.36 * s, -0.05, 0.1]} rotation={[0, 0, Math.PI / 2]} scale={[1.15, 1.35, 0.9]}>
        <capsuleGeometry args={[0.16, 0.22, 8, 20]} />
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
      {/* hip/pelvis */}
      <mesh position={[0, 1.5, 0]} scale={[1, 0.72, 0.85]}>
        <sphereGeometry args={[0.44, 32, 32]} />
        {chromeMaterial()}
      </mesh>

      {/* torso */}
      <mesh position={[0, 2.35, 0]} castShadow>
        <capsuleGeometry args={[0.52, 0.78, 12, 32]} />
        {chromeMaterial()}
      </mesh>

      {/* chest core: a small layered "power cell" instead of a single flat dot */}
      <mesh position={[0, 2.45, 0.53]}>
        <sphereGeometry args={[0.135, 24, 24]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[0, 2.45, 0.6]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        {tealMaterial()}
      </mesh>

      <mesh position={[0, 3.06, 0]}>
        <cylinderGeometry args={[0.17, 0.2, 0.24, 24]} />
        {chromeMaterial()}
      </mesh>

      {/* shoulder pauldrons, give the silhouette a bit more presence at the top */}
      <mesh position={[0.5, 2.82, 0]} scale={[0.9, 0.7, 0.9]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.26, 24, 24]} />
        {chromeMaterial()}
      </mesh>
      <mesh position={[-0.5, 2.82, 0]} scale={[0.9, 0.7, 0.9]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.26, 24, 24]} />
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

function StudioRig() {
  return (
    <Environment resolution={256}>
      <group>
        {/* big soft key light above/front, the main source the clearcoat reads */}
        <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[2, 4, 3]} scale={[6, 4, 1]} target={[0, 0, 0]} />
        {/* cool teal fill from the left, matches the brand accent in reflections */}
        <Lightformer form="rect" intensity={1.6} color={TEAL} position={[-4, 1, -2]} scale={[4, 6, 1]} target={[0, 0, 0]} />
        {/* warm brass kicker from below-front, small and subtle */}
        <Lightformer form="circle" intensity={0.8} color={BRASS} position={[0, -2, 4]} scale={2} target={[0, 0, 0]} />
        {/* soft rim behind, separates the robot from the dark background */}
        <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[0, 2, -5]} scale={[5, 5, 1]} target={[0, 0, 0]} />
      </group>
    </Environment>
  );
}

export function RobotScene({ pointer }: { pointer: React.RefObject<PointerState> }) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 11.5], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.02 }}
    >
      <ambientLight intensity={0.18} />
      <directionalLight position={[3.5, 5, 4]} intensity={1.7} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={1.3} color={TEAL} />
      <directionalLight position={[-2, -1, 3]} intensity={0.4} color="#ffffff" />
      <spotLight position={[0, 8, 2]} intensity={2.2} angle={0.5} penumbra={0.5} color="#ffffff" />
      <Suspense fallback={null}>
        <CameraLookAt />
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.3}>
          <Robot pointer={pointer} />
        </Float>
        <ContactShadows
          position={[0, -1.86, 0]}
          opacity={0.55}
          scale={6}
          blur={2.4}
          far={2.5}
          color="#000000"
        />
        <StudioRig />
      </Suspense>
    </Canvas>
  );
}

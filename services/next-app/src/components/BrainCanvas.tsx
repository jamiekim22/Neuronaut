"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";

type Props = {
  onSelect: (regionId: string) => void;
  selectedRegion: string | null; // Optional prop for selected region
};

export default function BrainCanvas({ onSelect, selectedRegion }: Props) {
  return (
    <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }}>
      {/* lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />

      {/* 3D brain model Scene */}
      <Scene
        onSelect={onSelect}
        selectedRegion={selectedRegion} />

      {/* controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.5}
        maxDistance={5}
        target={[0, 0, 0]} // Center point of rotation
        zoomSpeed={2}
      />
    </Canvas>
  );
}

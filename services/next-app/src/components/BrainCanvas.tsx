"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";

type Props = {
  onSelect: (regionId: string) => void;
  selectedRegion: string | null;
  sliceValue: number;
};

export default function BrainCanvas({ onSelect, selectedRegion, sliceValue }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 3], fov: 45 }}
      gl={{ localClippingEnabled: true }} >

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />

      {/* 3D brain model Scene */}
      <Scene
        onSelect={onSelect}
        selectedRegion={selectedRegion}
        sliceValue={sliceValue}
      />

      {/* Controls */}
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

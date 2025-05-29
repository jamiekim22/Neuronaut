"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";

type Props = {
  onSelect: (regionId: string) => void;
};

export default function BrainCanvas({ onSelect }: Props) {
  return (
    <Canvas camera={{ position: [0, 0.75, 0.75], fov: 45 }}>
      {/* lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      
      {/* 3D brain model Scene */}
      <Scene onSelect={onSelect} />

      {/* controls */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={1} // Minimum zoom distance
        maxDistance={2} // Maximum zoom distance
        target={[0, 0, 0]} // Center point of rotation
      />
    </Canvas>
  );
}

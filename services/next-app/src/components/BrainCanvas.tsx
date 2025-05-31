"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";

type Props = {
  onSelect: (regionId: string) => void;
};

export default function BrainCanvas({ onSelect }: Props) {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
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
        minDistance={0.5} // Minimum zoom distance - allow closer
        maxDistance={8}   // Maximum zoom distance - allow much further
        target={[0, 0, 0]} // Center point of rotation
      />
    </Canvas>
  );
}

"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";

type Props = {
  onSelect: (regionId: string) => void;
  selectedRegion: string | null;
  sliceValue: number;
  sliceAxis: 'x' | 'y' | 'z';
};

export default function BrainCanvas({
  onSelect,
  selectedRegion,
  sliceValue,
  sliceAxis,
}: Props) {
  return (
    <Canvas
      camera={{ position: [1.5, 1.0, 3], fov: 45 }}
      gl={{ localClippingEnabled: true }}
    >
      {/*Lighting*/}
      <ambientLight intensity={0.5} />
      <directionalLight
        intensity={1.0}
        color={"#FFFFFF"}
        position={[5, 5, 5]}
      />

      {/* Pink/Magenta Key Light */}
      <directionalLight
        color={"#FF28C9"}
        intensity={0.6}
        position={[5, 5, 3]}
        castShadow={false}
      />

      {/* Cyan/Aqua Fill Light */}
      <directionalLight
        color={"#6EEAE2"}
        intensity={0.6}
        position={[-5, 4, 2]}
        castShadow={false}
      />

      {/* Red Accent Light Underneath/Behind */}
      <pointLight
        color={"#D32E2E"}
        intensity={0.3}
        position={[0, -3, -4]}
      />

      {/* Low‐level Hemisphere/Environment Light */}
      <hemisphereLight
        color={"#A1C6C5"}
        groundColor={"#777777"}
        intensity={0.3}
      />

      {/* 3D brain model Scene */}
      <Scene
        onSelect={onSelect}
        selectedRegion={selectedRegion}
        sliceValue={sliceValue}
        sliceAxis={sliceAxis} 
      />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={4}
        target={[0, 0, 0]} // Middle of rotation
        zoomSpeed={2}
      />
    </Canvas>
  );
}

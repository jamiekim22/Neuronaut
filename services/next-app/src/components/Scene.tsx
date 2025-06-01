"use client";

import { useLoader, useThree, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { GLTFLoader } from "three-stdlib";
import { DRACOLoader } from "three-stdlib";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

interface SceneProps {
  onSelect: (id: string) => void;
  selectedRegion: string | null;
  sliceValue: number;        // from 0 to 100
}

export default function Scene({
  onSelect,
  selectedRegion,
  sliceValue,
}: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const regionNodesRef = useRef<Map<string, THREE.Object3D>>(new Map());

  // Clipping plane state management
  const [minZ, setMinZ] = useState<number>(0);
  const [maxZ, setMaxZ] = useState<number>(0);
  const slicingPlaneRef = useRef<THREE.Plane>(
    new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
  );

  // Load brain model with Draco compression
  const gltf = useLoader(
    GLTFLoader,
    "/models/brain-draco.glb",
    (loader) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/");
      loader.setDRACOLoader(draco);
    }
  );

  // Process loaded GLTF model: scale, center, clone materials, setup clipping
  useEffect(() => {
    if (!gltf.scene) return;

    // Scale and center the model
    gltf.scene.scale.setScalar(6);
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);

    // Calculate world-space bounding box for Z-axis limits
    const worldBox = new THREE.Box3().setFromObject(gltf.scene);
    setMinZ(worldBox.min.z);
    setMaxZ(worldBox.max.z);

    // Map region names to objects and setup materials
    regionNodesRef.current.clear();
    gltf.scene.children.forEach((obj) => {
      const regionName = obj.name.replace(/^_+/, "").replace(/[\*\?]/g, "");
      regionNodesRef.current.set(regionName, obj);

      // Clone materials and assign clipping planes
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          // Clone material to avoid shared references
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((mat) => mat.clone());
          } else {
            mesh.material = (mesh.material as THREE.Material).clone();
          }

          // Apply clipping plane to cloned material
          const matOrArray = mesh.material;
          if (Array.isArray(matOrArray)) {
            matOrArray.forEach((mat) => {
              ;(mat as THREE.MeshStandardMaterial).clippingPlanes = [
                slicingPlaneRef.current,
              ];
              (mat as THREE.MeshStandardMaterial).clipShadows = true;
            });
          } else {
            (matOrArray as THREE.MeshStandardMaterial).clippingPlanes = [
              slicingPlaneRef.current,
            ];
            (matOrArray as THREE.MeshStandardMaterial).clipShadows = true;
          }
        }
      });
    });

    // Add processed scene to render group
    groupRef.current?.add(gltf.scene);
  }, [gltf]);

  // Update clipping plane position based on slice value
  useEffect(() => {
    if (maxZ <= minZ) return;
    const worldZ = THREE.MathUtils.lerp(minZ, maxZ, sliceValue / 100);
    slicingPlaneRef.current.constant = worldZ;
  }, [sliceValue, minZ, maxZ]);

  // Handle region selection via raycasting
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera);

    const allRegions = Array.from(regionNodesRef.current.values());
    const intersects = raycaster.current.intersectObjects(allRegions, true);
    const slicePlaneZ = slicingPlaneRef.current.constant;

    for (let i = 0; i < intersects.length; i++) {
      const { object: hitObj, point } = intersects[i];
      // Skip intersection points above clipping plane
      if (point.z > slicePlaneZ + 1e-4) continue;

      // Traverse up object hierarchy to find region root
      let searchObject: THREE.Object3D | null = hitObj;
      while (searchObject && !allRegions.includes(searchObject)) {
        searchObject = searchObject.parent;
      }
      if (searchObject) {
        for (const [regionName, obj] of regionNodesRef.current.entries()) {
          if (obj === searchObject) {
            onSelect(regionName);
            return;
          }
        }
      }
    }
  };

  // Helper function to determine which regions to process based on L/R naming convention
  const getRegionsToProcess = (regionName: string): string[] => {
    const regionsToProcess: string[] = [];
    const match = regionName.match(/^(.+)_([LR])$/);
    
    if (match) {
      const base = match[1];
      const leftName = `${base}_L`;
      const rightName = `${base}_R`;

      if (regionNodesRef.current.has(leftName)) regionsToProcess.push(leftName);
      if (regionNodesRef.current.has(rightName)) regionsToProcess.push(rightName);

      // Fallback to exact match if bilateral regions not found
      if (regionsToProcess.length === 0 && regionNodesRef.current.has(regionName)) {
        regionsToProcess.push(regionName);
      }
    } else {
      // Single region without L/R suffix
      if (regionNodesRef.current.has(regionName)) {
        regionsToProcess.push(regionName);
      }
    }

    return regionsToProcess;
  };

  // ────── Region highlighting ──────
  const previousSelectedRefs = useRef<THREE.Object3D[]>([]);

  useEffect(() => {
    // Clear previous highlighting
    previousSelectedRefs.current.forEach((oldRoot) => {
      oldRoot.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          if (m.material) {
            const mat = m.material as THREE.MeshStandardMaterial;
            mat.emissive.set(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      });
    });
    previousSelectedRefs.current = [];

    if (!selectedRegion) return;

    const namesToHighlight = getRegionsToProcess(selectedRegion);

    // Apply highlighting to selected regions
    namesToHighlight.forEach((name) => {
      const root = regionNodesRef.current.get(name);
      if (root) {
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            if (m.material) {
              const mat = m.material as THREE.MeshStandardMaterial;
              mat.emissive.set(0x00ffdd);
              mat.emissiveIntensity = 0.5;
              mat.roughness = 0.2;
            }
          }
        });
        previousSelectedRefs.current.push(root);
      }
    });
  }, [selectedRegion]);

  // Pulse animation for highlighted regions
  useFrame((state) => {
    if (!selectedRegion) return;

    const namesToPulse = getRegionsToProcess(selectedRegion);

    // Sine wave pulse effect
    const t = state.clock.getElapsedTime();
    const pulse = Math.sin(t * 2.0) * 0.35 + 0.4;

    // Apply pulse effect to each region
    namesToPulse.forEach((name) => {
      const root = regionNodesRef.current.get(name);
      if (root) {
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            if (m.material) {
              const mat = m.material as THREE.MeshStandardMaterial;
              mat.emissiveIntensity = pulse;
            }
          }
        });
      }
    });
  });

  return <group ref={groupRef} onPointerDown={handlePointerDown} />;
}

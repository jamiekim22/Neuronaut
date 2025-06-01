"use client";

import { useLoader, useThree } from "@react-three/fiber";
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
  const previousSelectedRef = useRef<THREE.Object3D | null>(null);

  // Clipping‐slice bookkeeping (unchanged)
  const [minZ, setMinZ] = useState<number>(0);
  const [maxZ, setMaxZ] = useState<number>(0);
  const slicingPlaneRef = useRef<THREE.Plane>(
    new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
  );

  // Load GLTF with Draco (unchanged)
  const gltf = useLoader(
    GLTFLoader,
    "/models/brain-draco.glb",
    (loader) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/");
      loader.setDRACOLoader(draco);
    }
  );

  // ─── When GLTF loads: scale/center, clone each mesh’s material, record minZ/maxZ, assign clippingPlanes ───
  useEffect(() => {
    if (!gltf.scene) return;

    // 1) Scale & center the model
    gltf.scene.scale.setScalar(6);
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);

    // 2) Compute world‐space bounding box so we know minZ & maxZ
    const worldBox = new THREE.Box3().setFromObject(gltf.scene);
    setMinZ(worldBox.min.z);
    setMaxZ(worldBox.max.z);

    // 3) Populate regionNodesRef
    regionNodesRef.current.clear();
    gltf.scene.children.forEach((obj) => {
      const regionName = obj.name.replace(/^_+/, "").replace(/[\*\?]/g, "");
      regionNodesRef.current.set(regionName, obj);

      // Before assigning clippingPlanes, clone each mesh’s material so it’s unique:
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          // CLONE MATERIAL HERE:
          if (Array.isArray(mesh.material)) {
            // If the mesh has an array of materials, clone each one
            mesh.material = mesh.material.map((mat) => mat.clone());
          } else {
            // Otherwise, just clone the single material
            mesh.material = (mesh.material as THREE.Material).clone();
          }

          // Now that it's a unique material, you can safely assign clippingPlanes
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

    // 4) Add the loaded/corrected scene to our group
    groupRef.current?.add(gltf.scene);
  }, [gltf]);

  // Whenever sliceValue changes, update the clipping plane’s constant (unchanged)
  useEffect(() => {
    if (maxZ <= minZ) return;
    const worldZ = THREE.MathUtils.lerp(minZ, maxZ, sliceValue / 100);
    slicingPlaneRef.current.constant = worldZ;
  }, [sliceValue, minZ, maxZ]);

  // Raycasting for region selection (unchanged)
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
      // Skip hits that lie above (clipped away)
      if (point.z > slicePlaneZ + 1e-4) continue;

      // Climb up until we hit a top‐level region node
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

    // ─── HIGHLIGHTING LOGIC (fixed to de-highlight L & R pairs) ───
  // Use an array to remember *all* previously highlighted roots
  const previousSelectedRefs = useRef<THREE.Object3D[]>([]);

  useEffect(() => {
    // 1) Clear all previously highlighted regions (each root in the array)
    previousSelectedRefs.current.forEach((oldRoot) => {
      oldRoot.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          if (m.material) {
            const mat = m.material as THREE.MeshStandardMaterial;
            mat.emissive.set(0x000000);
            mat.emissiveIntensity = 1;
          }
        }
      });
    });
    // Reset the array
    previousSelectedRefs.current = [];

    // 2) If nothing is selected, do nothing more
    if (!selectedRegion) return;

    // 3) Build a list of region‐keys to highlight
    const namesToHighlight: string[] = [];
    const match = selectedRegion.match(/^(.+)_([LR])$/);
    if (match) {
      const base = match[1];                // e.g. "Inferior frontal sulcus"
      const leftName = `${base}_L`;         // "Inferior frontal sulcus_L"
      const rightName = `${base}_R`;        // "Inferior frontal sulcus_R"

      // If each exists, push it
      if (regionNodesRef.current.has(leftName))  namesToHighlight.push(leftName);
      if (regionNodesRef.current.has(rightName)) namesToHighlight.push(rightName);

      // If neither exists, fall back to the exact selectedRegion
      if (
        namesToHighlight.length === 0 &&
        regionNodesRef.current.has(selectedRegion)
      ) {
        namesToHighlight.push(selectedRegion);
      }
    } else {
      // No _L or _R suffix, just highlight that exact key if it exists
      if (regionNodesRef.current.has(selectedRegion)) {
        namesToHighlight.push(selectedRegion);
      }
    }

    // 4) Highlight each named root and add it to previousSelectedRefs
    namesToHighlight.forEach((name) => {
      const root = regionNodesRef.current.get(name);
      if (root) {
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            if (m.material) {
              const mat = m.material as THREE.MeshStandardMaterial;
              mat.emissive.set(0x00ffdd);
              mat.emissiveIntensity = 0.8;
              mat.roughness = 0.2;
            }
          }
        });
        previousSelectedRefs.current.push(root);
      }
    });
  }, [selectedRegion]);

  // Render only the group
  return <group ref={groupRef} onPointerDown={handlePointerDown} />;
}

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

  // Store the brain's bounding‐box minZ/maxZ after it loads
  const [minZ, setMinZ] = useState<number>(0);
  const [maxZ, setMaxZ] = useState<number>(0);

  // Create a clipping plane whose normal points along +Z (so it “clips out” points
  // whose world‐space Z coordinate is greater than plane.constant). Flip as needed.
  const slicingPlaneRef = useRef<THREE.Plane>(
    new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
  );

  // Load GLTF with Draco
  const gltf = useLoader(
    GLTFLoader,
    "/models/brain-draco.glb",
    (loader) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/");
      loader.setDRACOLoader(draco);
    }
  );

  // Once it loads, scale/center it, record minZ/maxZ, and assign clippingPlanes to each mesh
  useEffect(() => {
    if (!gltf.scene) return;

    // Scale & center
    gltf.scene.scale.setScalar(6);
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);

    // Now that the model is in place, compute world‐space bounding box again
    // so we know minZ & maxZ in world coordinates.
    const worldBox = new THREE.Box3().setFromObject(gltf.scene);
    setMinZ(worldBox.min.z);
    setMaxZ(worldBox.max.z);

    // Populate regionNodesRef 
    regionNodesRef.current.clear();
    gltf.scene.children.forEach((obj) => {
      const regionName = obj.name.replace(/^_+/, "").replace(/[\*\?]/g, "");
      regionNodesRef.current.set(regionName, obj);

      // Also, assign the clipping plane to every mesh in this region:
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          // Ensure each material uses the slicingPlane
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              mat.clippingPlanes = [slicingPlaneRef.current];
              mat.clipShadows = true;
            });
          } else {
            (mesh.material as THREE.MeshStandardMaterial).clippingPlanes = [
              slicingPlaneRef.current,
            ];
            (mesh.material as THREE.MeshStandardMaterial).clipShadows = true;
          }
        }
      });
    });

    // Add it to our group so it appears
    groupRef.current?.add(gltf.scene);
  }, [gltf]);

  // Whenever `sliceValue` changes (0→100), move the clipping plane’s constant
  useEffect(() => {
    // If minZ/maxZ hasn't been computed yet, do nothing.
    if (maxZ <= minZ) return;

    // Map sliceValue (0…100) to a world‐Z coordinate
    const worldZ = THREE.MathUtils.lerp(minZ, maxZ, sliceValue / 100);
    // Because our plane’s normal is (0,0,-1), setting plane.constant = worldZ
    // will “keep” everything whose Z is <= worldZ, and “clip” anything above it.
    slicingPlaneRef.current.constant = worldZ;
  }, [sliceValue, minZ, maxZ]);

  // Raycasting for region selection (exactly as before)
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
    

    // Get the current slicing plane’s world‐space Z
    const slicePlaneZ = slicingPlaneRef.current.constant;
    
    // Loop through all intersections; pick the first one whose point.z ≤ slicePlaneZ
    for (let i = 0; i < intersects.length; i++) {

      const { object: hitObj, point } = intersects[i];
      // If the intersection is in the clipped‐away region, skip it
      if (point.z > slicePlaneZ + 1e-4) {
        continue
      }
      // Otherwise, climb up until we hit a top‐level region node

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

  //
  // HIGHLIGHTING LOGIC 
  //
  useEffect(() => {
    // Clear old
    if (previousSelectedRef.current) {
      const oldMesh = previousSelectedRef.current as THREE.Mesh;
      if (oldMesh.material) {
        const mat = oldMesh.material as THREE.MeshStandardMaterial;
        mat.emissive.set(0x000000);
        mat.emissiveIntensity = 1;
      }
      previousSelectedRef.current = null;
    }
    // If nothing is selected, end
    if (!selectedRegion) return;

    // Otherwise, glow the new one
    const newObj = regionNodesRef.current.get(selectedRegion);
    if (newObj && (newObj as THREE.Mesh).material) {
      const newMesh = newObj as THREE.Mesh;
      const mat = newMesh.material as THREE.MeshStandardMaterial;
      mat.emissive.set(0x00ffdd);
      mat.emissiveIntensity = 0.8;
      mat.roughness = 0.2;
      previousSelectedRef.current = newMesh;
    }
  }, [selectedRegion]);

  // Render only the group
  return <group ref={groupRef} onPointerDown={handlePointerDown} />;
}

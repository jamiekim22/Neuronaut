"use client";

import { useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three-stdlib";
import { DRACOLoader } from "three-stdlib";
import * as THREE from "three";
import { useEffect, useRef } from "react";

interface SceneProps {
  onSelect: (id: string) => void;
  selectedRegion: string | null;
}

export default function Scene({
  onSelect,
  selectedRegion,
}: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Map from region name → the top‐level Object3D for that region
  const regionNodesRef = useRef<Map<string, THREE.Object3D>>(new Map());

  // Keep track of the last‐selected mesh so we can clear its glow
  const previousSelectedRef = useRef<THREE.Object3D | null>(null);

  // Load the GLTF (Draco) and populate `regionNodesRef`
  const gltf = useLoader(
    GLTFLoader,
    "/models/brain-draco.glb",
    (loader) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/");
      loader.setDRACOLoader(draco);
    }
  );

  useEffect(() => {
    if (!gltf.scene) return;

    // Scale & center the brain model
    gltf.scene.scale.setScalar(6);
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);

    // Clear the map and then fill it with each top‐level child as a “region”
    regionNodesRef.current.clear();
    gltf.scene.children.forEach((obj) => {
      // Regex to remove leading underscores or special chars from the name
      const regionName = obj.name.replace(/^_+/, "").replace(/[\*\?]/g, "");
      regionNodesRef.current.set(regionName, obj);
      console.log("Region found:", regionName);
    });

    // Attach the loaded scene under our groupRef so it actually renders
    groupRef.current?.add(gltf.scene);
  }, [gltf]);

  // Raycasting logic to detect which region was clicked, then call onSelect()
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();

    // Convert screen coords to normalized device coords
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    // Use a Vector2 for raycasting
    raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera);

    // Raycast against all region top‐level objects
    const allRegions = Array.from(regionNodesRef.current.values());
    const intersects = raycaster.current.intersectObjects(allRegions, true);
    if (intersects.length > 0) {
      let searchObject: THREE.Object3D = intersects[0].object;

      // Climb up until we hit one of our top‐level region nodes
      while (searchObject && !allRegions.includes(searchObject)) {
        searchObject = searchObject.parent!;
      }

      if (searchObject) {
        // Find which region name this corresponds to, then call onSelect
        for (const [regionName, obj] of regionNodesRef.current.entries()) {
          if (obj === searchObject) {
            console.log("Found region:", regionName);
            onSelect(regionName);
            return;
          }
        }
      }
    }

    console.log("No matching region found");
  };


  // Whenever `selectedRegion` changes: 
  //   - Clear the old mesh’s emissive
  //   - Set the new mesh’s emissive so it glows
  useEffect(() => {
    // If there was a previously selected mesh, reset its emissive to black
    if (previousSelectedRef.current) {
      const oldMesh = previousSelectedRef.current as THREE.Mesh;
      if (oldMesh.material) {
        const mat = oldMesh.material as THREE.MeshStandardMaterial;
        mat.emissive.set(0x000000);
        mat.emissiveIntensity = 1;
        // (Optional) If roughness/metalness was changed earlier, reset here:
        // mat.roughness = ORIGINAL_ROUGHNESS;
      }
      previousSelectedRef.current = null;
    }

    // If no new region is selected, we’re done
    if (!selectedRegion) return;

    // Look up the newly selected mesh by name
    const newObj = regionNodesRef.current.get(selectedRegion);
    if (newObj && (newObj as THREE.Mesh).material) {
      const newMesh = newObj as THREE.Mesh;
      const mat = newMesh.material as THREE.MeshStandardMaterial;

      // Make it glow
      mat.emissive.set(0x00ffdd);
      mat.emissiveIntensity = 0.3;
      mat.roughness = 0.2;

      // Remember this mesh so next time we can clear its emissive
      previousSelectedRef.current = newMesh;
    }
  }, [selectedRegion]);

  // Render only the <group> that holds the brain model with the click handler
  return <group ref={groupRef} onPointerDown={handlePointerDown} />;
}

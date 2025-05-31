"use client";

import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three-stdlib";
import { DRACOLoader } from "three-stdlib";
import * as THREE from "three";
import { useEffect, useRef } from "react";

export default function Scene({ onSelect }: { onSelect: (id: string) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const regionNodesRef = useRef(new Map<string, THREE.Object3D>());

  const gltf = useLoader(
    GLTFLoader,
    "/models/brain-draco.glb",
    (loader) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/");
      loader.setDRACOLoader(draco);
    }
  );  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.scale.setScalar(6); // Set scale
      
      // Then center the scaled model
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);

      // Create a map to store region names and their top-level nodes
      regionNodesRef.current.clear();
      gltf.scene.children.forEach((obj) => {
        const regionName = obj.name.replace(/^_+/, "").replace(/[\*\?]/g, "");
        regionNodesRef.current.set(regionName, obj);
        console.log("Region found:", regionName);
      });

      groupRef.current?.add(gltf.scene);
    }
  }, [gltf]);

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        
        // Find which region this mesh belongs to by checking its ancestors
        let searchObject: THREE.Object3D | null = e.object as THREE.Object3D;
        const regionNodes = Array.from(regionNodesRef.current.values());
        
        while (searchObject && !regionNodes.includes(searchObject)) {
          searchObject = searchObject.parent;
        }
        
        if (searchObject) {
          // Find the region name from our map
          for (const [regionName, obj] of regionNodesRef.current.entries()) {
            if (obj === searchObject) {
              console.log("Found region:", regionName);
              onSelect(regionName);
              return;
            }
          }
        }
        
        console.log("No matching region found");
      }}
    />
  );
}

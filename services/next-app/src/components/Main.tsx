"use client";
import { useState } from "react";
import BrainCanvas from "@/components/BrainCanvas";
import RegionInfoPanel from "@/components/RegionInfoPanel";

export default function Main() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <main>
      <div className="relative h-screen">
        <div className="absolute inset-0">
          <BrainCanvas onSelect={setSelected} />
        </div>
        <div className="absolute left-4 top-4 z-10 max-w-sm">
          <RegionInfoPanel regionId={selected} />
        </div>
      </div>
    </main>
  );
}

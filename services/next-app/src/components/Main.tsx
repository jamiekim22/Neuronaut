"use client";
import { useState } from "react";
import BrainCanvas from "@/components/BrainCanvas";
import RegionInfoPanel from "@/components/RegionInfoPanel";
import ControlPanel from "@/components/ControlPanel";

export default function Main() {
  const [selected, setSelected] = useState<string | null>(null);
  const [sliceValue, setSliceValue] = useState(100); // Default slice value
  const [sliceAxis, setSliceAxis] = useState<'x' | 'y' | 'z'>('z'); // Default slice axis

  return (
    <main>
      <div className="relative h-screen">
        <div className="absolute inset-0">
          <BrainCanvas
            onSelect={setSelected}
            selectedRegion={selected}
            sliceValue = {sliceValue} 
            sliceAxis={sliceAxis}/>
        </div>
        <div className="absolute left-4 top-4 z-10 max-w-sm">
          <RegionInfoPanel regionId={selected} />
        </div>
        <div className="absolute right-4 top-4 z-10">
          <ControlPanel
            sliceValue={sliceValue}
            onSliceChange={setSliceValue}
            sliceAxis={sliceAxis}
            onSliceAxisChange={setSliceAxis} />
        </div>
      </div>
    </main>
  );
}

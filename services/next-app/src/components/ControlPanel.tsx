"use client";

import React from "react";
import styles from "./ControlPanel.module.css"; 

interface ControlPanelProps {
  sliceValue: number;             // current slider value, 0–100
  onSliceChange: (val: number) => void;
}

export default function ControlPanel({ sliceValue, onSliceChange }: ControlPanelProps) {
  return (
    <div className="p-4 bg-black/70 backdrop-blur-sm rounded-lg shadow-lg space-y-4 text-white">
      <label htmlFor="sliceSlider" className="block mb-2 text-sm">
        Brain Slicing
      </label>
      <input
        id="sliceSlider"
        type="range"
        min={0}
        max={100}
        value={sliceValue}
        onChange={(e) => onSliceChange(parseFloat(e.target.value))}
        className={styles.slider}
      />
      <div className="text-center mt-1 text-xs">
        {sliceValue.toFixed(0)}%
      </div>
    </div>
  );
}


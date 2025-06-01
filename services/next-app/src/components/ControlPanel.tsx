"use client";

import React from "react";
import styles from "./ControlPanel.module.css";

interface ControlPanelProps {
  sliceValue: number;             // current slider value, 0–100
  sliceAxis?: 'x' | 'y' | 'z';     // current slice axis
  onSliceChange: (val: number) => void;
  onSliceAxisChange?: (axis: 'x' | 'y' | 'z') => void; 
}

export default function ControlPanel({
  sliceValue,
  onSliceChange,
  sliceAxis = 'x',
  onSliceAxisChange
}: ControlPanelProps) {
  return (
    <div className="w-96 p-6 bg-black/70 backdrop-blur-sm rounded-lg shadow-lg space-y-6 text-white">
      {/* Title */}
      <label htmlFor="sliceSlider" className="block mb-2 text-base font-medium">
        Brain Slicing
      </label>

      {/* Axis selection buttons */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={() => onSliceAxisChange?.('x')}
          className={`
            px-4 py-2 rounded text-sm font-medium
            ${sliceAxis === 'x' ? 'bg-cyan-500' : 'bg-gray-700'}
          `}
        >
          Sagittal
        </button>
        <button
          onClick={() => onSliceAxisChange?.('y')}
          className={`
            px-4 py-2 rounded text-sm font-medium
            ${sliceAxis === 'y' ? 'bg-cyan-500' : 'bg-gray-700'}
          `}
        >
          Horizontal
        </button>
        <button
          onClick={() => onSliceAxisChange?.('z')}
          className={`
            px-4 py-2 rounded text-sm font-medium
            ${sliceAxis === 'z' ? 'bg-cyan-500' : 'bg-gray-700'}
          `}
        >
          Coronal
        </button>
      </div>

      {/* Slider */}
      <input
        id="sliceSlider"
        type="range"
        min={0}
        max={100}
        value={sliceValue}
        onChange={(e) => onSliceChange(parseFloat(e.target.value))}
        className={styles.slider}
      />
      <div className="text-center mt-2 text-sm font-medium">
        {sliceValue.toFixed(0)}%
      </div>
    </div>
  );
}

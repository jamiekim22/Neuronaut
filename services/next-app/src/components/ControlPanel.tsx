"use client";

import React from "react";

interface ControlPanelProps {
  sliceValue: number;             // current slider value, 0–100
  onSliceChange: (val: number) => void;
}

export default function ControlPanel({ sliceValue, onSliceChange }: ControlPanelProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        right: "16px",
        transform: "translateY(-50%)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        width: "200px",
        fontFamily: "sans-serif",
      }}
    >
      <label htmlFor="sliceSlider" style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>
        Brain Slicing
      </label>
      <input
        id="sliceSlider"
        type="range"
        min={0}
        max={100}
        value={sliceValue}
        onChange={(e) => onSliceChange(parseFloat(e.target.value))}
        style={{ width: "100%" }}
      />
      <div style={{ textAlign: "center", marginTop: "4px", fontSize: "0.8rem" }}>
        {sliceValue.toFixed(0)}%
      </div>
    </div>
  );
}

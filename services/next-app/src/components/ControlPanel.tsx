"use client";

import React from "react";
import styles from "./ControlPanel.module.css";

interface ControlPanelProps {
    sliceValue: number;             // current slider value, 0–100
    sliceAxis?: 'x' | 'y' | 'z';    // current slice axis
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
        <div className="p-4 bg-black/70 backdrop-blur-sm rounded-lg shadow-lg space-y-4 text-white">
            <label htmlFor="sliceSlider" className="block mb-2 text-sm">
                Brain Slicing
            </label>

            {/* Axis selection buttons */}
            <div className="flex justify-center gap-2 mb-3">
                <button
                    onClick={() => onSliceAxisChange?.('x')}
                    className={`px-3 py-1 rounded text-xs ${sliceAxis === 'x' ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                    Saggital
                </button>
                <button
                    onClick={() => onSliceAxisChange?.('y')}
                    className={`px-3 py-1 rounded text-xs ${sliceAxis === 'y' ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                    Horizontal
                </button>
                <button
                    onClick={() => onSliceAxisChange?.('z')}
                    className={`px-3 py-1 rounded text-xs ${sliceAxis === 'z' ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                    Coronal
                </button>
            </div>

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


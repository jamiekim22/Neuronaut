"use client";
import React, { useMemo } from "react";
import styles from "./StarField.module.css";
import { mulberry32 } from "@/utils/seededRng";

interface Star {
  top: number;       // percentage (0–100)
  left: number;      // percentage (0–100)
  size: number;      // px
  delay: number;     // seconds
  duration: number;  // seconds
}

interface StarFieldProps {
  numStars?: number;
  seed?: number;
}

export default function StarField({
  numStars = 100,
  seed = 123456, // default seed—choose any integer you like
}: StarFieldProps) {
  // 1) Create a PRNG instance, always using the same seed
  const rng = useMemo(() => mulberry32(seed), [seed]);

  // 2) Generate all the stars (once) using that rng()
  const stars: Star[] = useMemo(() => {
    const arr: Star[] = [];
    for (let i = 0; i < numStars; i++) {
      // Instead of Math.random(), use rng():
      const top = rng() * 100;                             // 0–100 (%)
      const left = rng() * 100;                            // 0–100 (%)
      const size = 1 + rng() * 2;                          // 1–3 px
      const delay = rng() * 5;                             // 0–5 s
      const duration = 1.5 + rng() * 2.5;                  // 1.5–4 s
      arr.push({ top, left, size, delay, duration });
    }
    return arr;
  }, [numStars, rng]);

  return (
    <div className={styles.starContainer}>
      {stars.map((star, idx) => (
        <div
          key={idx}
          className={styles.star}
          style={{
            top: `${star.top}vh`,
            left: `${star.left}vw`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

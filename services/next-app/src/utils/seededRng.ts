/**
 * mulberry32 is a tiny, fast, seeded PRNG that returns values in [0, 1).
 * 
 * Usage:
 *   const rng = mulberry32(12345); // 12345 is your seed
 *   let x = rng(); // always the same first number if seed=12345
 *   let y = rng(); // second number, also deterministic
 */
export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

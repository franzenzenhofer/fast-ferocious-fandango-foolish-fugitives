export type Rng = () => number;

export const createRng = (seed: number): Rng => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

export const parseSeed = (value: string | null, fallback: number): number => {
  if (value === null) return fallback >>> 0;
  const trimmed = value.trim();
  if (trimmed.length === 0) return fallback >>> 0;
  const num = Number(trimmed);
  if (Number.isFinite(num)) return num >>> 0;
  let hash = 2166136261;
  for (let i = 0; i < trimmed.length; i += 1) {
    hash ^= trimmed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/**
 * Clamp a value between min and max bounds.
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Clamp a value between 0 and 1.
 */
export const clamp01 = (value: number): number => clamp(value, 0, 1);

/**
 * Linear interpolation between two values.
 */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Interpolate between two angles, taking the shortest path.
 */
export const lerpAngle = (a: number, b: number, t: number): number => {
  const delta = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + delta * t;
};

/**
 * Round to nearest integer.
 */
export const snap = (value: number): number => Math.round(value);

/**
 * Normalize hex color to 6-char format without hash.
 */
export const normalizeHex = (hex: string): string => {
  const cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    return cleaned
      .split('')
      .map((c) => `${c}${c}`)
      .join('');
  }
  return cleaned;
};

/**
 * Convert a number to 2-char padded hex string.
 */
export const toHex = (value: number): string =>
  Math.round(value).toString(16).padStart(2, '0');

/**
 * Lighten or darken a hex color by the given amount.
 */
export const shadeColor = (hex: string, amount: number): string => {
  const normalized = normalizeHex(hex);
  if (normalized.length !== 6) return hex;
  const num = Number.parseInt(normalized, 16);
  const r = clamp((num >> 16) + amount, 0, 255);
  const g = clamp(((num >> 8) & 0xff) + amount, 0, 255);
  const b = clamp((num & 0xff) + amount, 0, 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Format seconds as MM:SS string.
 */
export const formatTime = (seconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

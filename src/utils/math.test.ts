import { describe, it, expect } from 'vitest';
import {
  clamp,
  clamp01,
  lerp,
  lerpAngle,
  snap,
  shadeColor,
  normalizeHex,
  toHex,
  formatTime,
} from './math';

describe('clamp', () => {
  it('clamps value between min and max', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles edge cases', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('clamp01', () => {
  it('clamps value between 0 and 1', () => {
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(1.5)).toBe(1);
  });
});

describe('lerp', () => {
  it('interpolates between two values', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
  });

  it('handles negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });
});

describe('lerpAngle', () => {
  it('interpolates angles correctly', () => {
    expect(lerpAngle(0, Math.PI, 0.5)).toBeCloseTo(Math.PI / 2);
  });

  it('handles wrap-around correctly', () => {
    // The delta is calculated via atan2 to find shortest path
    const result = lerpAngle(Math.PI * 1.9, 0.1, 0.5);
    // Should interpolate taking the short path through 0/2PI
    expect(result).toBeGreaterThan(Math.PI * 1.9);
  });
});

describe('snap', () => {
  it('rounds to nearest integer', () => {
    expect(snap(5.4)).toBe(5);
    expect(snap(5.6)).toBe(6);
    expect(snap(5.5)).toBe(6);
  });
});

describe('normalizeHex', () => {
  it('expands 3-char hex to 6-char', () => {
    expect(normalizeHex('#fff')).toBe('ffffff');
    expect(normalizeHex('abc')).toBe('aabbcc');
  });

  it('strips hash and returns 6-char hex unchanged', () => {
    expect(normalizeHex('#ffffff')).toBe('ffffff');
    expect(normalizeHex('123456')).toBe('123456');
  });
});

describe('toHex', () => {
  it('converts number to padded hex string', () => {
    expect(toHex(0)).toBe('00');
    expect(toHex(255)).toBe('ff');
    expect(toHex(16)).toBe('10');
  });
});

describe('shadeColor', () => {
  it('lightens color with positive amount', () => {
    expect(shadeColor('#000000', 50)).toBe('#323232');
  });

  it('darkens color with negative amount', () => {
    expect(shadeColor('#ffffff', -50)).toBe('#cdcdcd');
  });

  it('clamps to valid color range', () => {
    expect(shadeColor('#ffffff', 100)).toBe('#ffffff');
    expect(shadeColor('#000000', -100)).toBe('#000000');
  });

  it('handles 3-char hex', () => {
    const result = shadeColor('#fff', -50);
    expect(result).toBe('#cdcdcd');
  });
});

describe('formatTime', () => {
  it('formats seconds to MM:SS', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(125)).toBe('2:05');
  });

  it('handles negative values', () => {
    expect(formatTime(-5)).toBe('0:00');
  });
});

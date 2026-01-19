import { describe, expect, it } from 'vitest';
import { createRng, parseSeed, randRange, randInt } from '../../src/utils/random.ts';

describe('random utils', () => {
  it('creates deterministic sequences for the same seed', () => {
    const a = createRng(123);
    const b = createRng(123);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('parses numeric seeds and string fallbacks', () => {
    expect(parseSeed('42', 1)).toBe(42);
    expect(parseSeed('', 7)).toBe(7);
    expect(parseSeed(null, 9)).toBe(9);
    expect(parseSeed('seeded', 3)).toBeTypeOf('number');
  });
});

describe('randRange', () => {
  it('returns values within range', () => {
    const rng = createRng(42);
    for (let i = 0; i < 100; i++) {
      const val = randRange(rng, 5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThan(10);
    }
  });

  it('returns min when rng returns 0', () => {
    const zeroRng = () => 0;
    expect(randRange(zeroRng, 5, 10)).toBe(5);
  });
});

describe('randInt', () => {
  it('returns integers within range', () => {
    const rng = createRng(42);
    for (let i = 0; i < 100; i++) {
      const val = randInt(rng, 10);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('returns 0 for non-positive max', () => {
    const rng = createRng(42);
    expect(randInt(rng, 0)).toBe(0);
    expect(randInt(rng, -5)).toBe(0);
  });
});

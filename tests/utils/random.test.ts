import { describe, expect, it } from 'vitest';
import { createRng, parseSeed } from '../../src/utils/random.ts';

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

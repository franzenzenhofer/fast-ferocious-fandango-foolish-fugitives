import { describe, expect, it } from 'vitest';
import { impactEnergy, impactTier, HIT_THRESHOLD, SLAM_THRESHOLD, TAP_THRESHOLD } from '../../src/game/collision.ts';

describe('impactEnergy', () => {
  it('returns zero when velocities match', () => {
    const bodyA = { mass: 10, velocity: { x: 2, y: -3 } };
    const bodyB = { mass: 12, velocity: { x: 2, y: -3 } };
    expect(impactEnergy(bodyA, bodyB)).toBe(0);
  });

  it('matches reduced mass energy for relative speed', () => {
    const bodyA = { mass: 10, velocity: { x: 5, y: 0 } };
    const bodyB = { mass: 10, velocity: { x: 0, y: 0 } };
    const energy = impactEnergy(bodyA, bodyB);
    expect(energy).toBeCloseTo(62.5, 4);
  });
});

describe('impactTier', () => {
  it('maps thresholds to tiers', () => {
    expect(impactTier(TAP_THRESHOLD - 0.01)).toBe('tap');
    expect(impactTier(TAP_THRESHOLD)).toBe('hit');
    expect(impactTier(HIT_THRESHOLD)).toBe('slam');
    expect(impactTier(SLAM_THRESHOLD)).toBe('crash');
  });
});

import { describe, expect, it } from 'vitest';
import { getOpenLanes, type LaneOccupant } from '../../src/game/spawn.ts';

describe('getOpenLanes', () => {
  it('avoids player lane near the reaction window at low heat', () => {
    const traffic: LaneOccupant[] = [];
    const openLanes = getOpenLanes(traffic, -200, 0.2, 1, 0);
    expect(openLanes).not.toContain(1);
  });

  it('allows player lane when heat is high and others are blocked', () => {
    const spawnY = -400;
    const traffic: LaneOccupant[] = [
      { lane: 0, y: spawnY + 40 },
      { lane: 2, y: spawnY - 30 },
      { lane: 3, y: spawnY + 20 },
    ];
    const openLanes = getOpenLanes(traffic, spawnY, 0.8, 1, 0);
    expect(openLanes).toEqual([1]);
  });

  it('blocks lanes with nearby traffic but allows distant gaps', () => {
    const spawnY = -500;
    const traffic: LaneOccupant[] = [
      { lane: 0, y: spawnY + 10 },
      { lane: 1, y: spawnY + 300 },
    ];
    const openLanes = getOpenLanes(traffic, spawnY, 0.4, 2, 0);
    expect(openLanes).toContain(1);
    expect(openLanes).not.toContain(0);
  });
});

import { LANE_COUNT } from './road.ts';

export interface LaneOccupant {
  lane: number;
  y: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
const clamp01 = (value: number): number => clamp(value, 0, 1);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const getOpenLanes = (
  traffic: LaneOccupant[],
  spawnY: number,
  heat: number,
  playerLane: number,
  playerY: number
): number[] => {
  const openLanes: number[] = [];
  const h = clamp01(heat);
  const minGap = lerp(260, 160, h);
  const reactionDistance = lerp(420, 260, h);
  const avoidPlayerLane = h < 0.7;

  for (let lane = 0; lane < LANE_COUNT; lane++) {
    if (avoidPlayerLane && lane === playerLane) {
      const distToPlayer = Math.abs(spawnY - playerY);
      if (distToPlayer < reactionDistance) continue;
    }
    let blocked = false;
    for (const other of traffic) {
      if (other.lane !== lane) continue;
      if (Math.abs(other.y - spawnY) < minGap) {
        blocked = true;
        break;
      }
    }
    if (!blocked) openLanes.push(lane);
  }

  return openLanes;
};

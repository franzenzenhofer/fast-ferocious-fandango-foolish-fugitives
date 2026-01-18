import {
  ROAD_WIDTH,
  LANE_COUNT,
  LANE_WIDTH,
  ROAD_LEFT,
  ROAD_RIGHT,
  BARRIER_WIDTH,
} from './config/constants.ts';

export {
  ROAD_WIDTH,
  LANE_COUNT,
  LANE_WIDTH,
  ROAD_LEFT,
  ROAD_RIGHT,
  BARRIER_WIDTH,
};

export const getLaneX = (lane: number): number =>
  ROAD_LEFT + LANE_WIDTH * (lane + 0.5);

export const fx_drawRoad = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scrollY: number
): void => {
  const centerX = width / 2;

  // Grass
  ctx.fillStyle = '#1a5f1a';
  ctx.fillRect(0, 0, centerX + ROAD_LEFT - 10, height);
  ctx.fillRect(centerX + ROAD_RIGHT + 10, 0, width, height);

  // Dirt shoulder
  ctx.fillStyle = '#8b7355';
  ctx.fillRect(centerX + ROAD_LEFT - 10, 0, 10, height);
  ctx.fillRect(centerX + ROAD_RIGHT, 0, 10, height);

  // Road
  ctx.fillStyle = '#333';
  ctx.fillRect(centerX + ROAD_LEFT, 0, ROAD_WIDTH, height);

  // Barriers
  ctx.fillStyle = '#888';
  ctx.fillRect(centerX + ROAD_LEFT - BARRIER_WIDTH, 0, BARRIER_WIDTH, height);
  ctx.fillRect(centerX + ROAD_RIGHT, 0, BARRIER_WIDTH, height);

  // Lane markers
  const dashLength = 30;
  const gapLength = 20;
  const offset = scrollY % (dashLength + gapLength);

  ctx.fillStyle = '#fff';
  for (let lane = 1; lane < LANE_COUNT; lane++) {
    const x = centerX + ROAD_LEFT + lane * LANE_WIDTH - 1;
    for (let y = -offset; y < height + dashLength; y += dashLength + gapLength) {
      ctx.fillRect(x, y, 2, dashLength);
    }
  }

  // Center line (double yellow)
  const centerLaneX = centerX;
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(centerLaneX - 3, 0, 2, height);
  ctx.fillRect(centerLaneX + 1, 0, 2, height);
};

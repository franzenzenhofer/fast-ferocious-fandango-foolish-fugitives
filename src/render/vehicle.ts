import { VEHICLE_CONFIGS } from '../game/vehicles';
import { shadeColor } from '../utils/math';
import type { Vehicle } from '../types';
import { drawWreckedBody, drawNormalBody, drawDamageScratches } from './vehicle-body';

/**
 * Calculate shadow alpha based on vehicle speed - prevents ghosting on fast vehicles.
 */
export const calcShadowAlpha = (speed: number, isWrecked: boolean): number => {
  const shadowFade = Math.max(0, 1 - speed / 12);
  const baseAlpha = isWrecked ? 0.38 : 0.2;
  return baseAlpha * shadowFade;
};

export const drawVehicle = (
  ctx: CanvasRenderingContext2D,
  v: Vehicle,
  screenX: number,
  screenY: number,
  angle: number
): void => {
  const config = VEHICLE_CONFIGS[v.type];
  const hw = config.width / 2;
  const hh = config.height / 2;
  const bodyW = config.width;
  const bodyH = config.height;

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(angle);

  // Shadow - fade based on speed to prevent ghosting on fast-moving vehicles
  const speed = Math.sqrt(v.body.velocity.x ** 2 + v.body.velocity.y ** 2);
  const shadowAlpha = calcShadowAlpha(speed, v.isWrecked);

  if (shadowAlpha > 0.03) {
    const shadowOffsetX = v.isWrecked ? 3 : 2;
    const shadowOffsetY = v.isWrecked ? 4 : 3;
    ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
    ctx.fillRect(-hw + shadowOffsetX, -hh + shadowOffsetY, bodyW, bodyH);
  }

  if (v.isWrecked) {
    drawWreckedBody(ctx, hw, hh, config.width, config.height);
  } else {
    const colors = {
      base: config.color,
      accent: config.accent,
      dark: shadeColor(config.color, -40),
      mid: shadeColor(config.color, -15),
      light: shadeColor(config.color, 35),
      glass: '#1f2a33',
      trim: '#101010',
    };
    drawNormalBody(ctx, v, hw, hh, bodyW, bodyH, colors);
  }

  if (v.hits > 0 && v.type !== 'player') {
    drawDamageScratches(ctx, v.hits, hw, hh, config.width, config.height);
  }

  ctx.restore();
};

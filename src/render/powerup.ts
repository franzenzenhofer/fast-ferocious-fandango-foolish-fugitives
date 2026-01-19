import { clamp01 } from '../utils/math';
import type { PowerUp } from '../types';

export const drawPowerUp = (
  ctx: CanvasRenderingContext2D,
  powerUp: PowerUp,
  screenX: number,
  screenY: number
): void => {
  const alpha = clamp01(powerUp.ttl / 1.2);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(screenX, screenY);

  // Background box
  ctx.fillStyle = '#111';
  ctx.fillRect(-10, -10, 20, 20);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(-10, -10, 20, 20);

  if (powerUp.type === 'repair') {
    drawRepairIcon(ctx);
  } else if (powerUp.type === 'shield') {
    drawShieldIcon(ctx);
  } else {
    drawTurboIcon(ctx);
  }

  ctx.restore();
};

const drawRepairIcon = (ctx: CanvasRenderingContext2D): void => {
  ctx.fillStyle = '#3df27a';
  ctx.fillRect(-3, -8, 6, 16);
  ctx.fillRect(-8, -3, 16, 6);
};

const drawShieldIcon = (ctx: CanvasRenderingContext2D): void => {
  ctx.fillStyle = '#46d9ff';
  ctx.beginPath();
  ctx.arc(0, -2, 7, Math.PI, 0);
  ctx.lineTo(6, 6);
  ctx.lineTo(-6, 6);
  ctx.closePath();
  ctx.fill();
};

const drawTurboIcon = (ctx: CanvasRenderingContext2D): void => {
  ctx.fillStyle = '#ffd447';
  ctx.fillRect(-2, -8, 4, 6);
  ctx.fillRect(-4, -2, 6, 6);
  ctx.fillRect(0, 2, 4, 6);
};

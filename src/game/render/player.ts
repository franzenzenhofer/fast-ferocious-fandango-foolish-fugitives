import { PLAYER_CAR } from '../config/vehicles.ts';

export const fx_drawPlayer = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  damage: number,
  boosting: boolean,
  shielded: boolean
): void => {
  const { width, height, color, accentColor } = PLAYER_CAR;
  const hw = width / 2;
  const hh = height / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Shield glow
  if (shielded) {
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(-hw + 4, -hh + 4, width, height);

  // RAM BAR (front reinforcement)
  ctx.fillStyle = '#444';
  ctx.fillRect(-hw - 2, -hh - 4, width + 4, 8);
  ctx.fillStyle = accentColor;
  ctx.fillRect(-hw, -hh - 2, width, 4);

  // Main body
  ctx.fillStyle = color;
  ctx.fillRect(-hw, -hh, width, height);

  // Roof (darker)
  ctx.fillStyle = '#a01830';
  ctx.fillRect(-hw + 5, -hh + height * 0.3, width - 10, height * 0.3);

  // Windshield
  ctx.fillStyle = '#224466';
  ctx.fillRect(-hw + 6, -hh + 8, width - 12, 12);

  // Racing stripes
  ctx.fillStyle = accentColor;
  ctx.fillRect(-4, -hh + 8, 3, height - 16);
  ctx.fillRect(1, -hh + 8, 3, height - 16);

  // Headlights
  ctx.fillStyle = '#ffffcc';
  ctx.fillRect(-hw + 2, -hh, 6, 4);
  ctx.fillRect(hw - 8, -hh, 6, 4);

  // Boost flames
  if (boosting) {
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(-6, hh, 5, 12);
    ctx.fillRect(1, hh, 5, 12);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(-4, hh + 2, 3, 8);
    ctx.fillRect(2, hh + 2, 3, 8);
  }

  // Damage
  if (damage > 0.5) {
    ctx.fillStyle = '#222';
    ctx.fillRect(-hw + 2, -hh + height * 0.4, 3, 15);
    ctx.fillRect(hw - 5, -hh + height * 0.6, 3, 10);
  }

  ctx.restore();
};

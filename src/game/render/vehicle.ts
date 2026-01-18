import type { VehicleStats } from '../config/vehicles.ts';

export const fx_drawVehicle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  stats: VehicleStats,
  damage: number
): void => {
  const { width, height, color, accentColor } = stats;
  const hw = width / 2;
  const hh = height / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(-hw + 3, -hh + 3, width, height);

  // Main body
  ctx.fillStyle = color;
  ctx.fillRect(-hw, -hh, width, height);

  // Roof
  ctx.fillStyle = shadeColor(color, -20);
  ctx.fillRect(-hw + 4, -hh + height * 0.25, width - 8, height * 0.35);

  // Windshield
  ctx.fillStyle = '#334455';
  ctx.fillRect(-hw + 5, -hh + 6, width - 10, height * 0.2);

  // Rear window
  ctx.fillStyle = '#334455';
  ctx.fillRect(-hw + 5, hh - height * 0.25, width - 10, height * 0.15);

  // Headlights
  ctx.fillStyle = '#ffee88';
  ctx.fillRect(-hw + 3, -hh + 1, 5, 3);
  ctx.fillRect(hw - 8, -hh + 1, 5, 3);

  // Taillights
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(-hw + 3, hh - 4, 5, 3);
  ctx.fillRect(hw - 8, hh - 4, 5, 3);

  // Accent stripe
  ctx.fillStyle = accentColor;
  ctx.fillRect(-hw, -2, width, 4);

  // Damage cracks
  if (damage > 0.3) {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-hw + 5, -hh + 10);
    ctx.lineTo(0, 0);
    ctx.lineTo(hw - 5, hh - 10);
    ctx.stroke();
  }

  ctx.restore();
};

const shadeColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

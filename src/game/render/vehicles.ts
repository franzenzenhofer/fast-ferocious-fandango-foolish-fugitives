import type { Vehicle, VehicleType } from '../vehicles.ts';
import { VEHICLE_CONFIGS } from '../vehicles.ts';

export const fx_drawVehicle = (
  ctx: CanvasRenderingContext2D,
  vehicle: Vehicle,
  screenX: number,
  screenY: number,
  isPlayer: boolean,
  boosting: boolean
): void => {
  const config = VEHICLE_CONFIGS[vehicle.type];
  const { body } = vehicle;
  const angle = body.angle;
  const damage = 1 - vehicle.integrity / 100;

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(angle);

  const hw = config.width / 2;
  const hh = config.height / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(-hw + 3, -hh + 3, config.width, config.height);

  // Ram bar for player
  if (isPlayer) {
    ctx.fillStyle = '#444';
    ctx.fillRect(-hw - 2, -hh - 5, config.width + 4, 8);
    ctx.fillStyle = config.accent;
    ctx.fillRect(-hw, -hh - 3, config.width, 4);
  }

  // Main body
  ctx.fillStyle = config.color;
  ctx.fillRect(-hw, -hh, config.width, config.height);

  // Roof
  ctx.fillStyle = shadeColor(config.color, -25);
  ctx.fillRect(-hw + 4, -hh + config.height * 0.28, config.width - 8, config.height * 0.32);

  // Windshield
  ctx.fillStyle = '#2a3a4a';
  ctx.fillRect(-hw + 5, -hh + 6, config.width - 10, config.height * 0.18);

  // Headlights
  ctx.fillStyle = '#ffee88';
  ctx.fillRect(-hw + 2, -hh + 1, 5, 3);
  ctx.fillRect(hw - 7, -hh + 1, 5, 3);

  // Taillights
  ctx.fillStyle = '#cc2222';
  ctx.fillRect(-hw + 2, hh - 4, 5, 3);
  ctx.fillRect(hw - 7, hh - 4, 5, 3);

  // Type-specific details
  drawVehicleDetails(ctx, vehicle.type, hw, hh, config);

  // Boost flames
  if (isPlayer && boosting) {
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(-6, hh, 5, 14);
    ctx.fillRect(1, hh, 5, 14);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(-4, hh + 3, 3, 8);
    ctx.fillRect(2, hh + 3, 3, 8);
  }

  // Damage cracks
  if (damage > 0.3) {
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-hw + 4, -hh + 12);
    ctx.lineTo(2, hh * 0.3);
    ctx.lineTo(hw - 6, hh - 8);
    ctx.stroke();
  }

  ctx.restore();
};

const drawVehicleDetails = (
  ctx: CanvasRenderingContext2D,
  type: VehicleType,
  hw: number,
  hh: number,
  config: { accent: string; width: number; height: number }
): void => {
  if (type === 'police') {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-6, -hh + config.height * 0.35, 4, 4);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(2, -hh + config.height * 0.35, 4, 4);
  } else if (type === 'geldtransporter') {
    ctx.fillStyle = config.accent;
    ctx.fillRect(-hw + 3, -hh + config.height * 0.5, config.width - 6, 8);
    ctx.fillStyle = '#111';
    ctx.font = '8px monospace';
    ctx.fillText('$$$', -8, -hh + config.height * 0.57);
  } else if (type === 'ambulance') {
    ctx.fillStyle = config.accent;
    ctx.fillRect(-4, -hh + 12, 8, 3);
    ctx.fillRect(-1, -hh + 9, 3, 9);
  } else if (type === 'player') {
    ctx.fillStyle = config.accent;
    ctx.fillRect(-3, -hh + 8, 2, config.height - 16);
    ctx.fillRect(1, -hh + 8, 2, config.height - 16);
  }
};

const shadeColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

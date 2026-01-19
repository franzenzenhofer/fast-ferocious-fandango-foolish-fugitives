import { shadeColor } from '../utils/math';
import type { Vehicle } from '../types';

export const drawWreckedBody = (
  ctx: CanvasRenderingContext2D,
  hw: number,
  hh: number,
  width: number,
  height: number
): void => {
  ctx.fillStyle = '#111';
  ctx.fillRect(-hw, -hh, width, height);
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 3;
  ctx.strokeRect(-hw, -hh, width, height);
  ctx.fillStyle = '#ff4400';
  ctx.fillRect(-hw + 2, -hh + 2, 8, 6);
  ctx.fillRect(hw - 10, -hh + 8, 8, 6);
  ctx.fillStyle = '#ffaa00';
  ctx.fillRect(-hw + 4, -hh + 4, 4, 4);
  ctx.fillRect(hw - 8, -hh + 10, 4, 4);
  ctx.fillStyle = 'rgba(80,80,80,0.7)';
  ctx.beginPath();
  ctx.arc(0, -hh - 8, 10, 0, Math.PI * 2);
  ctx.fill();
};

export const drawDamageScratches = (
  ctx: CanvasRenderingContext2D,
  hits: number,
  hw: number,
  hh: number,
  width: number,
  height: number
): void => {
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i < hits; i++) {
    const sx = -hw + ((i * 13 + 5) % width);
    const sy = -hh + ((i * 17 + 8) % height);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 8, sy + 6);
    ctx.stroke();
  }
};

interface BodyColors {
  base: string;
  accent: string;
  dark: string;
  mid: string;
  light: string;
  glass: string;
  trim: string;
}

export const drawNormalBody = (
  ctx: CanvasRenderingContext2D,
  v: Vehicle,
  hw: number,
  hh: number,
  bodyW: number,
  bodyH: number,
  colors: BodyColors
): void => {
  const { base, accent, dark, mid, light, glass, trim } = colors;

  // Outer shell and body
  ctx.fillStyle = dark;
  ctx.fillRect(-hw - 1, -hh - 1, bodyW + 2, bodyH + 2);
  ctx.fillStyle = base;
  ctx.fillRect(-hw, -hh, bodyW, bodyH);
  ctx.fillStyle = mid;
  ctx.fillRect(-hw + 2, -hh + 2, bodyW - 4, bodyH - 4);

  // Roof and windows
  const roofW = Math.max(10, bodyW * 0.58);
  const roofH = Math.max(14, bodyH * 0.5);
  ctx.fillStyle = light;
  ctx.fillRect(-roofW / 2, -roofH / 2, roofW, roofH);
  ctx.fillStyle = glass;
  ctx.fillRect(-roofW / 2 + 2, -roofH / 2 + 2, roofW - 4, roofH * 0.34);
  ctx.fillRect(-roofW / 2 + 2, roofH / 2 - roofH * 0.34 - 2, roofW - 4, roofH * 0.34);

  // Side stripe
  ctx.fillStyle = accent;
  ctx.fillRect(-hw + 3, -hh + bodyH * 0.35, bodyW - 6, 4);

  // Bumpers
  ctx.fillStyle = trim;
  ctx.fillRect(-hw + 3, -hh + 1, bodyW - 6, 3);
  ctx.fillRect(-hw + 3, hh - 4, bodyW - 6, 3);

  // Wheels
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(-hw - 2, -hh + 6, 4, 10);
  ctx.fillRect(-hw - 2, hh - 16, 4, 10);
  ctx.fillRect(hw - 2, -hh + 6, 4, 10);
  ctx.fillRect(hw - 2, hh - 16, 4, 10);

  drawTypeSpecificDetails(ctx, v, hw, hh, bodyW, bodyH, base, accent);

  // Lights
  ctx.fillStyle = '#ffee88';
  ctx.fillRect(-hw + 2, -hh + 1, 5, 3);
  ctx.fillRect(hw - 7, -hh + 1, 5, 3);
  ctx.fillStyle = '#cc2222';
  ctx.fillRect(-hw + 2, hh - 4, 5, 3);
  ctx.fillRect(hw - 7, hh - 4, 5, 3);
};

const drawTypeSpecificDetails = (
  ctx: CanvasRenderingContext2D,
  v: Vehicle,
  hw: number,
  hh: number,
  bodyW: number,
  bodyH: number,
  base: string,
  accent: string
): void => {
  if (v.type === 'sports') {
    ctx.fillStyle = shadeColor(accent, -10);
    ctx.fillRect(-3, -hh + 4, 6, bodyH - 8);
    ctx.fillStyle = shadeColor(accent, 20);
    ctx.fillRect(-10, -hh + 8, 3, bodyH - 16);
    ctx.fillRect(7, -hh + 8, 3, bodyH - 16);
  }

  if (v.type === 'truck' || v.type === 'geldtransporter') {
    ctx.fillStyle = shadeColor(base, -55);
    ctx.fillRect(-hw + 2, -hh + 6, bodyW - 4, bodyH * 0.32);
    ctx.fillStyle = shadeColor(base, 15);
    ctx.fillRect(-hw + 4, -hh + 8, bodyW - 8, bodyH * 0.18);
  }

  if (v.type === 'police') {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-hw + 2, -hh + 4, bodyW - 4, bodyH * 0.28);
    ctx.fillStyle = '#222';
    ctx.fillRect(-hw + 2, -hh + 4 + bodyH * 0.28, bodyW - 4, bodyH * 0.18);
    ctx.fillStyle = '#111';
    ctx.fillRect(-8, -hh + 7, 16, 6);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-7, -hh + 8, 7, 4);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(0, -hh + 8, 7, 4);
  }

  if (v.type === 'geldtransporter') {
    ctx.fillStyle = '#d9b11f';
    ctx.fillRect(-hw + 4, -hh + bodyH * 0.45, bodyW - 8, 6);
    ctx.fillRect(-hw + 4, -hh + bodyH * 0.62, bodyW - 8, 6);
  }

  if (v.type === 'player') {
    ctx.fillStyle = shadeColor(accent, 20);
    ctx.fillRect(-3, -hh + 5, 6, bodyH - 10);
    // Ram bar
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(-hw - 2, -hh - 6, bodyW + 4, 8);
    ctx.fillStyle = accent;
    ctx.fillRect(-hw, -hh - 4, bodyW, 4);
  }
};

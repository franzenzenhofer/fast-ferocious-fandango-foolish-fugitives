import { clamp01 } from '../utils/math';
import { formatTime } from '../utils/math';
import { BOOST_MAX, MAX_SPEED, SHIELD_DURATION } from '../config/physics';
import type { GameState, ThrottleState } from '../types';

export const getIntegrityColor = (integrity: number): string =>
  integrity > 50 ? '#2ecc71' : integrity > 25 ? '#f39c12' : '#e74c3c';

export const getBoostColor = (active: boolean, ready: boolean): string =>
  active ? '#ffd447' : ready ? '#3df27a' : '#00bfff';

export const getThrottleColor = (state: ThrottleState): string =>
  state === 'brake' ? '#e74c3c' : state === 'accel' ? '#3df27a' : '#f39c12';

export const drawStar = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number
): void => {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
};

export const drawHUD = (ctx: CanvasRenderingContext2D, state: GameState, w: number): void => {
  drawIntegrityBar(ctx, state);
  drawBoostBar(ctx, state);
  if (state.playerShieldTimer > 0) drawShieldBar(ctx, state);
  drawSpeedBar(ctx, state);
  drawCashDisplay(ctx, state, w);
  drawStars(ctx, state, w);
  drawHeatMeter(ctx, state, w);
  ctx.textAlign = 'left';
};

const drawIntegrityBar = (ctx: CanvasRenderingContext2D, state: GameState): void => {
  ctx.fillStyle = '#222';
  ctx.fillRect(18, 18, 204, 28);
  ctx.fillStyle = '#444';
  ctx.fillRect(20, 20, 200, 24);
  ctx.fillStyle = getIntegrityColor(state.player.integrity);
  ctx.fillRect(20, 20, 200 * Math.max(0, state.player.integrity / 100), 24);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`${state.player.integrity.toFixed(0)}%`, 25, 38);
};

const drawBoostBar = (ctx: CanvasRenderingContext2D, state: GameState): void => {
  const boostActive = state.boostActiveTimer > 0;
  const boostReady = state.boost >= BOOST_MAX - 0.1;
  const boostColor = getBoostColor(boostActive, boostReady);
  ctx.fillStyle = '#222';
  ctx.fillRect(18, 52, 124, 16);
  ctx.fillStyle = '#333';
  ctx.fillRect(20, 54, 120, 12);
  ctx.fillStyle = boostColor;
  ctx.fillRect(20, 54, 120 * (state.boost / BOOST_MAX), 12);
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = boostColor;
  ctx.fillText(boostActive ? 'BOOST' : boostReady ? 'READY' : 'CHARGE', 148, 63);
};

const drawShieldBar = (ctx: CanvasRenderingContext2D, state: GameState): void => {
  const shieldWidth = 120;
  const shieldPct = clamp01(state.playerShieldTimer / SHIELD_DURATION);
  ctx.fillStyle = '#222';
  ctx.fillRect(18, 72, shieldWidth + 4, 10);
  ctx.fillStyle = '#333';
  ctx.fillRect(20, 74, shieldWidth, 6);
  ctx.fillStyle = '#46d9ff';
  ctx.fillRect(20, 74, shieldWidth * shieldPct, 6);
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#46d9ff';
  ctx.fillText(`SHIELD ${Math.ceil(state.playerShieldTimer)}s`, 148, 81);
};

const drawSpeedBar = (ctx: CanvasRenderingContext2D, state: GameState): void => {
  const speedY = state.playerShieldTimer > 0 ? 88 : 72;
  const speed = Math.abs(state.player.body.velocity.y);
  const speedPct = clamp01(speed / MAX_SPEED);
  const throttleColor = getThrottleColor(state.throttleState);
  ctx.fillStyle = '#222';
  ctx.fillRect(18, speedY, 124, 14);
  ctx.fillStyle = '#333';
  ctx.fillRect(20, speedY + 2, 120, 10);
  ctx.fillStyle = throttleColor;
  ctx.fillRect(20, speedY + 2, 120 * speedPct, 10);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(state.throttleState.toUpperCase(), 24, speedY + 11);
  ctx.fillText(`SPD ${Math.round(speed * 10)}`, 148, speedY + 11);
};

const drawCashDisplay = (ctx: CanvasRenderingContext2D, state: GameState, w: number): void => {
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`$${state.cash.toLocaleString()}`, w - 20, 42);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`RUN ${formatTime(state.elapsedTime)}`, w - 20, 62);
};

const drawStars = (ctx: CanvasRenderingContext2D, state: GameState, w: number): void => {
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < state.stars ? '#f1c40f' : '#333';
    drawStar(ctx, w - 30 - i * 30, 65, 12, 6, 5);
  }
};

const drawHeatMeter = (ctx: CanvasRenderingContext2D, state: GameState, w: number): void => {
  const heatColor = state.heat < 0.33 ? '#2ecc71' : state.heat < 0.66 ? '#f39c12' : '#e74c3c';
  const heatWidth = 140;
  const heatX = w - 20 - heatWidth;
  const heatY = 86;
  ctx.fillStyle = '#222';
  ctx.fillRect(heatX - 2, heatY - 2, heatWidth + 4, 14);
  ctx.fillStyle = '#333';
  ctx.fillRect(heatX, heatY, heatWidth, 10);
  ctx.fillStyle = heatColor;
  ctx.fillRect(heatX, heatY, heatWidth * clamp01(state.heat), 10);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`HEAT ${Math.round(state.heat * 100)}%`, w - 20, heatY + 10);
};

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Matter from 'matter-js';
import { drawHUD, drawStar, getIntegrityColor, getBoostColor, getThrottleColor } from './hud';
import type { GameState, Vehicle } from '../types';

interface MockContext {
  fillStyle: string;
  strokeStyle: string;
  font: string;
  textAlign: string;
  fillRect: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
}

const createMockContext = (): MockContext => ({
  fillStyle: '',
  strokeStyle: '',
  font: '',
  textAlign: 'left',
  fillRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
});

const createMockPlayer = (): Vehicle => {
  const body = Matter.Bodies.rectangle(100, 100, 24, 44);
  Matter.Body.setVelocity(body, { x: 0, y: -10 });
  return {
    id: 0, type: 'player', body, integrity: 75, lane: 2, hits: 0, spawnTime: 0,
    prevPosition: { x: 100, y: 100 }, prevAngle: 0, policeMode: 'shadow',
    policeModeTimer: 0, ramCooldown: 0, spawnGraceTimer: 0, sidePreference: 0,
    aiMode: 'lane', targetLane: 2, laneChangeTimer: 0, isChasing: false,
    stunTimer: 0, targetSpeed: -10, isPursuer: false, isWrecked: false,
  };
};

const createMockState = (overrides: Partial<GameState> = {}): GameState => ({
  engine: Matter.Engine.create(),
  player: createMockPlayer(),
  traffic: [], powerUps: [],
  barriers: { left: Matter.Bodies.rectangle(0, 0, 10, 100), right: Matter.Bodies.rectangle(0, 0, 10, 100) },
  cash: 5000, seed: 123, heat: 0.5, stars: 3,
  lastCollisionTime: 0, lastBarrierDamageTime: 0, playerIFrameTimer: 0,
  lastHeatGainTime: 0, alertText: '', alertColor: '', alertTimer: 0,
  alertDirection: 'generic', pickupText: '', pickupColor: '', pickupTimer: 0,
  controlHintTimer: 0, hitFlash: 0, boost: 50, boostActiveTimer: 0,
  boostRechargeDelay: 0, throttleState: 'coast', hadTouch: false,
  playerShieldTimer: 0, powerUpSpawnTimer: 0, scrollY: 0, spawnTimer: 0,
  pursuerSpawnTimer: 0, busted: false, bustedTimer: 0, demoMode: false,
  frameCount: 0, activeCollisions: new Set(), elapsedTime: 120, screenShake: 0, slowMo: 0,
  ...overrides,
});

describe('getIntegrityColor', () => {
  it('returns green for high integrity', () => {
    expect(getIntegrityColor(75)).toBe('#2ecc71');
  });
  it('returns orange for medium integrity', () => {
    expect(getIntegrityColor(35)).toBe('#f39c12');
  });
  it('returns red for low integrity', () => {
    expect(getIntegrityColor(20)).toBe('#e74c3c');
  });
});

describe('getBoostColor', () => {
  it('returns yellow when active', () => {
    expect(getBoostColor(true, false)).toBe('#ffd447');
  });
  it('returns green when ready', () => {
    expect(getBoostColor(false, true)).toBe('#3df27a');
  });
  it('returns blue when charging', () => {
    expect(getBoostColor(false, false)).toBe('#00bfff');
  });
});

describe('getThrottleColor', () => {
  it('returns red for brake', () => {
    expect(getThrottleColor('brake')).toBe('#e74c3c');
  });
  it('returns green for accel', () => {
    expect(getThrottleColor('accel')).toBe('#3df27a');
  });
  it('returns orange for coast', () => {
    expect(getThrottleColor('coast')).toBe('#f39c12');
  });
});

describe('drawStar', () => {
  let ctx: MockContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('draws a star with correct number of points', () => {
    drawStar(ctx as unknown as CanvasRenderingContext2D, 100, 100, 12, 6, 5);
    expect(ctx.beginPath).toHaveBeenCalledOnce();
    expect(ctx.closePath).toHaveBeenCalledOnce();
    expect(ctx.fill).toHaveBeenCalledOnce();
    expect(ctx.moveTo).toHaveBeenCalledOnce();
    expect(ctx.lineTo).toHaveBeenCalledTimes(9); // 5*2 - 1 = 9 lineTo calls
  });
});

describe('drawHUD', () => {
  let ctx: MockContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('draws integrity bar', () => {
    const state = createMockState();
    drawHUD(ctx as unknown as CanvasRenderingContext2D, state, 400);
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('draws cash display', () => {
    const state = createMockState({ cash: 12345 });
    drawHUD(ctx as unknown as CanvasRenderingContext2D, state, 400);
    expect(ctx.fillText).toHaveBeenCalled();
  });

  it('draws stars', () => {
    const state = createMockState({ stars: 4 });
    drawHUD(ctx as unknown as CanvasRenderingContext2D, state, 400);
    expect(ctx.beginPath).toHaveBeenCalled();
  });

  it('draws shield bar when shield active', () => {
    const state = createMockState({ playerShieldTimer: 3.0 });
    drawHUD(ctx as unknown as CanvasRenderingContext2D, state, 400);
    // Shield section adds extra fillRect calls
    const fillRectCalls = ctx.fillRect.mock.calls.length;
    expect(fillRectCalls).toBeGreaterThan(10);
  });
});

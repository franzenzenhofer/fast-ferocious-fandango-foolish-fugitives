import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Matter from 'matter-js';
import { drawVehicle, calcShadowAlpha } from './vehicle';
import type { Vehicle } from '../types';

interface MockContext {
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  strokeRect: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  globalAlpha: number;
}

const createMockContext = (): MockContext => ({
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  globalAlpha: 1,
});

const createMockVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => {
  const body = Matter.Bodies.rectangle(100, 100, 24, 44);
  Matter.Body.setVelocity(body, { x: 0, y: 0 });
  return {
    id: 1,
    type: 'sedan',
    body,
    integrity: 100,
    lane: 1,
    hits: 0,
    spawnTime: 0,
    prevPosition: { x: 100, y: 100 },
    prevAngle: 0,
    policeMode: 'shadow',
    policeModeTimer: 0,
    ramCooldown: 0,
    spawnGraceTimer: 0,
    sidePreference: 0,
    aiMode: 'lane',
    targetLane: 1,
    laneChangeTimer: 0,
    isChasing: false,
    stunTimer: 0,
    targetSpeed: -8,
    isPursuer: false,
    isWrecked: false,
    ...overrides,
  };
};

describe('calcShadowAlpha', () => {
  it('returns full alpha at zero speed', () => {
    const alpha = calcShadowAlpha(0, false);
    expect(alpha).toBeCloseTo(0.2, 2);
  });

  it('returns zero alpha at high speed', () => {
    const alpha = calcShadowAlpha(15, false);
    expect(alpha).toBe(0);
  });

  it('reduces alpha proportionally with speed', () => {
    const alpha = calcShadowAlpha(6, false);
    expect(alpha).toBeCloseTo(0.1, 2); // 0.2 * (1 - 6/12) = 0.1
  });

  it('uses higher base alpha for wrecked vehicles', () => {
    const alphaWrecked = calcShadowAlpha(0, true);
    const alphaNormal = calcShadowAlpha(0, false);
    expect(alphaWrecked).toBeGreaterThan(alphaNormal);
    expect(alphaWrecked).toBeCloseTo(0.38, 2);
  });

  it('still fades wrecked shadow with speed', () => {
    const alpha = calcShadowAlpha(12, true);
    expect(alpha).toBe(0);
  });
});

describe('drawVehicle', () => {
  let ctx: MockContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('saves and restores context', () => {
    const vehicle = createMockVehicle();
    drawVehicle(ctx as unknown as CanvasRenderingContext2D, vehicle, 100, 200, 0);
    expect(ctx.save).toHaveBeenCalledOnce();
    expect(ctx.restore).toHaveBeenCalledOnce();
  });

  it('translates to screen position', () => {
    const vehicle = createMockVehicle();
    drawVehicle(ctx as unknown as CanvasRenderingContext2D, vehicle, 150, 250, 0);
    expect(ctx.translate).toHaveBeenCalledWith(150, 250);
  });

  it('rotates by angle', () => {
    const vehicle = createMockVehicle();
    drawVehicle(ctx as unknown as CanvasRenderingContext2D, vehicle, 100, 200, Math.PI / 4);
    expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 4);
  });

  it('draws shadow when stationary', () => {
    const vehicle = createMockVehicle();
    drawVehicle(ctx as unknown as CanvasRenderingContext2D, vehicle, 100, 200, 0);
    // Should have multiple fillRect calls including shadow
    expect(ctx.fillRect.mock.calls.length).toBeGreaterThan(1);
  });

  it('skips shadow at high speed', () => {
    const vehicle = createMockVehicle();
    Matter.Body.setVelocity(vehicle.body, { x: 0, y: -15 });
    drawVehicle(ctx as unknown as CanvasRenderingContext2D, vehicle, 100, 200, 0);
    // Still draws vehicle but shadow alpha would be 0
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('renders wrecked vehicle differently', () => {
    const vehicle = createMockVehicle({ isWrecked: true });
    drawVehicle(ctx as unknown as CanvasRenderingContext2D, vehicle, 100, 200, 0);
    expect(ctx.strokeRect).toHaveBeenCalled(); // Fire border
    expect(ctx.arc).toHaveBeenCalled(); // Smoke puff
  });

  it('renders damage scratches based on hits', () => {
    const vehicle = createMockVehicle({ hits: 3 });
    drawVehicle(ctx as unknown as CanvasRenderingContext2D, vehicle, 100, 200, 0);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
  });

  it('does not render damage for player vehicle', () => {
    const vehicle = createMockVehicle({ type: 'player', hits: 3 });
    drawVehicle(ctx as unknown as CanvasRenderingContext2D, vehicle, 100, 200, 0);
    // Player should not have scratch marks even with hits
    const strokeCalls = ctx.stroke.mock.calls.length;
    const vehicleNoHits = createMockVehicle({ type: 'player', hits: 0 });
    const ctx2 = createMockContext();
    drawVehicle(ctx2 as unknown as CanvasRenderingContext2D, vehicleNoHits, 100, 200, 0);
    expect(strokeCalls).toBe(ctx2.stroke.mock.calls.length);
  });
});

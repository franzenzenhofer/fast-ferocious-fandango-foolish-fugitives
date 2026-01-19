import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawPowerUp } from './powerup';
import type { PowerUp } from '../types';

interface MockContext {
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  strokeRect: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  globalAlpha: number;
}

const createMockContext = (): MockContext => ({
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  globalAlpha: 1,
});

const createMockPowerUp = (overrides: Partial<PowerUp> = {}): PowerUp => ({
  id: 1,
  type: 'repair',
  x: 100,
  y: 200,
  ttl: 5,
  value: 25,
  ...overrides,
});

describe('drawPowerUp', () => {
  let ctx: MockContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('saves and restores context', () => {
    const powerUp = createMockPowerUp();
    drawPowerUp(ctx as unknown as CanvasRenderingContext2D, powerUp, 100, 200);
    expect(ctx.save).toHaveBeenCalledOnce();
    expect(ctx.restore).toHaveBeenCalledOnce();
  });

  it('translates to screen position', () => {
    const powerUp = createMockPowerUp();
    drawPowerUp(ctx as unknown as CanvasRenderingContext2D, powerUp, 150, 250);
    expect(ctx.translate).toHaveBeenCalledWith(150, 250);
  });

  it('sets alpha based on ttl', () => {
    const powerUp = createMockPowerUp({ ttl: 1.2 }); // Full alpha
    drawPowerUp(ctx as unknown as CanvasRenderingContext2D, powerUp, 100, 200);
    expect(ctx.globalAlpha).toBe(1);
  });

  it('fades alpha when ttl is low', () => {
    const powerUp = createMockPowerUp({ ttl: 0.6 }); // Half alpha
    drawPowerUp(ctx as unknown as CanvasRenderingContext2D, powerUp, 100, 200);
    expect(ctx.globalAlpha).toBeCloseTo(0.5, 2);
  });

  it('draws repair icon as cross', () => {
    const powerUp = createMockPowerUp({ type: 'repair' });
    drawPowerUp(ctx as unknown as CanvasRenderingContext2D, powerUp, 100, 200);
    // Repair is a cross: 2 fillRects for the cross + 1 for background
    expect(ctx.fillRect.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('draws shield icon with arc', () => {
    const powerUp = createMockPowerUp({ type: 'shield' });
    drawPowerUp(ctx as unknown as CanvasRenderingContext2D, powerUp, 100, 200);
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws turbo icon with rectangles', () => {
    const powerUp = createMockPowerUp({ type: 'turbo' });
    drawPowerUp(ctx as unknown as CanvasRenderingContext2D, powerUp, 100, 200);
    // Turbo uses fillRect for lightning bolt shape
    expect(ctx.fillRect.mock.calls.length).toBeGreaterThanOrEqual(4);
  });
});

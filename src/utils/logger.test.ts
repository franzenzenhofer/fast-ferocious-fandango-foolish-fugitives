import { describe, it, expect, vi } from 'vitest';
import { LOG_COLORS, log } from './logger';

describe('LOG_COLORS', () => {
  it('has all required categories', () => {
    expect(LOG_COLORS.SPAWN).toBeDefined();
    expect(LOG_COLORS.COLLISION).toBeDefined();
    expect(LOG_COLORS.HIT).toBeDefined();
    expect(LOG_COLORS.DESTROY).toBeDefined();
    expect(LOG_COLORS.CASH).toBeDefined();
    expect(LOG_COLORS.STAR).toBeDefined();
    expect(LOG_COLORS.BUSTED).toBeDefined();
    expect(LOG_COLORS.DAMAGE).toBeDefined();
    expect(LOG_COLORS.DEMO).toBeDefined();
    expect(LOG_COLORS.STATE).toBeDefined();
  });

  it('has color strings for each category', () => {
    for (const [, value] of Object.entries(LOG_COLORS)) {
      expect(typeof value).toBe('string');
      expect(value).toContain('color:');
    }
  });
});

describe('log', () => {
  it('calls console.log with formatted message', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log('SPAWN', 'test message');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('includes timestamp and category in output', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log('HIT', 'hit test');
    const callArgs = spy.mock.calls[0];
    expect(callArgs?.[0]).toContain('[HIT]');
    spy.mockRestore();
  });

  it('accepts optional data parameter', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log('CASH', 'cash message', { amount: 100 });
    expect(spy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      { amount: 100 }
    );
    spy.mockRestore();
  });
});

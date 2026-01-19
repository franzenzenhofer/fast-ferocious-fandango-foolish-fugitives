import { describe, it, expect } from 'vitest';
import {
  PLAYER_TRACTION,
  AI_TRACTION,
  STUN_TRACTION,
  WRECKED_TRACTION,
  PLAYER_DRIVE,
  PLAYER_DRIVE_COAST,
  PLAYER_DRIVE_BRAKE,
  AI_DRIVE,
  MAX_SPEED,
  BOOST_MAX,
  BOOST_DURATION,
  BOOST_RECHARGE_DELAY,
  BOOST_RECHARGE_RATE,
  BOOST_SPEED,
  SHIELD_DURATION,
  POWERUP_TTL,
  PLAYER_SPEED,
} from './physics';

describe('traction params', () => {
  it('PLAYER_TRACTION has valid values', () => {
    expect(PLAYER_TRACTION.lateralGrip).toBeGreaterThan(0);
    expect(PLAYER_TRACTION.lateralGrip).toBeLessThan(1);
    expect(PLAYER_TRACTION.maxAngVel).toBeGreaterThan(0);
  });

  it('AI_TRACTION has valid values', () => {
    expect(AI_TRACTION.lateralGrip).toBeGreaterThan(0);
    expect(AI_TRACTION.lateralGrip).toBeLessThan(1);
  });

  it('STUN_TRACTION has lower grip than normal', () => {
    expect(STUN_TRACTION.lateralGrip).toBeLessThan(AI_TRACTION.lateralGrip);
  });

  it('WRECKED_TRACTION has higher grip (stops faster)', () => {
    expect(WRECKED_TRACTION.lateralGrip).toBeGreaterThan(AI_TRACTION.lateralGrip);
  });
});

describe('drive params', () => {
  it('PLAYER_DRIVE has valid values', () => {
    expect(PLAYER_DRIVE.engineForce).toBeGreaterThan(0);
    expect(PLAYER_DRIVE.maxLateralSpeed).toBeGreaterThan(0);
  });

  it('PLAYER_DRIVE_BRAKE has stronger engine force', () => {
    expect(PLAYER_DRIVE_BRAKE.engineForce).toBeGreaterThan(PLAYER_DRIVE_COAST.engineForce);
  });

  it('AI_DRIVE has valid values', () => {
    expect(AI_DRIVE.engineForce).toBeGreaterThan(0);
    expect(AI_DRIVE.maxLateralSpeed).toBeGreaterThan(0);
  });
});

describe('constants', () => {
  it('has valid speed constants', () => {
    expect(MAX_SPEED).toBeGreaterThan(0);
    expect(BOOST_SPEED).toBeGreaterThan(0);
    expect(BOOST_SPEED).toBeLessThan(MAX_SPEED);
  });

  it('has valid boost constants', () => {
    expect(BOOST_MAX).toBeGreaterThan(0);
    expect(BOOST_DURATION).toBeGreaterThan(0);
    expect(BOOST_RECHARGE_DELAY).toBeGreaterThan(0);
    expect(BOOST_RECHARGE_RATE).toBeGreaterThan(0);
  });

  it('has valid gameplay constants', () => {
    expect(SHIELD_DURATION).toBeGreaterThan(0);
    expect(POWERUP_TTL).toBeGreaterThan(0);
  });

  it('PLAYER_SPEED has all throttle states', () => {
    expect(PLAYER_SPEED.throttle).toBeGreaterThan(PLAYER_SPEED.coast);
    expect(PLAYER_SPEED.coast).toBeGreaterThan(PLAYER_SPEED.brake);
  });
});

import { describe, it, expect } from 'vitest';
import * as Matter from 'matter-js';
import { applyArcadeTraction, clampBodyMotion } from './traction';
import { PLAYER_TRACTION, AI_TRACTION, MAX_SPEED } from '../config/physics';

describe('applyArcadeTraction', () => {
  it('reduces lateral velocity over time', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setVelocity(body, { x: 10, y: 0 });

    applyArcadeTraction(body, 1 / 60, PLAYER_TRACTION);

    expect(Math.abs(body.velocity.x)).toBeLessThan(10);
  });

  it('reduces forward velocity with rolling drag', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setVelocity(body, { x: 0, y: -10 });

    applyArcadeTraction(body, 1 / 60, PLAYER_TRACTION);

    expect(Math.abs(body.velocity.y)).toBeLessThan(10);
  });

  it('handles NaN velocity gracefully', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setVelocity(body, { x: NaN, y: NaN });

    applyArcadeTraction(body, 1 / 60, PLAYER_TRACTION);

    expect(body.velocity.x).toBe(0);
    expect(body.velocity.y).toBe(0);
  });

  it('handles NaN angular velocity gracefully', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    // Directly set angularVelocity to NaN to simulate calculation error
    (body as { angularVelocity: number }).angularVelocity = NaN;

    // Should not throw and should reset angular velocity
    expect(() => {
      applyArcadeTraction(body, 1 / 60, PLAYER_TRACTION);
    }).not.toThrow();
    expect(body.angularVelocity).toBe(0);
  });

  it('applies yaw stiffness to straighten vehicle', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setAngle(body, 0.5);
    Matter.Body.setAngularVelocity(body, 0);

    applyArcadeTraction(body, 1 / 60, PLAYER_TRACTION);

    // Angular velocity should be negative (correcting toward 0)
    expect(body.angularVelocity).toBeLessThan(0);
  });

  it('clamps angular velocity to max', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setAngularVelocity(body, 100);

    applyArcadeTraction(body, 1 / 60, AI_TRACTION);

    expect(Math.abs(body.angularVelocity)).toBeLessThanOrEqual(AI_TRACTION.maxAngVel);
  });
});

describe('clampBodyMotion', () => {
  it('clamps velocity to max speed', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setVelocity(body, { x: 100, y: 100 });

    clampBodyMotion(body, MAX_SPEED, 2.5);

    expect(body.velocity.x).toBe(MAX_SPEED);
    expect(body.velocity.y).toBe(MAX_SPEED);
  });

  it('clamps negative velocity', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setVelocity(body, { x: -100, y: -100 });

    clampBodyMotion(body, MAX_SPEED, 2.5);

    expect(body.velocity.x).toBe(-MAX_SPEED);
    expect(body.velocity.y).toBe(-MAX_SPEED);
  });

  it('handles NaN velocity', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setVelocity(body, { x: NaN, y: NaN });

    clampBodyMotion(body, MAX_SPEED, 2.5);

    expect(body.velocity.x).toBe(0);
    expect(body.velocity.y).toBe(0);
  });

  it('clamps angular velocity', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setAngularVelocity(body, 10);

    clampBodyMotion(body, MAX_SPEED, 2.5);

    expect(body.angularVelocity).toBe(2.5);
  });

  it('handles NaN angular velocity', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setAngularVelocity(body, NaN);

    clampBodyMotion(body, MAX_SPEED, 2.5);

    expect(body.angularVelocity).toBe(0);
  });

  it('does not modify velocity within limits', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setVelocity(body, { x: 5, y: -5 });

    clampBodyMotion(body, MAX_SPEED, 2.5);

    expect(body.velocity.x).toBe(5);
    expect(body.velocity.y).toBe(-5);
  });
});

import { describe, it, expect } from 'vitest';
import * as Matter from 'matter-js';
import { applyDriveForces } from './drive';
import { PLAYER_DRIVE, AI_DRIVE } from '../config/physics';

describe('applyDriveForces', () => {
  it('applies forward force toward target speed', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setMass(body, 10);
    Matter.Body.setVelocity(body, { x: 0, y: 0 });

    applyDriveForces(body, -5, 0, AI_DRIVE);

    // Force applied, body should have pending force in Y direction
    expect(body.force.y).not.toBe(0);
  });

  it('applies lateral force for steering', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setMass(body, 10);
    Matter.Body.setVelocity(body, { x: 0, y: -5 });

    applyDriveForces(body, -5, 1, PLAYER_DRIVE);

    // Steering force applied in X direction
    expect(body.force.x).toBeGreaterThan(0);
  });

  it('applies negative lateral force for left steering', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setMass(body, 10);
    Matter.Body.setVelocity(body, { x: 0, y: -5 });

    applyDriveForces(body, -5, -1, PLAYER_DRIVE);

    expect(body.force.x).toBeLessThan(0);
  });

  it('clamps steering input to max', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setMass(body, 10);
    Matter.Body.setVelocity(body, { x: 0, y: -5 });

    // Extreme steering input should be clamped
    const body2 = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setMass(body2, 10);
    Matter.Body.setVelocity(body2, { x: 0, y: -5 });

    applyDriveForces(body, -5, 10, PLAYER_DRIVE);
    applyDriveForces(body2, -5, 1.5, PLAYER_DRIVE);

    // Both should have same force since 10 is clamped to 1.5
    expect(body.force.x).toBeCloseTo(body2.force.x, 5);
  });

  it('reduces acceleration when near target speed', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setMass(body, 10);
    Matter.Body.setVelocity(body, { x: 0, y: -4.9 }); // Near target of -5

    applyDriveForces(body, -5, 0, AI_DRIVE);

    // Small speed error = small force
    expect(Math.abs(body.force.y)).toBeLessThan(0.1);
  });

  it('applies stronger force when far from target speed', () => {
    const slowBody = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setMass(slowBody, 10);
    Matter.Body.setVelocity(slowBody, { x: 0, y: 0 });

    const fastBody = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setMass(fastBody, 10);
    Matter.Body.setVelocity(fastBody, { x: 0, y: -4 });

    applyDriveForces(slowBody, -5, 0, AI_DRIVE);
    applyDriveForces(fastBody, -5, 0, AI_DRIVE);

    expect(Math.abs(slowBody.force.y)).toBeGreaterThan(Math.abs(fastBody.force.y));
  });
});

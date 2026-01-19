import * as Matter from 'matter-js';
import { clamp } from '../utils/math';
import { type TractionParams, MAX_SPEED } from '../config/physics';

/**
 * Apply arcade-style traction physics to a body.
 * Reduces lateral slip, applies rolling drag, and straightens via yaw stiffness.
 */
export const applyArcadeTraction = (
  body: Matter.Body,
  dt: number,
  params: TractionParams
): void => {
  // Handle NaN velocity
  if (!Number.isFinite(body.velocity.x) || !Number.isFinite(body.velocity.y)) {
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
  }
  // Handle NaN angle/angular velocity - store corrected values
  let currentAngle = body.angle;
  let currentAngVel = body.angularVelocity;
  if (!Number.isFinite(currentAngle) || !Number.isFinite(currentAngVel)) {
    currentAngle = 0;
    currentAngVel = 0;
    Matter.Body.setAngle(body, 0);
    Matter.Body.setAngularVelocity(body, 0);
  }

  const vForward = body.velocity.y;
  const vLateral = body.velocity.x;

  // Damping factors (60fps normalized)
  const lateralDamp = Math.pow(1 - params.lateralGrip, dt * 60);
  const forwardDamp = Math.pow(1 - params.rollingDrag, dt * 60);

  const newVForward = clamp(vForward * forwardDamp, -MAX_SPEED, MAX_SPEED);
  const newVLateral = clamp(vLateral * lateralDamp, -MAX_SPEED, MAX_SPEED);

  Matter.Body.setVelocity(body, { x: newVLateral, y: newVForward });

  // Angular damping + yaw stiffness (straightens vehicle)
  const angDamp = Math.pow(1 - params.angularDrag, dt * 60);
  let angularVel = currentAngVel * angDamp;
  angularVel += -currentAngle * params.yawStiffness;
  angularVel = clamp(angularVel, -params.maxAngVel, params.maxAngVel);
  Matter.Body.setAngularVelocity(body, angularVel);
};

/**
 * Clamp body velocity and angular velocity to maximum values.
 * Also handles NaN values gracefully.
 */
export const clampBodyMotion = (
  body: Matter.Body,
  maxSpeed: number,
  maxAngVel: number
): void => {
  // Handle NaN velocity
  if (!Number.isFinite(body.velocity.x) || !Number.isFinite(body.velocity.y)) {
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
  }

  const clampedVx = clamp(body.velocity.x, -maxSpeed, maxSpeed);
  const clampedVy = clamp(body.velocity.y, -maxSpeed, maxSpeed);

  if (clampedVx !== body.velocity.x || clampedVy !== body.velocity.y) {
    Matter.Body.setVelocity(body, { x: clampedVx, y: clampedVy });
  }

  // Handle NaN angular velocity
  if (!Number.isFinite(body.angularVelocity)) {
    Matter.Body.setAngularVelocity(body, 0);
  }

  const clampedAngVel = clamp(body.angularVelocity, -maxAngVel, maxAngVel);
  if (clampedAngVel !== body.angularVelocity) {
    Matter.Body.setAngularVelocity(body, clampedAngVel);
  }
};

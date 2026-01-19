import * as Matter from 'matter-js';
import { clamp } from '../utils/math';
import { type DriveParams } from '../config/physics';

/**
 * Apply drive forces to a vehicle body.
 * Handles forward acceleration toward target speed and lateral steering.
 */
export const applyDriveForces = (
  body: Matter.Body,
  targetSpeed: number,
  steer: number,
  params: DriveParams
): void => {
  // Forward acceleration toward target speed
  const forwardSpeed = body.velocity.y;
  const speedError = clamp(
    targetSpeed - forwardSpeed,
    -params.maxSpeedDelta,
    params.maxSpeedDelta
  );
  const forwardAccel = speedError * params.engineForce;
  Matter.Body.applyForce(body, body.position, { x: 0, y: forwardAccel });

  // Lateral steering force
  const steering = clamp(steer, -1.5, 1.5);
  const desiredLateralSpeed = steering * params.maxLateralSpeed;
  const lateralError = desiredLateralSpeed - body.velocity.x;
  const lateralAccel = lateralError * params.steerAccel;
  Matter.Body.applyForce(body, body.position, { x: lateralAccel, y: 0 });
};

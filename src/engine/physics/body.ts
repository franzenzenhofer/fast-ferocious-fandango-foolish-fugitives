import type { Body, BodyConfig, BodyShape } from './types.ts';
import * as V from './vector.ts';

let nextBodyId = 0;

const calculateInertia = (shape: BodyShape, mass: number): number => {
  if (mass === 0) return 0;
  if (shape.type === 'circle') return (mass * shape.radius * shape.radius) / 2;
  return (mass * (shape.width ** 2 + shape.height ** 2)) / 12;
};

export const createBody = (config: BodyConfig): Body => {
  const mass = config.isStatic === true ? 0 : (config.mass ?? 1);
  const invMass = mass > 0 ? 1 / mass : 0;
  const inertia = calculateInertia(config.shape, mass);

  return {
    id: nextBodyId++,
    position: config.position ?? V.ZERO,
    velocity: config.velocity ?? V.ZERO,
    angle: config.angle ?? 0,
    angularVelocity: 0,
    mass,
    invMass,
    inertia,
    invInertia: inertia > 0 ? 1 / inertia : 0,
    restitution: config.restitution ?? 0.5,
    friction: config.friction ?? 0.3,
    shape: config.shape,
    isStatic: config.isStatic ?? false,
    isSensor: config.isSensor ?? false,
    layer: config.layer ?? 0,
  };
};

export const applyImpulse = (body: Body, impulse: V.Vec2, point?: V.Vec2): Body => {
  const newVelocity = V.add(body.velocity, V.scale(impulse, body.invMass));
  let newAngularVel = body.angularVelocity;
  if (point !== undefined && body.invInertia > 0) {
    const r = V.sub(point, body.position);
    newAngularVel += V.cross(r, impulse) * body.invInertia;
  }
  return { ...body, velocity: newVelocity, angularVelocity: newAngularVel };
};

export const integrate = (body: Body, dt: number): Body => {
  if (body.isStatic) return body;
  const newVelocity = body.velocity;
  const newPosition = V.add(body.position, V.scale(newVelocity, dt));
  const newAngle = body.angle + body.angularVelocity * dt;
  return { ...body, position: newPosition, angle: newAngle };
};

export const applyDamping = (body: Body, linear: number, angular: number): Body => ({
  ...body,
  velocity: V.scale(body.velocity, linear),
  angularVelocity: body.angularVelocity * angular,
});

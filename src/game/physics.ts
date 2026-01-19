import * as Matter from 'matter-js';

const { Engine, Bodies, Body, Events, Composite } = Matter;

export type PhysicsEngine = Matter.Engine;
export type PhysicsBody = Matter.Body;

export const createPhysicsEngine = (): PhysicsEngine => {
  const engine = Engine.create();
  engine.gravity.y = 0; // Top-down view, no gravity
  engine.positionIterations = 6;
  engine.velocityIterations = 4;
  return engine;
};

export const stepPhysics = (engine: PhysicsEngine, dt: number): void => {
  Engine.update(engine, dt * 1000);
};

export const createRectBody = (
  x: number,
  y: number,
  width: number,
  height: number,
  options?: Matter.IChamferableBodyDefinition
): PhysicsBody => Bodies.rectangle(x, y, width, height, options);

export const addBody = (engine: PhysicsEngine, body: PhysicsBody): void => {
  Composite.add(engine.world, body);
};

export const removeBody = (engine: PhysicsEngine, body: PhysicsBody): void => {
  Composite.remove(engine.world, body);
};

export const setVelocity = (body: PhysicsBody, vx: number, vy: number): void => {
  Body.setVelocity(body, { x: vx, y: vy });
};

export const applyForce = (body: PhysicsBody, fx: number, fy: number): void => {
  Body.applyForce(body, body.position, { x: fx, y: fy });
};

export const setAngle = (body: PhysicsBody, angle: number): void => {
  Body.setAngle(body, angle);
};

export const setPosition = (body: PhysicsBody, x: number, y: number): void => {
  Body.setPosition(body, { x, y });
};

export const onCollision = (
  engine: PhysicsEngine,
  callback: (pairs: Matter.Pair[]) => void
): void => {
  Events.on(engine, 'collisionStart', (event) => {
    callback(event.pairs);
  });
};

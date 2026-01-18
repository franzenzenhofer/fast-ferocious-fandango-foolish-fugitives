import type { Body, BodyConfig, Contact } from './types.ts';
import type { Vec2 } from './vector.ts';
import { createBody, integrate, applyDamping } from './body.ts';
import { detectAllCollisions } from './collision.ts';
import { resolveAllContacts } from './resolver.ts';

export interface WorldConfig {
  readonly gravity: Vec2;
  readonly linearDamping: number;
  readonly angularDamping: number;
  readonly iterations: number;
}

export interface PhysicsWorld {
  readonly config: WorldConfig;
  readonly bodies: readonly Body[];
  readonly contacts: readonly Contact[];
}

export const DEFAULT_WORLD_CONFIG: WorldConfig = {
  gravity: { x: 0, y: 0 },
  linearDamping: 0.99,
  angularDamping: 0.95,
  iterations: 4,
};

export const createWorld = (config?: Partial<WorldConfig>): PhysicsWorld => ({
  config: { ...DEFAULT_WORLD_CONFIG, ...config },
  bodies: [],
  contacts: [],
});

export const addBody = (world: PhysicsWorld, config: BodyConfig): PhysicsWorld => ({
  ...world,
  bodies: [...world.bodies, createBody(config)],
});

export const removeBody = (world: PhysicsWorld, bodyId: number): PhysicsWorld => ({
  ...world,
  bodies: world.bodies.filter(b => b.id !== bodyId),
});

export const updateBody = (world: PhysicsWorld, bodyId: number, update: Partial<Body>): PhysicsWorld => ({
  ...world,
  bodies: world.bodies.map(b => (b.id === bodyId ? { ...b, ...update } : b)),
});

export const getBody = (world: PhysicsWorld, id: number): Body | undefined =>
  world.bodies.find(b => b.id === id);

export const stepWorld = (world: PhysicsWorld, dt: number): PhysicsWorld => {
  const { config } = world;
  let bodies = world.bodies.map(b =>
    b.isStatic ? b : { ...b, velocity: { x: b.velocity.x + config.gravity.x * dt, y: b.velocity.y + config.gravity.y * dt } }
  );
  bodies = bodies.map(b => integrate(b, dt));
  const contacts = detectAllCollisions(bodies);
  for (let i = 0; i < config.iterations; i++) {
    bodies = resolveAllContacts(bodies, contacts);
  }
  bodies = bodies.map(b => applyDamping(b, config.linearDamping, config.angularDamping));
  return { ...world, bodies, contacts };
};

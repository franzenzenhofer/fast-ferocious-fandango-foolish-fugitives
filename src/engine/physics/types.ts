import type { Vec2 } from './vector.ts';

/** Rigid body shape */
export type BodyShape =
  | { readonly type: 'circle'; readonly radius: number }
  | { readonly type: 'rect'; readonly width: number; readonly height: number };

/** Rigid body state - immutable */
export interface Body {
  readonly id: number;
  readonly position: Vec2;
  readonly velocity: Vec2;
  readonly angle: number;
  readonly angularVelocity: number;
  readonly mass: number;
  readonly invMass: number;
  readonly inertia: number;
  readonly invInertia: number;
  readonly restitution: number;
  readonly friction: number;
  readonly shape: BodyShape;
  readonly isStatic: boolean;
  readonly isSensor: boolean;
  readonly layer: number;
}

/** Body configuration for creation */
export interface BodyConfig {
  readonly position?: Vec2;
  readonly velocity?: Vec2;
  readonly angle?: number;
  readonly mass?: number;
  readonly restitution?: number;
  readonly friction?: number;
  readonly shape: BodyShape;
  readonly isStatic?: boolean;
  readonly isSensor?: boolean;
  readonly layer?: number;
}

/** Collision contact information */
export interface Contact {
  readonly bodyA: Body;
  readonly bodyB: Body;
  readonly point: Vec2;
  readonly normal: Vec2;
  readonly penetration: number;
}

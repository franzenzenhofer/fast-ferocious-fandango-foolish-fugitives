import type { Body } from './types.ts';
import type { Vec2 } from './vector.ts';

export interface AABB {
  readonly min: Vec2;
  readonly max: Vec2;
}

export const getAABB = (body: Body): AABB => {
  const { shape, position, angle } = body;

  if (shape.type === 'circle') {
    const r = shape.radius;
    return {
      min: { x: position.x - r, y: position.y - r },
      max: { x: position.x + r, y: position.y + r },
    };
  }

  const hw = shape.width / 2;
  const hh = shape.height / 2;
  const cos = Math.abs(Math.cos(angle));
  const sin = Math.abs(Math.sin(angle));
  const ex = hw * cos + hh * sin;
  const ey = hw * sin + hh * cos;

  return {
    min: { x: position.x - ex, y: position.y - ey },
    max: { x: position.x + ex, y: position.y + ey },
  };
};

export const aabbOverlap = (a: Body, b: Body): boolean => {
  const boxA = getAABB(a);
  const boxB = getAABB(b);

  return !(
    boxA.max.x < boxB.min.x ||
    boxA.min.x > boxB.max.x ||
    boxA.max.y < boxB.min.y ||
    boxA.min.y > boxB.max.y
  );
};

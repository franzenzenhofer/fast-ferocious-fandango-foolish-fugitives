import type { Body, Contact } from './types.ts';
import * as V from './vector.ts';
import { aabbOverlap, getAABB } from './aabb.ts';

const circleVsCircle = (a: Body, b: Body): Contact | null => {
  if (a.shape.type !== 'circle' || b.shape.type !== 'circle') return null;
  const diff = V.sub(b.position, a.position);
  const dist = V.length(diff);
  const radiiSum = a.shape.radius + b.shape.radius;
  if (dist >= radiiSum) return null;
  const normal = dist > 0 ? V.scale(diff, 1 / dist) : { x: 1, y: 0 };
  const point = V.add(a.position, V.scale(normal, a.shape.radius));
  return { bodyA: a, bodyB: b, point, normal, penetration: radiiSum - dist };
};

const rectVsRect = (a: Body, b: Body): Contact | null => {
  if (a.shape.type !== 'rect' || b.shape.type !== 'rect') return null;
  const boxA = getAABB(a);
  const boxB = getAABB(b);
  const overlapX = Math.min(boxA.max.x - boxB.min.x, boxB.max.x - boxA.min.x);
  const overlapY = Math.min(boxA.max.y - boxB.min.y, boxB.max.y - boxA.min.y);
  if (overlapX <= 0 || overlapY <= 0) return null;
  const diff = V.sub(b.position, a.position);
  const [normal, penetration]: [V.Vec2, number] =
    overlapX < overlapY
      ? [{ x: diff.x > 0 ? 1 : -1, y: 0 }, overlapX]
      : [{ x: 0, y: diff.y > 0 ? 1 : -1 }, overlapY];
  const point = V.add(a.position, V.scale(normal, penetration / 2));
  return { bodyA: a, bodyB: b, point, normal, penetration };
};

const circleVsRect = (circle: Body, rect: Body): Contact | null => {
  if (circle.shape.type !== 'circle' || rect.shape.type !== 'rect') return null;
  const hw = rect.shape.width / 2;
  const hh = rect.shape.height / 2;
  const localPos = V.rotate(V.sub(circle.position, rect.position), -rect.angle);
  const closestX = Math.max(-hw, Math.min(hw, localPos.x));
  const closestY = Math.max(-hh, Math.min(hh, localPos.y));
  const diff = V.sub(localPos, { x: closestX, y: closestY });
  const distSq = V.lengthSq(diff);
  const radius = circle.shape.radius;
  if (distSq >= radius * radius) return null;
  const dist = Math.sqrt(distSq);
  const localNormal = dist > 0 ? V.scale(diff, 1 / dist) : { x: 0, y: -1 };
  const normal = V.rotate(localNormal, rect.angle);
  const worldClosest = V.add(rect.position, V.rotate({ x: closestX, y: closestY }, rect.angle));
  return { bodyA: circle, bodyB: rect, point: worldClosest, normal, penetration: radius - dist };
};

export const detectCollision = (a: Body, b: Body): Contact | null => {
  if (!aabbOverlap(a, b)) return null;
  if (a.shape.type === 'circle' && b.shape.type === 'circle') return circleVsCircle(a, b);
  if (a.shape.type === 'rect' && b.shape.type === 'rect') return rectVsRect(a, b);
  if (a.shape.type === 'circle') return circleVsRect(a, b);
  const c = circleVsRect(b, a);
  return c !== null ? { ...c, bodyA: a, bodyB: b, normal: V.scale(c.normal, -1) } : null;
};

export const detectAllCollisions = (bodies: readonly Body[]): Contact[] => {
  const contacts: Contact[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i]!;
      const b = bodies[j]!;
      if (a.isStatic && b.isStatic) continue;
      const contact = detectCollision(a, b);
      if (contact !== null) contacts.push(contact);
    }
  }
  return contacts;
};

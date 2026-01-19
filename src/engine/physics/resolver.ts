import type { Body, Contact } from './types.ts';
import * as V from './vector.ts';
import { applyImpulse } from './body.ts';

export interface ResolutionResult {
  readonly bodyA: Body;
  readonly bodyB: Body;
  readonly impulse: number;
}

export const resolveContact = (contact: Contact): ResolutionResult => {
  const { bodyA, bodyB, point, normal, penetration } = contact;
  if (bodyA.isSensor || bodyB.isSensor) return { bodyA, bodyB, impulse: 0 };

  const rA = V.sub(point, bodyA.position);
  const rB = V.sub(point, bodyB.position);
  const velA = V.add(bodyA.velocity, { x: -rA.y * bodyA.angularVelocity, y: rA.x * bodyA.angularVelocity });
  const velB = V.add(bodyB.velocity, { x: -rB.y * bodyB.angularVelocity, y: rB.x * bodyB.angularVelocity });
  const relVel = V.sub(velA, velB);
  const velAlongNormal = V.dot(relVel, normal);

  if (velAlongNormal > 0) return { bodyA, bodyB, impulse: 0 };

  const e = Math.min(bodyA.restitution, bodyB.restitution);
  const rACrossN = V.cross(rA, normal);
  const rBCrossN = V.cross(rB, normal);
  const invMassSum = bodyA.invMass + bodyB.invMass +
    rACrossN * rACrossN * bodyA.invInertia + rBCrossN * rBCrossN * bodyB.invInertia;
  const j = -(1 + e) * velAlongNormal / invMassSum;
  const impulse = V.scale(normal, j);

  let newA = applyImpulse(bodyA, impulse, point);
  let newB = applyImpulse(bodyB, V.scale(impulse, -1), point);

  const percent = 0.4;
  const slop = 0.01;
  const correction = Math.max(penetration - slop, 0) / invMassSum * percent;
  const correctionVec = V.scale(normal, correction);
  newA = { ...newA, position: V.add(newA.position, V.scale(correctionVec, bodyA.invMass)) };
  newB = { ...newB, position: V.sub(newB.position, V.scale(correctionVec, bodyB.invMass)) };

  return { bodyA: newA, bodyB: newB, impulse: Math.abs(j) };
};

export const resolveAllContacts = (bodies: readonly Body[], contacts: readonly Contact[]): Body[] => {
  const bodyMap = new Map<number, Body>();
  bodies.forEach((body) => bodyMap.set(body.id, body));

  for (const contact of contacts) {
    const a = bodyMap.get(contact.bodyA.id);
    const b = bodyMap.get(contact.bodyB.id);
    if (!a || !b) continue;
    const result = resolveContact({ ...contact, bodyA: a, bodyB: b });
    bodyMap.set(result.bodyA.id, result.bodyA);
    bodyMap.set(result.bodyB.id, result.bodyB);
  }
  return Array.from(bodyMap.values());
};

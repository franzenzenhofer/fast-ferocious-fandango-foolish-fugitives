export type ImpactBody = {
  mass: number;
  velocity: { x: number; y: number };
};

export const TAP_THRESHOLD = 25;
export const HIT_THRESHOLD = 80;
export const SLAM_THRESHOLD = 160;

export type ImpactTier = 'tap' | 'hit' | 'slam' | 'crash';

export const impactEnergy = (a: ImpactBody, b: ImpactBody): number => {
  const rvx = a.velocity.x - b.velocity.x;
  const rvy = a.velocity.y - b.velocity.y;
  const relSpeed = Math.hypot(rvx, rvy);
  const reducedMass = (a.mass * b.mass) / (a.mass + b.mass);
  return 0.5 * reducedMass * relSpeed * relSpeed;
};

export const impactTier = (energy: number): ImpactTier => {
  if (energy < TAP_THRESHOLD) return 'tap';
  if (energy < HIT_THRESHOLD) return 'hit';
  if (energy < SLAM_THRESHOLD) return 'slam';
  return 'crash';
};

/** 2D Vector - immutable */
export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export const vec2 = (x: number, y: number): Vec2 => ({ x, y });
export const ZERO: Vec2 = { x: 0, y: 0 };

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (v: Vec2, s: number): Vec2 => ({ x: v.x * s, y: v.y * s });
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const cross = (a: Vec2, b: Vec2): number => a.x * b.y - a.y * b.x;
export const length = (v: Vec2): number => Math.sqrt(v.x * v.x + v.y * v.y);
export const lengthSq = (v: Vec2): number => v.x * v.x + v.y * v.y;

export const normalize = (v: Vec2): Vec2 => {
  const len = length(v);
  return len > 0 ? scale(v, 1 / len) : ZERO;
};

export const distance = (a: Vec2, b: Vec2): number => length(sub(b, a));

export const rotate = (v: Vec2, angle: number): Vec2 => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos };
};

export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export const perp = (v: Vec2): Vec2 => ({ x: -v.y, y: v.x });

export const reflect = (v: Vec2, normal: Vec2): Vec2 => {
  const d = dot(v, normal) * 2;
  return sub(v, scale(normal, d));
};

export const clamp = (v: Vec2, maxLen: number): Vec2 => {
  const len = length(v);
  return len > maxLen ? scale(v, maxLen / len) : v;
};

export const angle = (v: Vec2): number => Math.atan2(v.y, v.x);
export const fromAngle = (a: number): Vec2 => ({ x: Math.cos(a), y: Math.sin(a) });

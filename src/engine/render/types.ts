import type { Vec2 } from '../physics/vector.ts';

export interface Camera {
  readonly position: Vec2;
  readonly zoom: number;
}

export interface RenderContext {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly camera: Camera;
}

export const DEFAULT_CAMERA: Camera = {
  position: { x: 0, y: 0 },
  zoom: 1,
};

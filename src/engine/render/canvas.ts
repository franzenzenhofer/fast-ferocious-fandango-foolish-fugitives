import type { RenderContext, Camera } from './types.ts';

export const createRenderContext = (
  canvas: HTMLCanvasElement,
  camera: Camera
): RenderContext | null => {
  const ctx = canvas.getContext('2d');
  if (ctx === null) return null;
  return {
    ctx,
    width: canvas.width,
    height: canvas.height,
    camera,
  };
};

export const fx_resizeCanvas = (canvas: HTMLCanvasElement): void => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  const ctx = canvas.getContext('2d');
  if (ctx !== null) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

export const fx_clear = (ctx: CanvasRenderingContext2D, color: string): void => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

export const toScreenX = (worldX: number, camera: Camera, screenW: number): number =>
  (worldX - camera.position.x) * camera.zoom + screenW / 2;

export const toScreenY = (worldY: number, camera: Camera, screenH: number): number =>
  (worldY - camera.position.y) * camera.zoom + screenH / 2;

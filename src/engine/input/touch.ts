import type { InputState } from './types.ts';
import { DEFAULT_INPUT } from './types.ts';

export interface TouchManager {
  readonly getState: () => InputState;
  readonly destroy: () => void;
}

export const createTouchManager = (canvas: HTMLCanvasElement): TouchManager => {
  let state: InputState = DEFAULT_INPUT;
  let touchStartX = 0;

  const onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch === undefined) return;
    touchStartX = touch.clientX;
    const rect = canvas.getBoundingClientRect();
    const relX = touch.clientX - rect.left;
    state = { ...state, up: true, boost: relX > rect.width * 0.7 };
  };

  const onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch === undefined) return;
    const dx = touch.clientX - touchStartX;
    state = { ...state, left: dx < -30, right: dx > 30 };
  };

  const onTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    state = DEFAULT_INPUT;
  };

  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });

  return {
    getState: () => state,
    destroy: (): void => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    },
  };
};

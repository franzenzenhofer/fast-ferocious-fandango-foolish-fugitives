import type { InputState } from './types.ts';
import { DEFAULT_INPUT } from './types.ts';

export interface KeyboardManager {
  readonly getState: () => InputState;
  readonly destroy: () => void;
}

const KEY_MAP: Record<string, keyof InputState> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  KeyA: 'left',
  KeyD: 'right',
  KeyW: 'up',
  KeyS: 'down',
  Space: 'boost',
  ShiftLeft: 'brake',
  ShiftRight: 'brake',
};

export const createKeyboardManager = (): KeyboardManager => {
  let state: InputState = DEFAULT_INPUT;

  const handleKey = (e: KeyboardEvent, pressed: boolean): void => {
    const action = KEY_MAP[e.code];
    if (action !== undefined) {
      e.preventDefault();
      state = { ...state, [action]: pressed };
    }
  };

  const onKeyDown = (e: KeyboardEvent): void => { handleKey(e, true); };
  const onKeyUp = (e: KeyboardEvent): void => { handleKey(e, false); };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    getState: () => state,
    destroy: (): void => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
  };
};

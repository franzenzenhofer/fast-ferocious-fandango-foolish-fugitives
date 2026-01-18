import type { GameTime, DeltaTime, Timestamp } from './types.ts';

export interface LoopState {
  readonly running: boolean;
  readonly lastTime: number;
  readonly accumulator: number;
  readonly frame: number;
}

const FIXED_DT = 1 / 60;

export const createLoopState = (): LoopState => ({
  running: false,
  lastTime: 0,
  accumulator: 0,
  frame: 0,
});

export const computeGameTime = (loop: LoopState, now: number): GameTime => {
  const elapsed = (now - loop.lastTime) / 1000;
  return {
    total: now as Timestamp,
    delta: FIXED_DT as DeltaTime,
    frame: loop.frame,
    fps: elapsed > 0 ? 1 / elapsed : 60,
  };
};

export const updateLoopState = (loop: LoopState, now: number): LoopState => {
  const elapsed = (now - loop.lastTime) / 1000;
  return {
    ...loop,
    lastTime: now,
    accumulator: loop.accumulator + elapsed,
    frame: loop.frame + 1,
  };
};

export const consumeAccumulator = (loop: LoopState): { loop: LoopState; steps: number } => {
  let steps = 0;
  let acc = loop.accumulator;
  while (acc >= FIXED_DT) {
    acc -= FIXED_DT;
    steps++;
  }
  return { loop: { ...loop, accumulator: acc }, steps };
};

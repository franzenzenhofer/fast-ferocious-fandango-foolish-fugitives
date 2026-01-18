/** Unique identifier for entities */
export type EntityId = number & { readonly __brand: 'EntityId' };

/** Timestamp in milliseconds */
export type Timestamp = number & { readonly __brand: 'Timestamp' };

/** Delta time in seconds */
export type DeltaTime = number & { readonly __brand: 'DeltaTime' };

/** Game loop state */
export interface GameTime {
  readonly total: Timestamp;
  readonly delta: DeltaTime;
  readonly frame: number;
  readonly fps: number;
}

/** System update function (pure - returns new state) */
export type SystemUpdate<TState> = (
  state: TState,
  time: GameTime
) => TState;

/** System with side effects (render, audio, etc) */
export type SystemEffect<TState> = (
  state: Readonly<TState>,
  time: GameTime
) => void;

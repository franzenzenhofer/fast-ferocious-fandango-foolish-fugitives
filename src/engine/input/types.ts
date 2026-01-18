export interface InputState {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
  readonly down: boolean;
  readonly boost: boolean;
  readonly brake: boolean;
}

export const DEFAULT_INPUT: InputState = {
  left: false,
  right: false,
  up: false,
  down: false,
  boost: false,
  brake: false,
};

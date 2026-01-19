import type * as Matter from 'matter-js';
import type { VehicleType } from '../game/vehicles';

export type PoliceMode = 'shadow' | 'ram';
export type AIMode = 'lane' | 'weave' | 'block' | 'escort';
export type PowerUpType = 'repair' | 'shield' | 'turbo';
export type AlertDirection = 'generic' | 'ahead' | 'behind';
export type ThrottleState = 'brake' | 'coast' | 'accel';

export interface Vehicle {
  id: number;
  type: VehicleType;
  body: Matter.Body;
  integrity: number;
  lane: number;
  hits: number;
  spawnTime: number;
  prevPosition: { x: number; y: number };
  prevAngle: number;
  policeMode: PoliceMode;
  policeModeTimer: number;
  ramCooldown: number;
  spawnGraceTimer: number;
  sidePreference: number;
  aiMode: AIMode;
  targetLane: number;
  laneChangeTimer: number;
  isChasing: boolean;
  stunTimer: number;
  targetSpeed: number;
  isPursuer: boolean;
  isWrecked: boolean;
}

export interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  ttl: number;
  value: number;
}

export interface GameState {
  engine: Matter.Engine;
  player: Vehicle;
  traffic: Vehicle[];
  powerUps: PowerUp[];
  barriers: { left: Matter.Body; right: Matter.Body };
  cash: number;
  seed: number;
  heat: number;
  stars: number;
  lastCollisionTime: number;
  lastBarrierDamageTime: number;
  playerIFrameTimer: number;
  lastHeatGainTime: number;
  alertText: string;
  alertColor: string;
  alertTimer: number;
  alertDirection: AlertDirection;
  pickupText: string;
  pickupColor: string;
  pickupTimer: number;
  controlHintTimer: number;
  hitFlash: number;
  boost: number;
  boostActiveTimer: number;
  boostRechargeDelay: number;
  throttleState: ThrottleState;
  hadTouch: boolean;
  playerShieldTimer: number;
  powerUpSpawnTimer: number;
  scrollY: number;
  spawnTimer: number;
  pursuerSpawnTimer: number;
  busted: boolean;
  bustedTimer: number;
  demoMode: boolean;
  frameCount: number;
  activeCollisions: Set<number>;
  elapsedTime: number;
  screenShake: number;
  slowMo: number;
}

export type EngineWithPairs = Omit<Matter.Engine, 'pairs'> & {
  pairs: { list: Matter.Pair[] };
};

import type { PhysicsWorld } from '@engine/physics/world.ts';
import type { Vec2 } from '@engine/physics/vector.ts';

export type VehicleType = 'player' | 'sedan' | 'sports' | 'truck' | 'police' | 'geldtransporter' | 'escort';

export interface Vehicle {
  readonly id: number;
  readonly bodyId: number;
  readonly type: VehicleType;
  readonly integrity: number;
  readonly maxIntegrity: number;
  readonly lane: number;
  readonly cashValue: number;
}

export interface Pickup {
  readonly id: number;
  readonly position: Vec2;
  readonly type: 'cash' | 'repair' | 'shield' | 'nitro';
  readonly value: number;
  readonly lifetime: number;
}

export interface GameState {
  readonly physics: PhysicsWorld;
  readonly vehicles: readonly Vehicle[];
  readonly pickups: readonly Pickup[];
  readonly player: PlayerState;
  readonly camera: Vec2;
  readonly worldY: number;
  readonly spawnTimer: number;
  readonly heistTimer: number;
}

export interface PlayerState {
  readonly vehicleId: number;
  readonly integrity: number;
  readonly maxIntegrity: number;
  readonly cash: number;
  readonly stars: number;
  readonly starDecayTimer: number;
  readonly boost: number;
  readonly shield: number;
  readonly busted: boolean;
  readonly bustedTimer: number;
}

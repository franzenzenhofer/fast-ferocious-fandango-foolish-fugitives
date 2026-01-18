import type { PhysicsBody } from './physics.ts';

export type VehicleType = 'player' | 'sedan' | 'sports' | 'truck' | 'police' | 'geldtransporter' | 'escort' | 'ambulance';

export interface VehicleConfig {
  readonly width: number;
  readonly height: number;
  readonly mass: number;
  readonly color: string;
  readonly accent: string;
  readonly maxSpeed: number;
  readonly cashDrop: [number, number];
  readonly repairDrop: number;
}

export const VEHICLE_CONFIGS: Record<VehicleType, VehicleConfig> = {
  // Mass scales with size - bigger = MUCH harder to push!
  player: { width: 28, height: 52, mass: 25, color: '#c41e3a', accent: '#ffd700', maxSpeed: 12, cashDrop: [0, 0], repairDrop: 0 },
  sedan: { width: 24, height: 44, mass: 8, color: '#3498db', accent: '#2980b9', maxSpeed: 6, cashDrop: [25, 50], repairDrop: 0 },
  sports: { width: 22, height: 42, mass: 6, color: '#e74c3c', accent: '#c0392b', maxSpeed: 8, cashDrop: [50, 100], repairDrop: 0 },
  truck: { width: 30, height: 60, mass: 35, color: '#27ae60', accent: '#1e8449', maxSpeed: 5, cashDrop: [75, 150], repairDrop: 0 },
  police: { width: 26, height: 48, mass: 12, color: '#2c3e50', accent: '#3498db', maxSpeed: 10, cashDrop: [0, 0], repairDrop: 15 },
  geldtransporter: { width: 36, height: 76, mass: 60, color: '#7f8c8d', accent: '#ffd700', maxSpeed: 5, cashDrop: [5000, 50000], repairDrop: 50 },
  escort: { width: 28, height: 52, mass: 18, color: '#1a1a1a', accent: '#444', maxSpeed: 6, cashDrop: [0, 0], repairDrop: 20 },
  ambulance: { width: 28, height: 56, mass: 15, color: '#fff', accent: '#e74c3c', maxSpeed: 7, cashDrop: [0, 0], repairDrop: 100 },
};

export interface Vehicle {
  readonly id: number;
  readonly type: VehicleType;
  readonly body: PhysicsBody;
  integrity: number;
  readonly lane: number;
  hits: number;
}

let nextVehicleId = 0;

export const createVehicle = (type: VehicleType, body: PhysicsBody, lane: number): Vehicle => ({
  id: nextVehicleId++,
  type,
  body,
  integrity: 100,
  lane,
  hits: 0,
});

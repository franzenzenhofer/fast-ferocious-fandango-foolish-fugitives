export interface VehicleStats {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly mass: number;
  readonly maxSpeed: number;
  readonly acceleration: number;
  readonly handling: number;
  readonly color: string;
  readonly accentColor: string;
}

export const PLAYER_CAR: VehicleStats = {
  name: 'The Fandango',
  width: 28,
  height: 52,
  mass: 1.5,
  maxSpeed: 12,
  acceleration: 0.4,
  handling: 0.15,
  color: '#c41e3a',
  accentColor: '#ffd700',
};

export const SEDAN: VehicleStats = {
  name: 'Sedan',
  width: 24,
  height: 44,
  mass: 1.0,
  maxSpeed: 7,
  acceleration: 0.2,
  handling: 0.1,
  color: '#3498db',
  accentColor: '#2980b9',
};

export const SPORTS_CAR: VehicleStats = {
  name: 'Sports',
  width: 22,
  height: 42,
  mass: 0.8,
  maxSpeed: 9,
  acceleration: 0.35,
  handling: 0.12,
  color: '#e74c3c',
  accentColor: '#c0392b',
};

export const TRUCK: VehicleStats = {
  name: 'Truck',
  width: 30,
  height: 60,
  mass: 2.0,
  maxSpeed: 5,
  acceleration: 0.15,
  handling: 0.06,
  color: '#27ae60',
  accentColor: '#1e8449',
};

export const POLICE_CAR: VehicleStats = {
  name: 'Police',
  width: 26,
  height: 48,
  mass: 1.2,
  maxSpeed: 10,
  acceleration: 0.35,
  handling: 0.12,
  color: '#2c3e50',
  accentColor: '#fff',
};

export const GELDTRANSPORTER: VehicleStats = {
  name: 'Geldtransporter',
  width: 34,
  height: 72,
  mass: 3.0,
  maxSpeed: 6,
  acceleration: 0.12,
  handling: 0.05,
  color: '#7f8c8d',
  accentColor: '#ffd700',
};

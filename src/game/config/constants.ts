// Road dimensions
export const ROAD_WIDTH = 300;
export const LANE_COUNT = 4;
export const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;
export const BARRIER_WIDTH = 8;
export const ROAD_LEFT = -ROAD_WIDTH / 2;
export const ROAD_RIGHT = ROAD_WIDTH / 2;

// Gameplay
export const BASE_SPEED = 5;
export const MAX_STARS = 5;
export const BUSTED_PENALTY = 0.3;
export const STAR_DECAY_TIME = 30000;

// Spawning
export const TRAFFIC_SPAWN_DISTANCE = 600;
export const DESPAWN_DISTANCE = 800;
export const MIN_TRAFFIC_GAP = 80;

// Damage
export const WALL_DAMAGE = 15;
export const SPIKE_DAMAGE = 25;
export const RAM_DAMAGE = 10;

// Loot
export const SEDAN_CASH = [25, 50] as const;
export const SPORTS_CASH = [50, 100] as const;
export const TRUCK_CASH = [75, 150] as const;
export const SMALL_REPAIR = 10;
export const MEDIUM_REPAIR = 15;
export const FULL_REPAIR = 25;
export const JACKPOT_REPAIR = 50;

// Colors
export const ROAD_COLOR = '#2d2d2d';
export const GRASS_COLOR = '#228b22';
export const BARRIER_COLOR = '#c0c0c0';
export const LINE_COLOR = '#ffffff';
export const CENTER_LINE_COLOR = '#ffd700';

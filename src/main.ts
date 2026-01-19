import * as Matter from 'matter-js';
import { VEHICLE_CONFIGS, type VehicleType } from './game/vehicles.ts';
import { ROAD_WIDTH, ROAD_LEFT, ROAD_RIGHT, LANE_COUNT, LANE_WIDTH, BARRIER_WIDTH, getLaneX } from './game/road.ts';
import { impactEnergy, impactTier } from './game/collision.ts';
import { getOpenLanes } from './game/spawn.ts';
import { createRng, parseSeed } from './utils/random.ts';

// ============================================================================
// TYPES
// ============================================================================

type PoliceMode = 'shadow' | 'ram';
type AIMode = 'lane' | 'weave' | 'block' | 'escort';
type PowerUpType = 'repair' | 'shield' | 'turbo';

interface Vehicle {
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
  isWrecked: boolean; // Car is destroyed but stays as obstacle
}

interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  ttl: number;
  value: number;
}

interface GameState {
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
  controlHintTimer: number;
  hitFlash: number;
  boost: number;
  boostActiveTimer: number;
  boostRechargeDelay: number;
  playerShieldTimer: number;
  powerUpSpawnTimer: number;
  scrollY: number;
  spawnTimer: number;
  pursuerSpawnTimer: number; // Timer for spawning police from behind
  busted: boolean;
  bustedTimer: number;
  demoMode: boolean;
  frameCount: number;
  activeCollisions: Set<number>;
  elapsedTime: number;
  // JUICE
  screenShake: number;
  slowMo: number;
}

type EngineWithPairs = Omit<Matter.Engine, 'pairs'> & { pairs: { list: Matter.Pair[] } };

// ============================================================================
// LOGGING SYSTEM
// ============================================================================

const LOG_COLORS = {
  SPAWN: 'color: #2ecc71; font-weight: bold',
  COLLISION: 'color: #e74c3c; font-weight: bold',
  HIT: 'color: #f39c12; font-weight: bold',
  DESTROY: 'color: #9b59b6; font-weight: bold',
  CASH: 'color: #f1c40f; font-weight: bold',
  STAR: 'color: #3498db; font-weight: bold',
  BUSTED: 'color: #e74c3c; font-weight: bold; font-size: 14px',
  DAMAGE: 'color: #e67e22; font-weight: bold',
  DEMO: 'color: #1abc9c; font-weight: bold',
  STATE: 'color: #95a5a6',
};

const log = (category: keyof typeof LOG_COLORS, message: string, data?: unknown): void => {
  const style = LOG_COLORS[category];
  const now = new Date();
  const ts = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  if (data !== undefined) {
    console.log(`%c[${ts}][${category}] ${message}`, style, data);
  } else {
    console.log(`%c[${ts}][${category}] ${message}`, style);
  }
};

// ============================================================================
// GLOBALS
// ============================================================================

declare global {
  interface Window {
    GAME: {
      state: GameState | null;
      toggleDemo: () => void;
      getStatus: () => void;
    };
  }
}

const input = { left: false, right: false, boost: false, brake: false, up: false };
let vehicleId = 0;
let rng = Math.random;
let powerUpId = 0;

// ============================================================================
// ARCADE HANDLING HELPERS
// ============================================================================

interface TractionParams {
  lateralGrip: number;
  rollingDrag: number;
  angularDrag: number;
  maxAngVel: number;
  yawStiffness: number;
}

interface DriveParams {
  engineForce: number;
  maxLateralSpeed: number;
  steerAccel: number;
  maxSpeedDelta: number;
}

const PLAYER_TRACTION: TractionParams = {
  lateralGrip: 0.12,
  rollingDrag: 0.02,
  angularDrag: 0.2,
  maxAngVel: 2.5,
  yawStiffness: 0.05,
};

const AI_TRACTION: TractionParams = {
  lateralGrip: 0.1,
  rollingDrag: 0.03,
  angularDrag: 0.25,
  maxAngVel: 2.2,
  yawStiffness: 0.04,
};

const STUN_TRACTION: TractionParams = {
  lateralGrip: 0.03,
  rollingDrag: 0.01,
  angularDrag: 0.15,
  maxAngVel: 3.5,
  yawStiffness: 0.01,
};

const WRECKED_TRACTION: TractionParams = {
  lateralGrip: 0.2,
  rollingDrag: 0.1,
  angularDrag: 0.3,
  maxAngVel: 1.2,
  yawStiffness: 0.02,
};

const PLAYER_DRIVE: DriveParams = {
  engineForce: 0.12,
  maxLateralSpeed: 4,
  steerAccel: 0.08,
  maxSpeedDelta: 20,
};

const PLAYER_DRIVE_COAST: DriveParams = {
  engineForce: 0.06,
  maxLateralSpeed: 3.6,
  steerAccel: 0.07,
  maxSpeedDelta: 16,
};

const PLAYER_DRIVE_BRAKE: DriveParams = {
  engineForce: 0.2,
  maxLateralSpeed: 3.2,
  steerAccel: 0.07,
  maxSpeedDelta: 20,
};

const AI_DRIVE: DriveParams = {
  engineForce: 0.08,
  maxLateralSpeed: 3,
  steerAccel: 0.06,
  maxSpeedDelta: 15,
};

const MAX_SPEED = 18;
const BOOST_MAX = 100;
const BOOST_DURATION = 1.4;
const BOOST_RECHARGE_DELAY = 1.2;
const BOOST_RECHARGE_RATE = 28;
const BOOST_SPEED = 8;
const SHIELD_DURATION = 4.5;
const POWERUP_TTL = 10;
const PLAYER_SPEED = {
  throttle: 9,
  coast: 5,
  brake: 2,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
const clamp01 = (value: number): number => clamp(value, 0, 1);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const lerpAngle = (a: number, b: number, t: number): number => {
  const delta = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + delta * t;
};
const snap = (value: number): number => Math.round(value);
const normalizeHex = (hex: string): string => {
  const cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    return cleaned
      .split('')
      .map((c) => `${c}${c}`)
      .join('');
  }
  return cleaned;
};
const toHex = (value: number): string => Math.round(value).toString(16).padStart(2, '0');
const shadeColor = (hex: string, amount: number): string => {
  const normalized = normalizeHex(hex);
  if (normalized.length !== 6) return hex;
  const num = Number.parseInt(normalized, 16);
  const r = clamp((num >> 16) + amount, 0, 255);
  const g = clamp(((num >> 8) & 0xff) + amount, 0, 255);
  const b = clamp((num & 0xff) + amount, 0, 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
const random = (): number => rng();
const randRange = (min: number, max: number): number => min + random() * (max - min);
const randInt = (maxExclusive: number): number =>
  maxExclusive <= 0 ? 0 : Math.floor(random() * maxExclusive);

const getNearestLane = (x: number): number => {
  const laneIndex = Math.round((x - (ROAD_LEFT + LANE_WIDTH / 2)) / LANE_WIDTH);
  return clamp(laneIndex, 0, LANE_COUNT - 1);
};

const applyArcadeTraction = (body: Matter.Body, dt: number, params: TractionParams): void => {
  if (!Number.isFinite(body.velocity.x) || !Number.isFinite(body.velocity.y)) {
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
  }
  if (!Number.isFinite(body.angle) || !Number.isFinite(body.angularVelocity)) {
    Matter.Body.setAngle(body, 0);
    Matter.Body.setAngularVelocity(body, 0);
  }

  const vForward = body.velocity.y;
  const vLateral = body.velocity.x;

  const lateralDamp = Math.pow(1 - params.lateralGrip, dt * 60);
  const forwardDamp = Math.pow(1 - params.rollingDrag, dt * 60);

  const newVForward = clamp(vForward * forwardDamp, -MAX_SPEED, MAX_SPEED);
  const newVLateral = clamp(vLateral * lateralDamp, -MAX_SPEED, MAX_SPEED);

  Matter.Body.setVelocity(body, { x: newVLateral, y: newVForward });

  const angDamp = Math.pow(1 - params.angularDrag, dt * 60);
  let angularVel = body.angularVelocity * angDamp;
  angularVel += -body.angle * params.yawStiffness;
  angularVel = clamp(angularVel, -params.maxAngVel, params.maxAngVel);
  Matter.Body.setAngularVelocity(body, angularVel);
};

const applyDriveForces = (body: Matter.Body, targetSpeed: number, steer: number, params: DriveParams): void => {
  const forwardSpeed = body.velocity.y;
  const speedError = clamp(targetSpeed - forwardSpeed, -params.maxSpeedDelta, params.maxSpeedDelta);
  const forwardAccel = speedError * params.engineForce;
  Matter.Body.applyForce(body, body.position, { x: 0, y: forwardAccel });

  const steering = clamp(steer, -1.5, 1.5);
  const desiredLateralSpeed = steering * params.maxLateralSpeed;
  const lateralError = desiredLateralSpeed - body.velocity.x;
  const lateralAccel = lateralError * params.steerAccel;
  Matter.Body.applyForce(body, body.position, { x: lateralAccel, y: 0 });
};

const clampBodyMotion = (body: Matter.Body, maxSpeed: number, maxAngVel: number): void => {
  if (!Number.isFinite(body.velocity.x) || !Number.isFinite(body.velocity.y)) {
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
  }
  const clampedVx = clamp(body.velocity.x, -maxSpeed, maxSpeed);
  const clampedVy = clamp(body.velocity.y, -maxSpeed, maxSpeed);
  if (clampedVx !== body.velocity.x || clampedVy !== body.velocity.y) {
    Matter.Body.setVelocity(body, { x: clampedVx, y: clampedVy });
  }

  if (!Number.isFinite(body.angularVelocity)) {
    Matter.Body.setAngularVelocity(body, 0);
  }
  const clampedAngVel = clamp(body.angularVelocity, -maxAngVel, maxAngVel);
  if (clampedAngVel !== body.angularVelocity) {
    Matter.Body.setAngularVelocity(body, clampedAngVel);
  }
};

const applyRoadBounds = (body: Matter.Body, spring = 0.002, margin = 10): void => {
  const leftLimit = ROAD_LEFT + margin;
  const rightLimit = ROAD_RIGHT - margin;
  if (body.position.x < leftLimit) {
    const dist = leftLimit - body.position.x;
    Matter.Body.applyForce(body, body.position, { x: dist * spring * body.mass, y: 0 });
  } else if (body.position.x > rightLimit) {
    const dist = body.position.x - rightLimit;
    Matter.Body.applyForce(body, body.position, { x: -dist * spring * body.mass, y: 0 });
  }
};

const updatePoliceTimers = (vehicle: Vehicle, stepDt: number): void => {
  vehicle.spawnGraceTimer = Math.max(0, vehicle.spawnGraceTimer - stepDt);
  vehicle.ramCooldown = Math.max(0, vehicle.ramCooldown - stepDt);
  vehicle.policeModeTimer = Math.max(0, vehicle.policeModeTimer - stepDt);
};

const updatePoliceMode = (vehicle: Vehicle): void => {
  if (vehicle.policeModeTimer > 0) return;
  const wantsRam = vehicle.spawnGraceTimer <= 0 && vehicle.ramCooldown <= 0 && random() < 0.4;
  vehicle.policeMode = wantsRam ? 'ram' : 'shadow';
  vehicle.policeModeTimer = randRange(1.6, 3.2);
  vehicle.sidePreference = random() < 0.5 ? -1 : 1;
};

const getDefaultAIMode = (type: VehicleType): AIMode => {
  switch (type) {
    case 'sports':
      return 'weave';
    case 'truck':
      return 'block';
    case 'geldtransporter':
      return 'escort';
    default:
      return 'lane';
  }
};

const spawnPowerUp = (
  state: GameState,
  type: PowerUpType,
  x: number,
  y: number,
  value: number,
  ttl = POWERUP_TTL
): void => {
  state.powerUps.push({
    id: powerUpId++,
    type,
    x,
    y,
    ttl,
    value,
  });
};

const collectPowerUp = (state: GameState, powerUp: PowerUp): void => {
  if (powerUp.type === 'repair') {
    const oldIntegrity = state.player.integrity;
    state.player.integrity = Math.min(100, state.player.integrity + powerUp.value);
    log('DAMAGE', `🔧 +${powerUp.value} repair (${oldIntegrity.toFixed(1)}% → ${state.player.integrity.toFixed(1)}%)`);
  } else if (powerUp.type === 'shield') {
    state.playerShieldTimer = Math.max(state.playerShieldTimer, SHIELD_DURATION);
    log('STATE', '🛡️ SHIELD ACTIVATED');
  } else {
    state.boost = BOOST_MAX;
    if (state.boostActiveTimer <= 0) {
      state.boostRechargeDelay = 0;
    }
    log('STATE', '⚡ TURBO CHARGED');
  }
};

const updatePowerUps = (state: GameState, stepDt: number): void => {
  const playerPos = state.player.body.position;
  state.powerUps = state.powerUps.filter((powerUp) => {
    powerUp.ttl -= stepDt;
    if (powerUp.ttl <= 0) return false;
    if (powerUp.y - playerPos.y > 900) return false;
    if (powerUp.y - playerPos.y < -1200) return false;
    const dx = powerUp.x - playerPos.x;
    const dy = powerUp.y - playerPos.y;
    if (dx * dx + dy * dy < 900) {
      collectPowerUp(state, powerUp);
      return false;
    }
    return true;
  });
};

const isLaneBlocked = (state: GameState, lane: number, y: number, minGap: number, ignoreId: number): boolean => {
  for (const other of state.traffic) {
    if (other.id === ignoreId) continue;
    if (other.lane !== lane) continue;
    if (Math.abs(other.body.position.y - y) < minGap) return true;
  }
  return false;
};

const updateTargetLane = (state: GameState, vehicle: Vehicle, relY: number, stepDt: number): void => {
  vehicle.laneChangeTimer = Math.max(0, vehicle.laneChangeTimer - stepDt);
  if (vehicle.laneChangeTimer > 0) return;

  const playerLane = getNearestLane(state.player.body.position.x);
  const reactionDistance = 180;
  const minGap = 140;
  const avoidPlayerLane = Math.abs(relY) < 240;

  if (Math.abs(relY) < reactionDistance) {
    vehicle.laneChangeTimer = randRange(0.6, 1.2);
    return;
  }

  const candidates: number[] = [];
  if (vehicle.aiMode === 'weave') {
    const dir = random() < 0.5 ? -1 : 1;
    candidates.push(vehicle.targetLane + dir, vehicle.targetLane - dir, vehicle.targetLane);
  } else if (vehicle.aiMode === 'block') {
    candidates.push(playerLane, vehicle.targetLane, vehicle.targetLane + 1, vehicle.targetLane - 1);
  } else if (vehicle.aiMode === 'escort') {
    const farLane = playerLane < LANE_COUNT / 2 ? LANE_COUNT - 1 : 0;
    candidates.push(farLane, vehicle.targetLane, farLane === 0 ? 1 : LANE_COUNT - 2);
  } else {
    candidates.push(vehicle.targetLane, vehicle.targetLane + 1, vehicle.targetLane - 1);
  }

  let nextLane = vehicle.targetLane;
  for (const lane of candidates) {
    if (lane < 0 || lane >= LANE_COUNT) continue;
    if (avoidPlayerLane && lane === playerLane) continue;
    if (!isLaneBlocked(state, lane, vehicle.body.position.y, minGap, vehicle.id)) {
      nextLane = lane;
      break;
    }
  }

  vehicle.targetLane = nextLane;
  vehicle.laneChangeTimer = vehicle.aiMode === 'weave'
    ? randRange(1.2, 2.2)
    : vehicle.aiMode === 'block'
      ? randRange(1.5, 2.8)
      : vehicle.aiMode === 'escort'
        ? randRange(2.4, 4.0)
        : randRange(1.8, 3.6);
};

const getPoliceSteer = (state: GameState, vehicle: Vehicle, relY: number): number => {
  const playerX = state.player.body.position.x;
  const playerVx = state.player.body.velocity.x;
  const leadTime = 0.35;
  const predictedX = playerX + playerVx * leadTime;

  const safeLeft = ROAD_LEFT + 18;
  const safeRight = ROAD_RIGHT - 18;
  let desiredX = predictedX + vehicle.sidePreference * LANE_WIDTH * 0.6;
  if (desiredX < safeLeft || desiredX > safeRight) {
    vehicle.sidePreference *= -1;
    desiredX = predictedX + vehicle.sidePreference * LANE_WIDTH * 0.6;
  }

  let steerForce = 0;
  if (vehicle.policeMode === 'ram' && vehicle.spawnGraceTimer <= 0 && vehicle.ramCooldown <= 0) {
    const ramTargetX = clamp(predictedX, safeLeft, safeRight);
    steerForce = clamp((ramTargetX - vehicle.body.position.x) * 0.04, -1.1, 1.1);
  } else {
    steerForce = clamp((desiredX - vehicle.body.position.x) * 0.02, -0.6, 0.6);
  }

  if (Math.abs(relY) < 70) {
    steerForce *= 0.5;
  }
  if (vehicle.spawnGraceTimer > 0) {
    steerForce *= 0.35;
  }

  const dx = playerX - vehicle.body.position.x;
  if (
    vehicle.policeMode === 'ram' &&
    vehicle.spawnGraceTimer <= 0 &&
    vehicle.ramCooldown <= 0 &&
    Math.abs(dx) < 25 &&
    Math.abs(relY) < 90
  ) {
    vehicle.ramCooldown = 2.2;
    vehicle.policeMode = 'shadow';
    vehicle.policeModeTimer = randRange(2.0, 3.2);
  }

  return steerForce;
};

const applyHeatGain = (state: GameState, amount: number, now: number): void => {
  if (amount <= 0) return;
  if (now - state.lastHeatGainTime < 250) return;
  state.heat = clamp01(state.heat + amount);
  state.lastHeatGainTime = now;
};

const triggerAlert = (state: GameState, text: string, color: string): void => {
  if (state.alertTimer > 0.6) return;
  state.alertText = text;
  state.alertColor = color;
  state.alertTimer = 1.6;
};

const pickVehicleType = (heat: number, elapsedTime: number): VehicleType => {
  const roll = random();
  if (elapsedTime < 30) return 'sedan';
  if (heat < 0.2) {
    return roll < 0.9 ? 'sedan' : 'sports';
  }
  if (heat < 0.4) {
    return roll < 0.6 ? 'sedan' : roll < 0.85 ? 'sports' : 'truck';
  }
  if (heat < 0.6) {
    return roll < 0.45 ? 'sedan' : roll < 0.7 ? 'sports' : roll < 0.9 ? 'truck' : 'police';
  }
  if (heat < 0.8) {
    return roll < 0.35 ? 'sedan' : roll < 0.6 ? 'sports' : roll < 0.82 ? 'truck' : 'police';
  }
  return roll < 0.25 ? 'sedan' : roll < 0.5 ? 'sports' : roll < 0.72 ? 'truck' : roll < 0.92 ? 'police' : 'geldtransporter';
};


// ============================================================================
// VEHICLE CREATION
// ============================================================================

const createVehicle = (engine: Matter.Engine, type: VehicleType, x: number, y: number, lane: number): Vehicle => {
  const config = VEHICLE_CONFIGS[type];
  // MAXIMUM CHAOS PHYSICS - cars get THROWN around and ROTATE!
  const body = Matter.Bodies.rectangle(x, y, config.width, config.height, {
    friction: 0.08, // Low friction = cars slide
    frictionAir: 0.008, // Low air drag = momentum carries
    restitution: 0.5, // REDUCED bounce - less pinball, more push
    label: type,
    chamfer: { radius: 8 },
    // Allow rotation! No more inertia: Infinity
    frictionStatic: 0.1,
  });
  Matter.Body.setMass(body, config.mass);
  Matter.Composite.add(engine.world, body);
  const id = vehicleId++;
  const spawnTime = performance.now();
  const isPolice = type === 'police';
  // Variable target speed based on vehicle type (±20% variation)
  const baseSpeed = config.maxSpeed;
  const speedVariation = randRange(0.8, 1.2); // 80% to 120%
  const targetSpeed = baseSpeed * speedVariation;

  log('SPAWN', `${type.toUpperCase()} #${id} at lane ${lane} (x=${x.toFixed(0)}, y=${y.toFixed(0)})${isPolice ? ' [WILL CHASE]' : ''}`);
  return {
    id, type, body, integrity: 100, lane, hits: 0, spawnTime,
    prevPosition: { x, y },
    prevAngle: body.angle,
    policeMode: 'shadow',
    policeModeTimer: isPolice ? randRange(1.5, 3) : 0,
    ramCooldown: 0,
    spawnGraceTimer: isPolice ? 0.8 : 0,
    sidePreference: random() < 0.5 ? -1 : 1,
    aiMode: getDefaultAIMode(type),
    targetLane: lane,
    laneChangeTimer: randRange(2, 5),
    isChasing: isPolice,
    stunTimer: 0,
    targetSpeed,
    isPursuer: false,
    isWrecked: false,
  };
};

// ============================================================================
// MAIN GAME
// ============================================================================

let initialized = false;

const main = (): void => {
  if (initialized) return;
  initialized = true;

  const seedParam = new URLSearchParams(window.location.search).get('seed');
  const seed = parseSeed(seedParam, Date.now());
  rng = createRng(seed);

  console.log('%c🎮 FAST FEROCIOUS FANDANGO: FOOLISH FUGITIVES 🎮', 'font-size: 20px; color: #c41e3a; font-weight: bold');
  console.log('%cPress F1 to toggle DEMO MODE | Check window.GAME for debug access', 'color: #888');

  // Clean up any existing canvases
  document.querySelectorAll('canvas').forEach((c) => {
    c.remove();
  });

  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context');
    return;
  }

  const resizeCanvas = (): void => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Physics engine
  const engine = Matter.Engine.create();
  engine.gravity.y = 0;
  engine.positionIterations = 6;
  engine.velocityIterations = 4;

  // Barriers (follow player position)
  const leftBarrier = Matter.Bodies.rectangle(
    ROAD_LEFT - BARRIER_WIDTH / 2,
    0,
    BARRIER_WIDTH,
    2000,
    { isStatic: true, label: 'barrier' }
  );
  const rightBarrier = Matter.Bodies.rectangle(
    ROAD_RIGHT + BARRIER_WIDTH / 2,
    0,
    BARRIER_WIDTH,
    2000,
    { isStatic: true, label: 'barrier' }
  );
  Matter.Composite.add(engine.world, [leftBarrier, rightBarrier]);

  // Player
  const player = createVehicle(engine, 'player', 0, 0, 1);

  const state: GameState = {
    engine,
    player,
    traffic: [],
    powerUps: [],
    barriers: { left: leftBarrier, right: rightBarrier },
    cash: 0,
    seed,
    heat: 0,
    stars: 0,
    lastCollisionTime: performance.now(),
    lastBarrierDamageTime: 0,
    playerIFrameTimer: 0,
    lastHeatGainTime: performance.now(),
    boost: BOOST_MAX,
    boostActiveTimer: 0,
    boostRechargeDelay: 0,
    playerShieldTimer: 0,
    powerUpSpawnTimer: randRange(6, 10),
    scrollY: 0,
    spawnTimer: 0,
    pursuerSpawnTimer: randRange(8, 13), // First pursuer after 8-13 seconds
    busted: false,
    bustedTimer: 0,
    demoMode: false,
    frameCount: 0,
    activeCollisions: new Set<number>(),
    elapsedTime: 0,
    alertText: '',
    alertColor: '#fff',
    alertTimer: 0,
    controlHintTimer: 6,
    hitFlash: 0,
    screenShake: 0,
    slowMo: 0,
  };

  // Debug access
  window.GAME = {
    state,
    toggleDemo: (): void => {
      state.demoMode = !state.demoMode;
      input.left = false;
      input.right = false;
      input.boost = false;
      input.brake = false;
      input.up = false;
      log('DEMO', state.demoMode ? 'Demo mode ENABLED - AI driving' : 'Demo mode DISABLED - Manual control');
    },
    getStatus: (): void => {
      console.log('%c=== GAME STATUS ===', 'font-size: 14px; font-weight: bold');
      log('STATE', `Cash: $${state.cash.toLocaleString()}`);
      log('STATE', `Seed: ${state.seed}`);
      log('STATE', `Stars: ${state.stars}/5`);
      log('STATE', `Heat: ${(state.heat * 100).toFixed(1)}%`);
      log('STATE', `Integrity: ${state.player.integrity.toFixed(1)}%`);
      log('STATE', `Boost: ${state.boost.toFixed(0)}%`);
      log('STATE', `Traffic count: ${state.traffic.length}`);
      log('STATE', `ScrollY: ${state.scrollY.toFixed(0)}`);
      log('STATE', `Demo mode: ${state.demoMode}`);
    },
  };

  log('DEMO', 'Demo mode DISABLED - Manual control (press F1 to toggle demo)');

  // Input handlers
  window.addEventListener('keydown', (e) => {
    if (e.code === 'F1') {
      e.preventDefault();
      window.GAME.toggleDemo();
      return;
    }
    if (state.demoMode) return; // Ignore input in demo mode
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') input.up = true;
    if (e.code === 'Space') input.boost = true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'ShiftLeft') input.brake = true;
  });
  window.addEventListener('keyup', (e) => {
    if (state.demoMode) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') input.up = false;
    if (e.code === 'Space') input.boost = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'ShiftLeft') input.brake = false;
  });

  const touchState = { startX: 0, startY: 0, active: false };

  const clearTouchInput = (): void => {
    touchState.active = false;
    input.left = false;
    input.right = false;
    input.up = false;
    input.brake = false;
  };

  const onTouchStart = (e: TouchEvent): void => {
    if (state.demoMode) return;
    const touch = e.touches[0];
    if (touch === undefined) return;
    e.preventDefault();
    touchState.active = true;
    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
  };

  const onTouchMove = (e: TouchEvent): void => {
    if (!touchState.active || state.demoMode) return;
    const touch = e.touches[0];
    if (touch === undefined) return;
    e.preventDefault();
    const dx = touch.clientX - touchState.startX;
    const dy = touch.clientY - touchState.startY;
    const threshold = 18;
    input.left = dx < -threshold;
    input.right = dx > threshold;
    input.up = dy < -threshold;
    input.brake = dy > threshold;
  };

  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', clearTouchInput, { passive: false });
  canvas.addEventListener('touchcancel', clearTouchInput, { passive: false });

  let lastTime = performance.now();
  let accumulator = 0;
  const fixedDt = 1 / 60;
  const maxFrameTime = 0.1;
  const gameLoop = (): void => {
    const now = performance.now();
    let frameTime = (now - lastTime) / 1000;
    if (frameTime > maxFrameTime) frameTime = maxFrameTime;
    lastTime = now;
    accumulator += frameTime;

    while (accumulator >= fixedDt) {
      update(state, fixedDt);
      accumulator -= fixedDt;
    }

    const alpha = accumulator / fixedDt;
    render(ctx, state, canvas.clientWidth, canvas.clientHeight, alpha);

    state.frameCount++;
    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);
  log('STATE', 'Game loop started!');
};

// ============================================================================
// DEMO MODE AI
// ============================================================================

const demoAI = (state: GameState): { left: boolean; right: boolean; boost: boolean; brake: boolean; up: boolean } => {
  const playerX = state.player.body.position.x;
  const playerY = state.player.body.position.y;

  // Find nearest traffic vehicle ahead
  let targetX = 0;
  let nearestDist = Infinity;
  let hasTarget = false;

  for (const v of state.traffic) {
    const relY = v.body.position.y - playerY;
    // Only target vehicles ahead (negative relY means ahead)
    if (relY < 0 && relY > -400) {
      const dist = Math.abs(v.body.position.x - playerX) + Math.abs(relY) * 0.5;
      if (dist < nearestDist) {
        nearestDist = dist;
        targetX = v.body.position.x;
        hasTarget = true;
      }
    }
  }

  // Steer toward target or weave if no target
  const diff = hasTarget ? targetX - playerX : Math.sin(state.frameCount * 0.02) * 50 - playerX;
  const deadzone = 20;
  const boostReady = state.boost >= BOOST_MAX - 0.1 && state.boostActiveTimer <= 0;

  return {
    left: diff < -deadzone,
    right: diff > deadzone,
    boost: boostReady && hasTarget && nearestDist < 200,
    brake: false,
    up: true,
  };
};

// ============================================================================
// UPDATE LOGIC
// ============================================================================

const update = (state: GameState, dt: number): void => {
  const timeScale = state.slowMo > 0 ? 0.7 : 1;
  if (state.slowMo > 0) {
    state.slowMo = Math.max(0, state.slowMo - dt);
  }
  const stepDt = dt * timeScale;

  // === JUICE: Decay screen shake ===
  if (state.screenShake > 0) {
    state.screenShake *= 0.85; // Rapid decay
    if (state.screenShake < 0.5) state.screenShake = 0;
  }

  if (state.busted) {
    state.bustedTimer -= stepDt;
    if (state.bustedTimer <= 0) {
      state.busted = false;
      state.player.integrity = 100;
      state.heat = 0;
      state.stars = 0;
      state.elapsedTime = 0;
      state.lastCollisionTime = performance.now();
      state.lastHeatGainTime = state.lastCollisionTime;
      state.spawnTimer = 0.6;
      state.pursuerSpawnTimer = randRange(8, 13);
      for (const v of state.traffic) {
        Matter.Composite.remove(state.engine.world, v.body);
      }
      state.traffic = [];
      state.activeCollisions.clear();
      state.player.prevPosition = { x: state.player.body.position.x, y: state.player.body.position.y };
      state.player.prevAngle = state.player.body.angle;
      state.hitFlash = 0;
      state.controlHintTimer = 6;
      state.playerShieldTimer = 0;
      state.powerUps = [];
      state.powerUpSpawnTimer = randRange(6, 10);
      log('STATE', 'Respawned! Integrity restored, stars cleared');
    }
    return;
  }

  const now = performance.now();
  state.elapsedTime += stepDt;
  state.heat = clamp01(state.heat + stepDt * 0.0035);
  if (now - state.lastCollisionTime > 6000) {
    state.heat = clamp01(state.heat - stepDt * 0.0015);
  }
  const newStars = Math.min(5, Math.floor(state.heat * 5 + 0.0001));
  if (newStars !== state.stars) {
    state.stars = newStars;
    log('STAR', `⭐ Wanted level: ${state.stars}`);
  }
  state.playerIFrameTimer = Math.max(0, state.playerIFrameTimer - stepDt);
  state.alertTimer = Math.max(0, state.alertTimer - stepDt);
  state.hitFlash = Math.max(0, state.hitFlash - stepDt * 4);
  state.playerShieldTimer = Math.max(0, state.playerShieldTimer - stepDt);
  if (!state.demoMode && (input.left || input.right || input.boost || input.brake)) {
    state.controlHintTimer = 0;
  } else {
    state.controlHintTimer = Math.max(0, state.controlHintTimer - stepDt);
  }

  // Get input (demo AI or manual)
  const currentInput = state.demoMode ? demoAI(state) : input;

  // Player movement (force-driven)
  const body = state.player.body;
  const steer = (currentInput.left ? -1 : 0) + (currentInput.right ? 1 : 0);

  const wantsBrake = currentInput.brake;
  const wantsThrottle = currentInput.up;
  const baseSpeed = wantsBrake
    ? PLAYER_SPEED.brake
    : wantsThrottle
      ? PLAYER_SPEED.throttle
      : PLAYER_SPEED.coast;
  const boostReady = state.boost >= BOOST_MAX - 0.1 && state.boostActiveTimer <= 0;
  if (currentInput.boost && boostReady && !wantsBrake) {
    state.boostActiveTimer = BOOST_DURATION;
    state.boostRechargeDelay = BOOST_RECHARGE_DELAY;
    state.boost = 0;
  }

  if (state.boostActiveTimer > 0) {
    state.boostActiveTimer = Math.max(0, state.boostActiveTimer - stepDt);
  }
  if (state.boostActiveTimer <= 0) {
    if (state.boostRechargeDelay > 0) {
      state.boostRechargeDelay = Math.max(0, state.boostRechargeDelay - stepDt);
    } else {
      state.boost = Math.min(BOOST_MAX, state.boost + BOOST_RECHARGE_RATE * stepDt);
    }
  }

  const boostSpeed = state.boostActiveTimer > 0 ? BOOST_SPEED : 0;
  const targetSpeed = -(baseSpeed + boostSpeed);

  const driveParams = wantsBrake ? PLAYER_DRIVE_BRAKE : wantsThrottle ? PLAYER_DRIVE : PLAYER_DRIVE_COAST;
  applyDriveForces(body, targetSpeed, steer, driveParams);

  // Spawn traffic AHEAD of player (negative Y = above player on screen)
  const earlyPhase = state.elapsedTime < 30;
  const spawnInterval = earlyPhase ? 2.8 : lerp(2.6, 0.55, state.heat);
  const maxTraffic = earlyPhase ? 1 : Math.max(2, Math.round(lerp(3, 16, state.heat)));
  const spawnDistance = lerp(720, 420, state.heat);

  state.spawnTimer -= stepDt;
  if (state.spawnTimer <= 0) {
    state.spawnTimer = spawnInterval * randRange(0.8, 1.2);
    if (state.traffic.length < maxTraffic) {
      const playerLane = getNearestLane(body.position.x);
      const spawnY = body.position.y - spawnDistance - randRange(0, 80);
      const openLanes = getOpenLanes(
        state.traffic.map((vehicle) => ({ lane: vehicle.lane, y: vehicle.body.position.y })),
        spawnY,
        state.heat,
        playerLane,
        body.position.y
      );
      if (openLanes.length === 0) {
        state.spawnTimer = 0.2;
      } else {
        const lane = openLanes[randInt(openLanes.length)];
        if (lane === undefined) {
          state.spawnTimer = 0.2;
        } else {
          const x = getLaneX(lane);
          const type = pickVehicleType(state.heat, state.elapsedTime);
          const vehicle = createVehicle(state.engine, type, x, spawnY, lane);
          state.traffic.push(vehicle);
          if (type === 'police') triggerAlert(state, 'POLICE AHEAD', '#ff4444');
          if (type === 'geldtransporter') triggerAlert(state, 'HEIST TARGET', '#ffd700');
        }
      }
    } else {
      state.spawnTimer = spawnInterval * 0.5;
    }
  }

  // Spawn power-ups (time-based)
  state.powerUpSpawnTimer -= stepDt;
  if (state.powerUpSpawnTimer <= 0) {
    state.powerUpSpawnTimer = randRange(6, 12);
    const spawnY = body.position.y - lerp(520, 380, state.heat) - randRange(0, 120);
    let lane = randInt(LANE_COUNT);
    if (lane < 0 || lane >= LANE_COUNT) lane = getNearestLane(body.position.x);
    const tries = 3;
    for (let i = 0; i < tries; i++) {
      const pick = randInt(LANE_COUNT);
      if (!isLaneBlocked(state, pick, spawnY, 140, -1)) {
        lane = pick;
        break;
      }
    }
    const x = getLaneX(lane);
    const roll = random();
    const type: PowerUpType = roll < 0.4 ? 'repair' : roll < 0.7 ? 'turbo' : 'shield';
    const value = type === 'repair' ? 12 : 0;
    spawnPowerUp(state, type, x, spawnY, value);
    log('SPAWN', `✨ ${type.toUpperCase()} power-up spawned`);
  }

  // === PURSUER POLICE from BEHIND! ===
  state.pursuerSpawnTimer -= stepDt;
  if (state.pursuerSpawnTimer <= 0 && state.heat > 0.25) {
    const intensity = clamp01((state.heat - 0.25) / 0.75);
    state.pursuerSpawnTimer = lerp(10, 4.5, intensity) + randRange(0, 2);
    const lane = randInt(LANE_COUNT);
    const x = getLaneX(lane);
    const spawnY = body.position.y + 700;
    const pursuer = createVehicle(state.engine, 'police', x, spawnY, lane);
    pursuer.isPursuer = true;
    pursuer.isChasing = true;
    pursuer.spawnGraceTimer = 1.2;
    pursuer.policeModeTimer = randRange(1.6, 3.2);
    pursuer.targetSpeed = lerp(10, 14, intensity) + randRange(0, 2);
    state.traffic.push(pursuer);
    log('SPAWN', `🚨 PURSUER POLICE #${pursuer.id} spawned BEHIND! [PURSUING]`);
    triggerAlert(state, 'POLICE BEHIND', '#ff4444');
  }

  // CHAOS PHYSICS: Cars get THROWN around and SLIDE!
  const playerX = body.position.x;
  const playerY = body.position.y;
  Matter.Body.setPosition(state.barriers.left, { x: ROAD_LEFT - BARRIER_WIDTH / 2, y: playerY });
  Matter.Body.setPosition(state.barriers.right, { x: ROAD_RIGHT + BARRIER_WIDTH / 2, y: playerY });
  state.traffic = state.traffic.filter((v) => {
    const trafficX = v.body.position.x;
    const trafficY = v.body.position.y;
    const relY = trafficY - playerY;
    v.lane = getNearestLane(trafficX);

    // === WRECKED VEHICLES: Stay as obstacles ===
    if (v.isWrecked) {
      if (relY > 1200 || relY < -1400) {
        Matter.Composite.remove(state.engine.world, v.body);
        return false;
      }
      return true;
    }

    // Decay stun timer
    if (v.stunTimer > 0 && v.stunTimer < 900) {
      v.stunTimer = Math.max(0, v.stunTimer - stepDt);
    }

    // === FIND NEAREST CAR AHEAD for distance keeping ===
    let nearestAheadDist = Infinity;
    for (const other of state.traffic) {
      if (other.id === v.id) continue;
      const otherY = other.body.position.y;
      const otherX = other.body.position.x;
      // Car is ahead if lower Y (going up = negative direction)
      if (otherY < trafficY && Math.abs(otherX - trafficX) < 50) {
        const dist = trafficY - otherY;
        if (dist < nearestAheadDist) nearestAheadDist = dist;
      }
    }

    // === CALCULATE SPEED based on target, distance, and pursuit ===
    let desiredSpeed = v.targetSpeed;
    const playerSpeed = Math.abs(state.player.body.velocity.y);

    // Keep natural distance from car ahead (unless chasing)
    if (!v.isChasing && nearestAheadDist < 120) {
      desiredSpeed *= nearestAheadDist / 120; // Slow down proportionally
    }

    // Pursuers (from behind) move FASTER to catch up
    if (v.isPursuer) {
      desiredSpeed = v.targetSpeed * 1.5; // 50% faster pursuit
    }

    if (v.type === 'police') {
      const closeY = Math.abs(relY) < 140;
      if (closeY) {
        desiredSpeed = lerp(desiredSpeed, playerSpeed + 2, 0.25);
      }
      if (v.spawnGraceTimer > 0) {
        desiredSpeed = Math.min(desiredSpeed, playerSpeed + 1);
      }
    } else if (v.aiMode === 'escort') {
      desiredSpeed = Math.min(desiredSpeed, playerSpeed + 0.6);
    } else if (v.aiMode === 'block') {
      if (Math.abs(relY) < 220) {
        desiredSpeed = lerp(desiredSpeed, playerSpeed + 0.5, 0.2);
      }
    }

    // === STUNNED: NO CONTROL - just slide! ===
    if (v.stunTimer <= 0) {
      // === NORMAL AI ===
      let steerForce = 0;

      // Police/chasers pursue aggressively
      if (v.type === 'police') {
        updatePoliceTimers(v, stepDt);
        updatePoliceMode(v);
        steerForce = getPoliceSteer(state, v, relY);
      } else if (v.isChasing || (v.hits > 0 && random() < 0.5)) {
        if (v.hits > 0 && !v.isChasing) {
          v.isChasing = true;
          log('HIT', `🔥 ${v.type.toUpperCase()} #${v.id} is now ANGRY!`);
        }

        const dx = playerX - trafficX;
        steerForce = Math.sign(dx) * 0.3;
      } else if (v.type !== 'geldtransporter') {
        updateTargetLane(state, v, relY, stepDt);
        // Regular traffic - lane keeping + avoid getting too close to others
        const targetX = getLaneX(v.targetLane);
        const laneError = targetX - trafficX;
        if (Math.abs(laneError) > 20) {
          const baseSteer = v.aiMode === 'weave' ? 0.06 : v.aiMode === 'block' ? 0.08 : 0.04;
          steerForce = Math.sign(laneError) * baseSteer;
        }

        // Gentle avoidance of nearby cars in same lane
        for (const other of state.traffic) {
          if (other.id === v.id) continue;
          const ox = other.body.position.x;
          const oy = other.body.position.y;
          const distX = ox - trafficX;
          const distY = Math.abs(oy - trafficY);
          if (distY < 80 && Math.abs(distX) < 40) {
            steerForce -= Math.sign(distX) * 0.08; // Move away
          }
        }
      } else {
        updateTargetLane(state, v, relY, stepDt);
        const targetX = getLaneX(v.targetLane);
        const laneError = targetX - trafficX;
        if (Math.abs(laneError) > 16) {
          steerForce = Math.sign(laneError) * 0.03;
        }
      }

      applyDriveForces(v.body, -desiredSpeed, steerForce, AI_DRIVE);
    }

    // Remove if way off screen
    if (relY > 900 || relY < -1200 || trafficX < ROAD_LEFT - 200 || trafficX > ROAD_RIGHT + 200) {
      Matter.Composite.remove(state.engine.world, v.body);
      return false;
    }
    return true;
  });

  // Arcade traction & angular control (pre-step clamp)
  applyArcadeTraction(body, stepDt, PLAYER_TRACTION);
  for (const v of state.traffic) {
    if (v.isWrecked) {
      applyArcadeTraction(v.body, stepDt, WRECKED_TRACTION);
    } else if (v.stunTimer > 0) {
      applyArcadeTraction(v.body, stepDt, STUN_TRACTION);
    } else {
      applyArcadeTraction(v.body, stepDt, AI_TRACTION);
    }
  }

  state.player.prevPosition = { x: body.position.x, y: body.position.y };
  state.player.prevAngle = body.angle;
  for (const v of state.traffic) {
    v.prevPosition = { x: v.body.position.x, y: v.body.position.y };
    v.prevAngle = v.body.angle;
  }

  // Physics step
  Matter.Engine.update(state.engine, stepDt * 1000);

  clampBodyMotion(body, MAX_SPEED, PLAYER_TRACTION.maxAngVel);
  for (const v of state.traffic) {
    const traction = v.isWrecked ? WRECKED_TRACTION : v.stunTimer > 0 ? STUN_TRACTION : AI_TRACTION;
    clampBodyMotion(v.body, MAX_SPEED, traction.maxAngVel);
    if (!v.isWrecked && v.stunTimer <= 0) {
      applyRoadBounds(v.body, 0.0014, 14);
    }
  }

  applyRoadBounds(body);
  state.scrollY = -body.position.y;

  // Handle collisions
  handleCollisions(state);

  // Power-ups
  updatePowerUps(state, stepDt);

  // Check for bust
  if (state.player.integrity <= 0) {
    state.busted = true;
    state.bustedTimer = 2.5;
    const lostCash = Math.floor(state.cash * 0.3);
    state.cash -= lostCash;
    state.heat = 0;
    state.stars = 0;
    state.elapsedTime = 0;
    state.lastHeatGainTime = performance.now();
    log('BUSTED', `💀 BUSTED! Lost $${lostCash.toLocaleString()} in bribes`);
  }
};

// ============================================================================
// COLLISION HANDLING (Using Matter.js collision pairs - REAL PHYSICS!)
// ============================================================================

const handleCollisions = (state: GameState): void => {
  const currentCollisions = new Set<number>();

  // Use Matter.js collision pairs (works because we use velocity-based movement)
  const pairs = (state.engine as EngineWithPairs).pairs.list;
  for (const pair of pairs) {
    if (!pair.isActive) continue;
    const labels = [pair.bodyA.label, pair.bodyB.label];

    // Barrier collision
    if (labels.includes('player') && labels.includes('barrier')) {
      const now = performance.now();
      const lateralSpeed = Math.abs(state.player.body.velocity.x);
      if (lateralSpeed > 1 && now - state.lastBarrierDamageTime > 200 && state.playerIFrameTimer <= 0) {
        const shieldMultiplier = state.playerShieldTimer > 0 ? 0.35 : 1;
        const damage = Math.min(7, Math.max(0.5, (lateralSpeed - 1) * 1.0)) * shieldMultiplier;
        state.player.integrity -= damage;
        state.lastBarrierDamageTime = now;
        state.lastCollisionTime = now;
        applyHeatGain(state, 0.001, now);
        state.playerIFrameTimer = 0.25;
        state.screenShake = Math.max(state.screenShake, Math.min(4, lateralSpeed));
        log('DAMAGE', `Player scraped barrier (-${damage.toFixed(1)}%)`);
      }
    }

    // Vehicle collision
    if (labels.includes('player') && !labels.includes('barrier')) {
      const vehicle = state.traffic.find((v) => v.body === pair.bodyA || v.body === pair.bodyB);
      if (vehicle !== undefined) {
        currentCollisions.add(vehicle.id);
      }
    }
  }

  // Process NEW collisions (not in previous frame)
  for (const vehicleId of currentCollisions) {
    if (!state.activeCollisions.has(vehicleId)) {
      const vehicle = state.traffic.find((v) => v.id === vehicleId);
      if (vehicle !== undefined) {
        const canDamageVehicle = !vehicle.isWrecked;
        const collisionTime = performance.now();
        state.lastCollisionTime = collisionTime; // Reset star decay timer

        // === ENERGY-BASED COLLISION FEEL ===
        const playerBody = state.player.body;
        const vehicleBody = vehicle.body;
        const vehicleConfig = VEHICLE_CONFIGS[vehicle.type];
        const playerConfig = VEHICLE_CONFIGS.player;

        // Relative velocity (impact speed)
        const relVx = playerBody.velocity.x - vehicleBody.velocity.x;
        const relVy = playerBody.velocity.y - vehicleBody.velocity.y;
        const impactSpeed = Math.hypot(relVx, relVy);
        const energy = impactEnergy(playerBody, vehicleBody);

        // Position difference for push direction
        const posX = vehicleBody.position.x - playerBody.position.x;
        const posY = vehicleBody.position.y - playerBody.position.y;
        const posDist = Math.sqrt(posX * posX + posY * posY) || 1;
        const pushDirX = posX / posDist;
        const pushDirY = posY / posDist;

        // Collision type
        const playerWidth = playerConfig.width;
        const isFrontal = posY < -20 && Math.abs(posX) < playerWidth * 0.8;
        const isSide = Math.abs(posY) < 30 && Math.abs(posX) > playerWidth * 0.3;
        const isRear = posY > 20;

        const tier = impactTier(energy);
        const heatGain = tier === 'tap' ? 0 : tier === 'hit' ? 0.003 : tier === 'slam' ? 0.006 : 0.012;
        applyHeatGain(state, heatGain, collisionTime);

        const basePlayerDamage = tier === 'tap' ? 0 : tier === 'hit' ? 1.5 : tier === 'slam' ? 4 : 8;
        const baseVehicleDamage = tier === 'tap' ? 0 : tier === 'hit' ? 10 : tier === 'slam' ? 24 : 45;

        const directionMultiplier = isFrontal ? 0.25 : isSide ? 0.7 : isRear ? 1.0 : 0.5;
        const heatScale = lerp(0.65, 1.0, state.heat);
        const shieldMultiplier = state.playerShieldTimer > 0 ? 0.35 : 1;
        const playerDamage = basePlayerDamage * directionMultiplier * heatScale * shieldMultiplier;
        if (playerDamage > 0 && state.playerIFrameTimer <= 0) {
          state.player.integrity -= playerDamage;
          const iFrameDuration = tier === 'crash' ? 0.5 : tier === 'slam' ? 0.35 : tier === 'hit' ? 0.2 : 0;
          state.playerIFrameTimer = Math.max(
            state.playerIFrameTimer,
            iFrameDuration
          );
          state.hitFlash = Math.max(state.hitFlash, tier === 'crash' ? 0.35 : tier === 'slam' ? 0.25 : 0.15);
          log('DAMAGE', `💥 Player hit (-${playerDamage.toFixed(1)}%)`);
        }

        const vehicleDamage = baseVehicleDamage * (isFrontal ? 1.2 : 1);
        if (canDamageVehicle && vehicleDamage > 0) {
          vehicle.integrity = Math.max(0, vehicle.integrity - vehicleDamage);
          vehicle.hits = Math.min(vehicle.hits + 1, 6);
          log('HIT', `🚗 ${vehicle.type.toUpperCase()} #${vehicle.id} -${vehicleDamage.toFixed(1)}%`);
        }

        if (tier === 'slam' || tier === 'crash') {
          state.slowMo = 0.12;
          state.screenShake = Math.max(state.screenShake, Math.min(6, energy / 40));
        }

        // Stun based on impact (lighter cars stunned longer)
        vehicle.stunTimer = Math.min(2.5, 0.2 + impactSpeed * 0.08 / Math.sqrt(vehicleConfig.mass / 10));

        // === PUSH FEEL ===
        const massRatio = playerConfig.mass / vehicleConfig.mass;
        const baseImpulse = impactSpeed * 0.18;
        const vehiclePushStrength = baseImpulse * massRatio;
        const playerPushStrength = baseImpulse / massRatio;

        if (isFrontal) {
          log('COLLISION', `🛡️ RAM BAR HIT! ${vehicle.type.toUpperCase()} #${vehicle.id}`);
          Matter.Body.setVelocity(vehicleBody, {
            x: vehicleBody.velocity.x + pushDirX * vehiclePushStrength,
            y: vehicleBody.velocity.y + Math.abs(pushDirY) * vehiclePushStrength * 0.25,
          });
          const spinForce = posX * 0.0018 * impactSpeed / Math.sqrt(vehicleConfig.mass / 10);
          Matter.Body.setAngularVelocity(vehicleBody, vehicleBody.angularVelocity + spinForce);
        } else if (isSide || isRear) {
          Matter.Body.setVelocity(vehicleBody, {
            x: vehicleBody.velocity.x + pushDirX * vehiclePushStrength * 0.7,
            y: vehicleBody.velocity.y + pushDirY * vehiclePushStrength * 0.3,
          });
          Matter.Body.setVelocity(playerBody, {
            x: playerBody.velocity.x - pushDirX * playerPushStrength,
            y: playerBody.velocity.y,
          });
          Matter.Body.setAngularVelocity(vehicleBody, vehicleBody.angularVelocity + posX * 0.0008);
          Matter.Body.setAngularVelocity(playerBody, playerBody.angularVelocity - posX * 0.0004);
        } else {
          Matter.Body.setVelocity(vehicleBody, {
            x: vehicleBody.velocity.x + pushDirX * vehiclePushStrength * 0.5,
            y: vehicleBody.velocity.y + pushDirY * vehiclePushStrength * 0.2,
          });
          Matter.Body.setVelocity(playerBody, {
            x: playerBody.velocity.x - pushDirX * playerPushStrength * 0.3,
            y: playerBody.velocity.y,
          });
        }

        if (canDamageVehicle && vehicle.integrity <= 0) {
          log('HIT', `🚗 ${vehicle.type.toUpperCase()} #${vehicle.id} wrecked`);
          if (vehicle.type === 'geldtransporter' || vehicle.type === 'police') {
            state.slowMo = 0.18;
          }
          destroyVehicle(state, vehicle);
          currentCollisions.delete(vehicleId);
        }
      }
    }
  }

  // Update active collisions for next frame
  state.activeCollisions.clear();
  for (const id of currentCollisions) {
    state.activeCollisions.add(id);
  }
};

const destroyVehicle = (state: GameState, vehicle: Vehicle): void => {
  if (vehicle.isWrecked) return;
  const config = VEHICLE_CONFIGS[vehicle.type];
  const [minCash, maxCash] = config.cashDrop;

  // Cash drop
  if (maxCash > 0) {
    const cashAmount = minCash + randInt(maxCash - minCash);
    state.cash += cashAmount;
    log('CASH', `💰 +$${cashAmount.toLocaleString()} from ${vehicle.type.toUpperCase()} (Total: $${state.cash.toLocaleString()})`);
  }

  // Repair drop
  if (config.repairDrop > 0) {
    spawnPowerUp(state, 'repair', vehicle.body.position.x, vehicle.body.position.y, config.repairDrop);
    log('DAMAGE', `🔧 Repair drop from ${vehicle.type.toUpperCase()}`);
  }

  // Power-up drops
  const dropRoll = random();
  if (vehicle.type === 'police' && dropRoll < 0.35) {
    spawnPowerUp(state, 'shield', vehicle.body.position.x, vehicle.body.position.y, 0);
  } else if (vehicle.type === 'sports' && dropRoll < 0.2) {
    spawnPowerUp(state, 'turbo', vehicle.body.position.x, vehicle.body.position.y, 0);
  } else if (vehicle.type === 'truck' && dropRoll < 0.18) {
    spawnPowerUp(state, 'shield', vehicle.body.position.x, vehicle.body.position.y, 0);
  } else if (vehicle.type === 'geldtransporter' && dropRoll < 0.6) {
    spawnPowerUp(state, 'turbo', vehicle.body.position.x, vehicle.body.position.y, 0);
  }

  // Heat escalation for special vehicles
  if (vehicle.type === 'police') {
    applyHeatGain(state, 0.03, performance.now());
    log('STAR', '⭐ Wanted level increased (destroyed police car!)');
  } else if (vehicle.type === 'geldtransporter') {
    applyHeatGain(state, 0.05, performance.now());
    log('STAR', '⭐⭐ Wanted level increased (HEIST!)');
  }

  log('DESTROY', `💥 ${vehicle.type.toUpperCase()} #${vehicle.id} WRECKED! (stays as obstacle)`);

  // Mark as wrecked - DON'T remove! Car stays as obstacle
  vehicle.isWrecked = true;
  vehicle.stunTimer = 999; // Permanent stun
  // Stop the car
  Matter.Body.setVelocity(vehicle.body, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(vehicle.body, 0);
};

// ============================================================================
// RENDERING
// ============================================================================

const render = (ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number, alpha: number): void => {
  ctx.save();

  if (state.screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShake;
    const shakeY = (Math.random() - 0.5) * state.screenShake;
    ctx.translate(shakeX, shakeY);
  }

  const cx = snap(w / 2);
  const clampedAlpha = clamp01(alpha);
  const playerPos = {
    x: lerp(state.player.prevPosition.x, state.player.body.position.x, clampedAlpha),
    y: lerp(state.player.prevPosition.y, state.player.body.position.y, clampedAlpha),
  };
  const playerAngle = lerpAngle(state.player.prevAngle, state.player.body.angle, clampedAlpha);
  const playerScreenY = snap(h * 0.65);

  // Clear with grass
  ctx.fillStyle = '#228b22';
  ctx.fillRect(0, 0, w, h);

  // Road
  ctx.fillStyle = '#333';
  ctx.fillRect(cx + ROAD_LEFT, 0, ROAD_WIDTH, h);

  // Barriers
  ctx.fillStyle = '#aaa';
  ctx.fillRect(cx + ROAD_LEFT - BARRIER_WIDTH, 0, BARRIER_WIDTH, h);
  ctx.fillRect(cx + ROAD_RIGHT, 0, BARRIER_WIDTH, h);

  // Lane markers
  ctx.fillStyle = '#fff';
  const dashLen = 35;
  const gapLen = 25;
  const totalLen = dashLen + gapLen;
  const scrollY = -playerPos.y;
  const offset = scrollY % totalLen;

  for (let lane = 1; lane < LANE_COUNT; lane++) {
    const laneX = cx + ROAD_LEFT + lane * LANE_WIDTH;
    for (let y = offset - totalLen; y < h + totalLen; y += totalLen) {
      ctx.fillRect(laneX - 1.5, y, 3, dashLen);
    }
  }

  // Power-ups
  for (const powerUp of state.powerUps) {
    const screenY = snap(playerScreenY + (powerUp.y - playerPos.y));
    const screenX = snap(cx + powerUp.x);
    drawPowerUp(ctx, powerUp, screenX, screenY);
  }

  // Draw traffic relative to player position
  for (const v of state.traffic) {
    const trafficPos = {
      x: lerp(v.prevPosition.x, v.body.position.x, clampedAlpha),
      y: lerp(v.prevPosition.y, v.body.position.y, clampedAlpha),
    };
    const trafficAngle = lerpAngle(v.prevAngle, v.body.angle, clampedAlpha);
    const screenY = snap(playerScreenY + (trafficPos.y - playerPos.y));
    const screenX = snap(cx + trafficPos.x);
    drawVehicle(ctx, v, screenX, screenY, trafficAngle);
  }

  // Draw player
  drawVehicle(ctx, state.player, snap(cx + playerPos.x), playerScreenY, playerAngle);

  // HUD
  drawHUD(ctx, state, w);

  // Control hints (first seconds in manual mode)
  if (!state.demoMode && state.controlHintTimer > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.controlHintTimer / 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(w / 2 - 190, h - 72, 380, 44);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STEER: A/D or \u2190/\u2192  ACCEL: W/\u2191  BOOST: SPACE  BRAKE: S/\u2193  DEMO: F1', w / 2, h - 45);
    ctx.restore();
  }

  if (state.alertTimer > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.alertTimer / 0.4);
    ctx.fillStyle = state.alertColor;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.alertText, w / 2, 60);
    ctx.restore();
  }

  // Demo mode indicator
  if (state.demoMode) {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🤖 DEMO MODE - Press F1 to take control', w / 2, 30);
    ctx.textAlign = 'left';
  }

  // Busted overlay
  if (state.busted) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 72px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BUSTED!', w / 2, h / 2 - 40);
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText(`Lost $${Math.floor(state.cash * 0.3).toLocaleString()} in bribes`, w / 2, h / 2 + 20);
    ctx.textAlign = 'left';
  }

  // Low integrity warning
  if (!state.busted && state.player.integrity <= 20) {
    const pulse = 0.35 + 0.35 * Math.sin(state.elapsedTime * 6);
    ctx.fillStyle = `rgba(255, 40, 40, ${pulse})`;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CRITICAL INTEGRITY', w / 2, 90);
    ctx.textAlign = 'left';
  }

  // Hit flash
  if (state.hitFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${state.hitFlash})`;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
};

const drawVehicle = (ctx: CanvasRenderingContext2D, v: Vehicle, screenX: number, screenY: number, angle: number): void => {
  const config = VEHICLE_CONFIGS[v.type];
  const hw = config.width / 2;
  const hh = config.height / 2;
  const bodyW = config.width;
  const bodyH = config.height;
  const base = config.color;
  const accent = config.accent;
  const dark = shadeColor(base, -40);
  const mid = shadeColor(base, -15);
  const light = shadeColor(base, 35);
  const glass = '#1f2a33';
  const trim = '#101010';

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(angle);

  // Shadow (subtle to avoid ghosting)
  const shadowOffsetX = v.isWrecked ? 3 : 2;
  const shadowOffsetY = v.isWrecked ? 4 : 3;
  ctx.fillStyle = v.isWrecked ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.2)';
  ctx.fillRect(-hw + shadowOffsetX, -hh + shadowOffsetY, bodyW, bodyH);

  // Body - BLACK and BURNING if wrecked
  if (v.isWrecked) {
    // Black burned body
    ctx.fillStyle = '#111';
    ctx.fillRect(-hw, -hh, config.width, config.height);
    // Orange fire border
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 3;
    ctx.strokeRect(-hw, -hh, config.width, config.height);
    // Flames
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(-hw + 2, -hh + 2, 8, 6);
    ctx.fillRect(hw - 10, -hh + 8, 8, 6);
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(-hw + 4, -hh + 4, 4, 4);
    ctx.fillRect(hw - 8, -hh + 10, 4, 4);
    // Smoke puff
    ctx.fillStyle = 'rgba(80,80,80,0.7)';
    ctx.beginPath();
    ctx.arc(0, -hh - 8, 10, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Outer shell
    ctx.fillStyle = dark;
    ctx.fillRect(-hw - 1, -hh - 1, bodyW + 2, bodyH + 2);
    ctx.fillStyle = base;
    ctx.fillRect(-hw, -hh, bodyW, bodyH);

    // Inner panel
    ctx.fillStyle = mid;
    ctx.fillRect(-hw + 2, -hh + 2, bodyW - 4, bodyH - 4);

    // Roof and windows
    const roofW = Math.max(10, bodyW * 0.58);
    const roofH = Math.max(14, bodyH * 0.5);
    ctx.fillStyle = light;
    ctx.fillRect(-roofW / 2, -roofH / 2, roofW, roofH);
    ctx.fillStyle = glass;
    ctx.fillRect(-roofW / 2 + 2, -roofH / 2 + 2, roofW - 4, roofH * 0.34);
    ctx.fillRect(-roofW / 2 + 2, roofH / 2 - roofH * 0.34 - 2, roofW - 4, roofH * 0.34);

    // Side stripe
    ctx.fillStyle = accent;
    ctx.fillRect(-hw + 3, -hh + bodyH * 0.35, bodyW - 6, 4);

    // Bumpers
    ctx.fillStyle = trim;
    ctx.fillRect(-hw + 3, -hh + 1, bodyW - 6, 3);
    ctx.fillRect(-hw + 3, hh - 4, bodyW - 6, 3);

    // Wheels
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(-hw - 2, -hh + 6, 4, 10);
    ctx.fillRect(-hw - 2, hh - 16, 4, 10);
    ctx.fillRect(hw - 2, -hh + 6, 4, 10);
    ctx.fillRect(hw - 2, hh - 16, 4, 10);

    // Type-specific styling
    if (v.type === 'sports') {
      ctx.fillStyle = shadeColor(accent, -10);
      ctx.fillRect(-3, -hh + 4, 6, bodyH - 8);
      ctx.fillStyle = shadeColor(accent, 20);
      ctx.fillRect(-10, -hh + 8, 3, bodyH - 16);
      ctx.fillRect(7, -hh + 8, 3, bodyH - 16);
    }

    if (v.type === 'truck' || v.type === 'geldtransporter') {
      ctx.fillStyle = shadeColor(base, -55);
      ctx.fillRect(-hw + 2, -hh + 6, bodyW - 4, bodyH * 0.32);
      ctx.fillStyle = shadeColor(base, 15);
      ctx.fillRect(-hw + 4, -hh + 8, bodyW - 8, bodyH * 0.18);
    }

    if (v.type === 'police') {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(-hw + 2, -hh + 4, bodyW - 4, bodyH * 0.28);
      ctx.fillStyle = '#222';
      ctx.fillRect(-hw + 2, -hh + 4 + bodyH * 0.28, bodyW - 4, bodyH * 0.18);
      ctx.fillStyle = '#111';
      ctx.fillRect(-8, -hh + 7, 16, 6);
      ctx.fillStyle = '#3498db';
      ctx.fillRect(-7, -hh + 8, 7, 4);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(0, -hh + 8, 7, 4);
    }

    if (v.type === 'geldtransporter') {
      ctx.fillStyle = '#d9b11f';
      ctx.fillRect(-hw + 4, -hh + bodyH * 0.45, bodyW - 8, 6);
      ctx.fillRect(-hw + 4, -hh + bodyH * 0.62, bodyW - 8, 6);
    }

    if (v.type === 'player') {
      ctx.fillStyle = shadeColor(accent, 20);
      ctx.fillRect(-3, -hh + 5, 6, bodyH - 10);
    }

    // Ram bar for player
    if (v.type === 'player') {
      ctx.fillStyle = '#2b2b2b';
      ctx.fillRect(-hw - 2, -hh - 6, bodyW + 4, 8);
      ctx.fillStyle = accent;
      ctx.fillRect(-hw, -hh - 4, bodyW, 4);
    }

    // Lights
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(-hw + 2, -hh + 1, 5, 3);
    ctx.fillRect(hw - 7, -hh + 1, 5, 3);
    ctx.fillStyle = '#cc2222';
    ctx.fillRect(-hw + 2, hh - 4, 5, 3);
    ctx.fillRect(hw - 7, hh - 4, 5, 3);
  }

  // Damage dents/scratches visual (subtle, not red flash)
  if (v.hits > 0 && v.type !== 'player') {
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    // Draw "dents" - random scratches based on hit count
    for (let i = 0; i < v.hits; i++) {
      const sx = -hw + (i * 13 + 5) % config.width;
      const sy = -hh + (i * 17 + 8) % config.height;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 8, sy + 6);
      ctx.stroke();
    }
  }

  ctx.restore();
};

const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUp, screenX: number, screenY: number): void => {
  const alpha = clamp01(powerUp.ttl / 1.2);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(screenX, screenY);
  ctx.fillStyle = '#111';
  ctx.fillRect(-10, -10, 20, 20);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(-10, -10, 20, 20);

  if (powerUp.type === 'repair') {
    ctx.fillStyle = '#3df27a';
    ctx.fillRect(-3, -8, 6, 16);
    ctx.fillRect(-8, -3, 16, 6);
  } else if (powerUp.type === 'shield') {
    ctx.fillStyle = '#46d9ff';
    ctx.beginPath();
    ctx.arc(0, -2, 7, Math.PI, 0);
    ctx.lineTo(6, 6);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#ffd447';
    ctx.fillRect(-2, -8, 4, 6);
    ctx.fillRect(-4, -2, 6, 6);
    ctx.fillRect(0, 2, 4, 6);
  }

  ctx.restore();
};

const drawHUD = (ctx: CanvasRenderingContext2D, state: GameState, w: number): void => {
  // Integrity bar
  ctx.fillStyle = '#222';
  ctx.fillRect(18, 18, 204, 28);
  ctx.fillStyle = '#444';
  ctx.fillRect(20, 20, 200, 24);
  const intColor = state.player.integrity > 50 ? '#2ecc71' : state.player.integrity > 25 ? '#f39c12' : '#e74c3c';
  ctx.fillStyle = intColor;
  ctx.fillRect(20, 20, 200 * Math.max(0, state.player.integrity / 100), 24);

  // Integrity text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`${state.player.integrity.toFixed(0)}%`, 25, 38);

  // Boost bar
  ctx.fillStyle = '#222';
  ctx.fillRect(18, 52, 124, 16);
  ctx.fillStyle = '#333';
  ctx.fillRect(20, 54, 120, 12);
  const boostActive = state.boostActiveTimer > 0;
  const boostReady = state.boost >= BOOST_MAX - 0.1;
  const boostColor = boostActive ? '#ffd447' : boostReady ? '#3df27a' : '#00bfff';
  ctx.fillStyle = boostColor;
  ctx.fillRect(20, 54, 120 * (state.boost / BOOST_MAX), 12);

  // Shield bar
  if (state.playerShieldTimer > 0) {
    const shieldWidth = 120;
    const shieldPct = clamp01(state.playerShieldTimer / SHIELD_DURATION);
    ctx.fillStyle = '#222';
    ctx.fillRect(18, 72, shieldWidth + 4, 10);
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 74, shieldWidth, 6);
    ctx.fillStyle = '#46d9ff';
    ctx.fillRect(20, 74, shieldWidth * shieldPct, 6);
  }

  // Cash
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`$${state.cash.toLocaleString()}`, w - 20, 42);

  // Stars
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < state.stars ? '#f1c40f' : '#333';
    drawStar(ctx, w - 30 - i * 30, 65, 12, 6, 5);
  }

  // Heat meter
  const heatColor = state.heat < 0.33 ? '#2ecc71' : state.heat < 0.66 ? '#f39c12' : '#e74c3c';
  const heatWidth = 140;
  const heatX = w - 20 - heatWidth;
  const heatY = 86;
  ctx.fillStyle = '#222';
  ctx.fillRect(heatX - 2, heatY - 2, heatWidth + 4, 14);
  ctx.fillStyle = '#333';
  ctx.fillRect(heatX, heatY, heatWidth, 10);
  ctx.fillStyle = heatColor;
  ctx.fillRect(heatX, heatY, heatWidth * clamp01(state.heat), 10);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`HEAT ${Math.round(state.heat * 100)}%`, w - 20, heatY + 10);

  ctx.textAlign = 'left';
};

const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, points: number): void => {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
};

// Start the game
main();

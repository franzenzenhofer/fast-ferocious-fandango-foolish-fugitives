import Matter from 'matter-js';
import { createPhysicsEngine, stepPhysics, createRectBody, addBody, removeBody, setVelocity, onCollision } from './physics.ts';
import type { Vehicle, VehicleType } from './vehicles.ts';
import { VEHICLE_CONFIGS, createVehicle } from './vehicles.ts';
import { ROAD_LEFT, ROAD_RIGHT, BARRIER_WIDTH, getLaneX, fx_drawRoad } from './road.ts';
import { fx_drawVehicle } from './render/vehicles.ts';
import { fx_drawHUD } from './render/hud.ts';

export interface GameState {
  engine: Matter.Engine;
  player: Vehicle;
  traffic: Vehicle[];
  pickups: Pickup[];
  cash: number;
  stars: number;
  boost: number;
  worldY: number;
  spawnTimer: number;
  busted: boolean;
  bustedTimer: number;
  starDecayTimer: number;
}

interface Pickup {
  x: number;
  y: number;
  type: 'cash' | 'repair' | 'shield';
  value: number;
  life: number;
}

export const createGame = (): GameState => {
  const engine = createPhysicsEngine();
  const playerConfig = VEHICLE_CONFIGS.player;
  const playerBody = createRectBody(0, 200, playerConfig.width, playerConfig.height, {
    friction: 0.3,
    frictionAir: 0.08,
    restitution: 0.4,
    label: 'player',
    chamfer: { radius: 8 },
  });
  Matter.Body.setMass(playerBody, playerConfig.mass);
  addBody(engine, playerBody);
  const player = createVehicle('player', playerBody, 1);
  addBarriers(engine);
  return {
    engine,
    player,
    traffic: [],
    pickups: [],
    cash: 0,
    stars: 0,
    boost: 100,
    worldY: 0,
    spawnTimer: 0,
    busted: false,
    bustedTimer: 0,
    starDecayTimer: 0,
  };
};

const addBarriers = (engine: Matter.Engine): void => {
  const leftBarrier = createRectBody(ROAD_LEFT - BARRIER_WIDTH / 2, 0, BARRIER_WIDTH, 2000, {
    isStatic: true,
    label: 'barrier',
  });
  const rightBarrier = createRectBody(ROAD_RIGHT + BARRIER_WIDTH / 2, 0, BARRIER_WIDTH, 2000, {
    isStatic: true,
    label: 'barrier',
  });
  addBody(engine, leftBarrier);
  addBody(engine, rightBarrier);
};

export const updateGame = (state: GameState, input: InputState, dt: number): void => {
  if (state.busted) {
    state.bustedTimer -= dt;
    if (state.bustedTimer <= 0) {
      state.busted = false;
      state.player.integrity = 100;
      state.stars = 0;
    }
    return;
  }
  updatePlayer(state, input, dt);
  updateTraffic(state, dt);
  spawnTraffic(state, dt);
  updatePickups(state, dt);
  stepPhysics(state.engine, dt);
  handleCollisions(state);
  state.worldY += getPlayerSpeed(state) * dt * 60;
  if (state.player.integrity <= 0) triggerBusted(state);
};

interface InputState { left: boolean; right: boolean; up: boolean; boost: boolean; brake: boolean; }

const updatePlayer = (state: GameState, input: InputState, dt: number): void => {
  const { player, boost } = state;
  const body = player.body;
  let vx = body.velocity.x;
  let vy = body.velocity.y;
  const steer = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  vx += steer * 0.5;
  const baseSpeed = input.brake ? 2 : 5;
  const boostSpeed = input.boost && boost > 0 ? 4 : 0;
  vy = -(baseSpeed + boostSpeed);
  if (input.boost && boost > 0) state.boost = Math.max(0, boost - 60 * dt);
  else state.boost = Math.min(100, boost + 15 * dt);
  setVelocity(body, vx * 0.92, vy);
};

const getPlayerSpeed = (state: GameState): number => Math.abs(state.player.body.velocity.y);

const updateTraffic = (state: GameState, dt: number): void => {
  const playerY = state.player.body.position.y;
  state.traffic = state.traffic.filter((v) => {
    const dy = v.body.position.y - playerY;
    if (Math.abs(dy) > 600) {
      removeBody(state.engine, v.body);
      return false;
    }
    const config = VEHICLE_CONFIGS[v.type];
    setVelocity(v.body, v.body.velocity.x * 0.95, -(config.maxSpeed - getPlayerSpeed(state)));
    return true;
  });
};

const spawnTraffic = (state: GameState, dt: number): void => {
  state.spawnTimer -= dt;
  if (state.spawnTimer > 0) return;
  state.spawnTimer = 0.8 + Math.random() * 1.2;
  const types: VehicleType[] = ['sedan', 'sedan', 'sports', 'truck'];
  const type = types[Math.floor(Math.random() * types.length)]!;
  const lane = Math.floor(Math.random() * 4);
  const config = VEHICLE_CONFIGS[type];
  const x = getLaneX(lane);
  const y = state.player.body.position.y - 500;
  const body = createRectBody(x, y, config.width, config.height, {
    friction: 0.3,
    frictionAir: 0.05,
    restitution: 0.5,
    label: type,
    chamfer: { radius: 8 },
  });
  Matter.Body.setMass(body, config.mass);
  addBody(state.engine, body);
  state.traffic.push(createVehicle(type, body, lane));
};

const updatePickups = (state: GameState, dt: number): void => {
  const playerX = state.player.body.position.x;
  const playerY = state.player.body.position.y;
  state.pickups = state.pickups.filter((p) => {
    p.life -= dt;
    if (p.life <= 0) return false;
    const dx = p.x - playerX;
    const dy = p.y - playerY;
    if (dx * dx + dy * dy < 900) {
      if (p.type === 'cash') state.cash += p.value;
      else if (p.type === 'repair') state.player.integrity = Math.min(100, state.player.integrity + p.value);
      return false;
    }
    return true;
  });
};

const handleCollisions = (state: GameState): void => {
  const pairs = state.engine.pairs.list;
  for (const pair of pairs) {
    if (!pair.isActive) continue;
    const labels = [pair.bodyA.label, pair.bodyB.label];
    if (labels.includes('player') && labels.includes('barrier')) {
      state.player.integrity -= 0.5;
      if (state.stars < 1) state.stars = 1;
    }
    if (labels.includes('player') && !labels.includes('barrier')) {
      const otherLabel = labels.find((l) => l !== 'player' && l !== 'barrier');
      if (otherLabel !== undefined) handleVehicleCollision(state, otherLabel, pair);
    }
  }
};

const handleVehicleCollision = (state: GameState, type: string, pair: Matter.Pair): void => {
  const vehicle = state.traffic.find((v) => v.body === pair.bodyA || v.body === pair.bodyB);
  if (vehicle === undefined) return;
  vehicle.hits++;
  if (vehicle.hits >= 2) {
    const config = VEHICLE_CONFIGS[vehicle.type];
    const [min, max] = config.cashDrop;
    if (max > 0) {
      state.pickups.push({
        x: vehicle.body.position.x,
        y: vehicle.body.position.y,
        type: 'cash',
        value: min + Math.floor(Math.random() * (max - min)),
        life: 5,
      });
    }
    if (config.repairDrop > 0) {
      state.pickups.push({
        x: vehicle.body.position.x + 20,
        y: vehicle.body.position.y,
        type: 'repair',
        value: config.repairDrop,
        life: 5,
      });
    }
    removeBody(state.engine, vehicle.body);
    state.traffic = state.traffic.filter((v) => v !== vehicle);
  }
};

const triggerBusted = (state: GameState): void => {
  state.busted = true;
  state.bustedTimer = 3;
  state.cash = Math.floor(state.cash * 0.7);
};

export const renderGame = (ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number): void => {
  const playerY = state.player.body.position.y;
  fx_drawRoad(ctx, width, height, state.worldY);
  for (const p of state.pickups) {
    const sx = width / 2 + p.x;
    const sy = height / 2 + (p.y - playerY);
    ctx.fillStyle = p.type === 'cash' ? '#ffd700' : '#2ecc71';
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const v of state.traffic) {
    const sx = width / 2 + v.body.position.x;
    const sy = height / 2 + (v.body.position.y - playerY);
    fx_drawVehicle(ctx, v, sx, sy, false, false);
  }
  const px = width / 2 + state.player.body.position.x;
  const py = height / 2;
  fx_drawVehicle(ctx, state.player, px, py, true, state.boost < 100 && state.player.body.velocity.y < -6);
  fx_drawHUD(ctx, width, height, state.player.integrity, state.cash, state.stars, state.boost, getPlayerSpeed(state));
  if (state.busted) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 72px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BUSTED!', width / 2, height / 2 - 30);
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText(`Lost $${Math.floor(state.cash * 0.3).toLocaleString()} in bribes`, width / 2, height / 2 + 20);
    ctx.textAlign = 'left';
  }
};

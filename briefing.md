# SPY DRIVER - Modern TypeScript Game Engine Architecture

## 🎯 Design Principles

1. **KISS** - Keep It Simple, Stupid
2. **Modular** - Each system is independent and composable
3. **Functional Core** - Pure functions for game logic, imperative shell for I/O
4. **Side-Effect Naming** - All impure functions prefixed with `fx_` (effects)
5. **Type-Safe** - Strict TypeScript, no `any`
6. **Extensible** - Easy to add new vehicles, physics behaviors, game modes
7. **Testable** - Pure functions are trivially testable

---

## 📁 Project Structure

```
spy-driver/
├── src/
│   ├── engine/                    # Core game engine (reusable)
│   │   ├── core/
│   │   │   ├── types.ts           # Core type definitions
│   │   │   ├── ecs.ts             # Entity Component System
│   │   │   ├── events.ts          # Event bus (pub/sub)
│   │   │   └── loop.ts            # Game loop with fixed timestep
│   │   │
│   │   ├── physics/
│   │   │   ├── types.ts           # Physics types (Body, Vector, etc.)
│   │   │   ├── vector.ts          # Vector2D math (pure)
│   │   │   ├── body.ts            # Rigid body functions (pure)
│   │   │   ├── collision.ts       # Collision detection (pure)
│   │   │   ├── resolver.ts        # Collision resolution (pure)
│   │   │   ├── world.ts           # Physics world state
│   │   │   └── index.ts           # Public API
│   │   │
│   │   ├── render/
│   │   │   ├── types.ts           # Render types
│   │   │   ├── canvas.ts          # Canvas2D renderer
│   │   │   ├── camera.ts          # Camera/viewport (pure transforms)
│   │   │   ├── sprites.ts         # Sprite management
│   │   │   ├── particles.ts       # Particle system
│   │   │   └── index.ts
│   │   │
│   │   ├── input/
│   │   │   ├── types.ts           # Input types
│   │   │   ├── keyboard.ts        # Keyboard handler
│   │   │   ├── touch.ts           # Touch/gesture handler
│   │   │   ├── gamepad.ts         # Gamepad support
│   │   │   └── index.ts
│   │   │
│   │   ├── audio/
│   │   │   ├── types.ts
│   │   │   ├── manager.ts         # Audio manager
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts               # Engine public API
│   │
│   ├── game/                      # Game-specific code
│   │   ├── components/            # ECS Components
│   │   │   ├── transform.ts
│   │   │   ├── physics-body.ts
│   │   │   ├── vehicle.ts
│   │   │   ├── player.ts
│   │   │   ├── ai-driver.ts
│   │   │   ├── health.ts
│   │   │   ├── score.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── systems/               # ECS Systems
│   │   │   ├── physics.system.ts
│   │   │   ├── player-input.system.ts
│   │   │   ├── ai.system.ts
│   │   │   ├── collision.system.ts
│   │   │   ├── damage.system.ts
│   │   │   ├── scoring.system.ts
│   │   │   ├── traffic.system.ts
│   │   │   ├── render.system.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── entities/              # Entity factories
│   │   │   ├── player-car.ts
│   │   │   ├── traffic-car.ts
│   │   │   ├── truck.ts
│   │   │   ├── police-car.ts
│   │   │   ├── obstacle.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── scenes/                # Game scenes/states
│   │   │   ├── menu.scene.ts
│   │   │   ├── game.scene.ts
│   │   │   ├── pause.scene.ts
│   │   │   └── gameover.scene.ts
│   │   │
│   │   ├── config/                # Game configuration
│   │   │   ├── physics.config.ts
│   │   │   ├── vehicles.config.ts
│   │   │   ├── difficulty.config.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts               # Game entry point
│   │
│   ├── ui/                        # UI Layer (optional: Preact/Solid)
│   │   ├── components/
│   │   │   ├── HUD.tsx
│   │   │   ├── HealthBar.tsx
│   │   │   ├── ScoreDisplay.tsx
│   │   │   └── Menu.tsx
│   │   └── index.ts
│   │
│   ├── utils/                     # Shared utilities
│   │   ├── math.ts                # Math helpers (pure)
│   │   ├── random.ts              # Seeded random (pure)
│   │   ├── pool.ts                # Object pooling
│   │   └── debug.ts               # Debug utilities
│   │
│   └── main.ts                    # Application entry
│
├── tests/
│   ├── engine/
│   │   ├── physics/
│   │   │   ├── vector.test.ts
│   │   │   ├── collision.test.ts
│   │   │   └── resolver.test.ts
│   │   └── ecs.test.ts
│   └── game/
│       └── systems/
│
├── public/
│   ├── assets/
│   │   ├── sprites/
│   │   ├── audio/
│   │   └── fonts/
│   └── index.html
│
├── .eslintrc.cjs
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── package.json
└── README.md
```

---

## 🛠 Tech Stack

### Core

| Tool | Purpose | Why |
|------|---------|-----|
| **TypeScript 5.4+** | Language | Strict typing, latest features |
| **Vite 5** | Build/Dev | Fast HMR, ESM-native, tiny config |
| **Vitest** | Testing | Vite-native, fast, Jest-compatible |
| **ESLint 9** | Linting | Flat config, strict rules |
| **Prettier** | Formatting | Consistent code style |

### Optional UI Layer

| Tool | Purpose | Why |
|------|---------|-----|
| **Preact** or **Solid.js** | UI Components | Tiny, fast, for HUD/menus only |

### Development

| Tool | Purpose |
|------|---------|
| **tsx** | Run TS directly for scripts |
| **husky** | Git hooks |
| **lint-staged** | Pre-commit checks |

---

## 📦 Package.json

```json
{
  "name": "spy-driver",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "check": "npm run typecheck && npm run lint && npm run test"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vitest": "^1.4.0",
    "@vitest/coverage-v8": "^1.4.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "prettier": "^3.2.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  },
  "dependencies": {
    "preact": "^10.20.0"
  }
}
```

---

## ⚙️ TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    
    // Strict mode - ALL ON
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    
    // Module
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    
    // Paths
    "baseUrl": ".",
    "paths": {
      "@engine/*": ["src/engine/*"],
      "@game/*": ["src/game/*"],
      "@utils/*": ["src/utils/*"],
      "@ui/*": ["src/ui/*"]
    },
    
    // JSX (if using Preact)
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

## 🔍 ESLint Config (Flat)

```javascript
// eslint.config.js
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript strict
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      
      // Functional style
      'no-var': 'error',
      'prefer-const': 'error',
      'no-param-reassign': 'error',
      
      // Side-effect naming convention
      // Functions with side effects MUST start with fx_
      // This is enforced by custom rule or naming convention check
    },
  },
];
```

---

## 🎮 Core Engine Types

```typescript
// src/engine/core/types.ts

/** Unique identifier for entities */
export type EntityId = number & { readonly __brand: 'EntityId' };

/** Timestamp in milliseconds */
export type Timestamp = number & { readonly __brand: 'Timestamp' };

/** Delta time in seconds */
export type DeltaTime = number & { readonly __brand: 'DeltaTime' };

/** Game loop state */
export interface GameTime {
  readonly total: Timestamp;      // Total elapsed time
  readonly delta: DeltaTime;      // Time since last frame
  readonly frame: number;         // Frame count
  readonly fps: number;           // Current FPS
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
```

---

## 🔢 Vector Math (Pure Functions)

```typescript
// src/engine/physics/vector.ts

/** 2D Vector - immutable */
export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

// ============================================
// PURE FUNCTIONS - No side effects
// ============================================

/** Create a new vector */
export const vec2 = (x: number, y: number): Vec2 => ({ x, y });

/** Zero vector */
export const ZERO: Vec2 = { x: 0, y: 0 };

/** Add two vectors */
export const add = (a: Vec2, b: Vec2): Vec2 => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

/** Subtract vectors (a - b) */
export const sub = (a: Vec2, b: Vec2): Vec2 => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

/** Scale vector by scalar */
export const scale = (v: Vec2, s: number): Vec2 => ({
  x: v.x * s,
  y: v.y * s,
});

/** Dot product */
export const dot = (a: Vec2, b: Vec2): number =>
  a.x * b.x + a.y * b.y;

/** Cross product (2D = scalar) */
export const cross = (a: Vec2, b: Vec2): number =>
  a.x * b.y - a.y * b.x;

/** Vector length/magnitude */
export const length = (v: Vec2): number =>
  Math.sqrt(v.x * v.x + v.y * v.y);

/** Squared length (faster, for comparisons) */
export const lengthSq = (v: Vec2): number =>
  v.x * v.x + v.y * v.y;

/** Normalize to unit vector */
export const normalize = (v: Vec2): Vec2 => {
  const len = length(v);
  return len > 0 ? scale(v, 1 / len) : ZERO;
};

/** Distance between two points */
export const distance = (a: Vec2, b: Vec2): number =>
  length(sub(b, a));

/** Rotate vector by angle (radians) */
export const rotate = (v: Vec2, angle: number): Vec2 => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
};

/** Linear interpolation */
export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/** Perpendicular vector (90° rotation) */
export const perp = (v: Vec2): Vec2 => ({ x: -v.y, y: v.x });

/** Reflect vector off normal */
export const reflect = (v: Vec2, normal: Vec2): Vec2 => {
  const d = dot(v, normal) * 2;
  return sub(v, scale(normal, d));
};
```

---

## 🏎️ Physics Body (Pure Functions)

```typescript
// src/engine/physics/body.ts

import type { Vec2 } from './vector';
import * as V from './vector';

/** Rigid body shape */
export type BodyShape =
  | { readonly type: 'circle'; readonly radius: number }
  | { readonly type: 'rect'; readonly width: number; readonly height: number }
  | { readonly type: 'polygon'; readonly vertices: readonly Vec2[] };

/** Rigid body state - immutable */
export interface Body {
  readonly id: number;
  readonly position: Vec2;
  readonly velocity: Vec2;
  readonly acceleration: Vec2;
  readonly angle: number;
  readonly angularVelocity: number;
  readonly mass: number;
  readonly invMass: number;         // 1/mass (0 for static)
  readonly inertia: number;
  readonly invInertia: number;
  readonly restitution: number;     // Bounciness 0-1
  readonly friction: number;        // Surface friction
  readonly shape: BodyShape;
  readonly isStatic: boolean;
  readonly isSensor: boolean;       // No physical response
  readonly collisionMask: number;   // Bit mask for layers
}

/** Body configuration for creation */
export interface BodyConfig {
  readonly position?: Vec2;
  readonly velocity?: Vec2;
  readonly angle?: number;
  readonly mass?: number;
  readonly restitution?: number;
  readonly friction?: number;
  readonly shape: BodyShape;
  readonly isStatic?: boolean;
  readonly isSensor?: boolean;
  readonly collisionMask?: number;
}

// ============================================
// PURE FUNCTIONS
// ============================================

let nextBodyId = 0;

/** Create a new body */
export const createBody = (config: BodyConfig): Body => {
  const mass = config.isStatic ? 0 : (config.mass ?? 1);
  const invMass = mass > 0 ? 1 / mass : 0;
  const inertia = calculateInertia(config.shape, mass);
  
  return {
    id: nextBodyId++,
    position: config.position ?? V.ZERO,
    velocity: config.velocity ?? V.ZERO,
    acceleration: V.ZERO,
    angle: config.angle ?? 0,
    angularVelocity: 0,
    mass,
    invMass,
    inertia,
    invInertia: inertia > 0 ? 1 / inertia : 0,
    restitution: config.restitution ?? 0.5,
    friction: config.friction ?? 0.3,
    shape: config.shape,
    isStatic: config.isStatic ?? false,
    isSensor: config.isSensor ?? false,
    collisionMask: config.collisionMask ?? 0xFFFFFFFF,
  };
};

/** Calculate moment of inertia for shape */
const calculateInertia = (shape: BodyShape, mass: number): number => {
  if (mass === 0) return 0;
  
  switch (shape.type) {
    case 'circle':
      return (mass * shape.radius * shape.radius) / 2;
    case 'rect':
      return (mass * (shape.width ** 2 + shape.height ** 2)) / 12;
    case 'polygon':
      // Simplified - use bounding box
      return mass * 100; // TODO: proper polygon inertia
  }
};

/** Apply force to body (returns new body) */
export const applyForce = (body: Body, force: Vec2): Body => ({
  ...body,
  acceleration: V.add(
    body.acceleration,
    V.scale(force, body.invMass)
  ),
});

/** Apply impulse (instant velocity change) */
export const applyImpulse = (
  body: Body,
  impulse: Vec2,
  contactPoint?: Vec2
): Body => {
  const newVelocity = V.add(body.velocity, V.scale(impulse, body.invMass));
  
  let newAngularVel = body.angularVelocity;
  if (contactPoint && body.invInertia > 0) {
    const r = V.sub(contactPoint, body.position);
    const torque = V.cross(r, impulse);
    newAngularVel += torque * body.invInertia;
  }
  
  return {
    ...body,
    velocity: newVelocity,
    angularVelocity: newAngularVel,
  };
};

/** Integrate body physics for one timestep */
export const integrate = (body: Body, dt: number): Body => {
  if (body.isStatic) return body;
  
  // Semi-implicit Euler integration
  const newVelocity = V.add(body.velocity, V.scale(body.acceleration, dt));
  const newPosition = V.add(body.position, V.scale(newVelocity, dt));
  const newAngle = body.angle + body.angularVelocity * dt;
  
  return {
    ...body,
    position: newPosition,
    velocity: newVelocity,
    angle: newAngle,
    acceleration: V.ZERO, // Reset acceleration for next frame
  };
};

/** Apply friction/damping */
export const applyDamping = (body: Body, linear: number, angular: number): Body => ({
  ...body,
  velocity: V.scale(body.velocity, linear),
  angularVelocity: body.angularVelocity * angular,
});

/** Get body's axis-aligned bounding box */
export const getAABB = (body: Body): { min: Vec2; max: Vec2 } => {
  const { shape, position, angle } = body;
  
  switch (shape.type) {
    case 'circle': {
      const r = shape.radius;
      return {
        min: { x: position.x - r, y: position.y - r },
        max: { x: position.x + r, y: position.y + r },
      };
    }
    case 'rect': {
      // Rotated rectangle AABB
      const hw = shape.width / 2;
      const hh = shape.height / 2;
      const cos = Math.abs(Math.cos(angle));
      const sin = Math.abs(Math.sin(angle));
      const ex = hw * cos + hh * sin;
      const ey = hw * sin + hh * cos;
      return {
        min: { x: position.x - ex, y: position.y - ey },
        max: { x: position.x + ex, y: position.y + ey },
      };
    }
    case 'polygon': {
      // Transform and find bounds
      const transformed = shape.vertices.map(v => 
        V.add(position, V.rotate(v, angle))
      );
      const xs = transformed.map(v => v.x);
      const ys = transformed.map(v => v.y);
      return {
        min: { x: Math.min(...xs), y: Math.min(...ys) },
        max: { x: Math.max(...xs), y: Math.max(...ys) },
      };
    }
  }
};
```

---

## 💥 Collision Detection (Pure)

```typescript
// src/engine/physics/collision.ts

import type { Body } from './body';
import type { Vec2 } from './vector';
import * as V from './vector';
import { getAABB } from './body';

/** Collision contact information */
export interface Contact {
  readonly bodyA: Body;
  readonly bodyB: Body;
  readonly point: Vec2;           // Contact point
  readonly normal: Vec2;          // Collision normal (A -> B)
  readonly penetration: number;   // Overlap depth
}

/** Check if AABBs overlap (broad phase) */
export const aabbOverlap = (a: Body, b: Body): boolean => {
  const boxA = getAABB(a);
  const boxB = getAABB(b);
  
  return !(
    boxA.max.x < boxB.min.x ||
    boxA.min.x > boxB.max.x ||
    boxA.max.y < boxB.min.y ||
    boxA.min.y > boxB.max.y
  );
};

/** Detect collision between two bodies (narrow phase) */
export const detectCollision = (a: Body, b: Body): Contact | null => {
  // Broad phase
  if (!aabbOverlap(a, b)) return null;
  
  // Check collision mask
  if ((a.collisionMask & b.collisionMask) === 0) return null;
  
  // Narrow phase based on shapes
  const shapeA = a.shape.type;
  const shapeB = b.shape.type;
  
  if (shapeA === 'circle' && shapeB === 'circle') {
    return circleVsCircle(a, b);
  }
  if (shapeA === 'rect' && shapeB === 'rect') {
    return rectVsRect(a, b);
  }
  if (shapeA === 'circle' && shapeB === 'rect') {
    return circleVsRect(a, b);
  }
  if (shapeA === 'rect' && shapeB === 'circle') {
    const contact = circleVsRect(b, a);
    return contact ? flipContact(contact) : null;
  }
  
  // Fallback to AABB for polygons
  return rectVsRect(a, b);
};

/** Circle vs Circle collision */
const circleVsCircle = (a: Body, b: Body): Contact | null => {
  if (a.shape.type !== 'circle' || b.shape.type !== 'circle') return null;
  
  const diff = V.sub(b.position, a.position);
  const dist = V.length(diff);
  const radiiSum = a.shape.radius + b.shape.radius;
  
  if (dist >= radiiSum) return null;
  
  const normal = dist > 0 ? V.scale(diff, 1 / dist) : { x: 1, y: 0 };
  const penetration = radiiSum - dist;
  const point = V.add(a.position, V.scale(normal, a.shape.radius));
  
  return { bodyA: a, bodyB: b, point, normal, penetration };
};

/** Rectangle vs Rectangle (OBB) collision */
const rectVsRect = (a: Body, b: Body): Contact | null => {
  if (a.shape.type !== 'rect' || b.shape.type !== 'rect') return null;
  
  // SAT (Separating Axis Theorem) simplified
  // For now, use AABB approximation
  const boxA = getAABB(a);
  const boxB = getAABB(b);
  
  const overlapX = Math.min(boxA.max.x - boxB.min.x, boxB.max.x - boxA.min.x);
  const overlapY = Math.min(boxA.max.y - boxB.min.y, boxB.max.y - boxA.min.y);
  
  if (overlapX <= 0 || overlapY <= 0) return null;
  
  // Find minimum penetration axis
  const diff = V.sub(b.position, a.position);
  let normal: Vec2;
  let penetration: number;
  
  if (overlapX < overlapY) {
    penetration = overlapX;
    normal = { x: diff.x > 0 ? 1 : -1, y: 0 };
  } else {
    penetration = overlapY;
    normal = { x: 0, y: diff.y > 0 ? 1 : -1 };
  }
  
  const point = V.add(a.position, V.scale(normal, penetration / 2));
  
  return { bodyA: a, bodyB: b, point, normal, penetration };
};

/** Circle vs Rectangle collision */
const circleVsRect = (circle: Body, rect: Body): Contact | null => {
  if (circle.shape.type !== 'circle' || rect.shape.type !== 'rect') return null;
  
  const { width, height } = rect.shape;
  const hw = width / 2;
  const hh = height / 2;
  
  // Transform circle center to rect's local space
  const localPos = V.rotate(
    V.sub(circle.position, rect.position),
    -rect.angle
  );
  
  // Clamp to rect bounds
  const closestX = Math.max(-hw, Math.min(hw, localPos.x));
  const closestY = Math.max(-hh, Math.min(hh, localPos.y));
  const closest = { x: closestX, y: closestY };
  
  const diff = V.sub(localPos, closest);
  const distSq = V.lengthSq(diff);
  const radius = circle.shape.radius;
  
  if (distSq >= radius * radius) return null;
  
  const dist = Math.sqrt(distSq);
  const localNormal = dist > 0 
    ? V.scale(diff, 1 / dist)
    : { x: 0, y: -1 };
  
  // Transform back to world space
  const normal = V.rotate(localNormal, rect.angle);
  const worldClosest = V.add(rect.position, V.rotate(closest, rect.angle));
  
  return {
    bodyA: circle,
    bodyB: rect,
    point: worldClosest,
    normal,
    penetration: radius - dist,
  };
};

/** Flip contact (swap A and B) */
const flipContact = (contact: Contact): Contact => ({
  bodyA: contact.bodyB,
  bodyB: contact.bodyA,
  point: contact.point,
  normal: V.scale(contact.normal, -1),
  penetration: contact.penetration,
});

/** Detect all collisions in a set of bodies */
export const detectAllCollisions = (bodies: readonly Body[]): Contact[] => {
  const contacts: Contact[] = [];
  
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i]!;
      const b = bodies[j]!;
      
      // Skip if both static
      if (a.isStatic && b.isStatic) continue;
      
      const contact = detectCollision(a, b);
      if (contact) contacts.push(contact);
    }
  }
  
  return contacts;
};
```

---

## 🔧 Collision Resolver (Pure)

```typescript
// src/engine/physics/resolver.ts

import type { Body } from './body';
import type { Contact } from './collision';
import type { Vec2 } from './vector';
import * as V from './vector';
import { applyImpulse } from './body';

/** Resolution result */
export interface ResolutionResult {
  readonly bodyA: Body;
  readonly bodyB: Body;
  readonly impulse: number;
}

/** Resolve a single collision contact */
export const resolveContact = (contact: Contact): ResolutionResult => {
  const { bodyA, bodyB, point, normal, penetration } = contact;
  
  // Skip sensors
  if (bodyA.isSensor || bodyB.isSensor) {
    return { bodyA, bodyB, impulse: 0 };
  }
  
  // Relative velocity at contact point
  const rA = V.sub(point, bodyA.position);
  const rB = V.sub(point, bodyB.position);
  
  const velA = V.add(bodyA.velocity, V.perp(V.scale(rA, bodyA.angularVelocity)));
  const velB = V.add(bodyB.velocity, V.perp(V.scale(rB, bodyB.angularVelocity)));
  const relVel = V.sub(velA, velB);
  
  // Relative velocity along normal
  const velAlongNormal = V.dot(relVel, normal);
  
  // Don't resolve if separating
  if (velAlongNormal > 0) {
    return { bodyA, bodyB, impulse: 0 };
  }
  
  // Restitution (bounciness)
  const e = Math.min(bodyA.restitution, bodyB.restitution);
  
  // Calculate impulse scalar
  const rACrossN = V.cross(rA, normal);
  const rBCrossN = V.cross(rB, normal);
  
  const invMassSum = 
    bodyA.invMass + 
    bodyB.invMass + 
    rACrossN * rACrossN * bodyA.invInertia +
    rBCrossN * rBCrossN * bodyB.invInertia;
  
  const j = -(1 + e) * velAlongNormal / invMassSum;
  const impulse = V.scale(normal, j);
  
  // Apply impulses
  let newA = applyImpulse(bodyA, impulse, point);
  let newB = applyImpulse(bodyB, V.scale(impulse, -1), point);
  
  // Positional correction (prevent sinking)
  const percent = 0.4;  // Penetration percentage to correct
  const slop = 0.01;    // Penetration allowance
  const correction = Math.max(penetration - slop, 0) / invMassSum * percent;
  const correctionVec = V.scale(normal, correction);
  
  newA = {
    ...newA,
    position: V.add(newA.position, V.scale(correctionVec, bodyA.invMass)),
  };
  newB = {
    ...newB,
    position: V.sub(newB.position, V.scale(correctionVec, bodyB.invMass)),
  };
  
  // Friction impulse
  const tangent = V.normalize(V.sub(relVel, V.scale(normal, velAlongNormal)));
  const jt = -V.dot(relVel, tangent) / invMassSum;
  
  const mu = (bodyA.friction + bodyB.friction) / 2;
  const frictionImpulse = Math.abs(jt) < j * mu
    ? V.scale(tangent, jt)
    : V.scale(tangent, -j * mu);
  
  newA = applyImpulse(newA, frictionImpulse, point);
  newB = applyImpulse(newB, V.scale(frictionImpulse, -1), point);
  
  return { bodyA: newA, bodyB: newB, impulse: Math.abs(j) };
};

/** Resolve all collisions and return updated bodies */
export const resolveAllContacts = (
  bodies: readonly Body[],
  contacts: readonly Contact[]
): Body[] => {
  // Create mutable map for updates
  const bodyMap = new Map<number, Body>();
  bodies.forEach(b => bodyMap.set(b.id, b));
  
  // Resolve each contact
  for (const contact of contacts) {
    const a = bodyMap.get(contact.bodyA.id)!;
    const b = bodyMap.get(contact.bodyB.id)!;
    
    const updatedContact: Contact = {
      ...contact,
      bodyA: a,
      bodyB: b,
    };
    
    const result = resolveContact(updatedContact);
    bodyMap.set(result.bodyA.id, result.bodyA);
    bodyMap.set(result.bodyB.id, result.bodyB);
  }
  
  return Array.from(bodyMap.values());
};
```

---

## 🌍 Physics World

```typescript
// src/engine/physics/world.ts

import type { Body, BodyConfig } from './body';
import type { Contact } from './collision';
import type { Vec2 } from './vector';
import { createBody, integrate, applyDamping } from './body';
import { detectAllCollisions } from './collision';
import { resolveAllContacts } from './resolver';

/** Physics world configuration */
export interface WorldConfig {
  readonly gravity: Vec2;
  readonly linearDamping: number;
  readonly angularDamping: number;
  readonly iterations: number;
}

/** Physics world state - immutable */
export interface PhysicsWorld {
  readonly config: WorldConfig;
  readonly bodies: readonly Body[];
  readonly contacts: readonly Contact[];
}

/** Default world configuration */
export const DEFAULT_WORLD_CONFIG: WorldConfig = {
  gravity: { x: 0, y: 0 },
  linearDamping: 0.99,
  angularDamping: 0.95,
  iterations: 4,
};

// ============================================
// PURE FUNCTIONS
// ============================================

/** Create a new physics world */
export const createWorld = (config?: Partial<WorldConfig>): PhysicsWorld => ({
  config: { ...DEFAULT_WORLD_CONFIG, ...config },
  bodies: [],
  contacts: [],
});

/** Add a body to the world */
export const addBody = (world: PhysicsWorld, config: BodyConfig): PhysicsWorld => ({
  ...world,
  bodies: [...world.bodies, createBody(config)],
});

/** Remove a body from the world */
export const removeBody = (world: PhysicsWorld, bodyId: number): PhysicsWorld => ({
  ...world,
  bodies: world.bodies.filter(b => b.id !== bodyId),
});

/** Update a specific body */
export const updateBody = (
  world: PhysicsWorld,
  bodyId: number,
  update: Partial<Body>
): PhysicsWorld => ({
  ...world,
  bodies: world.bodies.map(b =>
    b.id === bodyId ? { ...b, ...update } : b
  ),
});

/** Step the physics simulation */
export const stepWorld = (world: PhysicsWorld, dt: number): PhysicsWorld => {
  const { config } = world;
  let bodies = world.bodies;
  
  // Apply gravity
  bodies = bodies.map(b => 
    b.isStatic ? b : {
      ...b,
      velocity: {
        x: b.velocity.x + config.gravity.x * dt,
        y: b.velocity.y + config.gravity.y * dt,
      },
    }
  );
  
  // Integrate velocities -> positions
  bodies = bodies.map(b => integrate(b, dt));
  
  // Detect collisions
  const contacts = detectAllCollisions(bodies);
  
  // Resolve collisions (multiple iterations for stability)
  for (let i = 0; i < config.iterations; i++) {
    bodies = resolveAllContacts(bodies, contacts);
  }
  
  // Apply damping
  bodies = bodies.map(b => 
    applyDamping(b, config.linearDamping, config.angularDamping)
  );
  
  return { ...world, bodies, contacts };
};

/** Get body by ID */
export const getBody = (world: PhysicsWorld, id: number): Body | undefined =>
  world.bodies.find(b => b.id === id);

/** Query bodies in AABB region */
export const queryRegion = (
  world: PhysicsWorld,
  min: Vec2,
  max: Vec2
): Body[] => {
  // Simple linear search - could use spatial hash for optimization
  return world.bodies.filter(b => {
    const aabb = getAABB(b);
    return !(
      aabb.max.x < min.x ||
      aabb.min.x > max.x ||
      aabb.max.y < min.y ||
      aabb.min.y > max.y
    );
  });
};
```

---

## 🎯 Entity Component System

```typescript
// src/engine/core/ecs.ts

/** Entity is just an ID */
export type Entity = number & { readonly __brand: 'Entity' };

/** Component is any object with data */
export type Component = object;

/** Component type identifier */
export type ComponentType<T extends Component = Component> = {
  readonly name: string;
  readonly __type?: T; // Phantom type for inference
};

/** Create a component type */
export const defineComponent = <T extends Component>(
  name: string
): ComponentType<T> => ({ name });

/** ECS World state */
export interface ECSWorld {
  readonly nextEntity: number;
  readonly entities: ReadonlySet<Entity>;
  readonly components: ReadonlyMap<string, ReadonlyMap<Entity, Component>>;
}

// ============================================
// PURE FUNCTIONS
// ============================================

/** Create empty ECS world */
export const createECSWorld = (): ECSWorld => ({
  nextEntity: 0,
  entities: new Set(),
  components: new Map(),
});

/** Spawn a new entity */
export const spawnEntity = (world: ECSWorld): [ECSWorld, Entity] => {
  const entity = world.nextEntity as Entity;
  return [
    {
      ...world,
      nextEntity: world.nextEntity + 1,
      entities: new Set([...world.entities, entity]),
    },
    entity,
  ];
};

/** Despawn an entity and remove all its components */
export const despawnEntity = (world: ECSWorld, entity: Entity): ECSWorld => {
  const newComponents = new Map(world.components);
  
  for (const [type, store] of newComponents) {
    if (store.has(entity)) {
      const newStore = new Map(store);
      newStore.delete(entity);
      newComponents.set(type, newStore);
    }
  }
  
  const newEntities = new Set(world.entities);
  newEntities.delete(entity);
  
  return {
    ...world,
    entities: newEntities,
    components: newComponents,
  };
};

/** Add component to entity */
export const addComponent = <T extends Component>(
  world: ECSWorld,
  entity: Entity,
  type: ComponentType<T>,
  component: T
): ECSWorld => {
  const store = world.components.get(type.name) ?? new Map();
  const newStore = new Map(store);
  newStore.set(entity, component);
  
  const newComponents = new Map(world.components);
  newComponents.set(type.name, newStore);
  
  return { ...world, components: newComponents };
};

/** Remove component from entity */
export const removeComponent = <T extends Component>(
  world: ECSWorld,
  entity: Entity,
  type: ComponentType<T>
): ECSWorld => {
  const store = world.components.get(type.name);
  if (!store?.has(entity)) return world;
  
  const newStore = new Map(store);
  newStore.delete(entity);
  
  const newComponents = new Map(world.components);
  newComponents.set(type.name, newStore);
  
  return { ...world, components: newComponents };
};

/** Get component for entity */
export const getComponent = <T extends Component>(
  world: ECSWorld,
  entity: Entity,
  type: ComponentType<T>
): T | undefined => {
  return world.components.get(type.name)?.get(entity) as T | undefined;
};

/** Check if entity has component */
export const hasComponent = <T extends Component>(
  world: ECSWorld,
  entity: Entity,
  type: ComponentType<T>
): boolean => {
  return world.components.get(type.name)?.has(entity) ?? false;
};

/** Query entities with specific components */
export const query = <T extends ComponentType[]>(
  world: ECSWorld,
  ...types: T
): Entity[] => {
  const entities: Entity[] = [];
  
  for (const entity of world.entities) {
    const hasAll = types.every(type =>
      world.components.get(type.name)?.has(entity)
    );
    if (hasAll) entities.push(entity);
  }
  
  return entities;
};

/** Update component for entity */
export const updateComponent = <T extends Component>(
  world: ECSWorld,
  entity: Entity,
  type: ComponentType<T>,
  update: Partial<T> | ((prev: T) => T)
): ECSWorld => {
  const current = getComponent(world, entity, type);
  if (!current) return world;
  
  const newComponent = typeof update === 'function'
    ? update(current)
    : { ...current, ...update };
  
  return addComponent(world, entity, type, newComponent);
};
```

---

## 🎮 Game Components

```typescript
// src/game/components/index.ts

import { defineComponent } from '@engine/core/ecs';
import type { Vec2 } from '@engine/physics/vector';
import type { Body } from '@engine/physics/body';

/** Transform component */
export interface TransformData {
  readonly position: Vec2;
  readonly rotation: number;
  readonly scale: Vec2;
}
export const Transform = defineComponent<TransformData>('Transform');

/** Physics body reference */
export interface PhysicsBodyData {
  readonly bodyId: number;
}
export const PhysicsBody = defineComponent<PhysicsBodyData>('PhysicsBody');

/** Vehicle component */
export interface VehicleData {
  readonly type: 'sedan' | 'truck' | 'sports' | 'police' | 'player';
  readonly color: string;
  readonly maxSpeed: number;
  readonly acceleration: number;
  readonly handling: number;
  readonly mass: number;
}
export const Vehicle = defineComponent<VehicleData>('Vehicle');

/** Player controlled */
export interface PlayerData {
  readonly steerInput: number;
  readonly throttleInput: number;
  readonly brakeInput: number;
  readonly boostInput: boolean;
}
export const Player = defineComponent<PlayerData>('Player');

/** AI Driver */
export interface AIDriverData {
  readonly state: 'cruise' | 'chase' | 'evade' | 'panic';
  readonly targetX: number;
  readonly targetSpeed: number;
  readonly patience: number;
  readonly panicTimer: number;
}
export const AIDriver = defineComponent<AIDriverData>('AIDriver');

/** Health */
export interface HealthData {
  readonly current: number;
  readonly max: number;
}
export const Health = defineComponent<HealthData>('Health');

/** Score value when destroyed */
export interface ScoreValueData {
  readonly points: number;
  readonly bonusOnRam: number;
}
export const ScoreValue = defineComponent<ScoreValueData>('ScoreValue');

/** Visual effects */
export interface VFXData {
  readonly trailEnabled: boolean;
  readonly damageLevel: number;
  readonly flashTimer: number;
}
export const VFX = defineComponent<VFXData>('VFX');
```

---

## ⚙️ Game Systems

```typescript
// src/game/systems/physics.system.ts

import type { ECSWorld } from '@engine/core/ecs';
import type { PhysicsWorld } from '@engine/physics/world';
import type { GameTime } from '@engine/core/types';
import { query, getComponent, updateComponent } from '@engine/core/ecs';
import { stepWorld, getBody, updateBody } from '@engine/physics/world';
import { Transform, PhysicsBody } from '../components';

/** Combined game state */
export interface GameState {
  readonly ecs: ECSWorld;
  readonly physics: PhysicsWorld;
  readonly score: number;
  readonly health: number;
  readonly boost: number;
}

/** Physics system - syncs ECS with physics world */
export const physicsSystem = (
  state: GameState,
  time: GameTime
): GameState => {
  // Step physics
  let physics = stepWorld(state.physics, time.delta);
  
  // Sync physics bodies back to ECS transforms
  let ecs = state.ecs;
  
  const entities = query(ecs, Transform, PhysicsBody);
  
  for (const entity of entities) {
    const physBody = getComponent(ecs, entity, PhysicsBody);
    if (!physBody) continue;
    
    const body = getBody(physics, physBody.bodyId);
    if (!body) continue;
    
    ecs = updateComponent(ecs, entity, Transform, {
      position: body.position,
      rotation: body.angle,
    });
  }
  
  return { ...state, ecs, physics };
};
```

```typescript
// src/game/systems/player-input.system.ts

import type { GameState } from './physics.system';
import type { GameTime } from '@engine/core/types';
import { query, getComponent, updateComponent } from '@engine/core/ecs';
import { updateBody } from '@engine/physics/world';
import { Player, PhysicsBody, Transform } from '../components';
import * as V from '@engine/physics/vector';

/** Input state (from input manager) */
export interface InputState {
  readonly steer: number;      // -1 to 1
  readonly throttle: number;   // 0 to 1
  readonly brake: number;      // 0 to 1
  readonly boost: boolean;
}

/** Player input system */
export const playerInputSystem = (
  state: GameState,
  time: GameTime,
  input: InputState
): GameState => {
  let { ecs, physics } = state;
  
  const players = query(ecs, Player, PhysicsBody);
  
  for (const entity of players) {
    const physBody = getComponent(ecs, entity, PhysicsBody);
    if (!physBody) continue;
    
    // Update player component with input
    ecs = updateComponent(ecs, entity, Player, {
      steerInput: input.steer,
      throttleInput: input.throttle,
      brakeInput: input.brake,
      boostInput: input.boost,
    });
    
    // Apply forces to physics body
    const body = getBody(physics, physBody.bodyId);
    if (!body) continue;
    
    // Steering force
    const steerForce = input.steer * 0.5;
    
    // Throttle/brake
    const speed = input.boost && state.boost > 0
      ? 12
      : input.brake > 0.5
        ? 1.5
        : 4 + input.throttle * 4;
    
    physics = updateBody(physics, physBody.bodyId, {
      velocity: V.add(body.velocity, { x: steerForce, y: 0 }),
    });
  }
  
  // Boost drain
  let boost = state.boost;
  if (input.boost && boost > 0) {
    boost = Math.max(0, boost - 1.2);
  } else {
    boost = Math.min(100, boost + 0.2);
  }
  
  return { ...state, ecs, physics, boost };
};
```

```typescript
// src/game/systems/ai.system.ts

import type { GameState } from './physics.system';
import type { GameTime } from '@engine/core/types';
import { query, getComponent, updateComponent } from '@engine/core/ecs';
import { updateBody, getBody } from '@engine/physics/world';
import { AIDriver, PhysicsBody, Transform, Vehicle } from '../components';
import * as V from '@engine/physics/vector';

/** AI driving system */
export const aiSystem = (
  state: GameState,
  time: GameTime,
  playerPos: V.Vec2
): GameState => {
  let { ecs, physics } = state;
  
  const aiEntities = query(ecs, AIDriver, PhysicsBody, Transform);
  
  for (const entity of aiEntities) {
    const ai = getComponent(ecs, entity, AIDriver);
    const transform = getComponent(ecs, entity, Transform);
    const physBody = getComponent(ecs, entity, PhysicsBody);
    
    if (!ai || !transform || !physBody) continue;
    
    const body = getBody(physics, physBody.bodyId);
    if (!body) continue;
    
    let newAI = { ...ai };
    let steerForce = 0;
    
    switch (ai.state) {
      case 'cruise': {
        // Try to maintain target X position
        const diff = ai.targetX - transform.position.x;
        steerForce = Math.sign(diff) * Math.min(Math.abs(diff) * 0.02, 0.5);
        break;
      }
      
      case 'chase': {
        // Chase player
        const diff = playerPos.x - transform.position.x;
        steerForce = Math.sign(diff) * Math.min(Math.abs(diff) * 0.03, 0.8);
        break;
      }
      
      case 'panic': {
        // Erratic movement
        newAI = {
          ...newAI,
          panicTimer: ai.panicTimer - 1,
          targetX: ai.targetX + (Math.random() - 0.5) * 20,
        };
        
        if (newAI.panicTimer <= 0) {
          newAI = { ...newAI, state: 'cruise', panicTimer: 0 };
        }
        
        const diff = newAI.targetX - transform.position.x;
        steerForce = Math.sign(diff) * Math.min(Math.abs(diff) * 0.04, 1);
        break;
      }
      
      case 'evade': {
        // Move away from player
        const diff = transform.position.x - playerPos.x;
        steerForce = Math.sign(diff) * 0.6;
        break;
      }
    }
    
    // Update physics
    physics = updateBody(physics, physBody.bodyId, {
      velocity: V.add(body.velocity, { x: steerForce, y: 0 }),
    });
    
    // Update AI component
    ecs = updateComponent(ecs, entity, AIDriver, newAI);
  }
  
  return { ...state, ecs, physics };
};
```

---

## 🖼️ Render System (Side Effects)

```typescript
// src/game/systems/render.system.ts

/**
 * RENDER SYSTEM
 * 
 * This is a SIDE-EFFECT system (fx_ prefix convention)
 * It reads state and draws to canvas - does NOT return new state
 */

import type { GameState } from './physics.system';
import type { GameTime } from '@engine/core/types';
import { query, getComponent } from '@engine/core/ecs';
import { Transform, Vehicle, VFX, Health } from '../components';

/** Render context */
export interface RenderContext {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly camera: { x: number; y: number };
}

/** 
 * fx_ prefix = SIDE EFFECT function
 * This function performs I/O (canvas drawing)
 */
export const fx_renderGame = (
  state: Readonly<GameState>,
  time: GameTime,
  render: RenderContext
): void => {
  const { ctx, width, height, camera } = render;
  
  // Clear
  ctx.fillStyle = '#345';
  ctx.fillRect(0, 0, width, height);
  
  // Draw road
  fx_drawRoad(ctx, width, height, time);
  
  // Draw vehicles
  const vehicles = query(state.ecs, Transform, Vehicle);
  
  for (const entity of vehicles) {
    const transform = getComponent(state.ecs, entity, Transform);
    const vehicle = getComponent(state.ecs, entity, Vehicle);
    const vfx = getComponent(state.ecs, entity, VFX);
    const health = getComponent(state.ecs, entity, Health);
    
    if (!transform || !vehicle) continue;
    
    fx_drawVehicle(ctx, transform, vehicle, vfx, health, camera);
  }
};

const fx_drawRoad = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: GameTime
): void => {
  const roadWidth = width * 0.7;
  const roadLeft = (width - roadWidth) / 2;
  
  // Grass
  ctx.fillStyle = '#2a5';
  ctx.fillRect(0, 0, roadLeft, height);
  ctx.fillRect(roadLeft + roadWidth, 0, width, height);
  
  // Road
  ctx.fillStyle = '#333';
  ctx.fillRect(roadLeft, 0, roadWidth, height);
  
  // Lines
  ctx.fillStyle = '#fff';
  ctx.fillRect(roadLeft - 2, 0, 4, height);
  ctx.fillRect(roadLeft + roadWidth - 2, 0, 4, height);
  
  // Center dashes
  ctx.fillStyle = '#ff0';
  const offset = (time.total * 0.004) % 40;
  for (let y = -40 + offset; y < height; y += 40) {
    ctx.fillRect(width / 2 - 2, y, 4, 20);
  }
};

const fx_drawVehicle = (
  ctx: CanvasRenderingContext2D,
  transform: TransformData,
  vehicle: VehicleData,
  vfx: VFXData | undefined,
  health: HealthData | undefined,
  camera: { x: number; y: number }
): void => {
  const { position, rotation } = transform;
  const screenX = position.x - camera.x;
  const screenY = position.y - camera.y;
  
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(rotation);
  
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-13, -22, 30, 55);
  
  // Body
  ctx.fillStyle = vehicle.color;
  ctx.fillRect(-15, -25, 30, 55);
  
  // Windshield
  ctx.fillStyle = '#446';
  ctx.fillRect(-11, -20, 22, 12);
  
  // Damage
  if (health && health.current < health.max) {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(8, 10);
    ctx.stroke();
  }
  
  ctx.restore();
};
```

---

## 🚀 Main Game Loop

```typescript
// src/game/index.ts

import { createECSWorld } from '@engine/core/ecs';
import { createWorld } from '@engine/physics/world';
import type { GameState } from './systems/physics.system';
import type { GameTime } from '@engine/core/types';
import { physicsSystem } from './systems/physics.system';
import { playerInputSystem, type InputState } from './systems/player-input.system';
import { aiSystem } from './systems/ai.system';
import { fx_renderGame, type RenderContext } from './systems/render.system';
import { spawnPlayerCar } from './entities/player-car';
import { spawnTrafficCar } from './entities/traffic-car';

/** Initialize game state */
export const initGame = (): GameState => {
  let ecs = createECSWorld();
  let physics = createWorld({
    gravity: { x: 0, y: 0 },
    linearDamping: 0.96,
    angularDamping: 0.92,
  });
  
  // Spawn player
  const [newState, playerEntity] = spawnPlayerCar({ ecs, physics });
  ecs = newState.ecs;
  physics = newState.physics;
  
  return {
    ecs,
    physics,
    score: 0,
    health: 100,
    boost: 100,
  };
};

/** Update game state (pure) */
export const updateGame = (
  state: GameState,
  time: GameTime,
  input: InputState
): GameState => {
  let newState = state;
  
  // Run systems in order
  newState = playerInputSystem(newState, time, input);
  newState = aiSystem(newState, time, { x: 0, y: 0 }); // TODO: get player pos
  newState = physicsSystem(newState, time);
  
  return newState;
};

/** Render game (side effect) */
export const fx_render = (
  state: Readonly<GameState>,
  time: GameTime,
  render: RenderContext
): void => {
  fx_renderGame(state, time, render);
};
```

---

## 🏁 Application Entry

```typescript
// src/main.ts

import { initGame, updateGame, fx_render } from './game';
import { createInputManager } from '@engine/input';
import type { GameTime } from '@engine/core/types';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Resize handler
const fx_resize = (): void => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
};

window.addEventListener('resize', fx_resize);
fx_resize();

// Input
const inputManager = createInputManager(canvas);

// Game state
let state = initGame();
let lastTime = performance.now();
let frameCount = 0;

// Fixed timestep
const FIXED_DT = 1 / 60;
let accumulator = 0;

// Game loop
const fx_gameLoop = (timestamp: number): void => {
  const elapsed = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  frameCount++;
  
  accumulator += elapsed;
  
  const time: GameTime = {
    total: timestamp as any,
    delta: FIXED_DT as any,
    frame: frameCount,
    fps: 1 / elapsed,
  };
  
  // Fixed timestep updates
  while (accumulator >= FIXED_DT) {
    const input = inputManager.getState();
    state = updateGame(state, time, input);
    accumulator -= FIXED_DT;
  }
  
  // Render (variable timestep OK)
  const render = {
    ctx,
    width: window.innerWidth,
    height: window.innerHeight,
    camera: { x: 0, y: 0 },
  };
  
  fx_render(state, time, render);
  
  requestAnimationFrame(fx_gameLoop);
};

// Start
requestAnimationFrame(fx_gameLoop);
```

---

## 📋 Naming Conventions Summary

| Prefix/Pattern | Meaning | Example |
|---------------|---------|---------|
| `fx_` | Side-effect function (I/O, mutation) | `fx_render()`, `fx_playSound()` |
| `create*` | Factory function (returns new object) | `createWorld()`, `createBody()` |
| `*System` | ECS System (pure state transformer) | `physicsSystem()` |
| `*Data` | Component data interface | `VehicleData`, `HealthData` |
| `*Config` | Configuration interface | `WorldConfig`, `GameConfig` |
| `SCREAMING_CASE` | Constants | `FIXED_DT`, `MAX_SPEED` |
| `PascalCase` | Types, Components | `Vec2`, `Transform` |
| `camelCase` | Functions, variables | `stepWorld`, `playerPos` |

---

## 🧪 Testing Strategy

```typescript
// tests/engine/physics/vector.test.ts

import { describe, it, expect } from 'vitest';
import * as V from '@engine/physics/vector';

describe('Vector2D', () => {
  it('adds vectors correctly', () => {
    const a = V.vec2(1, 2);
    const b = V.vec2(3, 4);
    const result = V.add(a, b);
    
    expect(result).toEqual({ x: 4, y: 6 });
  });
  
  it('calculates length correctly', () => {
    const v = V.vec2(3, 4);
    expect(V.length(v)).toBe(5);
  });
  
  it('normalizes to unit vector', () => {
    const v = V.vec2(3, 4);
    const n = V.normalize(v);
    
    expect(V.length(n)).toBeCloseTo(1);
    expect(n.x).toBeCloseTo(0.6);
    expect(n.y).toBeCloseTo(0.8);
  });
});
```

---

## 🎯 Extension Points

1. **New Vehicle Types**: Add to `vehicles.config.ts` + entity factory
2. **New Physics Behaviors**: Add to physics systems (pure functions)
3. **New Game Modes**: Create new scene in `scenes/`
4. **New Power-ups**: Add component + system
5. **Multiplayer**: State is pure - easy to serialize/sync

---

This architecture provides:
- **Type safety** throughout
- **Testable** pure functions for all game logic
- **Clear separation** of pure vs impure code
- **Modular** systems that can be composed
- **Extensible** ECS for adding features
- **Fast iteration** with Vite HMR
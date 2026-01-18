# Fast Ferocious Fandango: Foolish Fugitives - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the existing spy_driver_physics.html prototype into the full game with tactical ramming, Geldtransporter heists, wanted stars, loot drops, and the BUSTED system.

**Architecture:** Single HTML file with embedded JavaScript. Enhance the existing physics engine and game loop. Add new vehicle types, pickup system, and wanted star mechanics.

**Tech Stack:** Vanilla JavaScript, Canvas 2D, no build tools (single HTML file)

---

## Phase 1: Core Systems Refactor

### Task 1: Simplify Health System (Remove Boost/Ram, Add Integrity Only)

**Files:**
- Modify: `spy_driver_physics.html` (lines 38-105 for CSS, 346-358 for state, 917-919 for UI)

**Step 1: Update HUD HTML - replace 3 bars with 1 INTEGRITY bar**

Find the stats-panel div and replace with:
```html
<div class="hud-panel" id="stats-panel">
  <div class="stat-row">
    <span class="stat-label">INTEGRITY</span>
    <div class="bar-bg" style="width:100px"><div class="bar-fill" id="integrity-fill" style="width:100%; background: linear-gradient(90deg, #f00, #0f0);"></div></div>
  </div>
  <div class="stat-row">
    <span class="stat-label">WANTED</span>
    <div id="wanted-stars">☆☆☆☆☆</div>
  </div>
</div>
```

**Step 2: Update CSS for wanted stars**

Add after `.bar-fill` styles:
```css
#wanted-stars {
  font-size: 14px;
  letter-spacing: 2px;
  color: #444;
}
#wanted-stars .filled {
  color: #f80;
  text-shadow: 0 0 5px #f80;
}
```

**Step 3: Update state variables**

Replace:
```javascript
let health = 100;
let boost = 100;
let ramPower = 100;
```

With:
```javascript
let integrity = 100;
let wantedStars = 0;
let money = 0;
let carsRammed = 0;
```

**Step 4: Remove boost/ram UI updates**

Delete these lines from updatePlayer():
```javascript
document.getElementById('boost-fill').style.width = boost + '%';
document.getElementById('ram-fill').style.width = ramPower + '%';
```

Replace with:
```javascript
document.getElementById('integrity-fill').style.width = Math.max(0, integrity) + '%';
updateWantedStars();
```

**Step 5: Add updateWantedStars function**

```javascript
function updateWantedStars() {
  const el = document.getElementById('wanted-stars');
  let html = '';
  for (let i = 0; i < 5; i++) {
    html += i < wantedStars ? '<span class="filled">★</span>' : '☆';
  }
  el.innerHTML = html;
}
```

**Step 6: Test manually**

Open in browser, verify:
- Only one health bar (INTEGRITY)
- Wanted stars display (all empty initially)
- No boost/ram bars

**Step 7: Commit**

```bash
git add spy_driver_physics.html
git commit -m "refactor: simplify to single integrity bar + wanted stars display"
```

---

### Task 2: Implement Ram Bar Damage Model

**Files:**
- Modify: `spy_driver_physics.html` (collision handling ~line 924-997)

**Step 1: Add helper to detect hit direction**

Add before checkCollisions():
```javascript
function getHitDirection(attacker, target) {
  // Returns where on TARGET the hit landed: 'front', 'rear', 'left', 'right'
  const dx = attacker.x - target.x;
  const dy = attacker.y - target.y;

  // Rotate to target's local space
  const cos = Math.cos(-target.angle);
  const sin = Math.sin(-target.angle);
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  // Determine quadrant
  if (Math.abs(localY) > Math.abs(localX)) {
    return localY < 0 ? 'front' : 'rear';
  } else {
    return localX < 0 ? 'left' : 'right';
  }
}

function getPlayerHitDirection(player, other) {
  // Where did PLAYER get hit?
  return getHitDirection(other, player);
}
```

**Step 2: Modify player damage logic in checkCollisions()**

Find the section where player takes damage and replace with:
```javascript
// Player damage - depends on WHERE player was hit
if (!player.invincible && impactSpeed > 2) {
  const hitDir = getPlayerHitDirection(player, v);

  if (hitDir === 'front') {
    // Ram bar protects front - NO DAMAGE
    showScorePopup(player.x, player.y - 40, 'RAM BAR!', '#0f0');
  } else {
    // Side/rear hits cause damage
    const damage = Math.floor(impactSpeed * 3);
    integrity -= damage;
    player.invincible = true;
    player.invincibleTime = 20;
    document.getElementById('integrity-fill').style.width = Math.max(0, integrity) + '%';
    showScorePopup(player.x, player.y - 40, '-' + damage, '#f00');

    if (integrity <= 0) {
      triggerBusted();
    }
  }
}
```

**Step 3: Test manually**

- Ram cars head-on → should see "RAM BAR!" popup, no damage
- Get hit from side → should take damage
- Get hit from rear → should take damage

**Step 4: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: implement ram bar - front hits safe, side/rear hits damage"
```

---

### Task 3: Add Wall/Barrier Damage

**Files:**
- Modify: `spy_driver_physics.html` (updatePlayer function ~line 854-919)

**Step 1: Add wall collision damage**

In updatePlayer(), find the wall bounce section and modify:
```javascript
// Clamp to screen - WALLS HURT
const margin = player.w / 2 + 10;
if (player.x < margin) {
  player.x = margin;
  player.vx = Math.abs(player.vx) * PHYSICS.wallBounce;
  spawnSparks(margin, player.y, 5);

  // Wall damage!
  if (!player.invincible) {
    const damage = 15;
    integrity -= damage;
    document.getElementById('integrity-fill').style.width = Math.max(0, integrity) + '%';
    showScorePopup(player.x + 20, player.y, '-' + damage, '#f00');
    player.invincible = true;
    player.invincibleTime = 15;
    if (integrity <= 0) triggerBusted();
  }
}
if (player.x > W - margin) {
  player.x = W - margin;
  player.vx = -Math.abs(player.vx) * PHYSICS.wallBounce;
  spawnSparks(W - margin, player.y, 5);

  // Wall damage!
  if (!player.invincible) {
    const damage = 15;
    integrity -= damage;
    document.getElementById('integrity-fill').style.width = Math.max(0, integrity) + '%';
    showScorePopup(player.x - 20, player.y, '-' + damage, '#f00');
    player.invincible = true;
    player.invincibleTime = 15;
    if (integrity <= 0) triggerBusted();
  }
}
```

**Step 2: Test manually**

- Drive into left wall → should take 15 damage
- Drive into right wall → should take 15 damage
- Quick successive hits → should be blocked by invincibility

**Step 3: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: walls cause damage when player hits them"
```

---

### Task 4: Implement BUSTED System (No Game Over)

**Files:**
- Modify: `spy_driver_physics.html`

**Step 1: Add BUSTED state variables**

Add after existing state variables:
```javascript
let isBusted = false;
let bustedTimer = 0;
let lifetimeMoney = 0; // Persists across busts
```

**Step 2: Create triggerBusted function**

Replace gameOver() function with:
```javascript
function triggerBusted() {
  if (isBusted) return;
  isBusted = true;
  bustedTimer = 180; // 3 seconds at 60fps

  // Calculate bribe (30% of current money)
  const bribe = Math.floor(money * 0.3);
  money -= bribe;
  if (money < 0) money = 0;

  // Show BUSTED message
  showMessage('BUSTED!', bribe > 0 ? 'Bribe: -$' + bribe.toLocaleString() : 'They got nothing!', '#f00');

  // Reset stars
  wantedStars = 0;
  updateWantedStars();

  // Stop player
  player.vx = 0;
  player.angularVel = 0;
}

function respawnAfterBust() {
  isBusted = false;
  integrity = 100;
  document.getElementById('integrity-fill').style.width = '100%';

  // Clear nearby vehicles
  vehicles = vehicles.filter(v => Math.abs(v.y - player.y) > 200);

  // Reset player state
  player.x = W / 2;
  player.vx = 0;
  player.angle = 0;
  player.invincible = true;
  player.invincibleTime = 60;

  showMessage('BACK ON THE ROAD!', '', '#0f0');
}
```

**Step 3: Add busted check in update loop**

Add at start of update() function:
```javascript
if (isBusted) {
  bustedTimer--;
  if (bustedTimer <= 0) {
    respawnAfterBust();
  }
  // Still update visuals but not gameplay
  return;
}
```

**Step 4: Update score display to show money**

Change addScore to:
```javascript
function addMoney(amount) {
  money += amount;
  lifetimeMoney += amount;
  document.getElementById('score').textContent = '$' + money.toLocaleString();
}
```

Replace all `addScore(` with `addMoney(` throughout the file.

**Step 5: Update startGame to reset properly**

In startGame(), update:
```javascript
integrity = 100;
wantedStars = 0;
money = 0;
isBusted = false;
bustedTimer = 0;
carsRammed = 0;
```

**Step 6: Test manually**

- Take damage until integrity = 0
- Should see "BUSTED!" message
- Should see bribe amount
- After 3 seconds, should respawn with full health
- Money should be reduced by 30%
- Wanted stars should be 0

**Step 7: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: BUSTED system - lose 30% money, respawn, never game over"
```

---

## Phase 2: Wanted Stars System

### Task 5: Implement Wanted Star Triggers

**Files:**
- Modify: `spy_driver_physics.html`

**Step 1: Add star management functions**

```javascript
function addWantedStars(amount) {
  wantedStars = Math.min(5, Math.max(0, wantedStars + amount));
  updateWantedStars();

  if (amount > 0 && wantedStars >= 1) {
    showMessage(wantedStars + ' STAR' + (wantedStars > 1 ? 'S' : '') + '!', '', '#f80');
  }
}

let starDecayTimer = 0;
const STAR_DECAY_TIME = 1800; // 30 seconds at 60fps

function updateStarDecay() {
  if (wantedStars > 0 && !isBusted) {
    starDecayTimer++;
    if (starDecayTimer >= STAR_DECAY_TIME) {
      starDecayTimer = 0;
      addWantedStars(-1);
      if (wantedStars === 0) {
        showMessage('HEAT CLEARED', '', '#0f0');
      }
    }
  } else {
    starDecayTimer = 0;
  }
}
```

**Step 2: Add star triggers in collision handling**

When player wrecks a car:
```javascript
// Track rams for wanted escalation
carsRammed++;
if (carsRammed >= 3 && wantedStars < 1) {
  addWantedStars(1);
}
if (carsRammed >= 10 && wantedStars < 2) {
  addWantedStars(1);
}
```

When player wrecks a cop (we'll add cops later, but add the hook):
```javascript
// If it's a cop, add stars
if (v.type === 'cop' || v.type === 'cruiser') {
  addWantedStars(1);
}
```

**Step 3: Call updateStarDecay in update loop**

Add to update():
```javascript
updateStarDecay();
```

**Step 4: Test manually**

- Ram 3 cars → should get 1 star
- Ram 10 cars → should get 2 stars
- Wait 30 seconds without ramming → star should decay

**Step 5: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: wanted stars - escalate on rams, decay over time"
```

---

## Phase 3: Geldtransporter Heist

### Task 6: Add Geldtransporter Spawning

**Files:**
- Modify: `spy_driver_physics.html`

**Step 1: Add Geldtransporter state**

```javascript
let geldtransporter = null;
let geldtransporterTimer = 0;
const GELDTRANSPORTER_INTERVAL = 4800; // 80 seconds at 60fps
let geldtransporterAnnounced = false;
```

**Step 2: Create Geldtransporter spawn function**

```javascript
function spawnGeldtransporter() {
  const truckX = W / 2;

  // The armored truck
  const truck = {
    x: truckX,
    y: -100,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVel: 0,
    w: 40,
    h: 80,
    mass: 4,
    type: 'geldtransporter',
    color: '#556b2f',
    baseSpeed: currentSpeed * 0.5,
    health: 3,
    value: 10000,
    wrecked: false,
    cracked: false,
    ai: { targetX: truckX, panic: false, panicTimer: 0 }
  };

  // Front escort
  const escortFront = {
    x: truckX,
    y: -180,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVel: 0,
    w: 34,
    h: 60,
    mass: 2.5,
    type: 'escort',
    color: '#111',
    baseSpeed: currentSpeed * 0.5,
    health: 2,
    value: 500,
    wrecked: false,
    ai: { targetX: truckX, panic: false, panicTimer: 0, role: 'front' }
  };

  // Rear escort
  const escortRear = {
    x: truckX,
    y: -20,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVel: 0,
    w: 34,
    h: 60,
    mass: 2.5,
    type: 'escort',
    color: '#111',
    baseSpeed: currentSpeed * 0.5,
    health: 2,
    value: 500,
    wrecked: false,
    ai: { targetX: truckX, panic: false, panicTimer: 0, role: 'rear' }
  };

  geldtransporter = truck;
  vehicles.push(truck);
  vehicles.push(escortFront);
  vehicles.push(escortRear);

  showMessage('$$$ INCOMING $$$', 'GELDTRANSPORTER SPOTTED!', '#ff0');
}
```

**Step 3: Add announcement system**

```javascript
function checkGeldtransporterSpawn() {
  geldtransporterTimer++;

  // Announce 3 seconds before
  if (geldtransporterTimer >= GELDTRANSPORTER_INTERVAL - 180 && !geldtransporterAnnounced) {
    geldtransporterAnnounced = true;
    showMessage('$$$', 'MONEY TRUCK APPROACHING...', '#ff0');
  }

  if (geldtransporterTimer >= GELDTRANSPORTER_INTERVAL && !geldtransporter) {
    geldtransporterTimer = 0;
    geldtransporterAnnounced = false;
    spawnGeldtransporter();
  }
}
```

**Step 4: Call in update loop**

Add to update():
```javascript
checkGeldtransporterSpawn();
```

**Step 5: Add special drawing for Geldtransporter**

In drawVehicle(), add special case:
```javascript
if (v.type === 'geldtransporter') {
  // Armored truck body
  ctx.fillStyle = v.cracked ? '#8b0000' : '#556b2f';
  ctx.fillRect(-v.w/2, -v.h/2, v.w, v.h);

  // Armored panels
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(-v.w/2 + 3, -v.h/2 + 5, v.w - 6, 15);
  ctx.fillRect(-v.w/2 + 3, v.h/2 - 20, v.w - 6, 15);

  // $ symbol
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('$', 0, 5);

  // Crack marks if damaged
  if (v.health < 3) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3 - v.health; i++) {
      ctx.beginPath();
      ctx.moveTo(-10 + i * 10, -20);
      ctx.lineTo(5 + i * 8, 15);
      ctx.stroke();
    }
  }
}
```

**Step 6: Test manually**

- Wait 80 seconds
- Should see "MONEY TRUCK APPROACHING" 3 seconds before
- Truck should appear with 2 black escort SUVs
- Truck should have $ symbol

**Step 7: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: Geldtransporter spawns with 2 escort SUVs"
```

---

### Task 7: Geldtransporter Heist Mechanics

**Files:**
- Modify: `spy_driver_physics.html`

**Step 1: Track escort status**

```javascript
function getActiveEscorts() {
  return vehicles.filter(v => v.type === 'escort' && !v.wrecked);
}

function isGeldtransporterVulnerable() {
  return geldtransporter && !geldtransporter.cracked && getActiveEscorts().length === 0;
}
```

**Step 2: Handle truck ramming**

In checkCollisions(), add special handling for Geldtransporter:
```javascript
if (v.type === 'geldtransporter' && !v.cracked) {
  if (getActiveEscorts().length > 0) {
    // Can't crack truck while escorts alive
    showScorePopup(v.x, v.y - 40, 'ESCORTS FIRST!', '#f80');
  } else {
    // Crack the truck!
    v.health--;
    showScorePopup(v.x, v.y - 40, 'CRACK! ' + v.health + '/3', '#ff0');

    if (v.health <= 0) {
      // JACKPOT!
      v.cracked = true;
      crackGeldtransporter(v);
    }
  }
}
```

**Step 3: Create jackpot function**

```javascript
function crackGeldtransporter(truck) {
  showMessage('JACKPOT!', '+$' + truck.value.toLocaleString(), '#ffd700');
  addMoney(truck.value);

  // Add wanted stars
  addWantedStars(2);

  // Spawn money particles
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: truck.x + (Math.random() - 0.5) * 40,
      y: truck.y + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 3,
      color: '#ffd700',
      size: 4 + Math.random() * 4,
      life: 60 + Math.random() * 40
    });
  }

  // Spawn repair pickup
  spawnPickup(truck.x, truck.y + 50, 'repair_large');

  // Clear geldtransporter reference
  geldtransporter = null;
}
```

**Step 4: Test manually**

- Wait for Geldtransporter
- Try to ram truck with escorts → should see "ESCORTS FIRST!"
- Ram escorts off road
- Ram truck 3 times → should see JACKPOT
- Should get $10,000 and +2 stars

**Step 5: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: Geldtransporter heist - eliminate escorts, crack truck, JACKPOT"
```

---

## Phase 4: Loot & Pickups

### Task 8: Pickup System

**Files:**
- Modify: `spy_driver_physics.html`

**Step 1: Add pickup state and types**

```javascript
let pickups = [];

const PICKUP_TYPES = {
  repair_small: { color: '#0f0', symbol: '+', value: 10, label: '+10%' },
  repair_medium: { color: '#0f0', symbol: '+', value: 20, label: '+20%' },
  repair_large: { color: '#0f0', symbol: '++', value: 50, label: '+50%' },
  cash_small: { color: '#ffd700', symbol: '$', value: 100, label: '+$100' },
  cash_medium: { color: '#ffd700', symbol: '$$', value: 500, label: '+$500' },
  cash_large: { color: '#ffd700', symbol: '$$$', value: 2000, label: '+$2000' },
  nitro: { color: '#00bfff', symbol: 'N', value: 1, label: 'NITRO!' },
  shield: { color: '#ff00ff', symbol: 'S', value: 5, label: 'SHIELD!' }
};
```

**Step 2: Create spawn and collect functions**

```javascript
function spawnPickup(x, y, type) {
  const pickupType = PICKUP_TYPES[type];
  if (!pickupType) return;

  pickups.push({
    x, y,
    vx: (Math.random() - 0.5) * 2,
    vy: 2,
    type,
    ...pickupType,
    life: 300 // 5 seconds
  });
}

function collectPickup(pickup) {
  const type = pickup.type;

  if (type.startsWith('repair')) {
    integrity = Math.min(100, integrity + pickup.value);
    document.getElementById('integrity-fill').style.width = integrity + '%';
    showScorePopup(player.x, player.y - 50, pickup.label, '#0f0');
  } else if (type.startsWith('cash')) {
    addMoney(pickup.value);
    showScorePopup(player.x, player.y - 50, pickup.label, '#ffd700');
  } else if (type === 'nitro') {
    // Store for later use
    showScorePopup(player.x, player.y - 50, pickup.label, '#00bfff');
  } else if (type === 'shield') {
    player.invincible = true;
    player.invincibleTime = 300; // 5 seconds
    showScorePopup(player.x, player.y - 50, pickup.label, '#ff00ff');
  }
}
```

**Step 3: Update and draw pickups**

```javascript
function updatePickups() {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.x += p.vx;
    p.y += p.vy + currentSpeed;
    p.life--;

    // Check collection
    const dx = p.x - player.x;
    const dy = p.y - player.y;
    if (Math.sqrt(dx*dx + dy*dy) < 40) {
      collectPickup(p);
      pickups.splice(i, 1);
      continue;
    }

    // Remove if expired or off screen
    if (p.life <= 0 || p.y > H + 50) {
      pickups.splice(i, 1);
    }
  }
}

function drawPickups() {
  for (const p of pickups) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Pulsing glow
    const pulse = 1 + Math.sin(frameCount * 0.2) * 0.2;

    // Background circle
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, 20 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Symbol
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.symbol, 0, 0);

    ctx.restore();
  }
}
```

**Step 4: Add to update and draw loops**

In update():
```javascript
updatePickups();
```

In draw(), after vehicles:
```javascript
drawPickups();
```

**Step 5: Spawn pickups when vehicles wrecked**

In the vehicle wreck logic:
```javascript
if (v.wrecked && v.health <= 0) {
  // Drop loot based on vehicle type
  if (v.type === 'escort') {
    spawnPickup(v.x, v.y, 'repair_medium');
  } else if (v.type === 'cop' || v.type === 'cruiser') {
    spawnPickup(v.x, v.y, 'repair_small');
  } else {
    // Regular cars drop small cash
    if (Math.random() < 0.3) {
      spawnPickup(v.x, v.y, 'cash_small');
    }
  }
}
```

**Step 6: Test manually**

- Wreck an escort → should drop green repair pickup
- Drive over pickup → should heal
- Wreck regular cars → sometimes drops gold cash pickup

**Step 7: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: pickup system - repair kits and cash drops from wrecked vehicles"
```

---

### Task 9: Special Vehicles (Ambulance, VIP, News Van)

**Files:**
- Modify: `spy_driver_physics.html`

**Step 1: Add special vehicle spawning**

Modify spawnVehicle() to occasionally spawn specials:
```javascript
function spawnVehicle() {
  // 5% chance for special vehicle
  if (Math.random() < 0.05) {
    spawnSpecialVehicle();
    return;
  }

  // ... existing spawn code
}

function spawnSpecialVehicle() {
  const specials = ['ambulance', 'vip_limo', 'news_van', 'fuel_truck'];
  const type = specials[Math.floor(Math.random() * specials.length)];

  const margin = 40;
  const x = roadLeft + margin + Math.random() * (roadWidth - margin * 2);

  const configs = {
    ambulance: {
      w: 32, h: 65, mass: 2, color: '#fff', value: 0,
      health: 2, baseSpeedMult: 0.6, dropType: 'repair_large'
    },
    vip_limo: {
      w: 30, h: 70, mass: 1.5, color: '#1a1a1a', value: 2000,
      health: 1, baseSpeedMult: 0.7, dropType: 'cash_large'
    },
    news_van: {
      w: 34, h: 60, mass: 2, color: '#fff', value: 0,
      health: 2, baseSpeedMult: 0.55, dropType: 'star_clear'
    },
    fuel_truck: {
      w: 36, h: 75, mass: 3, color: '#c0c0c0', value: 0,
      health: 3, baseSpeedMult: 0.4, dropType: 'nitro'
    }
  };

  const cfg = configs[type];

  vehicles.push({
    x, y: -100,
    vx: 0, vy: 0,
    angle: 0, angularVel: 0,
    w: cfg.w, h: cfg.h,
    mass: cfg.mass,
    type: type,
    color: cfg.color,
    baseSpeed: currentSpeed * cfg.baseSpeedMult,
    health: cfg.health,
    value: cfg.value,
    dropType: cfg.dropType,
    wrecked: false,
    ai: { targetX: x, panic: false, panicTimer: 0 }
  });
}
```

**Step 2: Add special vehicle drawing**

In drawVehicle(), add cases:
```javascript
if (v.type === 'ambulance') {
  ctx.fillStyle = '#fff';
  ctx.fillRect(-v.w/2, -v.h/2, v.w, v.h);
  ctx.fillStyle = '#f00';
  ctx.fillRect(-4, -v.h/2 + 5, 8, 20);
  ctx.fillRect(-10, -v.h/2 + 12, 20, 6);
}

if (v.type === 'vip_limo') {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-v.w/2, -v.h/2, v.w, v.h);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(-v.w/2 + 2, -v.h/2 + 10, v.w - 4, 3);
}

if (v.type === 'news_van') {
  ctx.fillStyle = '#fff';
  ctx.fillRect(-v.w/2, -v.h/2, v.w, v.h);
  ctx.fillStyle = '#f00';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LIVE', 0, 0);
}

if (v.type === 'fuel_truck') {
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(-v.w/2, -v.h/2, v.w, v.h);
  ctx.fillStyle = '#ff6600';
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
}
```

**Step 3: Handle special drops**

In wreck handling:
```javascript
if (v.dropType === 'star_clear' && wantedStars > 0) {
  addWantedStars(-1);
  showMessage('HEAT REDUCED!', 'News coverage helps!', '#0f0');
}
```

**Step 4: Test manually**

- Play for a while, special vehicles should occasionally spawn
- Ambulance → full repair
- VIP Limo → $2000
- News Van → clears 1 star
- Fuel Truck → nitro

**Step 5: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: special vehicles - ambulance, VIP limo, news van, fuel truck"
```

---

## Phase 5: Polish & Balance

### Task 10: Escort AI Behavior

**Files:**
- Modify: `spy_driver_physics.html`

**Step 1: Improve escort AI to block player**

In updateVehicle(), add escort-specific behavior:
```javascript
if (v.type === 'escort' && geldtransporter && !v.wrecked) {
  // Escorts try to stay between player and truck
  const truckX = geldtransporter.x;
  const playerX = player.x;

  if (v.ai.role === 'front') {
    // Front escort blocks approach
    v.ai.targetX = (truckX + playerX) / 2;
    v.ai.targetX = Math.max(roadLeft + 40, Math.min(roadRight - 40, v.ai.targetX));
  } else {
    // Rear escort mirrors player position
    const offset = playerX - truckX;
    v.ai.targetX = truckX + offset * 0.5;
    v.ai.targetX = Math.max(roadLeft + 40, Math.min(roadRight - 40, v.ai.targetX));
  }
}
```

**Step 2: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: escort AI actively blocks player from reaching truck"
```

---

### Task 11: Police Spawning Based on Wanted Level

**Files:**
- Modify: `spy_driver_physics.html`

**Step 1: Add police spawn logic**

```javascript
let policeSpawnTimer = 0;

function updatePoliceSpawning() {
  if (wantedStars === 0) return;

  policeSpawnTimer++;

  // Spawn rate based on stars
  const spawnInterval = Math.max(60, 300 - wantedStars * 50);

  if (policeSpawnTimer >= spawnInterval) {
    policeSpawnTimer = 0;
    spawnPolice();
  }
}

function spawnPolice() {
  const types = [];

  // Available types based on stars
  if (wantedStars >= 1) types.push('cop');
  if (wantedStars >= 2) types.push('cruiser', 'cruiser');
  if (wantedStars >= 3) types.push('unmarked');
  if (wantedStars >= 4) types.push('suv');
  if (wantedStars >= 5) types.push('swat');

  const type = types[Math.floor(Math.random() * types.length)];

  const configs = {
    cop: { w: 28, h: 52, mass: 1.2, color: '#000080', health: 1, value: 100 },
    cruiser: { w: 30, h: 55, mass: 1.4, color: '#000080', health: 1, value: 200 },
    unmarked: { w: 28, h: 50, mass: 1.0, color: '#2f2f2f', health: 1, value: 300 },
    suv: { w: 34, h: 60, mass: 2.5, color: '#000040', health: 2, value: 400 },
    swat: { w: 38, h: 70, mass: 4, color: '#1a1a1a', health: 3, value: 500 }
  };

  const cfg = configs[type];
  const fromBehind = Math.random() < 0.3 + wantedStars * 0.1;

  vehicles.push({
    x: roadLeft + 30 + Math.random() * (roadWidth - 60),
    y: fromBehind ? H + 100 : -100,
    vx: 0, vy: 0,
    angle: 0, angularVel: 0,
    w: cfg.w, h: cfg.h,
    mass: cfg.mass,
    type: type,
    color: cfg.color,
    baseSpeed: currentSpeed * (fromBehind ? 1.3 : 0.7),
    health: cfg.health,
    value: cfg.value,
    wrecked: false,
    isPolice: true,
    fromBehind: fromBehind,
    ai: { targetX: player.x, panic: false, panicTimer: 0, chase: true }
  });
}
```

**Step 2: Police chase AI**

In updateVehicle(), add police behavior:
```javascript
if (v.isPolice && v.ai.chase && !v.wrecked) {
  // Chase player
  v.ai.targetX = player.x + (Math.random() - 0.5) * 40;

  // Aggressive steering
  const steerDiff = v.ai.targetX - v.x;
  v.vx += steerDiff * 0.04;

  // Try to PIT player from behind
  if (v.fromBehind && Math.abs(v.x - player.x) < 50) {
    v.vy -= 0.5; // Speed up to catch
  }
}
```

**Step 3: Police vehicle drawing**

In drawVehicle(), add police lights:
```javascript
if (v.isPolice && !v.wrecked) {
  // Police lights
  const flashOn = Math.floor(frameCount / 5) % 2 === 0;
  ctx.fillStyle = flashOn ? '#f00' : '#00f';
  ctx.fillRect(-v.w/2 + 3, -v.h/2 + 3, 8, 5);
  ctx.fillStyle = flashOn ? '#00f' : '#f00';
  ctx.fillRect(v.w/2 - 11, -v.h/2 + 3, 8, 5);
}
```

**Step 4: Call in update loop**

```javascript
updatePoliceSpawning();
```

**Step 5: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: police spawning and chase AI based on wanted level"
```

---

### Task 12: Final Polish - Screen Shake, Slow-Mo

**Files:**
- Modify: `spy_driver_physics.html`

**Step 1: Add screen shake**

```javascript
let screenShake = 0;

function addScreenShake(intensity) {
  screenShake = Math.max(screenShake, intensity);
}

function updateScreenShake() {
  if (screenShake > 0) {
    screenShake *= 0.9;
    if (screenShake < 0.5) screenShake = 0;
  }
}

function applyScreenShake() {
  if (screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * screenShake;
    const shakeY = (Math.random() - 0.5) * screenShake;
    ctx.translate(shakeX, shakeY);
  }
}
```

**Step 2: Add shake triggers**

In collision handling:
```javascript
addScreenShake(impactSpeed * 2);
```

In wall collision:
```javascript
addScreenShake(10);
```

**Step 3: Apply in draw**

At start of draw():
```javascript
ctx.save();
applyScreenShake();
```

At end of draw():
```javascript
ctx.restore();
updateScreenShake();
```

**Step 4: Add slow-mo on big hits**

```javascript
let slowMoTimer = 0;

function triggerSlowMo(frames) {
  slowMoTimer = frames;
}

function getTimeScale() {
  return slowMoTimer > 0 ? 0.3 : 1;
}
```

In update(), wrap movement in time scale:
```javascript
const timeScale = getTimeScale();
if (slowMoTimer > 0) slowMoTimer--;

// Apply timeScale to physics...
```

Trigger on big impacts:
```javascript
if (impactSpeed > 8) {
  triggerSlowMo(10);
}
```

**Step 5: Commit**

```bash
git add spy_driver_physics.html
git commit -m "feat: screen shake and slow-mo on big impacts"
```

---

### Task 13: Update Title and Branding

**Files:**
- Modify: `spy_driver_physics.html`

**Step 1: Update title and start screen**

```html
<title>Fast Ferocious Fandango: Foolish Fugitives</title>
```

```html
<h1>FANDANGO</h1>
<div class="subtitle">FOOLISH FUGITIVES</div>
```

Update instructions:
```html
<div class="inst-row">
  <div class="inst-icon">🚛</div>
  <div class="inst-text"><b>ROB</b> the Geldtransporter!</div>
</div>
<div class="inst-row">
  <div class="inst-icon">🚔</div>
  <div class="inst-text"><b>EVADE</b> the police!</div>
</div>
<div class="inst-row">
  <div class="inst-icon">💥</div>
  <div class="inst-text"><b>RAM</b> escorts off the road!</div>
</div>
<div class="inst-row">
  <div class="inst-icon">💰</div>
  <div class="inst-text"><b>LOOT</b> pickups to survive!</div>
</div>
```

Button text:
```html
<button id="start-btn">LET'S FANDANGO!</button>
```

**Step 2: Commit**

```bash
git add spy_driver_physics.html
git commit -m "chore: rebrand to Fast Ferocious Fandango: Foolish Fugitives"
```

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-4 | Core systems (integrity, ram bar, walls, BUSTED) |
| 2 | 5 | Wanted stars |
| 3 | 6-7 | Geldtransporter heist |
| 4 | 8-9 | Loot & pickups, special vehicles |
| 5 | 10-13 | Polish (AI, police, effects, branding) |

**Estimated implementation time:** 13 tasks × 15-30 minutes = 3-6 hours

---

Plan complete and saved to `docs/plans/2026-01-18-implementation-plan.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**

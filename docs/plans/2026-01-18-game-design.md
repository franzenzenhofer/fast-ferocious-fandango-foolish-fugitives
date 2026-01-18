# Fast Ferocious Fandango: Foolish Fugitives - Game Design v2

## Core Fantasy

You are **"The Fandango"** - a legendary highway robber driving a custom muscle car with a reinforced RAM BAR. You intercept armored money transports, ram their escorts into barriers, crack open the trucks like piñatas. The cops hate you. You're never stopped for long.

**THE ROAD NEVER ENDS. YOU NEVER DIE. YOU JUST GET BUSTED AND KEEP GOING.**

---

## Why The Original Wasn't Fun

| Problem | Root Cause | Solution |
|---------|-----------|----------|
| No rhythm | Endless ramming with no peaks | Geldtransporter heists every 60-90 sec |
| Ramming felt random | No skill expression | Tactical moves: PIT, sideswipe, bulldoze |
| Health system illogical | "Ram to heal" makes no sense | Loot repair kits from wrecked special cars |
| All cars the same | No tactical variety | Different cars = different loot drops |
| Death = frustration | Lose everything | BUSTED = lose 30% cash, instant continue |
| Energy bars confusing | Multiple unclear meters | ONE bar: Integrity |

---

## The Logical Model

### Your Car: "The Fandango"

**Built for ramming:**
- Reinforced steel RAM BAR on the front
- Frontal impacts = SAFE for you (ram bar absorbs it)
- Sides, rear, underbody = VULNERABLE

**What hurts you:**
| Hazard | Damage | Why |
|--------|--------|-----|
| Walls/barriers | -15% | Scrapes your sides |
| Spike strips | -25% | Shreds tires/underbody |
| Cops ram YOUR side/rear | -10% | Vulnerable areas |
| Stationary obstacles | -20% | Full impact |

**What does NOT hurt you:**
| Action | Damage | Why |
|--------|--------|-----|
| You ram cars head-on | 0% | Ram bar protects you |
| Glancing bumps | 0% | Minor contact |

---

## The Core Skill: Tactical Ramming

**Classic car chase takedown techniques - your front ram bar is your weapon.**

### The Moves:

| Move | How | Result |
|------|-----|--------|
| **PIT Maneuver** | Hit their REAR CORNER | They SPIN OUT, lose control |
| **Sideswipe** | Pull alongside, steer INTO them | Push them into barrier |
| **Bulldoze** | Get behind, ram their rear | Push into obstacles ahead |
| **Squeeze** | Trap between you and wall | Crush them against barrier |

### Example: The Sideswipe

```
        BARRIER
        ═══════════════════════

             [Escort SUV]  ← Gets pushed RIGHT
                  ↗
        [YOUR CAR] → Sideswipe from LEFT

             Your front hits their side = YOU'RE FINE
             They slide into barrier = WRECKED
```

### Why Positioning Matters:

| Your Approach | Result |
|--------------|--------|
| Approach from their LEFT | They go RIGHT (into right barrier) |
| Approach from their RIGHT | They go LEFT (into left barrier) |
| Hit their REAR CORNER | PIT - they spin out |
| Hit HEAD-ON | Both bounce back (wastes time) |
| Sloppy angle | YOUR side scrapes the barrier = damage |

**Your ram bar protects the front. Smart positioning keeps your sides safe.**

---

## Health: One Bar, Simple Logic

### INTEGRITY

- Starts at 100%
- Drains from hazards (walls, spikes, getting rammed)
- Does NOT drain from your offensive rams
- Heals from LOOT PICKUPS dropped by wrecks
- At 0% = BUSTED

---

## Pickups: Loot From Wrecks

When you wreck a car, it drops loot. **You're scavenging from the wreckage.**

### Civilian Cars → Cash Only

| Type | Cash Drop |
|------|-----------|
| Sedan | $25-50 |
| Sports car | $50-100 |
| Truck | $75-150 |
| Motorcycle | $100-200 |

### Police/Escorts → Equipment

| Type | Drops | Logic |
|------|-------|-------|
| Traffic cop | Small repair kit (+10%) | Basic gear |
| Cruiser | Repair kit (+15%) | Standard equipment |
| Unmarked | Shield booster (5 sec invincibility) | Tactical gear |
| SUV | Full repair kit (+25%) | Heavy equipment |
| SWAT Van | Shield + Nitro | Elite loadout |
| Escort SUV | Repair kit (+20%) | Security gear |

### Geldtransporter → JACKPOT

| Drop | Amount |
|------|--------|
| Cash explosion | $5,000-50,000 |
| Full repair kit | +50% integrity |
| Sometimes: Gold bar | 2x score multiplier (30 sec) |

### Special Traffic (Random Spawns)

| Vehicle | Appearance | Drops | Logic |
|---------|------------|-------|-------|
| Ambulance | White + red cross | FULL repair (+100%) | Medical supplies! |
| Repair Van | Yellow "AAA" | Repair kit + shield | Mechanic's tools |
| Fuel Truck | Tanker | Nitro x3 | Fuel = speed |
| VIP Limo | Black, tinted | $2,000 + gold bar | Rich passenger |
| News Van | "LIVE" on side | Clears 1 star | They film cop brutality |

**Skilled players hunt these for resources.**

---

## The Geldtransporter Heist

### Formation:
```
    [Escort Front]     ← Heavy SUV, blocks approach
         ↓
    [GELDTRANSPORTER]  ← Armored, takes 3 rams to crack
         ↓
    [Escort Rear]      ← Heavy SUV, protects from behind
```

### How To Rob:

**Step 1: Eliminate Escorts**
- Escorts BLOCK, they don't chase
- Get alongside, ram at correct angle INTO barrier
- They're HEAVY - need speed + good angle
- Bad angle = YOU hit the barrier

**Step 2: Crack The Truck**
- Unprotected truck = vulnerable
- Ram 3 times (front ram bar)
- Each hit cracks armor visually
- Third hit = BREACH

**Step 3: Collect The Loot**
- Money EXPLODES out the back
- Drive through money trail (3-5 seconds to collect all)
- Also drops: Full repair kit, sometimes gold bar

**Step 4: Consequences**
- Instant +2 wanted stars
- Cops converge on your position
- High risk, high reward

### Why It's Challenging:

| Challenge | Detail |
|-----------|--------|
| Escort weight | Need speed + precise angle |
| Moving arena | Truck keeps driving, barriers shift |
| Both sides dangerous | Left wall AND right wall can hurt you |
| Time pressure | Miss the truck = it escapes |
| Cop response | After crack, cops swarm |

---

## Wanted Stars

### ⭐ ONE STAR
- **Trigger:** Ram 3+ civilians
- **Response:** Single traffic cop, slow, predictable
- **Tactic:** Pulls alongside to slow you
- **Counter:** Ram sideways into barrier
- **Decay:** 30 sec clean driving

### ⭐⭐ TWO STARS
- **Trigger:** Ram a cop, 10+ cars hit
- **Response:** 2-3 cruisers, aggressive
- **Tactic:** PIT maneuver (ram YOUR rear corner)
- **Counter:** Brake suddenly, they overshoot, then YOU pit THEM
- **Decay:** 45 sec, cops must leave screen

### ⭐⭐⭐ THREE STARS
- **Trigger:** Rob Geldtransporter, destroy cop car
- **Response:** Unmarked muscle cars, spike strips on road
- **Tactic:** Get ahead and brake-check you
- **Counter:** Steer around, ram their side into barrier
- **Decay:** 60 sec, rare

### ⭐⭐⭐⭐ FOUR STARS
- **Trigger:** Rob 2 transports, destroy 5+ cops
- **Response:** Police SUVs (heavy!), helicopter spotlight
- **Tactic:** Box you in with multiple vehicles
- **Counter:** High speed + perfect angle, use other cars as bumpers
- **Decay:** 90 sec, very rare

### ⭐⭐⭐⭐⭐ FIVE STARS
- **Trigger:** Rob 3+ transports, survive 4 stars for 2 min
- **Response:** SWAT vans, roadblocks, absolute chaos
- **Tactic:** SWAT rams YOU head-on (they have ram bars too!)
- **Counter:** AVOID, or trick them into hitting other cops
- **Decay:** Almost never - must get BUSTED
- **Bonus:** Survive 60 sec at 5 stars = $10K achievement

---

## Busted System

**You're a legendary criminal. They can't hold you.**

### Triggers:
- Integrity hits 0
- 5-star cops box you in for 3 seconds

### What Happens:
1. Screen flashes red/blue
2. Car spins out
3. "BUSTED!" slams on screen
4. Show: "Bribe paid: -$X,XXX" (30% of pocket cash)
5. 3-second pause
6. Respawn: "New car delivered by your crew"
7. Full integrity, 0 stars, back on road

### Why It Makes Sense:
| Event | Explanation |
|-------|-------------|
| Lose 30% cash | Bribe money |
| Full repair | Crew delivers new car |
| Stars reset | Heat dies down |
| Instant continue | You're too famous to hold |

### Special Case:
- Busted with $0 = free pass (prevents death spiral)
- "They got nothing from you this time"

---

## Progression & Upgrades

### Upgrades (Bought Between Runs)

| Upgrade | Effect | Tiers | Max Cost |
|---------|--------|-------|----------|
| Engine | Top speed + acceleration | 5 | $100K |
| Armor | More integrity capacity | 5 | $100K |
| Ram Bar | More knockback on enemies | 5 | $100K |
| Tires | Spike strip resistance | 5 | $100K |

### Consumables (Bought or Looted)

| Item | Effect | Cost |
|------|--------|------|
| Nitro x1 | Huge speed burst | $2K |
| Shield x1 | 5 sec invincibility | $5K |
| Repair Kit | +25% integrity | $3K |
| Magnet | Attract nearby loot | $4K |

### Permanent Unlocks

| Item | Effect | Cost |
|------|--------|------|
| Spike-proof tires | Half spike damage | $50K |
| Police scanner | Shows cop positions on minimap | $30K |
| Reinforced sides | -50% damage from side rams | $75K |
| Turbo engine | Boost recharges faster | $40K |

---

## The Juice

### Screen Effects:
- Impact shake (scales with force)
- 0.3 sec slow-mo on BIG hits
- Speed lines when boosting
- Screen tilts into turns
- Red vignette when low integrity

### Visual Feedback:
- Sparks fly from metal-on-metal
- Glass shatters on impacts
- Cars deform and crumple
- Tire smoke on drifts
- Money EXPLODES like confetti
- Oil slicks from wrecked cars
- Fire from destroyed engines

### Audio Cues (Future):
- Metal crunch scaling with impact
- Engine roar builds with speed
- Sirens grow with wanted level
- CASH REGISTER CHING on money
- WRENCH CLANK on repair pickup

### Pop-Ups:
- "+$500 WRECKED!"
- "PIT MANEUVER! +$200"
- "PERFECT ANGLE!"
- "JACKPOT! $15,000"
- "REPAIRED +25%"
- "WHALE! $2,000" (VIP limo)

---

## Health Economy Balance

### The Loop:
```
Heist COSTS integrity (fighting escorts, chaos)
         ↓
Wrecking enemies DROPS repair kits
         ↓
Skilled play = break even or PROFIT
         ↓
Sloppy play = slow death → BUSTED
```

### Typical Heist Math:

| Event | Integrity Change |
|-------|-----------------|
| Start heist | 100% |
| Clip wall during escort fight | -15% |
| Wreck escort #1 | +20% (repair drop) |
| Cop rams your side | -10% |
| Wreck escort #2 | +20% (repair drop) |
| Crack truck | +50% (jackpot repair) |
| **Net result** | +65% (profit!) |

**Skilled heist = health profit. Sloppy heist = health loss.**

---

## Moment-to-Moment Flow

| Time | Action | Integrity | Stars |
|------|--------|-----------|-------|
| 0:00 | Cruising, weaving through traffic | 100% | 0 |
| 0:20 | Ram civilians for cash, hunting ambulance | 100% | 0 |
| 0:35 | $$$ icon - Geldtransporter incoming! | 100% | 0 |
| 0:45 | Engage front escort, clip wall | 85% | 0 |
| 0:55 | Wreck escort #1, grab repair kit | 100% | 1 |
| 1:05 | Wreck escort #2, grab repair kit | 100% | 1 |
| 1:15 | Crack truck - JACKPOT! | 100% | 3 |
| 1:20 | Cops swarm, one rams your side | 90% | 3 |
| 1:30 | PIT a cruiser into wall, grab kit | 100% | 3 |
| 1:45 | Spike strip! Couldn't dodge | 75% | 3 |
| 2:00 | Another Geldtransporter! Go for it? | 75% | 2 |
| 2:10 | Risky... engage anyway | 75% | 2 |
| 2:30 | Sloppy fight, hit multiple walls | 40% | 3 |
| 2:45 | Crack truck but integrity critical | 60% | 5 |
| 3:00 | SWAT rams you head-on | 30% | 5 |
| 3:15 | Desperately hunting repair drops | 30% | 5 |
| 3:30 | BUSTED! Lost $5K bribe | 100% | 0 |
| 3:33 | Back on road, lesson learned | 100% | 0 |

---

## Why This Design Works

| Principle | Implementation |
|-----------|----------------|
| **Logical physics** | Ram bar protects front, sides vulnerable |
| **Skill expression** | Tactical ramming: PIT, sideswipe, bulldoze |
| **Clear goals** | Geldtransporter every 60-90 sec |
| **Risk/reward** | Push for heists = stars = danger = money |
| **Health economy** | Wrecks drop repairs - skilled play profits |
| **No frustration** | BUSTED = shame + money, not restart |
| **Variety** | Special cars, star levels, truck types |
| **Progression** | Money → upgrades → handle harder chaos |
| **Always forward** | Endless highway, no menus |
| **Maximum juice** | Every impact feels powerful |

---

## Implementation Priority

### Phase 1: Core Loop
1. Single integrity bar
2. Ram bar physics (front = safe, sides = damage)
3. Basic Geldtransporter with 2 escorts
4. Repair kit drops from wrecks
5. BUSTED system

### Phase 2: Wanted System
1. 1-5 star escalation
2. Different police behaviors per star level
3. Star decay mechanic
4. Spike strips and roadblocks (3+ stars)

### Phase 3: Loot & Economy
1. All pickup types (repair, shield, nitro)
2. Special traffic (ambulance, VIP, news van)
3. Upgrade shop between runs
4. Consumable purchases

### Phase 4: Polish
1. All juice effects (shake, slow-mo, particles)
2. Truck type variety
3. Visual car damage states
4. Sound design

### Phase 5: Content
1. Multiple environments (highway, city, mountain)
2. Weather effects
3. Achievements
4. Leaderboards

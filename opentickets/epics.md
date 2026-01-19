# JIRA Epics

## Context
- Product: Fast Ferocious Fandango: Foolish Fugitives (arcade car-ramming chase)
- Platform: Web (Vite), keyboard + touch
- Primary flows: start run, steer/accelerate/brake, boost, ram traffic, collect power-ups, survive BUSTED loop
- Assumptions: no menu screen, audio not implemented, game starts immediately

## Severity Scale
- S1: Blocker
- S2: Major
- S3: Minor
- S4: Polish

## Epics

### EPIC-001: Complete touch-first controls and onboarding
- Outcome: mobile players can steer, accelerate, brake, boost, and pause without relying on a keyboard
- Rationale: missing touch parity forces users to guess or abandon the run
- Impacted personas: P1, P2
- Linked tickets: TCK-001, TCK-002

### EPIC-002: HUD resilience across screen sizes
- Outcome: key stats remain readable and non-overlapping on small screens
- Rationale: crowded HUD reduces clarity during high-speed play
- Impacted personas: P1, P3
- Linked tickets: TCK-003, TCK-004

### EPIC-003: Impact and reward feedback polish
- Outcome: collisions and pickups feel rewarding without obscuring play
- Rationale: visual-only feedback limits perceived impact and fun
- Impacted personas: P1, P3
- Linked tickets: TCK-005, TCK-006

# Kitchen Chaos

A complete, original 2D canvas cooking game for the make.fun "best-cooking-game" competition.

## Play

```bash
node serve.ts
# Open http://localhost:8080 in Chrome
```

Or open `game/index.html` directly in a browser (some browsers may block ES modules from file://).

## How to Play

- **Stations** (press 1-5 to move):
  - **1 - Fridge**: Grab ingredients (tomato, lettuce, cheese, patty, bun, onion, pickle, bacon, egg)
  - **2 - Prep**: Chop vegetables (tomato, lettuce, onion, pickle)
  - **3 - Stove**: Cook proteins (patty, bacon, egg)
  - **4 - Plate**: Assemble ingredients in the correct order for the current order
  - **5 - Serve**: Submit completed dish

- **Controls**:
  - `1-5` - Move to station
  - `E` / `Space` / Click - Interact at current station
  - `P` / `Escape` - Pause
  - `Space` / `Enter` - Start/Restart

- **Goal**: Complete orders by building the exact recipe shown on the order board before the timer runs out. Wrong ingredients penalize your score. Perfect orders give bonus points and build a combo multiplier!

## Features

- 5 unique burger recipes with different ingredient combinations
- 9 ingredient types with distinct visual styles and states (raw/chopped/cooked)
- Real-time order timer with visual progress bar
- Order board showing up to 3 pending orders
- Station-based gameplay (no free movement - pure time management)
- Score tracking with perfect order bonuses and combos
- Persistent high score (localStorage)
- Accessible: screen reader announcements for all actions
- Screenshot support via `?shot=start|play|end&seed=N`

## Project Structure

```
├── main.ts                    # Entrypoint: copies game/ + screenshots/ → /output, builds dossier.json
├── vendor/makefun-game.ts     # Vendored make.fun dossier library (unchanged)
├── LICENSE                    # MIT License
├── game/
│   ├── index.html             # Entry page
│   └── src/
│       ├── config.js          # Game constants, palette, recipes, stations
│       ├── random.js          # Deterministic RNG (Mulberry32)
│       ├── input.js           # Keyboard/pointer input handling
│       ├── recipes.js         # Recipe definitions, ingredient logic
│       ├── stations.js        # Kitchen station logic
│       ├── orders.js          # Order management
│       ├── player.js          # Player state and inventory
│       ├── world.js           # Main game simulation
│       ├── render.js          # Canvas rendering
│       └── main.js            # Browser entry point, game loop
├── screenshots/               # 3-4 PNG/JPEG screenshots (cover first)
└── serve.ts                   # Local dev server
```

## Building for Submission

```bash
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
# Verifies dossier.json, game/, screenshots/ in out/
```

## License

MIT © 2026 jepehhh
// Kitchen Chaos - game configuration constants

/** Playfield size in game units. The renderer scales this to fit the window. */
export const FIELD = {
  width: 1280,
  height: 720,
};

/** Font for all text. */
export const FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Color palette. */
export const PALETTE = {
  backdrop: '#0d0f14',
  counter: '#2a241a',
  counterEdge: '#3d3426',
  stove: '#1a1a1a',
  stoveTop: '#2a2a2a',
  burner: '#0a0a0a',
  burnerOn: '#ff4400',
  cuttingBoard: '#8b6f47',
  boardEdge: '#6b5030',
  plate: '#f0f0f0',
  plateShadow: '#d0d0d0',
  text: '#e8e8e8',
  textDim: '#9aa0a6',
  accent: '#ffb340',
  accentDim: '#ff9900',
  danger: '#ff4444',
  success: '#44cc44',
  orderBg: '#1a1a2e',
  orderBorder: '#3d3d6b',
  timerBg: '#2a0a0a',
  timerFg: '#ff6666',
  ingredientBg: '#1a2a1a',
  ingredientBorder: '#3d5a3d',
  uiPanel: '#1a1a2e',
  uiBorder: '#3d3d6b',
};

/** Ingredient types with their visual properties. */
export const INGREDIENTS = {
  tomato: { name: 'Tomato', color: '#e84422', secondary: '#cc3311', shape: 'circle', size: 28 },
  lettuce: { name: 'Lettuce', color: '#44aa44', secondary: '#338833', shape: 'leaf', size: 30 },
  cheese: { name: 'Cheese', color: '#ffdd44', secondary: '#eebb33', shape: 'square', size: 24 },
  patty: { name: 'Patty', color: '#6b3311', secondary: '#442200', shape: 'circle', size: 32 },
  bunBottom: { name: 'Bun (Bottom)', color: '#d4a574', secondary: '#b88a5a', shape: 'bunBottom', size: 36 },
  bunTop: { name: 'Bun (Top)', color: '#d4a574', secondary: '#b88a5a', shape: 'bunTop', size: 36 },
  onion: { name: 'Onion', color: '#cc8844', secondary: '#aa6633', shape: 'ring', size: 26 },
  pickle: { name: 'Pickle', color: '#33aa33', secondary: '#228822', shape: 'pickle', size: 22 },
  bacon: { name: 'Bacon', color: '#cc5533', secondary: '#aa3322', shape: 'bacon', size: 30 },
  egg: { name: 'Egg', color: '#fff8e8', secondary: '#ffe0b8', shape: 'egg', size: 24 },
};

/** Recipe definitions. */
export const RECIPES = [
  {
    id: 'classic_burger',
    name: 'Classic Burger',
    ingredients: ['bunBottom', 'patty', 'cheese', 'lettuce', 'tomato', 'bunTop'],
    timeBonus: 15,
    baseScore: 100,
  },
  {
    id: 'bacon_burger',
    name: 'Bacon Burger',
    ingredients: ['bunBottom', 'patty', 'cheese', 'bacon', 'lettuce', 'tomato', 'bunTop'],
    timeBonus: 20,
    baseScore: 150,
  },
  {
    id: 'double_cheese',
    name: 'Double Cheese',
    ingredients: ['bunBottom', 'patty', 'cheese', 'patty', 'cheese', 'pickle', 'bunTop'],
    timeBonus: 20,
    baseScore: 180,
  },
  {
    id: 'breakfast_burger',
    name: 'Breakfast Burger',
    ingredients: ['bunBottom', 'patty', 'cheese', 'bacon', 'egg', 'bunTop'],
    timeBonus: 15,
    baseScore: 160,
  },
  {
    id: 'veggie_delight',
    name: 'Veggie Delight',
    ingredients: ['bunBottom', 'lettuce', 'tomato', 'onion', 'pickle', 'cheese', 'bunTop'],
    timeBonus: 10,
    baseScore: 120,
  },
];

/** Station positions and sizes. */
export const STATIONS = {
  fridge: { x: 60, y: 80, width: 120, height: 180, label: 'FRIDGE' },
  prep: { x: 220, y: 80, width: 140, height: 180, label: 'PREP' },
  stove: { x: 400, y: 80, width: 200, height: 180, label: 'STOVE' },
  plating: { x: 660, y: 80, width: 180, height: 180, label: 'PLATE' },
  serve: { x: 1080, y: 80, width: 160, height: 180, label: 'SERVE' },
};

/** Order board position. */
export const ORDER_BOARD = { x: 20, y: 300, width: 300, height: 380 };

/** Timer bar position. */
export const TIMER_BAR = { x: 360, y: 20, width: 560, height: 36 };

/** Player state constants. */
export const PLAYER = {
  maxCarry: 3,
  moveSpeed: 0, // Station-based, no free movement
};

/** Game timing. */
export const TIMING = {
  orderTime: 45, // seconds per order
  cookTime: 3, // seconds to cook patty/bacon/egg
  chopTime: 1.5, // seconds to chop
  serveWindow: 2, // seconds to serve after plating
};

/** Scoring. */
export const SCORING = {
  correctIngredient: 10,
  wrongIngredient: -15,
  orderComplete: 100,
  timeBonusPerSec: 2,
  perfectBonus: 50,
};

/** Screens. */
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

/** Actions. */
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_INTERACT = 4;

/** Station IDs. */
export const STATION_ID = {
  FRIDGE: 'fridge',
  PREP: 'prep',
  STOVE: 'stove',
  PLATING: 'plating',
  SERVE: 'serve',
};

/** Ingredient states. */
export const INGREDIENT_STATE = {
  RAW: 'raw',
  CHOPPED: 'chopped',
  COOKED: 'cooked',
  READY: 'ready',
};
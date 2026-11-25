// Kitchen Chaos - kitchen stations and their logic

import { STATIONS, STATION_ID, INGREDIENT_STATE, TIMING } from './config.js';
import { createIngredient, canProcessAt, getProcessedState, getProcessTime, getAllIngredientTypes } from './recipes.js';

/** Station state. */
export function createStation(id) {
  const def = STATIONS[id];
  const station = {
    id,
    ...def,
    contents: [], // ingredients currently in this station
    processing: null, // { ingredient, progress, startTime, duration }
    hover: false,
  };
  return station;
}

/** Initialize all stations. */
export function createStations() {
  const stations = {};
  for (const id of Object.keys(STATIONS)) {
    stations[id] = createStation(id);
  }
  // Stock fridge with ingredients
  stockFridge(stations.fridge);
  return stations;
}

/** Stock the fridge with available ingredients. */
function stockFridge(fridge) {
  const types = getAllIngredientTypes();
  // Add 2 of each ingredient type
  for (const type of types) {
    for (let i = 0; i < 2; i++) {
      const ing = createIngredient(type);
      if (ing) {
        ing.inStation = 'fridge';
        fridge.contents.push(ing);
      }
    }
  }
  arrangeFridgeContents(fridge);
}

/** Arrange fridge contents in a grid. */
function arrangeFridgeContents(fridge) {
  const cols = 4;
  const spacing = 32;
  const startX = fridge.x + 16;
  const startY = fridge.y + 40;
  fridge.contents.forEach((ing, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ing.x = startX + col * spacing;
    ing.y = startY + row * spacing;
  });
}

/** Try to take an ingredient from a station. */
export function takeFromStation(station, ingredientIndex, carrying) {
  if (carrying.length >= 3) return null; // Max carry limit
  if (ingredientIndex < 0 || ingredientIndex >= station.contents.length) return null;
  const ing = station.contents.splice(ingredientIndex, 1)[0];
  ing.inStation = null;
  rearrangeStation(station);
  return ing;
}

/** Try to place an ingredient into a station. */
export function placeIntoStation(station, ingredient) {
  if (station.id === 'fridge') return false; // Can't put back in fridge
  if (station.id === 'serve') return false; // Serve handled separately
  ingredient.inStation = station.id;
  station.contents.push(ingredient);
  rearrangeStation(station);
  return true;
}

/** Rearrange station contents visually. */
function rearrangeStation(station) {
  if (station.id === 'fridge') {
    arrangeFridgeContents(station);
    return;
  }
  // For other stations, arrange in a line
  const count = station.contents.length;
  const spacing = 36;
  const totalWidth = (count - 1) * spacing;
  const startX = station.x + (station.width - totalWidth) / 2;
  const y = station.y + station.height / 2;
  station.contents.forEach((ing, i) => {
    ing.x = startX + i * spacing;
    ing.y = y;
  });
}

/** Update station processing (cooking/chopping). */
export function updateStation(station, dt) {
  if (!station.processing) return null;

  station.processing.progress += dt / station.processing.duration;
  if (station.processing.progress >= 1) {
    // Processing complete
    const ing = station.processing.ingredient;
    ing.state = station.processing.resultState;
    ing.progress = 0;
    station.processing = null;
    // Place result in station
    placeIntoStation(station, ing);
    return ing;
  }
  return null;
}

/** Start processing an ingredient at a station. */
export function startProcessing(station, ingredientIndex) {
  if (station.processing) return false; // Already processing
  if (ingredientIndex < 0 || ingredientIndex >= station.contents.length) return false;

  const ing = station.contents[ingredientIndex];
  if (!canProcessAt(ing, station.id)) return false;

  const duration = getProcessTime(ing, station.id);
  const resultState = getProcessedState(ing, station.id);

  station.processing = {
    ingredient: ing,
    progress: 0,
    duration,
    resultState,
    startTime: Date.now(),
  };
  // Remove from contents while processing
  station.contents.splice(ingredientIndex, 1);
  rearrangeStation(station);
  return true;
}

/** Get the ingredient under mouse at a station. */
export function getIngredientAt(station, mx, my) {
  for (let i = station.contents.length - 1; i >= 0; i--) {
    const ing = station.contents[i];
    const def = { size: ing.size }; // approximate hitbox
    const dx = mx - ing.x;
    const dy = my - ing.y;
    const radius = def.size / 2 + 4;
    if (dx * dx + dy * dy <= radius * radius) return i;
  }
  return -1;
}

/** Check if point is inside station bounds. */
export function pointInStation(station, x, y) {
  return x >= station.x && x <= station.x + station.width &&
         y >= station.y && y <= station.y + station.height;
}

/** Get station by hotkey (1-5). */
export function getStationByHotkey(hotkey, stations) {
  const order = ['fridge', 'prep', 'stove', 'plating', 'serve'];
  const idx = parseInt(hotkey, 10) - 1;
  if (idx >= 0 && idx < order.length) return stations[order[idx]];
  return null;
}

/** Clear all stations (for reset). */
export function clearStations(stations) {
  for (const station of Object.values(stations)) {
    station.contents = [];
    station.processing = null;
  }
  stockFridge(stations.fridge);
}
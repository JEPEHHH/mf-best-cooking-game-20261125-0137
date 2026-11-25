// Kitchen Chaos - recipe and ingredient logic

import { INGREDIENTS, RECIPES, INGREDIENT_STATE } from './config.js';

/** Create a new ingredient instance. */
export function createIngredient(typeId, state = INGREDIENT_STATE.RAW) {
  const def = INGREDIENTS[typeId];
  if (!def) return null;
  return {
    type: typeId,
    name: def.name,
    color: def.color,
    secondary: def.secondary,
    shape: def.shape,
    size: def.size,
    state,
    x: 0,
    y: 0,
    inStation: null,
    progress: 0, // 0-1 for cooking/chopping
  };
}

/** Check if an ingredient matches a recipe slot (by type). */
export function ingredientMatchesSlot(ingredient, slotType) {
  return ingredient.type === slotType;
}

/** Get the next required ingredient type for a recipe given current plate. */
export function getNextRequired(recipe, plate) {
  const placed = plate.map((ing) => ing.type);
  for (const req of recipe.ingredients) {
    const needed = countNeeded(recipe.ingredients, req) - countPlaced(placed, req);
    if (needed > 0) return req;
  }
  return null;
}

function countNeeded(list, type) {
  let c = 0;
  for (const t of list) if (t === type) c++;
  return c;
}

function countPlaced(list, type) {
  let c = 0;
  for (const t of list) if (t === type) c++;
  return c;
}

/** Validate a completed plate against a recipe. Returns { valid, score, perfect }. */
export function validatePlate(recipe, plate) {
  const placed = plate.map((ing) => ing.type);
  const required = [...recipe.ingredients];
  const matched = [];
  const errors = [];

  // Check each placed ingredient against requirements in order
  for (const ing of placed) {
    const idx = required.indexOf(ing);
    if (idx >= 0) {
      matched.push(ing);
      required.splice(idx, 1);
    } else {
      errors.push(ing);
    }
  }

  const valid = required.length === 0 && errors.length === 0;
  const perfect = valid && placed.length === recipe.ingredients.length && errors.length === 0;

  let score = 0;
  if (valid) {
    score = recipe.baseScore;
    // Time bonus handled separately
  }
  score -= errors.length * 15;

  return { valid, score, perfect, matched: matched.length, extra: errors.length };
}

/** Create a random recipe for an order. */
export function pickRandomRecipe(rng) {
  const idx = Math.floor(rng() * RECIPES.length);
  return { ...RECIPES[idx] };
}

/** Get all ingredient types that exist. */
export function getAllIngredientTypes() {
  return Object.keys(INGREDIENTS);
}

/** Get ingredient definition by type. */
export function getIngredientDef(typeId) {
  return INGREDIENTS[typeId];
}

/** Check if ingredient can be processed at a station. */
export function canProcessAt(ingredient, stationId) {
  switch (stationId) {
    case 'prep':
      return ingredient.state === INGREDIENT_STATE.RAW &&
        ['tomato', 'lettuce', 'onion', 'pickle'].includes(ingredient.type);
    case 'stove':
      return ingredient.state === INGREDIENT_STATE.RAW &&
        ['patty', 'bacon', 'egg'].includes(ingredient.type);
    default:
      return false;
  }
}

/** Get the result state after processing at a station. */
export function getProcessedState(ingredient, stationId) {
  if (stationId === 'prep') return INGREDIENT_STATE.CHOPPED;
  if (stationId === 'stove') return INGREDIENT_STATE.COOKED;
  return ingredient.state;
}

/** Get processing time for an ingredient at a station. */
export function getProcessTime(ingredient, stationId) {
  if (stationId === 'prep') return 1.5; // TIMING.chopTime
  if (stationId === 'stove') return 3; // TIMING.cookTime
  return 0;
}
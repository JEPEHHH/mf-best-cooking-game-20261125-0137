// Kitchen Chaos - player state and carrying logic

import { PLAYER, INGREDIENT_STATE } from './config.js';

/** Create initial player state. */
export function createPlayer() {
  return {
    currentStation: 'fridge', // which station player is at
    carrying: [], // ingredients in hand (max 3)
    score: 0,
    ordersCompleted: 0,
    perfectOrders: 0,
    combo: 0, // consecutive perfect orders
  };
}

/** Move player to a station. */
export function moveToStation(player, stationId) {
  player.currentStation = stationId;
}

/** Check if player can carry more. */
export function canCarryMore(player) {
  return player.carrying.length < PLAYER.maxCarry;
}

/** Add ingredient to player's hand. */
export function pickUpIngredient(player, ingredient) {
  if (!canCarryMore(player)) return false;
  player.carrying.push(ingredient);
  return true;
}

/** Remove and return ingredient from player's hand by index. */
export function dropIngredient(player, index) {
  if (index < 0 || index >= player.carrying.length) return null;
  return player.carrying.splice(index, 1)[0];
}

/** Find ingredient in hand by type. */
export function findInHand(player, typeId) {
  return player.carrying.findIndex((ing) => ing.type === typeId);
}

/** Clear all carried ingredients. */
export function clearHand(player) {
  player.carrying = [];
}

/** Add to score. */
export function addScore(player, amount) {
  player.score += amount;
}

/** Register order completion. */
export function completeOrder(player, perfect) {
  player.ordersCompleted++;
  if (perfect) {
    player.perfectOrders++;
    player.combo++;
  } else {
    player.combo = 0;
  }
}

/** Get carrying count. */
export function getCarryCount(player) {
  return player.carrying.length;
}

/** Get carried ingredient types as array. */
export function getCarriedTypes(player) {
  return player.carrying.map((ing) => ing.type);
}
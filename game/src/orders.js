// Kitchen Chaos - order management

import { pickRandomRecipe, validatePlate, getNextRequired } from './recipes.js';
import { ORDER_BOARD, TIMING, SCORING } from './config.js';

/** Create a new order. */
export function createOrder(rng, orderIndex) {
  const recipe = pickRandomRecipe(rng);
  return {
    id: `order_${orderIndex}_${Date.now()}`,
    recipe,
    timeLeft: TIMING.orderTime,
    active: true,
    completed: false,
    plate: [], // ingredients placed on plate
    y: ORDER_BOARD.y + 20 + orderIndex * 110, // vertical position
  };
}

/** Update order timer. */
export function updateOrder(order, dt) {
  if (!order.active || order.completed) return;
  order.timeLeft -= dt;
  if (order.timeLeft <= 0) {
    order.active = false;
    order.failed = true;
  }
}

/** Try to add an ingredient to the order's plate. */
export function addToPlate(order, ingredient) {
  if (!order.active || order.completed) return { success: false, reason: 'inactive' };
  const nextRequired = getNextRequired(order.recipe, order.plate);
  if (!nextRequired) return { success: false, reason: 'complete' };
  if (ingredient.type !== nextRequired) {
    return { success: false, reason: 'wrong', expected: nextRequired };
  }
  order.plate.push({ ...ingredient });
  return { success: true };
}

/** Check if order can be served. */
export function canServe(order) {
  if (!order.active || order.completed) return false;
  const nextRequired = getNextRequired(order.recipe, order.plate);
  return nextRequired === null && order.plate.length > 0;
}

/** Complete an order and calculate score. */
export function completeOrder(order) {
  if (!canServe(order)) return { score: 0, perfect: false };
  const result = validatePlate(order.recipe, order.plate);
  let score = 0;
  if (result.valid) {
    score = result.score + Math.floor(order.timeLeft) * SCORING.timeBonusPerSec;
    if (result.perfect) score += SCORING.perfectBonus;
  } else {
    score = result.score; // negative for wrong ingredients
  }
  order.completed = true;
  order.active = false;
  order.score = score;
  order.perfect = result.perfect;
  return { score, perfect: result.perfect, valid: result.valid };
}

/** Generate initial orders. */
export function generateInitialOrders(rng, count = 3) {
  const orders = [];
  for (let i = 0; i < count; i++) {
    orders.push(createOrder(rng, i));
  }
  return orders;
}

/** Add a new order when one is completed. */
export function addNewOrder(orders, rng, nextIndex) {
  // Shift existing orders up
  for (const order of orders) {
    if (order.active) order.y -= 110;
  }
  // Add new at bottom
  const newOrder = createOrder(rng, nextIndex);
  orders.push(newOrder);
  return newOrder;
}

/** Get active orders count. */
export function getActiveCount(orders) {
  let c = 0;
  for (const o of orders) if (o.active) c++;
  return c;
}

/** Get the current order being worked on (first active). */
export function getCurrentOrder(orders) {
  for (const o of orders) if (o.active) return o;
  return null;
}
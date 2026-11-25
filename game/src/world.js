// Kitchen Chaos - main game world logic

import { createRandom } from './random.js';
import { createStations, updateStation, startProcessing, takeFromStation, placeIntoStation, getStationByHotkey, clearStations, pointInStation, getIngredientAt } from './stations.js';
import { createPlayer, moveToStation, pickUpIngredient, dropIngredient, addScore, completeOrder, clearHand, canCarryMore } from './player.js';
import { createOrder, updateOrder, addToPlate, canServe, completeOrder as doCompleteOrder, generateInitialOrders, addNewOrder, getCurrentOrder } from './orders.js';
import { validatePlate } from './recipes.js';
import {
  FIELD, TIMING, SCORING,
  SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_OVER,
  STATION_ID, ORDER_BOARD
} from './config.js';

/** Fixed timestep. */
export const STEP = 1 / 60;

/** Create the game world. */
export function createWorld(rng) {
  const state = {
    rng,
    screen: SCREEN_TITLE,
    stations: null,
    player: null,
    orders: [],
    nextOrderIndex: 0,
    timeScale: 1,
    gameTime: 0,
    lastAnnouncement: '',
  };
  resetWorld(state);
  return { state, step: (dt, inputDir, paused) => stepWorld(state, dt, inputDir, paused), reset: () => resetWorld(state) };
}

/** Reset world to initial state. */
function resetWorld(state) {
  state.stations = createStations();
  state.player = createPlayer();
  state.orders = generateInitialOrders(state.rng, 3);
  state.nextOrderIndex = 3;
  state.gameTime = 0;
  state.screen = SCREEN_PLAY;
  state.lastAnnouncement = '';
}

/** Main simulation step. */
function stepWorld(state, dt, inputDir, paused) {
  if (paused) return 0;
  const events = 0;

  state.gameTime += dt;

  // Update stations
  for (const station of Object.values(state.stations)) {
    updateStation(station, dt);
  }

  // Update orders
  let anyActive = false;
  for (const order of state.orders) {
    if (order.active) {
      anyActive = true;
      updateOrder(order, dt);
    }
  }

  // Check for game over (no active orders and player has no pending)
  if (!anyActive && state.orders.every(o => o.completed || o.failed)) {
    // All orders done
    return EVENT_OVER;
  }

  return events;
}

/** Handle player interaction at current station. */
export function interactAtStation(world, stationId) {
  const { state } = world;
  const station = state.stations[stationId];
  if (!station) return { success: false, message: 'No station' };

  const player = state.player;
  const currentOrder = getCurrentOrder(state.orders);

  switch (stationId) {
    case STATION_ID.FRIDGE: {
      // Take ingredient from fridge
      const idx = getIngredientAt(station, station.x + station.width / 2, station.y + station.height / 2);
      // For fridge, pick first available
      if (station.contents.length > 0 && canCarryMore(player)) {
        const ing = takeFromStation(station, 0, player.carrying);
        if (ing) pickUpIngredient(player, ing);
        return { success: true, message: `Picked up ${ing.name}` };
      }
      return { success: false, message: station.contents.length === 0 ? 'Fridge empty' : 'Hands full' };
    }

    case STATION_ID.PREP:
    case STATION_ID.STOVE: {
      // If carrying ingredient, try to place it for processing
      if (player.carrying.length > 0) {
        // Try to place first carryable ingredient that can be processed here
        for (let i = 0; i < player.carrying.length; i++) {
          const ing = player.carrying[i];
          if (canProcessAtStation(ing, stationId)) {
            const dropped = dropIngredient(player, i);
            if (placeIntoStation(station, dropped)) {
              return { success: true, message: `Placed ${dropped.name} for processing` };
            }
          }
        }
        return { success: false, message: 'Cannot process that here' };
      }
      // If not carrying, try to start processing or take result
      if (station.processing) {
        // Can't interact while processing
        return { success: false, message: 'Processing...' };
      }
      if (station.contents.length > 0) {
        // Check if any ingredient can be processed
        for (let i = 0; i < station.contents.length; i++) {
          if (canProcessAtStation(station.contents[i], stationId)) {
            if (startProcessing(station, i)) {
              return { success: true, message: 'Started processing' };
            }
          }
        }
        // Take finished ingredient
        if (station.contents.length > 0 && canCarryMore(player)) {
          const ing = takeFromStation(station, 0, player.carrying);
          if (ing) pickUpIngredient(player, ing);
          return { success: true, message: `Picked up ${ing.name}` };
        }
      }
      return { success: false, message: 'Nothing to do' };
    }

    case STATION_ID.PLATING: {
      // Place ingredient on plate or take from plate
      if (player.carrying.length > 0 && currentOrder) {
        // Try to add to plate
        for (let i = 0; i < player.carrying.length; i++) {
          const ing = player.carrying[i];
          const result = addToPlate(currentOrder, ing);
          if (result.success) {
            dropIngredient(player, i);
            return { success: true, message: `Added ${ing.name} to plate` };
          } else if (result.reason === 'wrong') {
            return { success: false, message: `Wrong! Need ${result.expected}` };
          }
        }
        return { success: false, message: 'Order complete or invalid' };
      }
      // Could implement taking from plate here
      return { success: false, message: 'Nothing to plate' };
    }

    case STATION_ID.SERVE: {
      if (currentOrder && canServe(currentOrder)) {
        const result = doCompleteOrder(currentOrder);
        addScore(player, result.score);
        completeOrder(player, result.perfect);
        state.lastAnnouncement = result.perfect ? `Perfect! +${result.score}` : `Served! +${result.score}`;
        // Add new order
        addNewOrder(state.orders, state.rng, state.nextOrderIndex++);
        return { success: true, message: state.lastAnnouncement };
      }
      return { success: false, message: currentOrder ? 'Plate not ready' : 'No order' };
    }

    default:
      return { success: false, message: 'Unknown station' };
  }
}

/** Check if ingredient can be processed at station. */
function canProcessAtStation(ingredient, stationId) {
  if (stationId === STATION_ID.PREP) {
    return ['tomato', 'lettuce', 'onion', 'pickle'].includes(ingredient.type) &&
           ingredient.state === 'raw';
  }
  if (stationId === STATION_ID.STOVE) {
    return ['patty', 'bacon', 'egg'].includes(ingredient.type) &&
           ingredient.state === 'raw';
  }
  return false;
}

/** Handle station hotkey press. */
export function handleStationHotkey(world, hotkey) {
  const station = getStationByHotkey(hotkey, world.state.stations);
  if (!station) return;
  moveToStation(world.state.player, station.id);
  // Auto-interact on hotkey press
  interactAtStation(world, station.id);
}

/** Handle confirm action (start/restart). */
export function handleConfirm(world) {
  const { state } = world;
  if (state.screen === SCREEN_TITLE || state.screen === SCREEN_OVER) {
    resetWorld(state);
    return true;
  }
  return false;
}

/** Handle pause action. */
export function handlePause(world) {
  const { state } = world;
  if (state.screen === SCREEN_PLAY) {
    state.screen = SCREEN_PAUSED;
    return true;
  } else if (state.screen === SCREEN_PAUSED) {
    state.screen = SCREEN_PLAY;
    return true;
  }
  return false;
}
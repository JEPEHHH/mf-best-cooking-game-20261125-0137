// Kitchen Chaos - keyboard and pointer input

import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_INTERACT } from './config.js';

const NUMBER_KEYS = new Set(['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const INTERACT = new Set(['KeyE', 'KeyF']);

export function createInput(canvas) {
  let actions = 0;
  let stationPress = null; // '1'..'5' for station hotkeys

  window.addEventListener('keydown', (event) => {
    if (NUMBER_KEYS.has(event.code)) {
      if (!event.repeat) stationPress = event.code.slice(-1); // '1'..'5'
    } else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (INTERACT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_INTERACT;
    } else return;
    event.preventDefault();
  });

  window.addEventListener('keyup', (event) => {
    if (NUMBER_KEYS.has(event.code)) {
      stationPress = null;
    }
  });

  // Click/tap on canvas = interact with current station
  canvas.addEventListener('pointerdown', () => {
    actions |= ACTION_INTERACT;
  });

  // Key released while tab hidden never sends keyup: release on blur
  window.addEventListener('blur', () => {
    stationPress = null;
  });

  return {
    /** The station hotkey pressed this frame ('1'..'5' or null). */
    takeStationPress() {
      const pressed = stationPress;
      stationPress = null;
      return pressed;
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
// Kitchen Chaos - main entry point and game loop

import { BEST_KEY, LIVES, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_INTERACT, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { handleStationHotkey, handleConfirm, handlePause, interactAtStation } from './world.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  // Screenshot staging not implemented for this game
  console.log('Screenshot mode:', name);
  // Just run a frame to show the game
  renderer.draw(world.state, SCREEN_PLAY, readBest());
  window.__shotReady = true;
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
    world.state.lastAnnouncement = message;
    // Clear after 3 seconds
    setTimeout(() => {
      if (world.state.lastAnnouncement === message) {
        world.state.lastAnnouncement = '';
      }
    }, 3000);
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Kitchen Chaos - Get cooking!');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.player.score > best) {
      best = world.state.player.score;
      saveBest(best);
    }
    announce(`Game Over! Score: ${world.state.player.score}. Best: ${best}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    const stationPress = input.takeStationPress();

    if (stationPress) {
      handleStationHotkey(world, stationPress);
    }

    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) {
      startGame();
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Resumed.');
    } else if (actions & ACTION_INTERACT && screen === SCREEN_PLAY) {
      const result = interactAtStation(world, world.state.player.currentStation);
      if (result.success) {
        announce(result.message);
      } else {
        announce(result.message);
      }
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      // Idle animation on title screen
      world.step(STEP, 0, true);
      return;
    }
    const events = world.step(STEP, 0, false);
    if (events & 2) { // EVENT_OVER
      endGame();
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting timers run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused (tab hidden).');
    }
  });

  announce('Kitchen Chaos. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
// Kitchen Chaos - renderer (drawing only)

import { FIELD, FONT, PALETTE, STATIONS, ORDER_BOARD, TIMER_BAR, INGREDIENTS, RECIPES } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_OVER } from './config.js';

/** Panel dimensions for UI. */
const PANEL = { width: 500, top: 100, line: 30, bottom: 60 };
const INGREDIENT_RADIUS = 16;

/** Cached label builder to avoid allocations. */
function cachedLabel(prefix) {
  let value = null;
  let text = '';
  return function label(next) {
    if (next !== value) {
      value = next;
      text = prefix + next;
    }
    return text;
  };
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  const scoreLabel = cachedLabel('Score: ');
  const ordersLabel = cachedLabel('Orders: ');
  const perfectLabel = cachedLabel('Perfect: ');
  const comboLabel = cachedLabel('Combo: x');

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align = 'left', baseline = 'top') {
    if (!fonts.has(size)) fonts.set(size, `${size}px ${FONT}`);
    ctx.font = fonts.get(size);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(value, x, y);
  }

  /** Draw rounded rectangle. */
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /** Draw an ingredient shape. */
  function drawIngredient(ing, x, y, size = INGREDIENT_RADIUS, showState = true) {
    const def = INGREDIENTS[ing.type];
    if (!def) return;

    const s = size / INGREDIENT_RADIUS;
    const r = size;
    const color = ing.state === 'cooked' ? def.secondary : (ing.state === 'chopped' ? def.color : def.color);
    const secColor = def.secondary;

    ctx.save();
    ctx.translate(x, y);

    // Base shape
    switch (def.shape) {
      case 'circle': // tomato, patty
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        // Add detail for tomato
        if (ing.type === 'tomato') {
          ctx.fillStyle = secColor;
          ctx.beginPath();
          ctx.arc(0, -r * 0.3, r * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        // Patty grill marks
        if (ing.type === 'patty' && ing.state === 'cooked') {
          ctx.strokeStyle = '#331100';
          ctx.lineWidth = 1.5 * s;
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(-r, i * r * 0.5);
            ctx.lineTo(r, i * r * 0.5);
            ctx.stroke();
          }
        }
        break;

      case 'leaf': // lettuce
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.2, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = secColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.8, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'square': // cheese
        ctx.fillStyle = color;
        roundRect(-r, -r * 0.9, r * 2, r * 1.8, 4);
        ctx.fill();
        // Cheese holes
        ctx.fillStyle = secColor;
        for (const [hx, hy] of [[-r * 0.4, -r * 0.3], [r * 0.3, r * 0.2], [-r * 0.2, r * 0.4]]) {
          ctx.beginPath();
          ctx.arc(hx, hy, r * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'bunBottom':
        // Bottom bun
        ctx.fillStyle = color;
        roundRect(-r * 1.2, -r * 0.4, r * 2.4, r * 1.2, r * 0.4);
        ctx.fill();
        break;

      case 'bunTop':
        // Top bun with sesame seeds
        ctx.fillStyle = color;
        roundRect(-r * 1.2, -r * 0.8, r * 2.4, r * 1.2, r * 0.4);
        ctx.fill();
        ctx.fillStyle = '#8b6f47';
        for (const [sx, sy] of [[-r * 0.6, -r * 0.4], [0, -r * 0.6], [r * 0.5, -r * 0.3], [-r * 0.3, -r * 0.1], [r * 0.7, -r * 0.1]]) {
          ctx.beginPath();
          ctx.arc(sx, sy, r * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'ring': // onion
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = secColor;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'pickle':
        ctx.fillStyle = color;
        roundRect(-r * 0.5, -r, r, r * 2, r * 0.5);
        ctx.fill();
        ctx.fillStyle = secColor;
        for (let i = -1; i <= 1; i++) {
          ctx.fillRect(-r * 0.4, i * r * 0.5, r * 0.8, r * 0.15);
        }
        break;

      case 'bacon':
        ctx.fillStyle = color;
        roundRect(-r * 1.2, -r * 0.4, r * 2.4, r * 0.8, 2);
        ctx.fill();
        ctx.fillStyle = secColor;
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(-r * 1.1 + i * r * 0.8, -r * 0.3, r * 0.6, r * 0.6);
        }
        break;

      case 'egg':
        // Fried egg
        ctx.fillStyle = '#fff8e8';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.3, r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#eebb33';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    // State indicator
    if (showState && ing.state !== 'raw') {
      ctx.fillStyle = ing.state === 'cooked' ? PALETTE.success : PALETTE.accent;
      ctx.beginPath();
      ctx.arc(r * 0.7, -r * 0.7, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(8, r * 0.3)}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ing.state === 'cooked' ? '🔥' : '🔪', r * 0.7, -r * 0.7);
    }

    ctx.restore();
  }

  /** Draw a station. */
  function drawStation(station, isCurrent) {
    const s = station;
    const x = s.x, y = s.y, w = s.width, h = s.height;

    // Station background
    ctx.fillStyle = isCurrent ? PALETTE.uiPanel : PALETTE.counter;
    roundRect(x, y, w, h, 8);
    ctx.fill();

    // Station border
    ctx.strokeStyle = isCurrent ? PALETTE.accent : PALETTE.counterEdge;
    ctx.lineWidth = isCurrent ? 3 : 2;
    roundRect(x, y, w, h, 8);
    ctx.stroke();

    // Station label
    ctx.fillStyle = PALETTE.text;
    text(s.label, x + w / 2, y + 20, 16, PALETTE.text, 'center');

    // Station-specific visuals
    if (s.id === 'stove') {
      // Draw burners
      const burnerCount = 2;
      const bw = w / (burnerCount + 1);
      for (let i = 0; i < burnerCount; i++) {
        const bx = x + bw * (i + 1);
        const by = y + h * 0.6;
        ctx.fillStyle = PALETTE.burner;
        ctx.beginPath();
        ctx.arc(bx, by, 20, 0, Math.PI * 2);
        ctx.fill();
        if (s.processing) {
          ctx.fillStyle = PALETTE.burnerOn;
          ctx.beginPath();
          ctx.arc(bx, by, 15, 0, Math.PI * 2);
          ctx.fill();
          // Flame animation
          const t = Date.now() / 200;
          ctx.fillStyle = '#ff8800';
          for (let f = 0; f < 3; f++) {
            const fx = bx + Math.sin(t + f) * 8;
            const fy = by - 15 - Math.cos(t * 2 + f) * 5;
            ctx.beginPath();
            ctx.arc(fx, fy, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    } else if (s.id === 'prep') {
      // Cutting board visual
      ctx.fillStyle = PALETTE.cuttingBoard;
      roundRect(x + 10, y + 35, w - 20, h - 50, 4);
      ctx.fill();
      ctx.strokeStyle = PALETTE.boardEdge;
      ctx.lineWidth = 2;
      roundRect(x + 10, y + 35, w - 20, h - 50, 4);
      ctx.stroke();
      // Knife mark
      if (s.processing) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        const t = Date.now() / 100;
        const kx = x + w / 2 + Math.sin(t) * 20;
        ctx.beginPath();
        ctx.moveTo(kx, y + 35);
        ctx.lineTo(kx + 10, y + h - 15);
        ctx.stroke();
      }
    } else if (s.id === 'plating') {
      // Plate outline
      ctx.fillStyle = PALETTE.plateShadow;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, 55, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.plate;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2 - 2, 53, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.id === 'serve') {
      // Serve window
      ctx.fillStyle = PALETTE.success;
      roundRect(x + 10, y + 35, w - 20, h - 50, 6);
      ctx.fill();
      text('SERVE', x + w / 2, y + h / 2 + 5, 24, '#fff', 'center', 'middle');
    } else if (s.id === 'fridge') {
      // Fridge shelves
      ctx.strokeStyle = PALETTE.counterEdge;
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const sy = y + 40 + i * (h - 40) / 4;
        ctx.beginPath();
        ctx.moveTo(x + 10, sy);
        ctx.lineTo(x + w - 10, sy);
        ctx.stroke();
      }
    }

    // Draw contents
    for (const ing of s.contents) {
      drawIngredient(ing, ing.x, ing.y, INGREDIENT_RADIUS);
    }

    // Draw processing progress
    if (s.processing) {
      const p = s.processing;
      const px = x + w / 2;
      const py = y + h / 2;
      // Progress ring
      ctx.strokeStyle = PALETTE.uiBorder;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(px, py, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = PALETTE.accent;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(px, py, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.progress);
      ctx.stroke();
      // Ingredient being processed
      drawIngredient(p.ingredient, px, py, 24);
      // Time remaining
      text(`${Math.ceil(p.duration * (1 - p.progress))}s`, px, py + 45, 14, PALETTE.text, 'center');
    }
  }

  /** Draw player's carried ingredients. */
  function drawCarrying(player, x, y) {
    if (player.carrying.length === 0) return;
    text('Carrying:', x, y, 16, PALETTE.textDim);
    player.carrying.forEach((ing, i) => {
      const ix = x + 100 + i * 40;
      const iy = y - 10;
      drawIngredient(ing, ix, iy, INGREDIENT_RADIUS * 0.8);
      // Number key hint
      text(`${i + 1}`, ix, iy + 22, 10, PALETTE.textDim, 'center');
    });
  }

  /** Draw order board. */
  function drawOrderBoard(orders) {
    const x = ORDER_BOARD.x, y = ORDER_BOARD.y, w = ORDER_BOARD.width, h = ORDER_BOARD.height;

    // Board background
    ctx.fillStyle = PALETTE.orderBg;
    roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = PALETTE.orderBorder;
    ctx.lineWidth = 2;
    roundRect(x, y, w, h, 8);
    ctx.stroke();

    // Title
    text('ORDERS', x + w / 2, y + 25, 20, PALETTE.accent, 'center');

    // Draw each order
    let orderIdx = 0;
    for (const order of orders) {
      if (!order.active && !order.completed) continue;
      if (orderIdx >= 3) break; // Only show 3 orders max

      const oy = order.y;
      const isCurrent = orderIdx === 0;

      // Order card
      ctx.fillStyle = isCurrent ? PALETTE.uiPanel : PALETTE.orderBg;
      roundRect(x + 10, oy, w - 20, 100, 6);
      ctx.fill();
      ctx.strokeStyle = isCurrent ? PALETTE.accent : PALETTE.orderBorder;
      ctx.lineWidth = isCurrent ? 2 : 1;
      roundRect(x + 10, oy, w - 20, 100, 6);
      ctx.stroke();

      // Recipe name
      text(order.recipe.name, x + 20, oy + 20, 16, PALETTE.text);

      // Timer
      const timePercent = order.timeLeft / 45;
      const timerW = (w - 40) * Math.max(0, timePercent);
      ctx.fillStyle = PALETTE.timerBg;
      roundRect(x + 20, oy + 40, w - 40, 8, 4);
      ctx.fill();
      ctx.fillStyle = timePercent > 0.3 ? PALETTE.timerFg : PALETTE.danger;
      roundRect(x + 20, oy + 40, timerW, 8, 4);
      ctx.fill();
      text(`${Math.ceil(order.timeLeft)}s`, x + w - 30, oy + 40, 12, PALETTE.text, 'right');

      // Ingredients needed
      const plateTypes = order.plate.map(p => p.type);
      const required = order.recipe.ingredients;
      let drawn = 0;
      for (const req of required) {
        const needed = required.filter(r => r === req).length;
        const placed = plateTypes.filter(p => p === req).length;
        if (placed < needed) {
          const ix = x + 20 + drawn * 28;
          const iy = oy + 65;
          const def = INGREDIENTS[req];
          if (def) {
            // Draw mini ingredient
            ctx.save();
            ctx.translate(ix, iy);
            ctx.scale(0.5, 0.5);
            drawIngredient({ ...def, type: req, state: 'raw', color: def.color, secondary: def.secondary, shape: def.shape, size: def.size }, 0, 0, 16, false);
            ctx.restore();
            // Count
            if (needed > 1) {
              text(`${placed}/${needed}`, ix + 8, iy + 20, 10, PALETTE.textDim, 'center');
            }
            drawn++;
          }
        }
      }

      // Completed ingredients (small checkmarks)
      let checkX = x + w - 80;
      for (const ing of order.plate) {
        ctx.fillStyle = PALETTE.success;
        ctx.beginPath();
        ctx.arc(checkX, oy + 75, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', checkX, oy + 76);
        checkX -= 20;
      }

      if (order.completed) {
        text(order.perfect ? 'PERFECT!' : 'SERVED', x + w / 2, oy + 85, 14, order.perfect ? PALETTE.success : PALETTE.accent, 'center');
      }

      orderIdx++;
    }
  }

  /** Draw timer bar at top. */
  function drawTimerBar(currentOrder) {
    if (!currentOrder) return;
    const x = TIMER_BAR.x, y = TIMER_BAR.y, w = TIMER_BAR.width, h = TIMER_BAR.height;
    const percent = currentOrder.timeLeft / 45;

    ctx.fillStyle = PALETTE.timerBg;
    roundRect(x, y, w, h, 6);
    ctx.fill();

    const fillW = w * Math.max(0, percent);
    const grad = ctx.createLinearGradient(x, 0, x + fillW, 0);
    grad.addColorStop(0, percent > 0.5 ? PALETTE.success : PALETTE.danger);
    grad.addColorStop(1, percent > 0.5 ? PALETTE.accent : '#ff8800');
    ctx.fillStyle = grad;
    roundRect(x, y, fillW, h, 6);
    ctx.fill();

    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 2;
    roundRect(x, y, w, h, 6);
    ctx.stroke();

    text(`${Math.ceil(currentOrder.timeLeft)}s`, x + w / 2, y + h / 2 + 5, 18, '#fff', 'center', 'middle');
  }

  /** Draw HUD. */
  function drawHUD(state) {
    const player = state.player;
    const x = 20, y = 20;

    text(scoreLabel(player.score), x, y, 24, PALETTE.accent);
    text(ordersLabel(player.ordersCompleted), x, y + 30, 16, PALETTE.text);
    text(perfectLabel(player.perfectOrders), x, y + 50, 16, PALETTE.success);
    if (player.combo > 1) {
      text(comboLabel(player.combo), x, y + 70, 16, PALETTE.accentDim);
    }

    // Carried ingredients at bottom
    drawCarrying(player, 20, FIELD.height - 30);
  }

  /** Draw title screen. */
  function drawTitle(best) {
    // Background
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);

    // Title panel
    const lines = [
      'Cook dishes by gathering ingredients,',
      'chopping, cooking, and plating them',
      'before the timer runs out!',
      '',
      'Stations: 1-Fridge  2-Prep  3-Stove  4-Plate  5-Serve',
      'Press 1-5 to move, E/Space to interact',
      '',
      best > 0 ? `Best Score: ${best}` : '',
    ].filter(l => l !== '');

    const panelW = PANEL.width;
    const panelH = PANEL.top + lines.length * PANEL.line + PANEL.bottom;
    const px = (FIELD.width - panelW) / 2;
    const py = (FIELD.height - panelH) / 2;

    ctx.fillStyle = PALETTE.uiPanel;
    roundRect(px, py, panelW, panelH, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 2;
    roundRect(px, py, panelW, panelH, 12);
    ctx.stroke();

    text('Kitchen Chaos', FIELD.width / 2, py + 60, 42, PALETTE.accent, 'center');
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], FIELD.width / 2, py + PANEL.top + i * PANEL.line, 18, PALETTE.text, 'center');
    }
    text('Press Space or Click to Start', FIELD.width / 2, py + panelH - 40, 20, PALETTE.accent, 'center');
  }

  /** Draw paused overlay. */
  function drawPaused() {
    // Dim overlay
    ctx.fillStyle = 'rgba(13, 15, 20, 0.85)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);

    const lines = ['The orders will wait for you.'];
    const panelW = PANEL.width;
    const panelH = PANEL.top + lines.length * PANEL.line + PANEL.bottom;
    const px = (FIELD.width - panelW) / 2;
    const py = (FIELD.height - panelH) / 2;

    ctx.fillStyle = PALETTE.uiPanel;
    roundRect(px, py, panelW, panelH, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 2;
    roundRect(px, py, panelW, panelH, 12);
    ctx.stroke();

    text('Paused', FIELD.width / 2, py + 60, 36, PALETTE.accent, 'center');
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], FIELD.width / 2, py + PANEL.top + i * PANEL.line, 18, PALETTE.text, 'center');
    }
    text('Press P to Resume', FIELD.width / 2, py + panelH - 40, 20, PALETTE.accent, 'center');
  }

  /** Draw game over screen. */
  function drawGameOver(state, best) {
    const player = state.player;

    // Background
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);

    const lines = [
      `Final Score: ${player.score}`,
      `Orders Completed: ${player.ordersCompleted}`,
      `Perfect Orders: ${player.perfectOrders}`,
      `Best Score: ${best}`,
    ];

    const panelW = PANEL.width;
    const panelH = PANEL.top + lines.length * PANEL.line + PANEL.bottom;
    const px = (FIELD.width - panelW) / 2;
    const py = (FIELD.height - panelH) / 2;

    ctx.fillStyle = PALETTE.uiPanel;
    roundRect(px, py, panelW, panelH, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 2;
    roundRect(px, py, panelW, panelH, 12);
    ctx.stroke();

    text('Game Over', FIELD.width / 2, py + 60, 36, PALETTE.danger, 'center');
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], FIELD.width / 2, py + PANEL.top + i * PANEL.line, 20, PALETTE.text, 'center');
    }
    text('Press Space or Click to Play Again', FIELD.width / 2, py + panelH - 40, 20, PALETTE.accent, 'center');
  }

  /** Announcement toast. */
  function drawAnnouncement(message) {
    if (!message) return;
    const x = FIELD.width / 2;
    const y = 120;
    ctx.fillStyle = 'rgba(26, 26, 46, 0.95)';
    const padding = 16;
    const metrics = ctx.measureText(message);
    const w = metrics.width + padding * 2;
    roundRect(x - w / 2, y - 20, w, 40, 8);
    ctx.fill();
    ctx.strokeStyle = PALETTE.accent;
    ctx.lineWidth = 2;
    roundRect(x - w / 2, y - 20, w, 40, 8);
    ctx.stroke();
    text(message, x, y + 5, 18, PALETTE.accent, 'center', 'middle');
  }

  /** Main draw function. */
  function draw(state, screen, best) {
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Clear with backdrop
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply view transform
    ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);

    if (screen === SCREEN_TITLE) {
      drawTitle(best);
      return;
    }

    // Draw stations
    for (const station of Object.values(state.stations)) {
      const isCurrent = station.id === state.player.currentStation;
      drawStation(station, isCurrent);
    }

    // Draw order board
    drawOrderBoard(state.orders);

    // Draw timer bar
    const currentOrder = state.orders.find(o => o.active);
    drawTimerBar(currentOrder);

    // Draw HUD
    drawHUD(state);

    // Draw announcement
    if (state.lastAnnouncement) {
      drawAnnouncement(state.lastAnnouncement);
    }

    // Screen overlays
    if (screen === SCREEN_PAUSED) drawPaused();
    else if (screen === SCREEN_OVER) drawGameOver(state, best);
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
import Phaser from 'phaser';
import { getEvents, hasSavedGame, loadGame, newGame, saveGame } from '../state/store';
import { TextButton } from '../ui/widgets';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('home');
  }

  create() {
    const { width, height } = this.scale;

    const pad = 32;

    // Top ticker (Bloomberg-style)
    const tickerH = 34;
    this.add
      .rectangle(0, 0, width, tickerH, 0x0f1730, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1);

    const events = getEvents();
    const headlines = events.slice(0, 5).map((e) => e.title);
    const tickerMsg = `CAMP STOCK SIMULATOR   •   TOP STORIES: ${headlines.join('   •   ')}`;

    const tickerText = this.add
      .text(width + 20, tickerH / 2, tickerMsg, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '18px',
        color: '#e8eefc'
      })
      .setOrigin(0, 0.5);

    const speedPxPerSec = 120;
    const travel = width + tickerText.width + 60;
    const durationMs = Math.max(3000, (travel / speedPxPerSec) * 1000);
    this.tweens.add({
      targets: tickerText,
      x: -tickerText.width - 40,
      duration: durationMs,
      repeat: -1,
      onRepeat: () => tickerText.setX(width + 20)
    });

    // Hero area with simple chart graphics (no external assets)
    const heroTop = tickerH;
    const heroH = Math.max(190, Math.floor(height * 0.30));

    this.add
      .rectangle(0, heroTop, width, heroH, 0x111a33, 0.45)
      .setOrigin(0, 0)
      .setStrokeStyle(0);

    const heroG = this.add.graphics();
    heroG.setPosition(0, heroTop);
    heroG.lineStyle(1, 0x334166, 0.35);

    const gridStep = 64;
    for (let x = 0; x <= width; x += gridStep) heroG.lineBetween(x, 0, x, heroH);
    for (let y = 0; y <= heroH; y += 40) heroG.lineBetween(0, y, width, y);

    // Deterministic-ish seed from headlines for a stable looking line.
    let seed = 0;
    for (const h of headlines) {
      for (let i = 0; i < h.length; i++) seed = (seed * 31 + h.charCodeAt(i)) >>> 0;
    }
    const rand = () => {
      // xorshift32
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return ((seed >>> 0) % 1000) / 1000;
    };

    const chartPadX = pad;
    const chartPadY = 26;
    const chartW = width - chartPadX * 2;
    const chartH = heroH - chartPadY * 2;
    const points = 48;
    const series: number[] = [];
    let v = 0.55;
    for (let i = 0; i < points; i++) {
      v = Math.max(0.18, Math.min(0.88, v + (rand() - 0.5) * 0.18));
      series.push(v);
    }

    heroG.lineStyle(3, 0x6ea8fe, 0.8);
    for (let i = 0; i < series.length; i++) {
      const t = series.length === 1 ? 0 : i / (series.length - 1);
      const x = chartPadX + t * chartW;
      const y = chartPadY + (1 - series[i]) * chartH;
      if (i === 0) heroG.beginPath().moveTo(x, y);
      else heroG.lineTo(x, y);
    }
    heroG.strokePath();

    heroG.fillStyle(0xc7f9cc, 0.9);
    heroG.fillCircle(chartPadX + chartW, chartPadY + (1 - series[series.length - 1]) * chartH, 4);

    this.add
      .text(width / 2, heroTop + 76, 'Camp Stock Simulator', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '48px',
        color: '#e8eefc'
      })
      .setOrigin(0.5);

    const contentTop = heroTop + heroH + 18;
    const bottomPad = 44;
    const contentH = Math.max(120, height - bottomPad - contentTop);

    const wideLayout = width >= 1050;

    // Headline board
    const btnPanelW = 360;
    const gap = 24;

    const boardW = wideLayout ? Math.min(820, Math.max(540, width - btnPanelW - pad * 3)) : Math.min(820, width - 80);
    const boardX = wideLayout ? pad : (width - boardW) / 2;
    const boardY = contentTop;

    const buttonsH = 64 * 2 + 16;
    const maxBoardH = 280;
    const boardHBase = wideLayout
      ? Math.min(maxBoardH, Math.max(160, Math.floor(contentH * 0.72)))
      : Math.max(140, Math.min(maxBoardH, contentH - buttonsH - gap));

    // Buttons (never overlap the board)
    const btnYTop = wideLayout ? contentTop : boardY + boardHBase + gap;
    const btnPanelX = wideLayout ? boardX + boardW + pad : (width - btnPanelW) / 2;
    const btnPanelY = wideLayout ? contentTop : btnYTop;
    // Ensure the START panel is tall enough for both buttons (and avoids hitbox overlap).
    const btnGapY = 92;
    const btn1Y = btnPanelY + 120;
    const requiredBtnPanelH = (btn1Y + btnGapY + 32) - btnPanelY + 28;

    const boardH = wideLayout ? Math.max(boardHBase, requiredBtnPanelH) : boardHBase;
    const btnPanelH = wideLayout ? boardH : Math.max(requiredBtnPanelH, Math.min(280, height - bottomPad - btnPanelY));

    this.add
      .rectangle(boardX, boardY, boardW, boardH, 0x0f1730, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1);

    this.add
      .text(boardX + 16, boardY + 12, 'TOP STORIES', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#b9c7ee'
      })
      .setOrigin(0, 0);

    this.add
      .text(boardX + 16, boardY + 40, headlines.map((h) => `• ${h}`).join('\n'), {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#e8eefc',
        lineSpacing: 6,
        wordWrap: { width: boardW - 32 }
      })
      .setOrigin(0, 0);

    this.add
      .rectangle(btnPanelX, btnPanelY, btnPanelW, btnPanelH, 0x0f1730, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1);

    this.add
      .text(btnPanelX + 16, btnPanelY + 14, 'START', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#b9c7ee'
      })
      .setOrigin(0, 0);

    // Small candlestick-style decoration in the button panel
    const deco = this.add.graphics();
    deco.setPosition(btnPanelX + 16, btnPanelY + 42);
    deco.lineStyle(2, 0x334166, 0.8);
    const candles = 10;
    const cw = 24;
    for (let i = 0; i < candles; i++) {
      const x = i * cw;
      const hi = 6 + Math.round(rand() * 26);
      const lo = 40 - Math.round(rand() * 24);
      const open = lo + Math.round(rand() * (hi - lo));
      const close = lo + Math.round(rand() * (hi - lo));
      const up = close >= open;
      deco.lineBetween(x + 8, lo, x + 8, hi);
      deco.fillStyle(up ? 0xc7f9cc : 0xffd6a5, 0.8);
      deco.fillRect(x + 3, Math.min(open, close), 10, Math.max(4, Math.abs(close - open)));
    }

    const btnCenterX = btnPanelX + btnPanelW / 2;
    new TextButton(this, btnCenterX, btn1Y, {
      width: 320,
      height: 64,
      label: 'New Game',
      hitPadding: 0,
      onClick: () => {
        const state = newGame(1000);
        saveGame(state);
        this.scene.start('lobby');
      }
    }).setDepth(20);

    const canLoad = hasSavedGame();
    const loadBtn = new TextButton(this, btnCenterX, btn1Y + btnGapY, {
      width: 320,
      height: 64,
      label: canLoad ? 'Load Game' : 'Load Game (none)',
      hitPadding: 0,
      onClick: () => {
        const state = loadGame();
        if (!state) return;
        saveGame(state);
        this.scene.start('lobby');
      }
    }).setDepth(19);

    if (!canLoad) loadBtn.setAlpha(0.6);

    // With Scale.FIT, Phaser automatically scales to the screen.
  }
}

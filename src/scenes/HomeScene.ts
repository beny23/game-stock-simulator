import Phaser from 'phaser';
import { getEvents, hasSavedGame, loadGame, newGame, saveGame } from '../state/store';
import { TextButton } from '../ui/widgets';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('home');
  }

  create() {
    const { width, height } = this.scale;

    // Top ticker (Bloomberg-style)
    const tickerH = 26;
    this.add
      .rectangle(0, 0, width, tickerH, 0x0f1730, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1);

    const events = getEvents();
    const headlines = events.slice(0, 5).map((e) => e.title);
    const tickerMsg = `STOCK CAMP SIMULATOR   •   OFFLINE • GM-LED • PROJECTOR-FRIENDLY   •   TOP STORIES: ${headlines.join('   •   ')}`;

    const tickerText = this.add
      .text(width + 20, tickerH / 2, tickerMsg, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
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

    this.add
      .text(width / 2, Math.max(90, height * 0.18), 'Stock Camp Simulator', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '48px',
        color: '#e8eefc'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, Math.max(140, height * 0.24), 'Offline • GM-led • Projector-friendly', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '18px',
        color: '#8ea3d8'
      })
      .setOrigin(0.5);

    // Headline board
    const boardW = Math.min(820, width - 80);
    const boardX = (width - boardW) / 2;
    const boardY = Math.max(180, height * 0.28);
    const boardH = 180;
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

    new TextButton(this, width / 2, height * 0.54, {
      width: 320,
      height: 64,
      label: 'New Game',
      onClick: () => {
        const state = newGame(1000);
        saveGame(state);
        this.scene.start('lobby');
      }
    });

    const canLoad = hasSavedGame();
    const loadBtn = new TextButton(this, width / 2, height * 0.60, {
      width: 320,
      height: 64,
      label: canLoad ? 'Load Game' : 'Load Game (none)',
      onClick: () => {
        const state = loadGame();
        if (!state) return;
        saveGame(state);
        this.scene.start('lobby');
      }
    });

    if (!canLoad) loadBtn.setAlpha(0.6);

    // With Scale.FIT, Phaser automatically scales to the screen.
  }
}

import Phaser from 'phaser';
import { loadGame, portfolioValue, saveGame } from '../state/store';
import { TextButton } from '../ui/widgets';

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super('results');
  }

  create() {
    const state = loadGame();
    if (!state) {
      this.scene.start('home');
      return;
    }

    const { width, height } = this.scale;

    this.add
      .text(width / 2, 40, 'Results', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '44px',
        color: '#e8eefc'
      })
      .setOrigin(0.5, 0);

    const ranked = [...state.players]
      .map((p) => ({ p, value: portfolioValue(state, p) }))
      .sort((a, b) => b.value - a.value);

    const topY = 120;
    const rowH = 34;

    ranked.forEach((r, i) => {
      this.add
        .text(width / 2, topY + i * rowH, `${i + 1}. ${r.p.name} — ${r.value} coins`, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '22px',
          color: '#e8eefc'
        })
        .setOrigin(0.5, 0);
    });

    this.add
      .text(width / 2, height - 170, 'Reflection', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '20px',
        color: '#b9c7ee'
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height - 130,
        '• What happened when lots of people bought the same stock?\n• Did diversification help when something dropped?\n• Which events were hype vs real performance?',
        {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '16px',
          color: '#8ea3d8',
          align: 'center'
        }
      )
      .setOrigin(0.5);

    new TextButton(this, width / 2, height - 60, {
      width: 320,
      height: 56,
      label: 'Back to Lobby',
      onClick: () => {
        saveGame(state);
        this.scene.start('lobby');
      }
    });

      // With Scale.FIT, Phaser automatically scales to the screen.
  }
}

import Phaser from 'phaser';
import { hasSavedGame, loadGame, newGame, saveGame } from '../state/store';
import { TextButton } from '../ui/widgets';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('home');
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, Math.max(80, height * 0.18), 'Stock Camp Simulator', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '48px',
        color: '#e8eefc'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, Math.max(130, height * 0.24), 'Offline • GM-led • Projector-friendly', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '18px',
        color: '#8ea3d8'
      })
      .setOrigin(0.5);

    new TextButton(this, width / 2, height * 0.48, {
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

    const onResize = () => this.scene.restart();
    this.scale.on('resize', onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', onResize);
    });
  }
}

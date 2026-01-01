import Phaser from 'phaser';
import { addPlayer, loadGame, removePlayer, saveGame } from '../state/store';
import { KeyboardTextInput, TextButton } from '../ui/widgets';

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super('lobby');
  }

  create() {
    const state = loadGame();
    if (!state) {
      this.scene.start('home');
      return;
    }

    const { width, height } = this.scale;

    this.add
      .text(40, 28, 'Lobby (GM)', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '30px',
        color: '#e8eefc'
      })
      .setOrigin(0, 0);

    this.add
      .text(40, 68, `Starting cash: ${state.startingCash} camp coins`, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '16px',
        color: '#8ea3d8'
      })
      .setOrigin(0, 0);

    const listTop = 110;
    const rowH = 34;

    this.add
      .text(40, listTop - 26, 'Players', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '18px',
        color: '#b9c7ee'
      })
      .setOrigin(0, 0);

    state.players.forEach((p, idx) => {
      const y = listTop + idx * rowH;
      this.add
        .text(40, y, `${idx + 1}. ${p.name}`, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '18px',
          color: '#e8eefc'
        })
        .setOrigin(0, 0);

      new TextButton(this, 362, y + 12, {
        width: 76,
        height: 24,
        label: 'Remove',
        onClick: () => {
          const next = removePlayer(state, p.id);
          saveGame(next);
          this.scene.restart();
        }
      });
    });

    new TextButton(this, width - 220, height - 160, {
      width: 360,
      height: 64,
      label: 'Add Player',
      onClick: () => {
        const input = new KeyboardTextInput(this, width / 2, height / 2, 'Player name');
        input.open((value) => {
          if (!value) return;
          const next = addPlayer(state, value);
          saveGame(next);
          this.scene.restart();
        });
      }
    });

    new TextButton(this, width - 220, height - 80, {
      width: 360,
      height: 64,
      label: state.players.length >= 2 ? 'Start Market' : 'Start Market (need 2+)',
      onClick: () => {
        if (state.players.length < 2) return;
        this.scene.start('market');
      }
    });

    new TextButton(this, width - 220, 60, {
      width: 360,
      height: 50,
      label: 'Back to Home',
      onClick: () => this.scene.start('home')
    });

    const onResize = () => this.scene.restart();
    this.scale.on('resize', onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', onResize);
    });
  }
}

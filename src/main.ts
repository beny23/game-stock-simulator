import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HomeScene } from './scenes/HomeScene';
import { LobbyScene } from './scenes/LobbyScene';
import { MarketScene } from './scenes/MarketScene';
import { ResultsScene } from './scenes/ResultsScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#0b1020',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, HomeScene, LobbyScene, MarketScene, ResultsScene]
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _keep = game;

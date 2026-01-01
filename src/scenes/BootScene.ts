import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    // No external assets: keep offline + simple.
    this.scene.start('home');
  }
}

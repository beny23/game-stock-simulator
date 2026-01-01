import Phaser from 'phaser';

export type ButtonOpts = {
  width: number;
  height: number;
  label: string;
  onClick: () => void;
};

export class TextButton extends Phaser.GameObjects.Container {
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: ButtonOpts) {
    super(scene, x, y);

    this.bg = scene.add
      .rectangle(0, 0, opts.width, opts.height, 0x1f2a44, 1)
      .setStrokeStyle(2, 0x334166, 1)
      .setOrigin(0.5);

    this.text = scene.add
      .text(0, 0, opts.label, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '20px',
        color: '#e8eefc'
      })
      .setOrigin(0.5);

    this.add([this.bg, this.text]);

    this.setSize(opts.width, opts.height);
    this.setInteractive(new Phaser.Geom.Rectangle(-opts.width / 2, -opts.height / 2, opts.width, opts.height), Phaser.Geom.Rectangle.Contains);

    this.on('pointerover', () => this.bg.setFillStyle(0x25335a, 1));
    this.on('pointerout', () => this.bg.setFillStyle(0x1f2a44, 1));
    this.on('pointerdown', () => this.bg.setFillStyle(0x2e3f70, 1));
    this.on('pointerup', () => {
      this.bg.setFillStyle(0x25335a, 1);
      opts.onClick();
    });

    scene.add.existing(this);
  }

  setLabel(label: string) {
    this.text.setText(label);
  }
}

export class Panel extends Phaser.GameObjects.Container {
  private readonly bg: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);

    this.bg = scene.add
      .rectangle(0, 0, width, height, 0x111a33, 0.85)
      .setStrokeStyle(2, 0x334166, 1)
      .setOrigin(0);

    this.add(this.bg);
    this.setSize(width, height);

    scene.add.existing(this);
  }
}

export class KeyboardTextInput extends Phaser.GameObjects.Container {
  private readonly label: Phaser.GameObjects.Text;
  private readonly valueText: Phaser.GameObjects.Text;
  private value = '';
  private done?: (value: string | undefined) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, prompt: string) {
    super(scene, x, y);

    const panel = scene.add.rectangle(0, 0, 520, 160, 0x0f1730, 1).setStrokeStyle(2, 0x334166, 1).setOrigin(0.5);
    this.label = scene.add
      .text(0, -50, prompt, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '20px',
        color: '#e8eefc'
      })
      .setOrigin(0.5);

    this.valueText = scene.add
      .text(0, 10, 'Type name…', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '26px',
        color: '#b9c7ee'
      })
      .setOrigin(0.5);

    const hint = scene.add
      .text(0, 55, 'Enter = OK   Esc = Cancel', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '16px',
        color: '#8ea3d8'
      })
      .setOrigin(0.5);

    this.add([panel, this.label, this.valueText, hint]);
    scene.add.existing(this);

    this.setDepth(1000);
  }

  open(onDone: (value: string | undefined) => void) {
    this.done = onDone;
    this.value = '';
    this.valueText.setText('');

    const handler = (event: KeyboardEvent) => {
      if (!this.scene) return;
      if (event.key === 'Escape') {
        cleanup();
        this.done?.(undefined);
        this.destroy();
        return;
      }
      if (event.key === 'Enter') {
        const v = this.value.trim();
        cleanup();
        this.done?.(v ? v : undefined);
        this.destroy();
        return;
      }
      if (event.key === 'Backspace') {
        this.value = this.value.slice(0, -1);
        this.valueText.setText(this.value || '');
        return;
      }
      if (event.key.length === 1) {
        if (this.value.length >= 16) return;
        // Basic whitelist: letters/numbers/space/hyphen
        if (!/[a-zA-Z0-9\-\s]/.test(event.key)) return;
        this.value += event.key;
        this.valueText.setText(this.value);
      }
    };

    const cleanup = () => {
      window.removeEventListener('keydown', handler);
    };

    window.addEventListener('keydown', handler);
  }
}

import Phaser from 'phaser';

export type ButtonOpts = {
  width: number;
  height: number;
  label: string;
  onClick: () => void;
  fontSize?: number;
  hitPadding?: number;
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
        fontSize: `${opts.fontSize ?? 20}px`,
        color: '#e8eefc'
      })
      .setOrigin(0.5);

    this.add([this.bg, this.text]);

    this.setSize(opts.width, opts.height);
    const pad = opts.hitPadding ?? 0;
    this.bg.setInteractive();
    // Expand hit target without changing visuals.
    if (pad > 0 && this.bg.input?.hitArea && this.bg.input.hitArea instanceof Phaser.Geom.Rectangle) {
      this.bg.input.hitArea.x -= pad;
      this.bg.input.hitArea.y -= pad;
      this.bg.input.hitArea.width += pad * 2;
      this.bg.input.hitArea.height += pad * 2;
    }
    if (this.bg.input) this.bg.input.cursor = 'pointer';

    this.bg.on('pointerover', () => this.bg.setFillStyle(0x25335a, 1));
    this.bg.on('pointerout', () => this.bg.setFillStyle(0x1f2a44, 1));
    this.bg.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event?: Event) => {
      event?.stopPropagation();
      this.bg.setFillStyle(0x2e3f70, 1);
      opts.onClick();
      this.bg.setFillStyle(0x25335a, 1);
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

export class KeyboardNumberInput extends Phaser.GameObjects.Container {
  private readonly label: Phaser.GameObjects.Text;
  private readonly valueText: Phaser.GameObjects.Text;
  private value = '';
  private done?: (value: number | undefined) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, prompt: string) {
    super(scene, x, y);

    const panel = scene.add
      .rectangle(0, 0, 520, 160, 0x0f1730, 1)
      .setStrokeStyle(2, 0x334166, 1)
      .setOrigin(0.5);

    this.label = scene.add
      .text(0, -50, prompt, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '20px',
        color: '#e8eefc'
      })
      .setOrigin(0.5);

    this.valueText = scene.add
      .text(0, 10, '', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '28px',
        color: '#b9c7ee'
      })
      .setOrigin(0.5);

    const hint = scene.add
      .text(0, 55, 'Digits only • Enter = OK • Esc = Cancel', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '16px',
        color: '#8ea3d8'
      })
      .setOrigin(0.5);

    this.add([panel, this.label, this.valueText, hint]);
    scene.add.existing(this);
    this.setDepth(1500);
  }

  open(onDone: (value: number | undefined) => void, initialValue?: number) {
    this.done = onDone;
    this.value = initialValue != null && Number.isFinite(initialValue) ? String(initialValue) : '';
    this.valueText.setText(this.value);

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cleanup();
        this.done?.(undefined);
        this.destroy();
        return;
      }
      if (event.key === 'Enter') {
        const n = this.value.trim() ? Number(this.value) : NaN;
        cleanup();
        this.done?.(Number.isFinite(n) ? n : undefined);
        this.destroy();
        return;
      }
      if (event.key === 'Backspace') {
        this.value = this.value.slice(0, -1);
        this.valueText.setText(this.value);
        return;
      }
      if (/^[0-9]$/.test(event.key)) {
        if (this.value.length >= 4) return;
        // Avoid leading zeros like 0002
        if (this.value === '0') this.value = '';
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

export type TradeConfirmDetails = {
  title: string;
  lines: string[];
  confirmLabel?: string;
  cancelLabel?: string;
};

export class TradeConfirmDialog extends Phaser.GameObjects.Container {
  private readonly bgBlock: Phaser.GameObjects.Rectangle;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly onConfirm: () => void;
  private readonly onCancel: () => void;
  private readonly keyHandler: (ev: KeyboardEvent) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    details: TradeConfirmDetails,
    handlers: { onConfirm: () => void; onCancel: () => void }
  ) {
    super(scene, x, y);

    this.onConfirm = handlers.onConfirm;
    this.onCancel = handlers.onCancel;

    const w = 620;
    const h = 280;

    // Fullscreen click-blocker
    this.bgBlock = scene.add
      .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.55)
      .setOrigin(0, 0)
      .setInteractive();

    this.panel = scene.add
      .rectangle(0, 0, w, h, 0x0f1730, 1)
      .setStrokeStyle(2, 0x334166, 1)
      .setOrigin(0.5);

    this.titleText = scene.add
      .text(0, -h / 2 + 26, details.title, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '22px',
        color: '#e8eefc'
      })
      .setOrigin(0.5, 0);

    this.bodyText = scene.add
      .text(-w / 2 + 26, -h / 2 + 70, details.lines.join('\n'), {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '16px',
        color: '#b9c7ee',
        wordWrap: { width: w - 52 }
      })
      .setOrigin(0, 0);

    const btnY = h / 2 - 44;
    const confirmW = 220;
    const cancelW = 180;
    const gap = 18;
    const confirmX = 80;
    const cancelX = confirmX - (confirmW / 2 + cancelW / 2 + gap);

    const confirmBtn = new TextButton(scene, confirmX, btnY, {
      width: confirmW,
      height: 48,
      label: details.confirmLabel ?? 'Confirm',
      onClick: () => {
        this.onConfirm();
        this.destroy();
      }
    });

    const cancelBtn = new TextButton(scene, cancelX, btnY, {
      width: cancelW,
      height: 48,
      label: details.cancelLabel ?? 'Cancel',
      onClick: () => {
        this.onCancel();
        this.destroy();
      }
    });

    this.add([this.bgBlock, this.panel, this.titleText, this.bodyText, cancelBtn, confirmBtn]);
    scene.add.existing(this);

    this.setDepth(2000);

    this.keyHandler = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        this.onCancel();
        this.destroy();
        return;
      }
      if (ev.key === 'Enter') {
        this.onConfirm();
        this.destroy();
      }
    };

    window.addEventListener('keydown', this.keyHandler);
  }

  override destroy(fromScene?: boolean): void {
    window.removeEventListener('keydown', this.keyHandler);
    super.destroy(fromScene);
  }
}

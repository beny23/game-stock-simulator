import Phaser from 'phaser';

type TickerSetEvent = {
  text: string;
};

export class MarketTickerScene extends Phaser.Scene {
  private bg?: Phaser.GameObjects.Rectangle;
  private textObj?: Phaser.GameObjects.Text;
  private tween?: Phaser.Tweens.Tween;
  private currentText = '';

  constructor() {
    super('marketTicker');
  }

  create() {
    const { width } = this.scale;
    const tickerH = 34;

    this.bg = this.add
      .rectangle(0, 0, width, tickerH, 0x0f1730, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1);

    this.textObj = this.add
      .text(width + 20, tickerH / 2, '', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '18px',
        color: '#e8eefc'
      })
      .setOrigin(0, 0.5);

    const applyText = (text: string) => {
      if (!text) return;
      if (text === this.currentText) return;
      this.currentText = text;
      this.textObj?.setText(this.currentText);
      this.textObj?.setX(this.scale.width + 20);
      this.ensureTween(true);
    };

    const applyLayout = () => {
      const w = this.scale.width;
      this.bg?.setSize(w, tickerH);

      // If we're off-screen due to a resize, nudge back into a reasonable range.
      if (this.textObj) {
        const minX = -this.textObj.width - 60;
        const maxX = w + 60;
        if (this.textObj.x < minX || this.textObj.x > maxX) this.textObj.setX(w + 20);
      }

      if (this.currentText) this.ensureTween();
    };

    this.scale.on('resize', applyLayout);

    const onSet = (payload: TickerSetEvent) => {
      if (!payload?.text) return;
      applyText(payload.text);
    };

    this.game.events.on('marketTicker:set', onSet);

    // Rehydrate from registry in case the first event fired before we subscribed.
    const initial = this.game.registry.get('marketTicker:text');
    if (typeof initial === 'string' && initial.trim()) {
      applyText(initial);
    } else {
      this.textObj.setText('');
    }

    // If we ever get woken/resumed, re-apply from registry.
    const onWake = () => {
      const t = this.game.registry.get('marketTicker:text');
      if (typeof t === 'string' && t.trim()) applyText(t);
    };
    this.events.on(Phaser.Scenes.Events.WAKE, onWake);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', applyLayout);
      this.game.events.off('marketTicker:set', onSet);
      this.events.off(Phaser.Scenes.Events.WAKE, onWake);
      this.tween?.stop();
      this.tween = undefined;
    });
  }

  private ensureTween(forceRestart = false) {
    const textObj = this.textObj;
    if (!textObj) return;

    if (this.tween && !forceRestart) return;

    if (this.tween) {
      this.tween.stop();
      this.tween = undefined;
    }

    const w = this.scale.width;
    const speedPxPerSec = 120;
    const travel = w + textObj.width + 60;
    const durationMs = Math.max(3000, (travel / speedPxPerSec) * 1000);

    this.tween = this.tweens.add({
      targets: textObj,
      x: -textObj.width - 40,
      duration: durationMs,
      repeat: -1,
      onRepeat: () => textObj.setX(this.scale.width + 20)
    });
  }
}

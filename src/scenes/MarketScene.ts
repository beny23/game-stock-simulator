import Phaser from 'phaser';
import { SECTORS } from '../state/content';
import {
  getEvents,
  getPlayer,
  loadGame,
  placeOrder,
  resolveNextRound,
  saveGame,
  setSelectedEvent,
  setTradingOpen,
  toggleSelectedEventAlt
} from '../state/store';
import { OrderSide } from '../state/types';
import { Panel, TextButton } from '../ui/widgets';

export class MarketScene extends Phaser.Scene {
  private selectedPlayerId?: string;
  private selectedTicker?: string;
  private selectedSide: OrderSide = 'BUY';
  private shareBuffer = '';

  constructor() {
    super('market');
  }

  create() {
    const state = loadGame();
    if (!state) {
      this.scene.start('home');
      return;
    }

    const { width, height } = this.scale;

    // Layout
    const leftW = Math.max(260, Math.floor(width * 0.22));
    const rightW = Math.max(340, Math.floor(width * 0.28));
    const centerW = width - leftW - rightW;

    const headerH = 70;

    this.add
      .text(24, 18, `Market (Round ${state.round})`, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '28px',
        color: '#e8eefc'
      })
      .setOrigin(0, 0);

    this.add
      .text(24, 48, state.tradingOpen ? 'Trading: OPEN' : 'Trading: CLOSED', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '16px',
        color: state.tradingOpen ? '#c7f9cc' : '#ffd6a5'
      })
      .setOrigin(0, 0);

    // Left panel: players
    const left = new Panel(this, 0, headerH, leftW, height - headerH);
    left.add(
      this.add
        .text(16, 12, 'Players', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '18px',
          color: '#b9c7ee'
        })
        .setOrigin(0, 0)
    );

    const playerStartY = 48;
    const playerRowH = 34;

    const selectedId = this.selectedPlayerId ?? state.players[0]?.id;
    this.selectedPlayerId = selectedId;

    state.players.forEach((p, idx) => {
      const y = playerStartY + idx * playerRowH;
      const isSel = p.id === selectedId;
      const row = this.add
        .text(16, y, p.name, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '18px',
          color: isSel ? '#ffffff' : '#d6e2ff'
        })
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

      row.on('pointerdown', () => {
        this.selectedPlayerId = p.id;
        this.scene.restart();
      });

      left.add(row);
    });

    // Center: stock board by sector
    const centerX = leftW;
    const center = new Panel(this, centerX, headerH, centerW, height - headerH);

    center.add(
      this.add
        .text(16, 12, 'Market Board', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '18px',
          color: '#b9c7ee'
        })
        .setOrigin(0, 0)
    );

    const boardX = 16;
    const boardY = 48;
    const colGap = 14;
    const colW = Math.floor((centerW - 32 - colGap * 4) / 5);

    const currentSelectedTicker = this.selectedTicker ?? state.stocks[0]?.ticker;
    this.selectedTicker = currentSelectedTicker;

    SECTORS.forEach((sector, colIdx) => {
      const x = boardX + colIdx * (colW + colGap);

      const hdr = this.add
        .text(x, boardY, sector.name, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '14px',
          color: '#8ea3d8',
          wordWrap: { width: colW }
        })
        .setOrigin(0, 0);
      center.add(hdr);

      const stocks = state.stocks.filter((s) => s.sector === sector.id);

      stocks.forEach((s, i) => {
        const tileY = boardY + 28 + i * 86;
        const isSel = s.ticker === currentSelectedTicker;

        const tile = this.add
          .rectangle(x, tileY, colW, 78, isSel ? 0x22305a : 0x162248, 1)
          .setOrigin(0, 0)
          .setStrokeStyle(2, isSel ? 0x6ea8fe : 0x334166, 1)
          .setInteractive({ useHandCursor: true });

        tile.on('pointerdown', () => {
          this.selectedTicker = s.ticker;
          this.scene.restart();
        });

        const label = this.add
          .text(x + 10, tileY + 8, `${s.ticker}  ${s.name}`, {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '14px',
            color: '#e8eefc',
            wordWrap: { width: colW - 20 }
          })
          .setOrigin(0, 0);

        const price = this.add
          .text(x + 10, tileY + 44, `${s.price}`, {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '26px',
            color: '#c7f9cc'
          })
          .setOrigin(0, 0);

        center.add(tile);
        center.add(label);
        center.add(price);
      });
    });

    // Right panel: GM controls
    const rightX = leftW + centerW;
    const right = new Panel(this, rightX, headerH, rightW, height - headerH);

    right.add(
      this.add
        .text(16, 12, 'GM Controls', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '18px',
          color: '#b9c7ee'
        })
        .setOrigin(0, 0)
    );

    // Selected player summary
    const player = selectedId ? getPlayer(state, selectedId) : undefined;
    const playerName = player?.name ?? '—';
    const cash = player?.cash ?? 0;
    right.add(
      this.add
        .text(16, 44, `Player: ${playerName}\nCash: ${cash}`, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '16px',
          color: '#e8eefc',
          lineSpacing: 6
        })
        .setOrigin(0, 0)
    );

    // Trading open/close
    new TextButton(this, rightX + rightW / 2, headerH + 130, {
      width: rightW - 40,
      height: 50,
      label: state.tradingOpen ? 'Close Trading' : 'Open Trading',
      onClick: () => {
        const next = setTradingOpen(state, !state.tradingOpen);
        saveGame(next);
        this.scene.restart();
      }
    });

    // Buy/sell toggle
    new TextButton(this, rightX + rightW / 2, headerH + 195, {
      width: (rightW - 52) / 2,
      height: 44,
      label: this.selectedSide === 'BUY' ? 'BUY ✓' : 'BUY',
      onClick: () => {
        this.selectedSide = 'BUY';
        this.scene.restart();
      }
    });
    new TextButton(this, rightX + rightW / 2 + (rightW - 52) / 2 + 12, headerH + 195, {
      width: (rightW - 52) / 2,
      height: 44,
      label: this.selectedSide === 'SELL' ? 'SELL ✓' : 'SELL',
      onClick: () => {
        this.selectedSide = 'SELL';
        this.scene.restart();
      }
    });

    // Shares input (keyboard)
    const sharesLabel = this.add
      .text(rightX + 16, headerH + 240, `Stock: ${this.selectedTicker ?? '—'}\nShares (type digits): ${this.shareBuffer || '—'}`, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '16px',
        color: '#e8eefc',
        lineSpacing: 6
      })
      .setOrigin(0, 0);
    right.add(sharesLabel);

    const errorText = this.add
      .text(rightX + 16, headerH + 298, '', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#ffadad'
      })
      .setOrigin(0, 0);
    right.add(errorText);

    new TextButton(this, rightX + rightW / 2, headerH + 330, {
      width: rightW - 40,
      height: 52,
      label: 'Place Trade (Enter)',
      onClick: () => {
        const shares = Number(this.shareBuffer);
        const pid = this.selectedPlayerId;
        const ticker = this.selectedTicker;
        if (!pid || !ticker) return;
        const { next, error } = placeOrder(state, pid, ticker, this.selectedSide, shares);
        if (error) {
          errorText.setText(error);
          return;
        }
        this.shareBuffer = '';
        saveGame(next);
        this.scene.restart();
      }
    });

    // Event picker
    const events = getEvents();
    right.add(
      this.add
        .text(16, headerH + 392, 'Event card (GM chooses):', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '16px',
          color: '#b9c7ee'
        })
        .setOrigin(0, 0)
    );

    const selectedEvent = state.selectedEventId ? events.find((e) => e.id === state.selectedEventId) : undefined;

    const eventTitle = this.add
      .text(rightX + 16, headerH + 420, selectedEvent ? selectedEvent.title : '—', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#e8eefc',
        wordWrap: { width: rightW - 32 }
      })
      .setOrigin(0, 0);

    const eventExpl = this.add
      .text(rightX + 16, headerH + 468, selectedEvent ? selectedEvent.explanation : '', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '12px',
        color: '#8ea3d8',
        wordWrap: { width: rightW - 32 }
      })
      .setOrigin(0, 0);

    right.add(eventTitle);
    right.add(eventExpl);

    // Quick cycle buttons (for MVP). Later we can add scroll/search.
    new TextButton(this, rightX + rightW / 2, headerH + 540, {
      width: (rightW - 52) / 2,
      height: 44,
      label: 'Prev',
      onClick: () => {
        const idx = Math.max(0, events.findIndex((e) => e.id === state.selectedEventId));
        const nextIdx = (idx - 1 + events.length) % events.length;
        const next = setSelectedEvent(state, events[nextIdx].id);
        saveGame(next);
        this.scene.restart();
      }
    });

    new TextButton(this, rightX + rightW / 2 + (rightW - 52) / 2 + 12, headerH + 540, {
      width: (rightW - 52) / 2,
      height: 44,
      label: 'Next',
      onClick: () => {
        const idx = Math.max(0, events.findIndex((e) => e.id === state.selectedEventId));
        const nextIdx = (idx + 1) % events.length;
        const next = setSelectedEvent(state, events[nextIdx].id);
        saveGame(next);
        this.scene.restart();
      }
    });

    if (selectedEvent?.impactPctAlt != null) {
      new TextButton(this, rightX + rightW / 2, headerH + 592, {
        width: rightW - 40,
        height: 44,
        label: state.selectedEventAlt ? 'Use Alt Impact ✓' : 'Use Alt Impact',
        onClick: () => {
          const next = toggleSelectedEventAlt(state);
          saveGame(next);
          this.scene.restart();
        }
      });
    }

    // Next round
    new TextButton(this, rightX + rightW / 2, height - 130, {
      width: rightW - 40,
      height: 56,
      label: 'Next Round (Resolve)',
      onClick: () => {
        const { next, error } = resolveNextRound(state);
        if (error) {
          errorText.setText(error);
          return;
        }
        saveGame(next);
        this.scene.restart();
      }
    });

    new TextButton(this, rightX + rightW / 2, height - 65, {
      width: rightW - 40,
      height: 52,
      label: 'End Game (Results)',
      onClick: () => {
        this.scene.start('results');
      }
    });

    // Keyboard shortcuts for faster GM entry
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter') {
        const shares = Number(this.shareBuffer);
        const pid = this.selectedPlayerId;
        const ticker = this.selectedTicker;
        if (!pid || !ticker) return;
        const { next, error } = placeOrder(state, pid, ticker, this.selectedSide, shares);
        if (error) {
          errorText.setText(error);
          return;
        }
        this.shareBuffer = '';
        saveGame(next);
        this.scene.restart();
        return;
      }
      if (ev.key === 'Backspace') {
        this.shareBuffer = this.shareBuffer.slice(0, -1);
        this.scene.restart();
        return;
      }
      if (/^[0-9]$/.test(ev.key)) {
        if (this.shareBuffer.length >= 4) return;
        this.shareBuffer += ev.key;
        this.scene.restart();
      }
    };

    this.input.keyboard?.on('keydown', onKeyDown);

    const onResize = () => this.scene.restart();
    this.scale.on('resize', onResize);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', onKeyDown);
      this.scale.off('resize', onResize);
    });

    // Back
    new TextButton(this, leftW + 120, 34, {
      width: 180,
      height: 40,
      label: 'Back to Lobby',
      onClick: () => this.scene.start('lobby')
    }).setScale(0.9);

  }
}

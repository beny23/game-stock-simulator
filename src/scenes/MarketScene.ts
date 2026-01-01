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
import { Panel, TextButton, TradeConfirmDialog } from '../ui/widgets';

export class MarketScene extends Phaser.Scene {
  private selectedPlayerId?: string;
  private selectedTicker?: string;
  private selectedSide: OrderSide = 'BUY';
  private eventScrollIndex = 0;
  private modalOpen = false;

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

    const rightInnerX = rightX + 20;
    const rightInnerW = rightW - 40;
    const rightGap = 12;
    const rightHalfW = (rightInnerW - rightGap) / 2;
    const rightCol1X = rightInnerX + rightHalfW / 2;
    const rightCol2X = rightInnerX + rightHalfW + rightGap + rightHalfW / 2;

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
      width: rightInnerW,
      height: 50,
      label: state.tradingOpen ? 'Close Trading' : 'Open Trading',
      onClick: () => {
        const next = setTradingOpen(state, !state.tradingOpen);
        saveGame(next);
        this.scene.restart();
      }
    });

    // Buy/sell toggle
    new TextButton(this, rightCol1X, headerH + 195, {
      width: rightHalfW,
      height: 44,
      label: this.selectedSide === 'BUY' ? 'BUY ✓' : 'BUY',
      onClick: () => {
        this.selectedSide = 'BUY';
        this.scene.restart();
      }
    });
    new TextButton(this, rightCol2X, headerH + 195, {
      width: rightHalfW,
      height: 44,
      label: this.selectedSide === 'SELL' ? 'SELL ✓' : 'SELL',
      onClick: () => {
        this.selectedSide = 'SELL';
        this.scene.restart();
      }
    });

    // Trade info
    const tradeInfo = this.add
      .text(16, 232, `Stock: ${this.selectedTicker ?? '—'}\nEach trade = 1 share`, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '16px',
        color: '#e8eefc',
        lineSpacing: 6
      })
      .setOrigin(0, 0);
    right.add(tradeInfo);

    const errorText = this.add
      .text(16, 282, '', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#ffadad'
      })
      .setOrigin(0, 0);
    right.add(errorText);

    const requestPlaceTrade = () => {
      if (this.modalOpen) return;
      const shares = 1;
      const pid = this.selectedPlayerId;
      const ticker = this.selectedTicker;
      if (!pid || !ticker) return;

      if (!state.tradingOpen) {
        errorText.setText('Trading is closed.');
        return;
      }

      const player = state.players.find((p) => p.id === pid);
      const stock = state.stocks.find((s) => s.ticker === ticker);
      if (!player || !stock) return;

      const cost = stock.price * shares;
      const owned = player.holdings[ticker] ?? 0;
      const action = this.selectedSide === 'BUY' ? 'Buy' : 'Sell';

      this.modalOpen = true;
      new TradeConfirmDialog(
        this,
        width / 2,
        height / 2,
        {
          title: 'Confirm Trade',
          lines: [
            `Player: ${player.name}`,
            `Action: ${action}`,
            `Stock: ${stock.ticker} (${stock.name})`,
            `Shares: 1`,
            `Price: ${stock.price} each`,
            this.selectedSide === 'BUY' ? `Total cost: ${cost}` : `Total received: ${cost}`,
            `Cash: ${player.cash}   Owned: ${owned}`
          ],
          confirmLabel: 'Confirm (Enter)',
          cancelLabel: 'Cancel (Esc)'
        },
        {
          onConfirm: () => {
            const { next, error } = placeOrder(state, pid, ticker, this.selectedSide, shares);
            if (error) {
              this.modalOpen = false;
              errorText.setText(error);
              return;
            }
            saveGame(next);
            this.modalOpen = false;
            this.scene.restart();
          },
          onCancel: () => {
            this.modalOpen = false;
          }
        }
      );
    };

    new TextButton(this, rightX + rightW / 2, headerH + 330, {
      width: rightInnerW,
      height: 52,
      label: 'Place Trade (Enter)',
      onClick: () => {
        requestPlaceTrade();
      }
    });

    // Event picker (scrollable list)
    const events = getEvents();
    right.add(
      this.add
        .text(16, headerH + 382, 'Event cards (GM chooses):', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '16px',
          color: '#b9c7ee'
        })
        .setOrigin(0, 0)
    );

    const selectedEventIndex = Math.max(0, events.findIndex((e) => e.id === state.selectedEventId));
    const selectedEvent = events[selectedEventIndex];

    // Keep selection visible
    const listRows = 7;
    if (selectedEventIndex < this.eventScrollIndex) this.eventScrollIndex = selectedEventIndex;
    if (selectedEventIndex >= this.eventScrollIndex + listRows) this.eventScrollIndex = selectedEventIndex - (listRows - 1);
    this.eventScrollIndex = Math.max(0, Math.min(this.eventScrollIndex, Math.max(0, events.length - listRows)));

    const listX = rightX + 16;
    const listY = headerH + 410;
    const listW = rightW - 32;
    const rowH = 28;

    const listBg = this.add
      .rectangle(listX, listY, listW, rowH * listRows + 10, 0x0f1730, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1);
    right.add(listBg);

    for (let r = 0; r < listRows; r++) {
      const idx = this.eventScrollIndex + r;
      if (idx >= events.length) break;
      const e = events[idx];
      const y = listY + 6 + r * rowH;
      const isSel = e.id === state.selectedEventId;

      const hit = this.add
        .rectangle(listX + 6, y, listW - 12, rowH - 2, isSel ? 0x22305a : 0x0f1730, 1)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        const next = setSelectedEvent(state, e.id);
        saveGame(next);
        this.scene.restart();
      });

      const label = this.add
        .text(listX + 12, y + 4, `${idx + 1}. ${e.title}`, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '12px',
          color: isSel ? '#ffffff' : '#d6e2ff',
          wordWrap: { width: listW - 28 }
        })
        .setOrigin(0, 0);

      right.add(hit);
      right.add(label);
    }

    const scrollUp = () => {
      this.eventScrollIndex = Math.max(0, this.eventScrollIndex - 1);
      this.scene.restart();
    };
    const scrollDown = () => {
      this.eventScrollIndex = Math.min(Math.max(0, events.length - listRows), this.eventScrollIndex + 1);
      this.scene.restart();
    };

    new TextButton(this, rightCol1X, headerH + 620, {
      width: rightHalfW,
      height: 44,
      label: 'Up',
      onClick: scrollUp
    });

    new TextButton(this, rightCol2X, headerH + 620, {
      width: rightHalfW,
      height: 44,
      label: 'Down',
      onClick: scrollDown
    });

    new TextButton(this, rightX + rightW / 2, headerH + 672, {
      width: rightW - 40,
      height: 44,
      label: 'Random Event',
      onClick: () => {
        const choice = events[Math.floor(Math.random() * events.length)];
        const next = setSelectedEvent(state, choice.id);
        saveGame(next);
        this.scene.restart();
      }
    });

    const detailsY = headerH + 720;
    const detailsTitle = this.add
      .text(rightX + 16, detailsY, selectedEvent ? selectedEvent.title : 'Pick an event', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#e8eefc',
        wordWrap: { width: rightW - 32 }
      })
      .setOrigin(0, 0);
    right.add(detailsTitle);

    const detailsExpl = this.add
      .text(rightX + 16, detailsY + 40, selectedEvent ? selectedEvent.explanation : '', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '12px',
        color: '#8ea3d8',
        wordWrap: { width: rightW - 32 }
      })
      .setOrigin(0, 0);
    right.add(detailsExpl);

    if (selectedEvent?.impactPctAlt != null) {
      new TextButton(this, rightX + rightW / 2, detailsY + 110, {
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
      if (this.modalOpen) return;
      if (ev.key === 'Enter') {
        requestPlaceTrade();
        return;
      }
    };

    this.input.keyboard?.on('keydown', onKeyDown);

    const onResize = () => this.scene.restart();
    this.scale.on('resize', onResize);

    const onWheel = (_pointer: Phaser.Input.Pointer, _over: any, _dx: number, dy: number) => {
      // Scroll event list with mouse wheel/trackpad.
      if (dy < 0) scrollUp();
      if (dy > 0) scrollDown();
    };
    this.input.on('wheel', onWheel);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', onKeyDown);
      this.scale.off('resize', onResize);
      this.input.off('wheel', onWheel);
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

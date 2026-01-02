import Phaser from 'phaser';
import { SECTORS } from '../state/content';
import {
  getPlayer,
  loadGame,
  MARKET_INDEX_KEY,
  placeOrder,
  resolveNextRound,
  saveGame,
  getEvents
} from '../state/store';
import { OrderSide } from '../state/types';
import { Panel, TextButton, TradeConfirmDialog } from '../ui/widgets';

export class MarketScene extends Phaser.Scene {
  private selectedPlayerId?: string;
  private selectedTicker?: string;
  private confirmOpen = false;
  private viewMode: 'overview' | 'player' = 'overview';
  private initMessage?: string;

  init(data: { message?: string } | undefined) {
    this.initMessage = data?.message;
  }

  constructor() {
    super('market');
  }

  create() {
    const state = loadGame();
    if (!state) {
      this.scene.start('home');
      return;
    }

    // reset modal flags each create (scene.restart reuses instance)
    this.confirmOpen = false;

    const { width, height } = this.scale;

    const events = getEvents();
    const lastEvent = state.lastEventId ? events.find((e) => e.id === state.lastEventId) : undefined;

    // Bottom row: console (left) + GM buttons (right)
    const bottomH = 110;
    const bottomY = height - bottomH;
    const gmW = 260;
    const consoleW = Math.max(320, width - gmW);
    const gmX = consoleW;
    const usableH = height - bottomH;
    const consoleBg = this.add
      .rectangle(0, bottomY, consoleW, bottomH, 0x0f1730, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1)
      .setDepth(50);

    const consoleText = this.add
      .text(16, bottomY + 10, '', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#e8eefc',
        wordWrap: { width: consoleW - 32 }
      })
      .setOrigin(0, 0)
      .setDepth(51);

    const gmPanelBg = this.add
      .rectangle(gmX, bottomY, width - gmX, bottomH, 0x111a33, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1)
      .setDepth(60);

    const makeId = () => `a_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
    const activityLog = [...(state.activityLog ?? [])];

    // Console scroll: 0 means show most recent entries.
    let consoleScroll = 0;
    const consoleLineH = 18;
    const consolePadY = 10;
    const maxVisibleRows = Math.max(1, Math.floor((bottomH - consolePadY * 2) / consoleLineH));

    const clampConsoleScroll = () => {
      const maxScroll = Math.max(0, activityLog.length - maxVisibleRows);
      consoleScroll = Math.max(0, Math.min(consoleScroll, maxScroll));
    };

    const renderConsole = () => {
      clampConsoleScroll();

      // Newest first.
      const ordered = activityLog
        .slice()
        .reverse()
        .map((e) => `R${e.round}  ${e.actor}: ${e.message}`);

      const visible = ordered.slice(consoleScroll, consoleScroll + maxVisibleRows);
      consoleText.setText(visible.join('\n'));
    };

    const recordActivity = (baseState: typeof state, actor: string, message: string, roundOverride?: number) => {
      // If the user is looking at the most recent messages, keep the console pinned to the top.
      const wasPinnedToTop = consoleScroll === 0;

      activityLog.push({
        id: makeId(),
        ts: Date.now(),
        round: roundOverride ?? baseState.round,
        actor,
        message
      });
      saveGame({ ...baseState, activityLog });

      if (wasPinnedToTop) consoleScroll = 0;
      renderConsole();
    };

    const showError = (actor: string, msg: string) => recordActivity(state, actor, `ERROR: ${msg}`, state.round);

    renderConsole();
    if (this.initMessage) recordActivity(state, 'GM', this.initMessage, state.round);

    // Scrollback controls: mouse wheel over console and PageUp/PageDown.
    const onWheel = (pointer: Phaser.Input.Pointer, _dx: number, dy: number) => {
      if (pointer.y < bottomY) return;
      const step = dy > 0 ? 1 : -1;
      consoleScroll += step;
      clampConsoleScroll();
      renderConsole();
    };
    this.input.on('wheel', onWheel);

    const onPageUp = () => {
      consoleScroll += Math.max(1, Math.floor(maxVisibleRows * 0.75));
      clampConsoleScroll();
      renderConsole();
    };
    const onPageDown = () => {
      consoleScroll -= Math.max(1, Math.floor(maxVisibleRows * 0.75));
      clampConsoleScroll();
      renderConsole();
    };

    this.input.keyboard?.on('keydown-PAGEUP', onPageUp);
    this.input.keyboard?.on('keydown-PAGEDOWN', onPageDown);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('wheel', onWheel);
      this.input.keyboard?.off('keydown-PAGEUP', onPageUp);
      this.input.keyboard?.off('keydown-PAGEDOWN', onPageDown);
    });

    // Layout
    const centerW = width;

    const headerH = 70;
    const tabStripH = 42;

    // Top ticker (Bloomberg-style)
    const tickerH = 26;
    this.add
      .rectangle(0, 0, width, tickerH, 0x0f1730, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1);

    const eventsById = new Map(events.map((e) => [e.id, e] as const));

    // Ticker shows UPCOMING headlines only (no explanations)
    const upcomingHeadlines = (state.upcomingNews ?? [])
      .map((n) => {
        const title = eventsById.get(n.eventId)?.title ?? '—';
        return `${n.sectorName}: ${title}`;
      })
      .filter((s) => s.trim() !== '');

    const newsStrip = upcomingHeadlines.length ? upcomingHeadlines.join('   •   ') : lastEvent?.title ?? 'No news yet';

    const tickerMsg = `BREAKING: ${newsStrip}   •   Round ${state.round}`;
    const tickerText = this.add
      .text(width + 20, tickerH / 2, tickerMsg, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#e8eefc'
      })
      .setOrigin(0, 0.5);

    const speedPxPerSec = 120;
    const travel = width + tickerText.width + 60;
    const durationMs = Math.max(3000, (travel / speedPxPerSec) * 1000);
    this.tweens.add({
      targets: tickerText,
      x: -tickerText.width - 40,
      duration: durationMs,
      repeat: -1,
      onRepeat: () => tickerText.setX(width + 20)
    });

    this.add
      .text(24, 30, `Market (Round ${state.round})`, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '28px',
        color: '#e8eefc'
      })
      .setOrigin(0, 0);

    // Tab state
    if (this.viewMode === 'player' && state.players.length === 0) {
      this.viewMode = 'overview';
      this.selectedPlayerId = undefined;
    }

    const selectedId = this.viewMode === 'player' ? (this.selectedPlayerId ?? state.players[0]?.id) : undefined;
    this.selectedPlayerId = selectedId;

    const requestTrade = (ticker: string, side: OrderSide, playerIdOverride?: string) => {
      if (this.confirmOpen) return;
      const shares = 1;
      const pid = playerIdOverride ?? this.selectedPlayerId;
      if (!pid) return;

      const player = state.players.find((p) => p.id === pid);
      const stock = state.stocks.find((s) => s.ticker === ticker);
      if (!player || !stock) return;

      const cost = stock.price * shares;
      const owned = player.holdings[ticker] ?? 0;
      const action = side === 'BUY' ? 'Buy' : 'Sell';

      this.selectedTicker = ticker;

      this.confirmOpen = true;
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
            side === 'BUY' ? `Total cost: ${cost}` : `Total received: ${cost}`,
            `Cash: ${player.cash}   Owned: ${owned}`
          ],
          confirmLabel: 'Confirm (Enter)',
          cancelLabel: 'Cancel (Esc)'
        },
        {
          onConfirm: () => {
            const { next, error } = placeOrder(state, pid, ticker, side, shares);
            if (error) {
              this.confirmOpen = false;
              showError(player.name, error);
              return;
            }
            recordActivity(next, player.name, `${action.toUpperCase()} 1 ${stock.ticker} @ ${stock.price}`, state.round);
            this.confirmOpen = false;
            this.scene.restart();
          },
          onCancel: () => {
            this.confirmOpen = false;
          }
        }
      );
    };

    // Browser-like tabs strip (Overview + each player)
    const tabStripBg = this.add
      .rectangle(0, headerH, centerW, tabStripH, 0x0f1730, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1)
      .setDepth(200);

    const tabs = [{ id: 'overview', label: 'Overview' }, ...state.players.map((p) => ({ id: p.id, label: p.name }))];
    const tabCount = tabs.length;
    const padX = 12;
    const availW = Math.max(1, centerW - padX * 2);
    const tabW = Math.max(110, Math.min(190, Math.floor(availW / tabCount)));
    const tabH = 30;
    const tabFont = tabW < 130 ? 12 : 14;

    const makeTab = (
      x: number,
      y: number,
      cellW: number,
      drawW: number,
      h: number,
      label: string,
      active: boolean,
      onClick: () => void
    ) => {
      const c = this.add.container(x, y).setDepth(201);

      const g = this.add.graphics();
      const fill = active ? 0x111a33 : 0x162248;
      const stroke = active ? 0x6ea8fe : 0x334166;
      g.fillStyle(fill, active ? 0.95 : 0.85);
      g.lineStyle(2, stroke, 1);
      g.fillRoundedRect(0, 0, drawW, h, 7);
      g.strokeRoundedRect(0, 0, drawW, h, 7);

      const t = this.add.text(drawW / 2, h / 2, label, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: `${tabFont}px`,
        color: active ? '#ffffff' : '#d6e2ff'
      });
      t.setOrigin(0.5);

      c.add([g, t]);
      // Make each tab's interactive area fill its entire "cell" so there are no gaps
      // and no overlapping hit targets between neighboring tabs.
      c.setSize(cellW, h);
      const hitPadY = 12;
      c.setInteractive(new Phaser.Geom.Rectangle(0, -hitPadY, cellW, h + hitPadY * 2), Phaser.Geom.Rectangle.Contains);
      if (c.input) c.input.cursor = 'pointer';

      c.on('pointerdown', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        onClick();
      });

      // Nudge active tab up a bit like a browser.
      if (active) c.y -= 2;
      return c;
    };

    const tabY = headerH + 6;
    tabs.forEach((tab, idx) => {
      const x = padX + idx * tabW;
      const isActive = tab.id === 'overview' ? this.viewMode === 'overview' : this.viewMode === 'player' && selectedId === tab.id;
      const label = tab.label.length > 14 && tabW < 150 ? `${tab.label.slice(0, 12)}…` : tab.label;
      makeTab(x, tabY, tabW, tabW - 6, tabH, label, isActive, () => {
        if (tab.id === 'overview') {
          this.viewMode = 'overview';
          this.selectedPlayerId = undefined;
        } else {
          this.viewMode = 'player';
          this.selectedPlayerId = tab.id;
        }
        this.scene.restart();
      });
    });

    const centerPanelH = usableH - (headerH + tabStripH);
    const contentMaxY = centerPanelH - 12;

    const drawSparkline = (x: number, y: number, w: number, h: number, values: number[]) => {
      const g = this.add.graphics().setDepth(10);
      g.setPosition(x, y);
      g.lineStyle(2, 0x8ea3d8, 1);
      if (!values.length) return g;

      const min = Math.min(...values);
      const max = Math.max(...values);
      const span = max - min || 1;

      for (let i = 0; i < values.length; i++) {
        const t = values.length === 1 ? 0 : i / (values.length - 1);
        const px = t * w;
        const py = h - ((values[i] - min) / span) * h;
        if (i === 0) g.beginPath().moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();
      return g;
    };

    // Center: overview (news + history)
    const centerX = 0;
    const center = new Panel(this, centerX, headerH + tabStripH, centerW, centerPanelH);

    const currentNews = (state.currentNews ?? []).map((n) => {
      const e = eventsById.get(n.eventId);
      return {
        sectorName: n.sectorName,
        title: e?.title ?? '—',
        explanation: e?.explanation ?? ''
      };
    });

    const makeBulletins = () => {
      const idxHistory = state.priceHistory?.[MARKET_INDEX_KEY] ?? [];
      const idxNow = idxHistory.length ? idxHistory[idxHistory.length - 1] : undefined;
      const idxPrev = idxHistory.length > 1 ? idxHistory[idxHistory.length - 2] : undefined;
      const idxDelta = idxNow != null && idxPrev != null ? idxNow - idxPrev : undefined;
      const idxDeltaStr = idxDelta == null ? '' : ` (${idxDelta >= 0 ? '+' : ''}${idxDelta})`;

      const movers = (() => {
        const items = state.stocks
          .map((s) => {
            const arr = state.priceHistory?.[s.ticker];
            const now = arr?.length ? arr[arr.length - 1] : s.price;
            const prev = arr && arr.length > 1 ? arr[arr.length - 2] : now;
            const delta = now - prev;
            const pct = prev ? delta / prev : 0;
            return { ticker: s.ticker, name: s.name, now, prev, delta, pct };
          })
          .filter((x) => Number.isFinite(x.delta));

        const winners = items
          .slice()
          .sort((a, b) => (b.pct - a.pct) || (b.delta - a.delta))
          .slice(0, 3);
        const losers = items
          .slice()
          .sort((a, b) => (a.pct - b.pct) || (a.delta - b.delta))
          .slice(0, 3);

        const fmt = (v: number) => `${v >= 0 ? '+' : ''}${Math.round(v)}`;
        const fmtPct = (p: number) => `${p >= 0 ? '+' : ''}${Math.round(p * 100)}%`;

        const winnersStr = winners.length
          ? winners.map((w) => `${w.ticker} ${fmt(w.delta)} (${fmtPct(w.pct)})`).join('  •  ')
          : '—';
        const losersStr = losers.length
          ? losers.map((l) => `${l.ticker} ${fmt(l.delta)} (${fmtPct(l.pct)})`).join('  •  ')
          : '—';

        return {
          kind: 'Movers',
          header: `Market Movers • Round ${state.round}`,
          body: `Winners: ${winnersStr}\nLosers: ${losersStr}`
        };
      })();

      const applied = (state.currentNews ?? []).map((n) => {
        const e = eventsById.get(n.eventId);
        return {
          kind: 'Current',
          header: `${n.sectorName} • ${e?.title ?? '—'}`,
          body: e?.explanation ?? ''
        };
      });

      const upcoming = (state.upcomingNews ?? []).map((n) => {
        const e = eventsById.get(n.eventId);
        return {
          kind: 'Upcoming',
          header: `UPCOMING • ${n.sectorName} • ${e?.title ?? '—'}`,
          body: 'This headline is expected to affect prices next round.'
        };
      });

      const summary = {
        kind: 'Summary',
        header: `Market Summary • Round ${state.round}`,
        body:
          'Tip: Buy before positive news applies. Sell before negative news applies. Diversify across sectors to reduce risk.'
      };

      const indexBulletin = {
        kind: 'Market',
        header: idxNow == null ? 'CAMP INDEX' : `CAMP INDEX • ${idxNow}${idxDeltaStr}`,
        body:
          idxNow == null
            ? 'A combined market index will appear once price history is available.'
            : 'The CAMP Index tracks the combined movement of all stocks.'
      };

      const all = [summary, movers, indexBulletin, ...applied, ...upcoming].filter((b) => b.header.trim() !== '');
      return all.length
        ? all
        : [
            {
              kind: 'Summary',
              header: 'Welcome to Market News',
              body: 'No news yet. Resolve a round to apply price changes and generate headlines.'
            }
          ];
    };

    const bulletins = makeBulletins();

    const buildTvBulletin = (x: number, y: number, w: number, h: number) => {
      const tvBg = this.add
        .rectangle(x, y, w, h, 0x0f1730, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x334166, 1);
      center.add(tvBg);

      // Presenter (simple animated silhouette)
      const presenterX = x + 16;
      const presenterY = y + 16;
      const presenterW = 220;
      const presenterH = h - 32;

      const presenterBg = this.add
        .rectangle(presenterX, presenterY, presenterW, presenterH, 0x111a33, 0.6)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x334166, 1);
      center.add(presenterBg);

      const g = this.add.graphics();
      center.add(g);
      g.setPosition(0, 0);

      const headCx = presenterX + presenterW / 2;
      // Keep the presenter fully inside the presenter panel.
      const headRadius = 24;
      const headCy = presenterY + 34;
      const bodyTop = headCy + headRadius + 12;
      const bodyBottom = presenterY + presenterH - 10;
      const bodyH = Math.max(56, bodyBottom - bodyTop);
      const bodyW = 116;
      const bodyX = headCx - bodyW / 2;
      const bodyY = bodyBottom - bodyH;

      const drawPresenter = (mouthOpen: boolean, blink: boolean) => {
        g.clear();

        // Head
        g.fillStyle(0x22305a, 1);
        g.fillCircle(headCx, headCy, headRadius);

        // Eyes (blink by shrinking to line)
        g.fillStyle(0x0f1730, 1);
        if (blink) {
          g.fillRect(headCx - 16, headCy - 4, 10, 2);
          g.fillRect(headCx + 6, headCy - 4, 10, 2);
        } else {
          g.fillRect(headCx - 16, headCy - 8, 10, 5);
          g.fillRect(headCx + 6, headCy - 8, 10, 5);
        }

        // Mouth
        g.fillStyle(0x0f1730, 1);
        g.fillRect(headCx - 12, headCy + 10, 24, mouthOpen ? 7 : 3);

        // Body + jacket
        g.fillStyle(0x162248, 1);
        g.fillRoundedRect(bodyX, bodyY, bodyW, bodyH, 10);

        // Tie
        g.fillStyle(0x334166, 1);
        const tieTop = bodyY + 18;
        g.fillTriangle(headCx, tieTop, headCx - 10, tieTop + 26, headCx + 10, tieTop + 26);
      };

      drawPresenter(false, false);

      // Bulletin text
      const textX = presenterX + presenterW + 16;
      const textW = x + w - 16 - textX;

      const lowerThirdH = 34;
      const lowerThird = this.add
        .rectangle(x, y + h - lowerThirdH, w, lowerThirdH, 0x162248, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x334166, 1);
      center.add(lowerThird);

      const lowerThirdText = this.add
        .text(x + 14, y + h - lowerThirdH + 8, 'BULLETIN', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '14px',
          color: '#ffd6a5'
        })
        .setOrigin(0, 0);
      center.add(lowerThirdText);

      const titleText = this.add
        .text(textX, y + 18, '', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '18px',
          color: '#e8eefc',
          wordWrap: { width: textW }
        })
        .setOrigin(0, 0);
      center.add(titleText);

      const bodyText = this.add
        .text(textX, y + 52, '', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '14px',
          color: '#b9c7ee',
          lineSpacing: 6,
          wordWrap: { width: textW }
        })
        .setOrigin(0, 0);
      center.add(bodyText);

      let idx = 0;
      const apply = (i: number) => {
        const b = bulletins[i % bulletins.length];
        lowerThirdText.setText(`${b.kind.toUpperCase()} • Round ${state.round}`);
        titleText.setText(b.header);
        bodyText.setText(b.body);
      };
      apply(idx);

      // Fade transition between bulletins
      const transitionToNext = () => {
        const targets = [titleText, bodyText];
        this.tweens.add({
          targets,
          alpha: 0,
          duration: 250,
          onComplete: () => {
            idx = (idx + 1) % bulletins.length;
            apply(idx);
            this.tweens.add({ targets, alpha: 1, duration: 250 });
          }
        });
      };

      // Presenter speaking animation
      const speakTimer = this.time.addEvent({
        delay: 180,
        loop: true,
        callback: () => {
          // small chance to blink
          const blink = Math.random() < 0.06;
          const mouthOpen = Math.random() < 0.55;
          drawPresenter(mouthOpen, blink);
        }
      });

      const bulletinTimer = this.time.addEvent({ delay: 5200, loop: true, callback: transitionToNext });

      // Ensure timers stop if scene shuts down
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        speakTimer.remove(false);
        bulletinTimer.remove(false);
      });
    };

    if (this.viewMode === 'overview') {
      center.add(
        this.add
          .text(16, 12, 'Current News', {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '18px',
            color: '#b9c7ee'
          })
          .setOrigin(0, 0)
      );

      buildTvBulletin(16, 40, centerW - 32, 150);
    } else {
      // Player tab: embedded market board only (no news clutter here).
      const p = selectedId ? getPlayer(state, selectedId) : undefined;
      if (p) {
        const boardTopY = 14;
        const title = this.add
          .text(16, boardTopY, `${p.name} — Cash: ${p.cash}`, {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '18px',
            color: '#b9c7ee'
          })
          .setOrigin(0, 0);
        center.add(title);

        const innerX = 16;
        const innerY = boardTopY + 34;
        const innerW = centerW - 32;
        const availableH = Math.max(220, contentMaxY - innerY);
        const historyPanelH = Math.min(160, Math.max(110, Math.floor(availableH * 0.32)));
        const historyGap = 12;
        const innerH = Math.max(200, availableH - historyPanelH - historyGap);

        const colGap = 12;
        const colW = Math.floor((innerW - colGap * 4) / 5);
        const tileH = 64;
        const tileGapY = 8;

        SECTORS.forEach((sector, colIdx) => {
          const x = innerX + colIdx * (colW + colGap);
          const hdr = this.add
            .text(x, innerY, sector.name, {
              fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
              fontSize: '13px',
              color: '#8ea3d8',
              wordWrap: { width: colW }
            })
            .setOrigin(0, 0);
          center.add(hdr);

          const stocks = state.stocks.filter((s) => s.sector === sector.id);
          stocks.forEach((s, i) => {
            const tileY = innerY + 22 + i * (tileH + tileGapY);
            if (tileY + tileH > innerY + innerH) return;

            const owned = p.holdings[s.ticker] ?? 0;

            const tile = this.add
              .rectangle(x, tileY, colW, tileH, 0x162248, 1)
              .setOrigin(0, 0)
              .setStrokeStyle(2, 0x334166, 1);
            center.add(tile);

            const label = this.add
              .text(x + 10, tileY + 6, `${s.ticker}  ${s.name}`, {
                fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
                fontSize: '12px',
                color: '#e8eefc',
                wordWrap: { width: colW - 52 }
              })
              .setOrigin(0, 0);
            center.add(label);

            const price = this.add
              .text(x + 10, tileY + 34, `${s.price}`, {
                fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
                fontSize: '20px',
                color: '#c7f9cc'
              })
              .setOrigin(0, 0);
            center.add(price);

            const ownedText = this.add
              .text(0, tileY + 38, `x${owned}`, {
                fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
                fontSize: '13px',
                color: '#ffd6a5'
              })
              .setOrigin(1, 0);
            center.add(ownedText);

            const btnX = x + colW - 18;
            // Keep the label right-aligned, but ensure it doesn't sit under the +/- buttons.
            // Buttons are 30px wide and centered at btnX, so their left edge is ~btnX-15.
            ownedText.setX(btnX - 22);
            const buyBtn = new TextButton(this, btnX, tileY + 20, {
              width: 30,
              height: 24,
              label: '+',
              fontSize: 16,
              hitPadding: 10,
              onClick: () => requestTrade(s.ticker, 'BUY', p.id)
            });
            const sellBtn = new TextButton(this, btnX, tileY + 46, {
              width: 30,
              height: 24,
              label: '-',
              fontSize: 16,
              hitPadding: 10,
              onClick: () => requestTrade(s.ticker, 'SELL', p.id)
            });
            center.add(buyBtn);
            center.add(sellBtn);
          });
        });

        // Bottom panels: Recent Trades (left) + Net Worth tracker (right)
        const bottomX = innerX;
        const bottomY = innerY + innerH + historyGap;
        const bottomW = innerW;
        const bottomH = historyPanelH;
        const bottomGapX = 12;

        const tradesW = Math.min(
          Math.max(260, Math.floor(bottomW * 0.42)),
          Math.max(260, bottomW - 260 - bottomGapX)
        );
        const worthW = Math.max(260, bottomW - tradesW - bottomGapX);

        const tradesX = bottomX;
        const worthX = bottomX + tradesW + bottomGapX;

        // Recent trade history (inside player tab)
        const tradesBg = this.add
          .rectangle(tradesX, bottomY, tradesW, bottomH, 0x0f1730, 0.75)
          .setOrigin(0, 0)
          .setStrokeStyle(2, 0x334166, 1);
        center.add(tradesBg);

        const tradesTitle = this.add
          .text(tradesX + 12, bottomY + 10, 'Recent Trades', {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '14px',
            color: '#ffd6a5'
          })
          .setOrigin(0, 0);
        center.add(tradesTitle);

        const recent = (state.tradeHistory ?? [])
          .filter((t) => t.playerId === p.id)
          .slice(-8)
          .reverse()
          .map((t) => `R${t.round}  ${t.side}  ${t.ticker}  x${t.shares}  @ ${t.price}`);

        const tradesBody = this.add
          .text(tradesX + 12, bottomY + 34, recent.length ? recent.join('\n') : '—', {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '13px',
            color: '#e8eefc',
            lineSpacing: 5,
            wordWrap: { width: tradesW - 24 }
          })
          .setOrigin(0, 0);
        center.add(tradesBody);

        // Net worth tracker
        const worthBg = this.add
          .rectangle(worthX, bottomY, worthW, bottomH, 0x0f1730, 0.75)
          .setOrigin(0, 0)
          .setStrokeStyle(2, 0x334166, 1);
        center.add(worthBg);

        const worthTitle = this.add
          .text(worthX + 12, bottomY + 10, 'Net Worth', {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '14px',
            color: '#ffd6a5'
          })
          .setOrigin(0, 0);
        center.add(worthTitle);

        const priceAtRound = (ticker: string, round: number): number => {
          const arr = state.priceHistory?.[ticker];
          if (!arr?.length) {
            return state.stocks.find((s) => s.ticker === ticker)?.price ?? 0;
          }
          const idx = Math.max(0, Math.min(arr.length - 1, arr.length - 1 - (state.round - round)));
          return arr[idx] ?? 0;
        };

        const playerTrades = (state.tradeHistory ?? [])
          .filter((t) => t.playerId === p.id)
          .slice()
          .sort((a, b) => (a.round - b.round) || (a.ts - b.ts));

        const maxRounds = 24;
        const startRound = Math.max(1, state.round - maxRounds + 1);

        let cash = state.startingCash;
        const holdings: Record<string, number> = {};
        let tradeIdx = 0;

        const cashSeries: number[] = [];
        const holdingsSeries: number[] = [];
        const totalSeries: number[] = [];

        for (let r = 1; r <= state.round; r++) {
          while (tradeIdx < playerTrades.length && playerTrades[tradeIdx].round === r) {
            const t = playerTrades[tradeIdx];
            const amt = t.price * t.shares;
            if (t.side === 'BUY') {
              cash -= amt;
              holdings[t.ticker] = (holdings[t.ticker] ?? 0) + t.shares;
            } else {
              cash += amt;
              const nextShares = (holdings[t.ticker] ?? 0) - t.shares;
              if (nextShares <= 0) delete holdings[t.ticker];
              else holdings[t.ticker] = nextShares;
            }
            tradeIdx++;
          }

          if (r < startRound) continue;

          let holdingsValue = 0;
          for (const [ticker, shares] of Object.entries(holdings)) {
            holdingsValue += priceAtRound(ticker, r) * shares;
          }

          const cashNow = Math.round(cash);
          const holdingsNow = Math.round(holdingsValue);
          cashSeries.push(cashNow);
          holdingsSeries.push(holdingsNow);
          totalSeries.push(cashNow + holdingsNow);
        }

        const cashNow = cashSeries.length ? cashSeries[cashSeries.length - 1] : p.cash;
        const stocksNow = holdingsSeries.length ? holdingsSeries[holdingsSeries.length - 1] : 0;
        const worthNow = totalSeries.length ? totalSeries[totalSeries.length - 1] : p.cash;

        const rightEdgeX = worthX + worthW - 12;
        const headerY = bottomY + 10;
        const headerGap = 14;

        const worthNowText = this.add
          .text(rightEdgeX, headerY, `Total: ${worthNow}`, {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '14px',
            color: '#e8eefc'
          })
          .setOrigin(1, 0);
        center.add(worthNowText);

        const stocksNowText = this.add
          .text(0, headerY, `Stocks: ${stocksNow}`, {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '14px',
            color: '#b9c7ee'
          })
          .setOrigin(1, 0);
        stocksNowText.setX(worthNowText.x - worthNowText.width - headerGap);
        center.add(stocksNowText);

        const cashNowText = this.add
          .text(0, headerY, `Cash: ${cashNow}`, {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '14px',
            color: '#b9c7ee'
          })
          .setOrigin(1, 0);
        cashNowText.setX(stocksNowText.x - stocksNowText.width - headerGap);
        center.add(cashNowText);

        const worthGraphX = worthX + 12;
        const worthGraphY = bottomY + 34;
        const worthGraphW = worthW - 24;
        const worthGraphH = Math.max(40, bottomH - 46);

        const worthGraphBorder = this.add
          .rectangle(worthGraphX, worthGraphY, worthGraphW, worthGraphH, 0x111a33, 0.35)
          .setOrigin(0, 0)
          .setStrokeStyle(2, 0x334166, 1);
        center.add(worthGraphBorder);

        const worthGraph = this.add.graphics().setDepth(10);
        worthGraph.setPosition(worthGraphX + 10, worthGraphY + 10);
        center.add(worthGraph);

        const drawWorthGraph = (series: Array<{ color: number; values: number[]; width: number }>, w: number, h: number) => {
          worthGraph.clear();
          const nonEmpty = series.filter((s) => s.values.length);
          if (!nonEmpty.length) return;

          const all = nonEmpty.flatMap((s) => s.values);
          const min = Math.min(...all);
          const max = Math.max(...all);
          const span = max - min || 1;

          nonEmpty.forEach((s) => {
            const values = s.values;
            worthGraph.lineStyle(s.width, s.color, 1);
            for (let i = 0; i < values.length; i++) {
              const t = values.length === 1 ? 0 : i / (values.length - 1);
              const px = t * w;
              const py = h - ((values[i] - min) / span) * h;
              if (i === 0) worthGraph.beginPath().moveTo(px, py);
              else worthGraph.lineTo(px, py);
            }
            worthGraph.strokePath();
          });
        };

        drawWorthGraph(
          [
            { color: 0x6ea8fe, values: cashSeries, width: 2 },
            { color: 0xc7f9cc, values: holdingsSeries, width: 2 },
            { color: 0xffd6a5, values: totalSeries, width: 3 }
          ],
          Math.max(10, worthGraphW - 20),
          Math.max(10, worthGraphH - 20)
        );
      }
    }

    if (this.viewMode === 'overview') {
      // Market spotlight loop (index + sectors)
      const spotlightX = 16;
      const spotlightY = 202;
      const spotlightW = centerW - 32;
      const spotlightH = Math.max(160, centerPanelH - spotlightY - 18);

      const history = state.priceHistory ?? {};

      const spotBg = this.add
        .rectangle(spotlightX, spotlightY, spotlightW, spotlightH, 0x0f1730, 0.75)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x334166, 1);
      center.add(spotBg);

      const spotTitle = this.add
        .text(spotlightX + 12, spotlightY + 10, 'Market Spotlight', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '16px',
          color: '#b9c7ee'
        })
        .setOrigin(0, 0);
      center.add(spotTitle);

      const sectorNameText = this.add
        .text(spotlightX + 12, spotlightY + 34, '', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '20px',
          color: '#e8eefc'
        })
        .setOrigin(0, 0);
      center.add(sectorNameText);

      const listText = this.add
        .text(spotlightX + 12, spotlightY + 64, '', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '13px',
          color: '#8ea3d8',
          lineSpacing: 5,
          wordWrap: { width: 240 }
        })
        .setOrigin(0, 0);
      // We keep a container for per-line colored tickers; the placeholder text
      // object above is replaced below.
      listText.destroy();

      const listContainer = this.add.container(spotlightX + 12, spotlightY + 64);
      center.add(listContainer);

      const graphTitle = this.add
        .text(spotlightX + 270, spotlightY + 64, '', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '14px',
          color: '#ffd6a5'
        })
        .setOrigin(0, 0);
      center.add(graphTitle);

      const graphX = spotlightX + 270;
      const graphY = spotlightY + 90;
      const graphW = spotlightW - 282;
      const graphH = Math.max(70, spotlightH - 110);

      const graphBorder = this.add
        .rectangle(graphX, graphY, graphW, graphH, 0x111a33, 0.35)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x334166, 1);
      center.add(graphBorder);

      const graph = this.add.graphics().setDepth(10);
      graph.setPosition(graphX + 10, graphY + 10);
      center.add(graph);

      const lineColors = [0x6ea8fe, 0xc7f9cc, 0xffd6a5, 0x8ea3d8, 0xb9c7ee];

      const drawGraph = (series: Array<{ label: string; values: number[] }>, w: number, h: number) => {
        graph.clear();
        const nonEmpty = series.filter((s) => s.values.length);
        if (!nonEmpty.length) return;

        const all = nonEmpty.flatMap((s) => s.values);
        const min = Math.min(...all);
        const max = Math.max(...all);
        const span = max - min || 1;

        nonEmpty.forEach((s, idx) => {
          const values = s.values;
          const color = lineColors[idx % lineColors.length];
          graph.lineStyle(idx === 0 ? 3 : 2, color, 1);
          for (let i = 0; i < values.length; i++) {
            const t = values.length === 1 ? 0 : i / (values.length - 1);
            const px = t * w;
            const py = h - ((values[i] - min) / span) * h;
            if (i === 0) graph.beginPath().moveTo(px, py);
            else graph.lineTo(px, py);
          }
          graph.strokePath();
        });
      };

      const spotlightItems = [{ kind: 'index' as const }, ...SECTORS.map((s) => ({ kind: 'sector' as const, sectorId: s.id }))];

      let spotlightIdx = 0;
      const applySpotlight = (idx: number) => {
        const item = spotlightItems[idx % spotlightItems.length];

        listContainer.removeAll(true);

        if (item.kind === 'index') {
          const idxSeries = (history[MARKET_INDEX_KEY] ?? []).slice(-40);
          const idxNow = idxSeries.length ? idxSeries[idxSeries.length - 1] : undefined;
          const idxPrev = idxSeries.length > 1 ? idxSeries[idxSeries.length - 2] : undefined;
          const idxDelta = idxNow != null && idxPrev != null ? idxNow - idxPrev : undefined;
          const deltaStr = idxDelta == null ? '' : ` (${idxDelta >= 0 ? '+' : ''}${idxDelta})`;

          sectorNameText.setText('CAMP Index');
          const idxLine = this.add
            .text(0, 0, idxNow == null ? '—' : `Index: ${idxNow}${deltaStr}`, {
              fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
              fontSize: '13px',
              color: '#8ea3d8'
            })
            .setOrigin(0, 0);
          listContainer.add(idxLine);
          graphTitle.setText('Graph: CAMP Index (last 40)');

          drawGraph(
            [{ label: 'INDEX', values: idxSeries.length ? idxSeries : [idxNow ?? 0] }],
            Math.max(10, graphW - 20),
            Math.max(10, graphH - 20)
          );
          return;
        }

        const sector = SECTORS.find((s) => s.id === item.sectorId) ?? SECTORS[0];
        const stocks = state.stocks.filter((s) => s.sector === sector.id);
        sectorNameText.setText(sector.name);

        const shown = stocks.slice(0, 5);
        if (!shown.length) {
          const empty = this.add
            .text(0, 0, '—', {
              fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
              fontSize: '13px',
              color: '#8ea3d8'
            })
            .setOrigin(0, 0);
          listContainer.add(empty);
        } else {
          const lineH = 18;
          shown.forEach((s, i) => {
            const y = i * lineH;
            const color = lineColors[i % lineColors.length];

            const tickerText = this.add
              .text(0, y, s.ticker, {
                fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
                fontSize: '13px',
                color: `#${color.toString(16).padStart(6, '0')}`
              })
              .setOrigin(0, 0);
            listContainer.add(tickerText);

            const priceText = this.add
              .text(tickerText.width + 10, y, `${s.price}`, {
                fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
                fontSize: '13px',
                color: '#8ea3d8'
              })
              .setOrigin(0, 0);
            listContainer.add(priceText);
          });
        }

        if (!stocks.length) {
          graphTitle.setText('');
          graph.clear();
          return;
        }

        graphTitle.setText(`Graph: ${sector.name} (all stocks • last 40)`);
        const series = stocks.map((st) => ({
          label: st.ticker,
          values: (history[st.ticker] ?? [st.price]).slice(-40)
        }));
        drawGraph(series, Math.max(10, graphW - 20), Math.max(10, graphH - 20));
      };

      applySpotlight(spotlightIdx);

      const fadeTargets = [sectorNameText, listContainer, graphTitle];
      const transitionToNextSpotlight = () => {
        this.tweens.add({
          targets: [...fadeTargets, graph],
          alpha: 0,
          duration: 220,
          onComplete: () => {
            spotlightIdx = (spotlightIdx + 1) % spotlightItems.length;
            applySpotlight(spotlightIdx);
            this.tweens.add({ targets: [...fadeTargets, graph], alpha: 1, duration: 220 });
          }
        });
      };

      const sectorTimer = this.time.addEvent({ delay: 5000, loop: true, callback: transitionToNextSpotlight });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => sectorTimer.remove(false));
    }

    // GM buttons live bottom-right next to the console.
    this.add
      .text(gmX + 14, bottomY + 10, 'GM', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#b9c7ee'
      })
      .setOrigin(0, 0)
      .setDepth(61);

    new TextButton(this, gmX + (width - gmX) / 2, bottomY + 44, {
      width: Math.max(160, width - gmX - 28),
      height: 34,
      label: 'Next Round (Resolve)',
      fontSize: 14,
      hitPadding: 6,
      onClick: () => {
        const { next, error } = resolveNextRound(state);
        if (error) {
          showError('GM', error);
          return;
        }
        const applied = (next.currentNews ?? next.lastRoundNews ?? [])
          .map((n) => {
            const title = eventsById.get(n.eventId)?.title ?? '—';
            return `${n.sectorName}: ${title}`;
          })
          .join(' | ');

        recordActivity(next, 'GM', `Resolved round • Applied: ${applied}`, state.round);

        // After resolving, return to the Overview screen.
        this.viewMode = 'overview';
        this.selectedPlayerId = undefined;
        this.scene.restart();
      }
    }).setDepth(61);

    new TextButton(this, gmX + (width - gmX) / 2, bottomY + 84, {
      width: Math.max(160, width - gmX - 28),
      height: 34,
      label: 'End Game (Results)',
      fontSize: 14,
      hitPadding: 6,
      onClick: () => {
        recordActivity(state, 'GM', 'Ended game (results)', state.round);
        this.scene.start('results');
      }
    }).setDepth(61);

    // Back
    new TextButton(this, width - 110, 34, {
      width: 180,
      height: 40,
      label: 'Back to Lobby',
      onClick: () => this.scene.start('lobby')
    }).setScale(0.9);

  }
}

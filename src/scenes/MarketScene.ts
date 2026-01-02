import Phaser from 'phaser';
import { SECTORS } from '../state/content';
import {
  getPlayer,
  loadGame,
  placeOrder,
  portfolioValue,
  resolveNextRound,
  saveGame,
  setTradingOpen,
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

    // Bottom console
    const consoleH = 110;
    const consoleY = height - consoleH;
    const consoleBg = this.add
      .rectangle(0, consoleY, width, consoleH, 0x0f1730, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334166, 1)
      .setDepth(50);

    const consoleText = this.add
      .text(16, consoleY + 10, '', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#e8eefc',
        wordWrap: { width: width - 32 }
      })
      .setOrigin(0, 0)
      .setDepth(51);

    const makeId = () => `a_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
    const activityLog = [...(state.activityLog ?? [])];

    const renderConsole = () => {
      const tail = activityLog.slice(-6);
      consoleText.setText(
        tail
          .map((e) => `R${e.round}  ${e.actor}: ${e.message}`)
          .join('\n')
      );
    };

    const recordActivity = (baseState: typeof state, actor: string, message: string, roundOverride?: number) => {
      activityLog.push({
        id: makeId(),
        ts: Date.now(),
        round: roundOverride ?? baseState.round,
        actor,
        message
      });
      saveGame({ ...baseState, activityLog });
      renderConsole();
    };

    const showError = (actor: string, msg: string) => recordActivity(state, actor, `ERROR: ${msg}`, state.round);

    renderConsole();
    if (this.initMessage) recordActivity(state, 'GM', this.initMessage, state.round);

    // Layout
    const rightW = Math.max(260, Math.floor(width * 0.2));
    const centerW = width - rightW;

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

    const tickerMsg = `BREAKING: ${newsStrip}   •   Round ${state.round}   •   Trading: ${state.tradingOpen ? 'OPEN' : 'CLOSED'}`;
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

    this.add
      .text(24, 58, state.tradingOpen ? 'Trading: OPEN' : 'Trading: CLOSED', {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '16px',
        color: state.tradingOpen ? '#c7f9cc' : '#ffd6a5'
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

      if (!state.tradingOpen) {
        showError('GM', 'Trading is closed.');
        return;
      }

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

    const centerPanelH = height - (headerH + tabStripH);
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
        header: `Market Summary • Round ${state.round} • Trading: ${state.tradingOpen ? 'OPEN' : 'CLOSED'}`,
        body:
          'Tip: Buy before positive news applies. Sell before negative news applies. Diversify across sectors to reduce risk.'
      };

      const all = [summary, ...applied, ...upcoming].filter((b) => b.header.trim() !== '');
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
        const innerH = Math.max(200, contentMaxY - innerY);

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
              .text(x + colW - 46, tileY + 38, `x${owned}`, {
                fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
                fontSize: '13px',
                color: '#ffd6a5'
              })
              .setOrigin(0, 0);
            center.add(ownedText);

            const btnX = x + colW - 18;
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
      }
    }

    if (this.viewMode === 'overview') {
      // Sector spotlight loop (replaces the old ticker history list)
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
        .text(spotlightX + 12, spotlightY + 10, 'Sector Spotlight', {
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
      center.add(listText);

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

      let sectorIdx = 0;
      const applySector = (idx: number) => {
        const sector = SECTORS[idx % SECTORS.length];
        const stocks = state.stocks.filter((s) => s.sector === sector.id);
        sectorNameText.setText(sector.name);

        const lines = stocks
          .slice(0, 5)
          .map((s) => `${s.ticker}  ${s.price}`);
        listText.setText(lines.length ? lines.join('\n') : '—');

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

      applySector(sectorIdx);

      const fadeTargets = [sectorNameText, listText, graphTitle];
      const transitionToNextSector = () => {
        this.tweens.add({
          targets: [...fadeTargets, graph],
          alpha: 0,
          duration: 220,
          onComplete: () => {
            sectorIdx = (sectorIdx + 1) % SECTORS.length;
            applySector(sectorIdx);
            this.tweens.add({ targets: [...fadeTargets, graph], alpha: 1, duration: 220 });
          }
        });
      };

      const sectorTimer = this.time.addEvent({ delay: 5000, loop: true, callback: transitionToNextSector });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => sectorTimer.remove(false));
    } else {
      center.add(
        this.add
          .text(16, 168, 'Click a player to trade', {
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
            fontSize: '16px',
            color: '#8ea3d8'
          })
          .setOrigin(0, 0)
      );
    }

    // Right panel: GM controls
    const rightX = centerW;
    const right = new Panel(this, rightX, headerH, rightW, height - headerH);

    const rightInnerX = rightX + 20;
    const rightInnerW = rightW - 40;
    const rightGap = 10;
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
        .text(16, 44, this.viewMode === 'overview' ? `View: Overview` : `Player: ${playerName}\nCash: ${cash}`, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '16px',
          color: '#e8eefc',
          lineSpacing: 6
        })
        .setOrigin(0, 0)
    );

    const openPortfolioHistory = () => {
      if (this.confirmOpen) return;
      if (!player) return;

      this.confirmOpen = true;

      const blocker = this.add
        .rectangle(0, 0, width, height, 0x000000, 0.55)
        .setOrigin(0, 0)
        .setInteractive();

      const panelW = Math.min(760, width - 80);
      const panelH = Math.min(520, height - 80);
      const panelX = width / 2;
      const panelY = height / 2;

      const panelBg = this.add
        .rectangle(panelX, panelY, panelW, panelH, 0x0f1730, 1)
        .setStrokeStyle(2, 0x334166, 1)
        .setOrigin(0.5);

      const title = this.add
        .text(panelX - panelW / 2 + 18, panelY - panelH / 2 + 16, `${player.name} — Portfolio & History`, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '20px',
          color: '#e8eefc'
        })
        .setOrigin(0, 0);

      const byTicker = new Map(state.stocks.map((s) => [s.ticker, s]));
      const total = portfolioValue(state, player);

      const heldSectors = new Set(
        Object.keys(player.holdings)
          .map((t) => byTicker.get(t)?.sector)
          .filter((s): s is NonNullable<typeof s> => !!s)
      );

      const sectorNews = (state.currentNews ?? state.lastRoundNews ?? [])
        .filter((n) => heldSectors.has(n.sectorId))
        .map((n) => {
          const ev = events.find((e) => e.id === n.eventId);
          return `${n.sectorName}: ${ev?.title ?? '—'}`;
        });

      const holdingsLines = Object.entries(player.holdings)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([ticker, shares]) => {
          const stock = byTicker.get(ticker);
          const price = stock?.price ?? 0;
          const val = price * shares;
          return `${ticker}  x${shares}   @ ${price}   = ${val}`;
        });

      const holdingsText = holdingsLines.length
        ? holdingsLines.join('\n')
        : '—';

      const recent = (state.tradeHistory ?? [])
        .filter((t) => t.playerId === player.id)
        .slice(-12)
        .reverse()
        .map((t) => `R${t.round}  ${t.side}  ${t.ticker}  x${t.shares}  @ ${t.price}`);

      const body = this.add
        .text(panelX - panelW / 2 + 18, panelY - panelH / 2 + 56, '', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: '14px',
          color: '#e8eefc',
          lineSpacing: 6,
          wordWrap: { width: panelW - 36 }
        })
        .setOrigin(0, 0);

      body.setText(
        [
          `Cash: ${player.cash}`,
          `Total value (cash + holdings): ${total}`,
          `Latest sector news: ${sectorNews.length ? sectorNews.join('   •   ') : '—'}`,
          '',
          'Holdings:',
          holdingsText,
          '',
          'Recent trades:',
          recent.length ? recent.join('\n') : '—',
          '',
          'Esc = Close'
        ].join('\n')
      );

      const close = () => {
        if (!this.confirmOpen) return;
        this.confirmOpen = false;
        this.input.keyboard?.off('keydown', onKeyDownModal);
        blocker.destroy();
        panelBg.destroy();
        title.destroy();
        body.destroy();
      };

      const onKeyDownModal = (ev: KeyboardEvent) => {
        if (ev.key === 'Escape') close();
      };

      blocker.on('pointerdown', close);
      this.input.keyboard?.on('keydown', onKeyDownModal);
    };

    new TextButton(this, rightX + rightW / 2, headerH + 112, {
      width: rightInnerW,
      height: 34,
      label: 'Portfolio & Trade History',
      fontSize: 14,
      onClick: openPortfolioHistory
    });

    // Trading open/close
    new TextButton(this, rightX + rightW / 2, headerH + 160, {
      width: rightInnerW,
      height: 36,
      label: state.tradingOpen ? 'Close Trading' : 'Open Trading',
      fontSize: 14,
      onClick: () => {
        const next = setTradingOpen(state, !state.tradingOpen);
        recordActivity(next, 'GM', next.tradingOpen ? 'Trading opened' : 'Trading closed', state.round);
        this.scene.restart();
      }
    });

    // Trade info
    const tradeInfo = this.add
      .text(
        16,
        210,
        this.viewMode === 'overview'
          ? 'Click a player name to open their market board.'
          : 'Market board is open per player.',
        {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        color: '#8ea3d8',
        wordWrap: { width: rightW - 32 }
        }
      )
      .setOrigin(0, 0);
    right.add(tradeInfo);

    // Next round
    new TextButton(this, rightX + rightW / 2, height - consoleH - 130, {
      width: rightW - 40,
      height: 56,
      label: 'Next Round (Resolve)',
      fontSize: 16,
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
        this.scene.restart();
      }
    });

    new TextButton(this, rightX + rightW / 2, height - consoleH - 65, {
      width: rightW - 40,
      height: 52,
      label: 'End Game (Results)',
      fontSize: 16,
      onClick: () => {
        recordActivity(state, 'GM', 'Ended game (results)', state.round);
        this.scene.start('results');
      }
    });

    // Back
    new TextButton(this, 200, 34, {
      width: 180,
      height: 40,
      label: 'Back to Lobby',
      onClick: () => this.scene.start('lobby')
    }).setScale(0.9);

  }
}

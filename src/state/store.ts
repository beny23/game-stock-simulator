import { DEFAULT_STOCKS, SECTORS } from './content';
import { EVENT_DECK } from './eventDeck';
import { GameState, LastRoundNewsEntry, MarketEvent, OrderSide, Player, Stock, TradeHistoryEntry } from './types';

const STORAGE_KEY = 'stock-camp-sim:v1';

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function newGame(startingCash = 1000): GameState {
  const tempState: GameState = {
    version: 1,
    round: 1,
    tradingOpen: false,
    startingCash,
    players: [],
    stocks: structuredClone(DEFAULT_STOCKS),
    priceHistory: Object.fromEntries(structuredClone(DEFAULT_STOCKS).map((s) => [s.ticker, [s.price]])),
    selectedEventId: undefined,
    selectedEventAlt: false,
    lastEventId: undefined,
    lastRoundNews: [],
    currentNews: [],
    upcomingNews: [],
    activityLog: [],
    roundNetShares: {},
    tradeHistory: []
  };

  // Pre-generate upcoming headlines so players can "trade the news".
  const upcoming = pickSectorNews(tempState, getEvents());

  return {
    ...tempState,
    upcomingNews: upcoming
  };
}

function pickSectorNews(state: GameState, events: MarketEvent[]): LastRoundNewsEntry[] {
  const tickersBySector = new Map(
    SECTORS.map(
      (s) => [s.id, new Set(state.stocks.filter((st) => st.sector === s.id).map((st) => st.ticker))] as const
    )
  );

  return SECTORS.map((sector) => {
    const sectorTickers = tickersBySector.get(sector.id) ?? new Set<string>();

    // Prefer sector-wide headlines so multiple tickers move.
    const sectorWide = events.filter((e) => e.scope === 'SECTOR' && e.target === sector.id);
    const companyWide = events.filter((e) => e.scope === 'COMPANY' && sectorTickers.has(e.target));
    const marketWide = events.filter((e) => e.scope === 'MARKET' && e.target === 'ALL');

    const pool = sectorWide.length ? sectorWide : companyWide.length ? companyWide : marketWide.length ? marketWide : events;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    return { sectorId: sector.id, sectorName: sector.name, eventId: choice.id };
  });
}

function appendTradeHistory(
  state: GameState,
  player: Player,
  ticker: string,
  side: OrderSide,
  shares: number,
  price: number
): TradeHistoryEntry[] {
  const entry: TradeHistoryEntry = {
    id: makeId('t'),
    ts: Date.now(),
    round: state.round,
    playerId: player.id,
    playerName: player.name,
    ticker,
    side,
    shares,
    price
  };

  return [...(state.tradeHistory ?? []), entry];
}

export function addPlayer(state: GameState, name: string): GameState {
  const trimmed = name.trim();
  if (!trimmed) return state;

  const player: Player = {
    id: makeId('p'),
    name: trimmed,
    cash: state.startingCash,
    holdings: {}
  };

  return { ...state, players: [...state.players, player] };
}

export function removePlayer(state: GameState, playerId: string): GameState {
  return { ...state, players: state.players.filter((p) => p.id !== playerId) };
}

export function setTradingOpen(state: GameState, open: boolean): GameState {
  return { ...state, tradingOpen: open };
}

export function setSelectedEvent(state: GameState, eventId: string | undefined): GameState {
  return { ...state, selectedEventId: eventId, selectedEventAlt: false };
}

export function toggleSelectedEventAlt(state: GameState): GameState {
  return { ...state, selectedEventAlt: !state.selectedEventAlt };
}

export function getEvents(): MarketEvent[] {
  return EVENT_DECK;
}

export function getStocks(state: GameState): Stock[] {
  return state.stocks;
}

export function getPlayer(state: GameState, playerId: string): Player | undefined {
  return state.players.find((p) => p.id === playerId);
}

export function placeOrder(
  state: GameState,
  playerId: string,
  ticker: string,
  side: OrderSide,
  shares: number
): { next: GameState; error?: string } {
  if (!state.tradingOpen) return { next: state, error: 'Trading is closed.' };
  if (!Number.isFinite(shares) || shares <= 0 || !Number.isInteger(shares)) {
    return { next: state, error: 'Shares must be a whole number > 0.' };
  }

  const stock = state.stocks.find((s) => s.ticker === ticker);
  if (!stock) return { next: state, error: 'Unknown stock.' };

  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { next: state, error: 'Unknown player.' };

  const cost = stock.price * shares;
  const holdings = player.holdings[ticker] ?? 0;

  if (side === 'BUY') {
    if (player.cash < cost) return { next: state, error: 'Not enough cash.' };
    const nextPlayer: Player = {
      ...player,
      cash: player.cash - cost,
      holdings: { ...player.holdings, [ticker]: holdings + shares }
    };

    const nextPlayers = state.players.map((p) => (p.id === playerId ? nextPlayer : p));
    const nextNet = { ...state.roundNetShares, [ticker]: (state.roundNetShares[ticker] ?? 0) + shares };
    const nextHistory = appendTradeHistory(state, nextPlayer, ticker, side, shares, stock.price);
    return { next: { ...state, players: nextPlayers, roundNetShares: nextNet, tradeHistory: nextHistory } };
  }

  // SELL
  if (holdings < shares) return { next: state, error: 'Not enough shares to sell.' };

  const nextShares = holdings - shares;
  const nextHoldings = { ...player.holdings };
  if (nextShares === 0) delete nextHoldings[ticker];
  else nextHoldings[ticker] = nextShares;

  const nextPlayer: Player = {
    ...player,
    cash: player.cash + cost,
    holdings: nextHoldings
  };

  const nextPlayers = state.players.map((p) => (p.id === playerId ? nextPlayer : p));
  const nextNet = { ...state.roundNetShares, [ticker]: (state.roundNetShares[ticker] ?? 0) - shares };
  const nextHistory = appendTradeHistory(state, nextPlayer, ticker, side, shares, stock.price);
  return { next: { ...state, players: nextPlayers, roundNetShares: nextNet, tradeHistory: nextHistory } };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function noiseForVolatility(vol: Stock['volatility']): number {
  switch (vol) {
    case 'LOW':
      return 0.005;
    case 'MED':
      return 0.01;
    case 'HIGH':
      return 0.02;
  }
}

function isCrashEvent(event: MarketEvent): boolean {
  return /market crash/i.test(event.title);
}

export function resolveNextRound(state: GameState): { next: GameState; error?: string; appliedEvent?: MarketEvent } {
  const events = getEvents();
  if (!events.length) return { next: state, error: 'No events available.' };

  const upcoming = state.upcomingNews?.length ? state.upcomingNews : pickSectorNews(state, events);

  const eventsById = new Map(events.map((e) => [e.id, e] as const));
  const chosenEvents = upcoming.map((n) => eventsById.get(n.eventId)).filter((e): e is MarketEvent => !!e);
  const lastEvent = chosenEvents[chosenEvents.length - 1];

  const nextStocks = state.stocks.map((s) => {
    let eventImpactSum = 0;
    for (const ev of chosenEvents) {
      const impact = ev.impactPct;

      if (ev.scope === 'MARKET' && ev.target === 'ALL') {
        let add = impact;
        // Simple "defensive sector" teaching moment for the crash card.
        if (isCrashEvent(ev) && impact <= -0.08 && s.sector === 'FOOD') {
          add = -0.06;
        }
        eventImpactSum += add;
      } else if (ev.scope === 'SECTOR' && ev.target === s.sector) {
        eventImpactSum += impact;
      } else if (ev.scope === 'COMPANY' && ev.target === s.ticker) {
        eventImpactSum += impact;
      }
    }

    // Avoid absurd compounding if there are many players.
    eventImpactSum = clamp(eventImpactSum, -0.25, 0.25);

    // small imbalance effect based on net shares this round
    const netShares = state.roundNetShares[s.ticker] ?? 0;
    const imbalance = clamp(netShares / 200, -0.03, 0.03); // tuned for camp scale

    const noiseRange = noiseForVolatility(s.volatility);
    const noise = (Math.random() * 2 - 1) * noiseRange;

    const pct = clamp(eventImpactSum + imbalance + noise, -0.3, 0.3);
    // Round to whole coins so changes are visible on the board.
    const nextPrice = Math.max(10, Math.round(s.price * (1 + pct)));

    return { ...s, price: nextPrice };
  });

  const prevHistory = state.priceHistory ?? Object.fromEntries(state.stocks.map((s) => [s.ticker, [s.price]]));
  const nextHistory: Record<string, number[]> = { ...prevHistory };
  for (const s of nextStocks) {
    const arr = nextHistory[s.ticker] ? [...nextHistory[s.ticker]] : [];
    arr.push(s.price);
    // Keep history bounded so saves stay small.
    while (arr.length > 60) arr.shift();
    nextHistory[s.ticker] = arr;
  }

  const next: GameState = {
    ...state,
    round: state.round + 1,
    tradingOpen: false,
    stocks: nextStocks,
    priceHistory: nextHistory,
    roundNetShares: {},
    selectedEventId: undefined,
    selectedEventAlt: false,
    lastEventId: lastEvent?.id,
    lastRoundNews: upcoming,
    currentNews: upcoming,
    upcomingNews: pickSectorNews({ ...state, stocks: nextStocks }, events)
  };

  return { next, appliedEvent: lastEvent };
}

export function saveGame(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGame(): GameState | undefined {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as GameState;
    if (parsed?.version !== 1) return undefined;
    const rawLastRoundNews = (parsed as any).lastRoundNews;
    const lastRoundNews = Array.isArray(rawLastRoundNews)
      ? rawLastRoundNews.filter(
          (n: any) => typeof n?.sectorId === 'string' && typeof n?.sectorName === 'string' && typeof n?.eventId === 'string'
        )
      : [];

    const rawCurrentNews = (parsed as any).currentNews;
    const currentNews = Array.isArray(rawCurrentNews)
      ? rawCurrentNews.filter(
          (n: any) => typeof n?.sectorId === 'string' && typeof n?.sectorName === 'string' && typeof n?.eventId === 'string'
        )
      : lastRoundNews;

    const rawUpcomingNews = (parsed as any).upcomingNews;
    const upcomingNews = Array.isArray(rawUpcomingNews)
      ? rawUpcomingNews.filter(
          (n: any) => typeof n?.sectorId === 'string' && typeof n?.sectorName === 'string' && typeof n?.eventId === 'string'
        )
      : [];

    const base: GameState = {
      ...parsed,
      roundNetShares: parsed.roundNetShares ?? {},
      tradeHistory: (parsed as any).tradeHistory ?? [],
      lastEventId: (parsed as any).lastEventId ?? undefined,
      lastRoundNews,
      currentNews,
      upcomingNews,
      activityLog: (parsed as any).activityLog ?? [],
      priceHistory:
        (parsed as any).priceHistory ?? Object.fromEntries((parsed.stocks ?? []).map((s: any) => [s.ticker, [s.price]]))
    };

    // Ensure we always have upcoming headlines for the ticker.
    if (!base.upcomingNews?.length) {
      base.upcomingNews = pickSectorNews(base, getEvents());
    }

    return base;
  } catch {
    return undefined;
  }
}

export function hasSavedGame(): boolean {
  return localStorage.getItem(STORAGE_KEY) != null;
}

export function clearSavedGame(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function portfolioValue(state: GameState, player: Player): number {
  const byTicker = new Map(state.stocks.map((s) => [s.ticker, s.price]));
  let value = player.cash;
  for (const [ticker, shares] of Object.entries(player.holdings)) {
    value += (byTicker.get(ticker) ?? 0) * shares;
  }
  return value;
}

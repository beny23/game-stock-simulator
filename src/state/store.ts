import { DEFAULT_EVENTS, DEFAULT_STOCKS } from './content';
import { GameState, MarketEvent, OrderSide, Player, Stock } from './types';

const STORAGE_KEY = 'stock-camp-sim:v1';

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function newGame(startingCash = 1000): GameState {
  return {
    version: 1,
    round: 1,
    tradingOpen: false,
    startingCash,
    players: [],
    stocks: structuredClone(DEFAULT_STOCKS),
    selectedEventId: undefined,
    selectedEventAlt: false,
    roundNetShares: {}
  };
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
  return DEFAULT_EVENTS;
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
    return { next: { ...state, players: nextPlayers, roundNetShares: nextNet } };
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
  return { next: { ...state, players: nextPlayers, roundNetShares: nextNet } };
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

export function resolveNextRound(state: GameState): { next: GameState; error?: string; appliedEvent?: MarketEvent } {
  const events = getEvents();
  const event = state.selectedEventId ? events.find((e) => e.id === state.selectedEventId) : undefined;
  if (!event) return { next: state, error: 'Pick an event card first.' };

  const impact = state.selectedEventAlt && event.impactPctAlt != null ? event.impactPctAlt : event.impactPct;

  const nextStocks = state.stocks.map((s) => {
    let eventImpact = 0;
    if (event.scope === 'MARKET' && event.target === 'ALL') {
      eventImpact = impact;
      // Simple "defensive sector" teaching moment for the crash card.
      if (event.id === 'e_market_crash' && s.sector === 'FOOD') {
        eventImpact = -0.06;
      }
    } else if (event.scope === 'SECTOR' && event.target === s.sector) {
      eventImpact = impact;
    } else if (event.scope === 'COMPANY' && event.target === s.ticker) {
      eventImpact = impact;
    }

    // small imbalance effect based on net shares this round
    const netShares = state.roundNetShares[s.ticker] ?? 0;
    const imbalance = clamp(netShares / 200, -0.03, 0.03); // tuned for camp scale

    const noiseRange = noiseForVolatility(s.volatility);
    const noise = (Math.random() * 2 - 1) * noiseRange;

    const pct = eventImpact + imbalance + noise;
    const nextPrice = Math.max(10, Math.round((s.price * (1 + pct)) / 10) * 10); // keep multiples of 10

    return { ...s, price: nextPrice };
  });

  const next: GameState = {
    ...state,
    round: state.round + 1,
    tradingOpen: false,
    stocks: nextStocks,
    roundNetShares: {},
    selectedEventId: undefined,
    selectedEventAlt: false
  };

  return { next, appliedEvent: event };
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
    return parsed;
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

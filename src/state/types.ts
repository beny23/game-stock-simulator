export type SectorId =
  | 'TECH_MEDIA'
  | 'ENERGY'
  | 'TRANSPORT'
  | 'HEALTH'
  | 'FOOD';

export type OrderSide = 'BUY' | 'SELL';

export type Stock = {
  ticker: string;
  name: string;
  sector: SectorId;
  price: number;
  volatility: 'LOW' | 'MED' | 'HIGH';
};

export type Player = {
  id: string;
  name: string;
  cash: number;
  holdings: Record<string, number>; // ticker -> shares
};

export type EventScope = 'COMPANY' | 'SECTOR' | 'MARKET';

export type MarketEvent = {
  id: string;
  title: string;
  scope: EventScope;
  target: string; // ticker OR sector id OR 'ALL'
  impactPct: number; // e.g. -0.03 = -3%
  impactPctAlt?: number; // optional alternative impact for "uncertain" cards
  explanation: string;
};

export type TradeHistoryEntry = {
  id: string;
  ts: number;
  round: number;
  playerId: string;
  playerName: string;
  ticker: string;
  side: OrderSide;
  shares: number;
  price: number;
};

export type LastRoundNewsEntry = {
  sectorId: SectorId;
  sectorName: string;
  eventId: string;
};

export type ActivityLogEntry = {
  id: string;
  ts: number;
  round: number;
  actor: string; // player name or 'GM'
  message: string;
};

export type GameState = {
  version: 1;
  round: number;
  tradingOpen: boolean;
  startingCash: number;
  players: Player[];
  stocks: Stock[];
  priceHistory?: Record<string, number[]>; // ticker -> list of past prices (by resolve order)
  selectedEventId?: string;
  selectedEventAlt?: boolean;
  lastEventId?: string;
  // Back-compat: previously used for "last applied" news
  lastRoundNews?: LastRoundNewsEntry[];
  // New: what was applied last resolve, and what will be applied next resolve
  currentNews?: LastRoundNewsEntry[];
  upcomingNews?: LastRoundNewsEntry[];
  activityLog?: ActivityLogEntry[];
  // track this round's net orders for a tiny imbalance effect
  roundNetShares: Record<string, number>; // ticker -> net shares bought (buys - sells)
  tradeHistory: TradeHistoryEntry[];
};

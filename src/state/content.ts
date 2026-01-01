import { MarketEvent, SectorId, Stock } from './types';

export const SECTORS: Array<{ id: SectorId; name: string; riskLabel: string }> = [
  { id: 'TECH_MEDIA', name: 'Technology & Media', riskLabel: 'Higher risk' },
  { id: 'ENERGY', name: 'Energy', riskLabel: 'Medium-High risk' },
  { id: 'TRANSPORT', name: 'Transport & Logistics', riskLabel: 'Medium risk' },
  { id: 'HEALTH', name: 'Health & Wellness', riskLabel: 'Medium risk' },
  { id: 'FOOD', name: 'Food & Farming', riskLabel: 'Lower risk' }
];

export const DEFAULT_STOCKS: Stock[] = [
  { ticker: 'BBDY', name: 'ByteBuddies', sector: 'TECH_MEDIA', price: 120, volatility: 'HIGH' },
  { ticker: 'SSRT', name: 'StreamSprout', sector: 'TECH_MEDIA', price: 90, volatility: 'HIGH' },
  { ticker: 'CKCR', name: 'CloudKit Crew', sector: 'TECH_MEDIA', price: 110, volatility: 'HIGH' },

  { ticker: 'SSPR', name: 'SolarSprout Energy', sector: 'ENERGY', price: 80, volatility: 'HIGH' },
  { ticker: 'WWPW', name: 'WindWay Power', sector: 'ENERGY', price: 70, volatility: 'MED' },

  { ticker: 'RBRT', name: 'RoboRoute', sector: 'TRANSPORT', price: 100, volatility: 'MED' },
  { ticker: 'TTLG', name: 'TrailTrack Logistics', sector: 'TRANSPORT', price: 60, volatility: 'MED' },

  { ticker: 'MDMT', name: 'MediMints', sector: 'HEALTH', price: 50, volatility: 'MED' },
  { ticker: 'PLPT', name: 'PulsePatch', sector: 'HEALTH', price: 130, volatility: 'HIGH' },

  { ticker: 'AQHV', name: 'AquaHarvest', sector: 'FOOD', price: 60, volatility: 'MED' },
  { ticker: 'GGCP', name: 'GrainGuard Co-op', sector: 'FOOD', price: 40, volatility: 'LOW' },
  { ticker: 'SSDY', name: 'SunnySide Dairy', sector: 'FOOD', price: 30, volatility: 'LOW' }
];

// Starter deck (expand later if desired). Includes a crash + recovery.
export const DEFAULT_EVENTS: MarketEvent[] = [
  {
    id: 'e_bbdy_feature',
    title: 'ByteBuddies adds a great new feature!',
    scope: 'COMPANY',
    target: 'BBDY',
    impactPct: 0.05,
    explanation: 'More people might use it, so investors feel optimistic.'
  },
  {
    id: 'e_tech_privacy',
    title: 'Tech privacy worries in the news',
    scope: 'SECTOR',
    target: 'TECH_MEDIA',
    impactPct: -0.03,
    explanation: 'Rules and trust can affect many tech companies.'
  },
  {
    id: 'e_fuel_rise',
    title: 'Fuel costs rise',
    scope: 'SECTOR',
    target: 'TRANSPORT',
    impactPct: -0.03,
    explanation: 'If fuel costs more, deliveries cost more.'
  },
  {
    id: 'e_good_vibes',
    title: 'Good vibes day (confidence)',
    scope: 'MARKET',
    target: 'ALL',
    impactPct: 0.01,
    explanation: 'Sometimes people feel optimistic and buy more.'
  },
  {
    id: 'e_market_crash',
    title: 'Market crash: Panic selling!',
    scope: 'MARKET',
    target: 'ALL',
    impactPct: -0.1,
    explanation: 'Sometimes fear spreads and many people sell at once.'
  },
  {
    id: 'e_aftershock',
    title: 'Aftershock day',
    scope: 'MARKET',
    target: 'ALL',
    impactPct: -0.03,
    explanation: 'After a crash, people can still feel nervous.'
  },
  {
    id: 'e_bargain_buyers',
    title: 'Bargain hunters buy (small bounce)',
    scope: 'MARKET',
    target: 'ALL',
    impactPct: 0.03,
    explanation: 'Some investors buy when prices look cheap.'
  }
];

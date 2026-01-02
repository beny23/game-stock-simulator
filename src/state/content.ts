import { SectorId, Stock } from './types';

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
  { ticker: 'HYDK', name: 'HydroKite', sector: 'ENERGY', price: 65, volatility: 'MED' },

  { ticker: 'RBRT', name: 'RoboRoute', sector: 'TRANSPORT', price: 100, volatility: 'MED' },
  { ticker: 'TTLG', name: 'TrailTrack Logistics', sector: 'TRANSPORT', price: 60, volatility: 'MED' },
  { ticker: 'BCHP', name: 'BeaconHop Freight', sector: 'TRANSPORT', price: 75, volatility: 'MED' },

  { ticker: 'MDMT', name: 'MediMints', sector: 'HEALTH', price: 50, volatility: 'MED' },
  { ticker: 'PLPT', name: 'PulsePatch', sector: 'HEALTH', price: 130, volatility: 'HIGH' },
  { ticker: 'VITN', name: 'VitaNudge', sector: 'HEALTH', price: 85, volatility: 'MED' },

  { ticker: 'AQHV', name: 'AquaHarvest', sector: 'FOOD', price: 60, volatility: 'MED' },
  { ticker: 'GGCP', name: 'GrainGuard Co-op', sector: 'FOOD', price: 40, volatility: 'LOW' },
  { ticker: 'SSDY', name: 'SunnySide Dairy', sector: 'FOOD', price: 30, volatility: 'LOW' }
];

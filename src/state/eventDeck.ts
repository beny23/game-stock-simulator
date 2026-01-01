import type { EventScope, MarketEvent, SectorId } from './types';

// Vite will bundle this as a raw string for offline use.
// Source of truth remains the root markdown file.
// eslint-disable-next-line import/no-unresolved
import contentPack from '../../CONTENT_PACK_V1.md?raw';

function toScope(raw: string): EventScope {
  const s = raw.trim().toUpperCase();
  if (s === 'COMPANY') return 'COMPANY';
  if (s === 'SECTOR') return 'SECTOR';
  return 'MARKET';
}

function toSectorId(target: string): SectorId | undefined {
  const t = target.trim();
  if (t === 'Technology & Media') return 'TECH_MEDIA';
  if (t === 'Energy') return 'ENERGY';
  if (t === 'Transport & Logistics') return 'TRANSPORT';
  if (t === 'Health & Wellness') return 'HEALTH';
  if (t === 'Food & Farming') return 'FOOD';
  return undefined;
}

function parseImpact(raw: string): { impactPct: number; impactPctAlt?: number } | undefined {
  const s = raw.trim();

  // Patterns like: +0.06 OR -0.06 (GM chooses)
  const orMatch = s.match(/([+-]?\d*\.?\d+)\s*OR\s*([+-]?\d*\.?\d+)/i);
  if (orMatch) {
    return { impactPct: Number(orMatch[1]), impactPctAlt: Number(orMatch[2]) };
  }

  // Patterns like: -0.03
  const numMatch = s.match(/([+-]?\d*\.?\d+)/);
  if (numMatch) {
    return { impactPct: Number(numMatch[1]) };
  }

  // Patterns like: 0.00 overall; increase noise this round
  const zeroMatch = s.match(/\b0\.00\b/);
  if (zeroMatch) return { impactPct: 0 };

  return undefined;
}

function safeIdFromTitle(n: number, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return `cp_${n}_${slug}`;
}

export function parseEventsFromContentPack(raw: string): MarketEvent[] {
  const lines = raw.split(/\r?\n/);
  const events: MarketEvent[] = [];

  for (let i = 0; i < lines.length; i++) {
    // Match: 12) “Title”  OR  12) "Title"
    const header = lines[i].match(/^\s*(\d+)\)\s*[“"](.+?)[”"]\s*$/);
    if (!header) continue;

    const num = Number(header[1]);
    const title = header[2].trim();

    // Look ahead for Scope/Target/Impact/Why within next ~8 lines.
    let scope: EventScope | undefined;
    let targetRaw: string | undefined;
    let impactRaw: string | undefined;
    let explanation: string | undefined;

    for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
      const line = lines[j].trim();

      const st = line.match(/^-\s*Scope:\s*([^|]+)\|\s*Target:\s*(.+)$/i);
      if (st) {
        scope = toScope(st[1]);
        targetRaw = st[2].trim();
        continue;
      }

      const imp = line.match(/\bImpact:\s*(.+)$/i);
      if (imp) {
        impactRaw = imp[1].trim();
        continue;
      }

      const why = line.match(/^-\s*Why:\s*(.+)$/i);
      if (why) {
        explanation = why[1].trim();
        continue;
      }
    }

    if (!scope || !targetRaw || !impactRaw || !explanation) continue;

    const impact = parseImpact(impactRaw);
    if (!impact) continue;

    let target: string;
    if (scope === 'MARKET') {
      target = 'ALL';
    } else if (scope === 'SECTOR') {
      const sid = toSectorId(targetRaw);
      if (!sid) continue;
      target = sid;
    } else {
      // Company
      target = targetRaw;
    }

    events.push({
      id: safeIdFromTitle(num, title),
      title,
      scope,
      target,
      impactPct: impact.impactPct,
      impactPctAlt: impact.impactPctAlt,
      explanation
    });
  }

  // Ensure deterministic order by the leading number.
  events.sort((a, b) => {
    const an = Number(a.id.split('_')[1] ?? 0);
    const bn = Number(b.id.split('_')[1] ?? 0);
    return an - bn;
  });

  return events;
}

export const EVENT_DECK: MarketEvent[] = parseEventsFromContentPack(contentPack);

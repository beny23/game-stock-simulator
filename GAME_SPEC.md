# Stock Market Simulator (Scout Camp, Offline, GM-Led) — Game Spec v1

## 1) Elevator Pitch
An offline, browser-based stock market simulation designed for ages 10–14 and run over a scout camp. A scout leader (Game Master) runs the market on one device. Scouts submit buy/sell requests to the leader each round; the leader enters them, then resolves the round to update prices.

Prices move based on simple, explainable forces (camp events + supply/demand + small randomness). The goal is to learn core investing concepts (risk, diversification, volatility, fundamentals vs hype) rather than “get rich.”

Runs as a static website **with no internet connectivity** required.

## 2) Target Audience
- Primary: ages 10–14 (middle school)
- Secondary: teachers/parents facilitating sessions

Design principles for this age:
- Keep concepts concrete and explainable in 1–2 sentences
- Make feedback immediate (tooltips, “why did price change?”)
- Avoid jargon, or define it in-place
- Ensure short sessions (15–30 minutes) work well

## 3) Learning Goals (What kids should learn)
By the end of a session, players should be able to:
- Explain that stock prices can go up and down quickly (volatility)
- Describe diversification (“don’t put all your eggs in one basket”)
- Distinguish **fundamentals** (company performance) vs **hype/news** (sentiment)
- Understand that higher potential reward usually comes with higher risk
- Practice basic math: percent change, profit/loss, average cost

## 4) Key Constraints
- Static website (can be opened from a laptop locally)
- **No internet connectivity** at camp
- The scout leader controls the system; scouts request actions

Implication:
- The core game must work in a **single-device, GM-led** mode with local persistence.

## 5) Game Overview
### 5.1 Session Structure
- A camp game has:
  - A roster of players
  - A set of fictional stocks
  - A timeline of rounds (grouped into “days” if desired)
  - A deck of camp events/news
  - Market rules and difficulty preset

Default camp assumptions (from you):
- ~12 players
- Projector/shared screen for the market board
- Round count is GM-controlled (no fixed limit)
- No undo (GM enters carefully; confirmations required)

### 5.2 Win Condition / Success Metrics
Educational success > competitive win.
- Default: leaderboard by **Total Portfolio Value** at session end
- Optional: “achievement” badges (non-competitive) like:
  - “Diversified” (hold 4+ different stocks)
  - “Calm Trader” (no panic-selling after negative news)
  - “Researcher” (read 6+ company cards)

(If you want ultra-minimal MVP, we can skip achievements.)

### 5.3 Core Loop
1. **Upcoming headlines are shown on-screen** (one per sector)
2. Scouts submit buy/sell requests to the GM (verbally or on paper)
3. GM enters trades into the game
4. GM resolves the round → upcoming headlines are applied → prices update
5. GM shares outcomes (e.g., top movers) + “why it moved” explanation
6. Next round (new upcoming headlines appear)

## 6) Fictional Market Content
### 6.0 Sectors (for sector-wide events)
The market is organized into **5 sectors** so the GM can pick sector events that affect a meaningful group.

Default sector model:
- 5 sectors
- Each stock belongs to exactly 1 sector
- Sector events target 1 sector (or occasionally 2)

Reality-based risk profile (camp default):
- Some sectors are intentionally more volatile than others to mirror the real world.
- This affects:
  - the typical size of random price “noise”
  - how strongly hype/rumor events can move prices
  - how often large up/down moves happen

Default 5 sectors (with typical risk):
- **Technology & Media** (higher risk / higher volatility)
- **Energy** (medium-high risk; can swing on supply shocks)
- **Transport & Logistics** (medium risk; sensitive to fuel/costs/demand)
- **Health & Wellness** (medium risk; some companies can be higher)
- **Food & Farming** (lower risk; more stable demand)

Note: This is simplified on purpose. We’re teaching patterns, not predicting markets.

### 6.1 Stocks (fictional companies)
Use kid-friendly themes; avoid real brands.
- Examples:
  - **SolarSprout Energy (SSPR)** — renewable power
  - **ByteBuddies (BBDY)** — chat app
  - **AquaHarvest (AQHV)** — sustainable food
  - **RoboRoute (RBRT)** — delivery robots
  - **MediMints (MDMT)** — health snacks

Each stock has:
- Ticker, name, short description
- Sector (one of the 5)
- “Fundamentals” meters (simple):
  - Profitability (Low/Med/High)
  - Stability (Low/Med/High)
  - Growth Potential (Low/Med/High)
- Volatility level (Low/Med/High)

Volatility guidance (default):
- Most Technology & Media stocks: High
- Most Food & Farming stocks: Low–Medium
- Energy: Medium–High
- Transport & Logistics: Medium
- Health & Wellness: Medium (with 1 “spicier” High-volatility stock if desired)

### 6.2 News Cards
News drives explainable price movement.
- Types:
  - Earnings (fundamentals)
  - Product launch (mixed)
  - Regulation/environment event (sector-wide)
  - Rumor/hype (sentiment)

Scope:
- **Single-company** events (affect one stock)
- **Sector** events (affect a labeled group of stocks)
- **Whole-market** events (small effect across all stocks)

Special case: market crash events
- Very rare **Market** events that cause a large drop across most or all stocks.
- Used to teach risk, uncertainty, and diversification (not to “punish” players).
- GM-triggered (chosen like any other event card).

Frequency (camp default):
- Fully **GM-decided**.
- Recommendation: use crashes sparingly (e.g., once in a longer game) so they stay meaningful.

Every news card includes:
- Headline (kid-safe)
- 1–2 sentence explanation
- “Expected impact” hint (small/medium/large, up/down/uncertain)
- Scope tag: Company / Sector / Market
- A short “Why this affects prices” explanation written for ages 10–14

Event selection (current build):
- Each round, the game **auto-generates a set of upcoming sector headlines** (shown on the ticker).
- On **Next Round (Resolve)**, those headlines are applied to prices and a new set is generated.
- (Future option) GM-selected or random-card selection UI.

Deck size guidance:
- For variety across a whole camp, aim for ~50 event cards total.

If you want extra variety, ~100 cards works well (with the GM picking).

## 7) Market Mechanics
### 7.1 Time & Rounds
This game uses **turn-based rounds**.

Suggested camp pacing (adjustable):
- 2–4 rounds per activity block
- 8–20 rounds total across camp

Each round:
- GM announces event/news
- 2–5 minutes for scouts to decide
- GM enters orders and resolves

Recommended for your camp setup:
- Number of rounds is GM-controlled (no fixed limit)
- GM-chosen decision time per round (no enforced timer)
- GM-chosen entry + resolve + discussion time

Total time: ~30–45 minutes depending on discussion.

Note: total duration depends on how many rounds the GM runs.

### 7.2 Pricing Model (simple + explainable)
Each stock price changes via three components:
1. **News impact** (predefined per news card)
2. **Order imbalance** (more buys than sells → price nudges up)
3. **Random noise** (small; scaled by volatility)

Example (per tick):
- $\Delta P = P \times (news + imbalance + noise)$

Where:
- `news` is a small percent like +0.03 or -0.02
- `imbalance` based on (buyVolume - sellVolume) / totalVolume, capped
- `noise` random in a small range

### 7.3 Trading Rules
- Players can:
  - Buy shares with cash
  - Sell shares they own
- No short selling (keep simple)
- No leverage (no borrowing)
- Optionally include a small transaction fee to discourage spam trading

Definition:
- A “trade” means one order: (buy OR sell) + (one stock) + (whole-number shares).

Camp default (no hard trade cap):
- There is **no per-round limit** on number of trades.
- Pacing and fairness are handled by the GM (recommended: a simple queue rule).

Current build note:
- The UI enters trades in **1-share steps** via `+` and `-` buttons. Repeat clicks for multiple shares.

### 7.4 Order Types
MVP order type:
- **Market order**: buy/sell at current price

Whole shares only (camp default):
- Orders must use whole-number shares (no fractional shares)

Optional (later):
- Limit orders

### 7.5 Portfolio Value
- Cash + sum(shares × current price)
- Display:
  - Total value
  - Today’s change (since last tick/round)
  - Overall profit/loss

## 8) UI/UX Requirements
### 8.1 Screens
Minimal required screens:
1. **Home**
  - Create new camp game
  - Load saved camp game
2. **Lobby**
  - Player list (add/remove)
  - Starting cash
  - Difficulty preset
  - Start camp game (GM)
3. **Market**
   - **Overview tab:** ticker (upcoming headlines) + TV-style bulletins (includes Market Movers + CAMP Index)
   - **Market Spotlight:** rotates through CAMP Index and sectors with price history charts
   - **Player tabs:** market board with `+`/`-` 1-share trade entry + confirmation
   - Player panels include **Recent Trades** and a **Net Worth** tracker (cash, stocks, total)
   - Bottom console shows activity log (newest at top) with scrollback
   - **Advance controls (GM):**
     - Next Round (resolve)
     - End Game
4. **Results**
   - Final leaderboard
   - Reflection prompts (1–3 questions)

Optional (still offline):
5. **Handout / Player View**
  - A printable or shareable “price sheet” for the current round
  - A simple “portfolio card” per player

Recommended for your camp setup:
6. **Projector View (Read-Only)**
  - Big stock prices + round number + headline news
  - “Top movers” list (optional)
  - No controls (GM operates from their device)

### 8.2 Kid-Friendly UI
- Large buttons, clear labels
- Avoid red/green-only meaning (colorblind-safe)
- Tooltips: define “share,” “portfolio,” “diversify”

### 8.3 Reflection Prompts (Educational wrap-up)
At end, show 1–3 prompts:
- “What happened when lots of people bought the same stock?”
- “Did diversification help when one stock dropped?”
- “Which news felt like hype vs real performance?”

## 9) Offline Camp Mode (GM-Led)
### 9.1 Device Model
- Primary: one laptop/tablet run by the scout leader (GM)
- Optional: a second display/projector to show the market board

### 9.2 How Scouts Submit Actions
Default pattern (your camp setup):
- **Verbal requests** (“Buy 2 shares of SSPR”)

Optional fallback:
- Paper order slips (only if verbal gets too chaotic)

The game UI should make it fast for the GM to:
- Pick a player tab
- Pick a stock tile
- Click `+` (buy 1) or `-` (sell 1), repeating for multiple shares
- Confirm (with validation)

Given “no undos,” the UI should also:
- Show a clear confirmation step before finalizing an order
- Prevent invalid sells (selling more shares than owned)
- Prevent invalid buys (insufficient cash)

Recommended verbal round routine (12 players + projector):
- GM shows the market board and reads the round’s headline event.
- Trading is always open (no separate open/close step).
- Scouts line up (or raise hands). One at a time, a scout places **one trade** (fast), then goes to the back of the line if they want to trade again.
- GM aims for fairness by cycling through the line so no one dominates time.
- For each trade, GM repeats back: “Player X: BUY/SELL N of TICKER at PRICE — confirm?” then submits.
- If a buy is unaffordable at the moment it’s entered, GM says “Not enough cash” and skips that trade (scout may use remaining trades).
- GM calls “last call” when energy/schedule demands, then resolves the round and briefly explains movers.

Fairness guardrail (recommended):
- GM uses a simple queue rule: everyone gets a chance at 1 trade before anyone takes a 2nd (time permitting).
- The UI can optionally show “trades entered this round” per player for GM awareness, but it must not block additional trades.

Round-end rule (your camp setup):
- Rounds end when the GM calls it (based on time, energy, and logistics), not when a cap is reached.

### 9.3 Saving & Restoring
Must support continuing across multiple days of camp:
- Save game locally in browser storage
- (Future) Export/import save file for safety (USB/AirDrop)

Because the number of rounds is open-ended, saves must include current round number and full price/portfolio state.

## 10) Roles & Permissions
- Scout (player): makes trade decisions (submitted to GM)
- GM (scout leader): manages roster, enters trades, advances rounds, optionally injects an event

## 11) Data Model (high-level)
- Session
  - id, code, status, round, tickEndsAt
  - stocks[] (price, history, volatility)
  - sectors[] (name, tickers)
  - newsQueue[]
- Player
  - id, nickname
  - cash
  - holdings { ticker: shares }
- Order
  - playerId, ticker, side, shares, createdAt, round

## 12) Anti-Griefing / Safety
- Profanity filter for nicknames (basic)
- GM-only data entry (reduces trolling)
- No chat

Fairness / pacing guardrails:
- No hard caps.
- Recommended: use the one-trade-per-turn queue rule to keep things fair.

## 13) Accessibility & Compliance-ish Basics
- Keyboard navigable controls
- Text alternatives for charts
- Avoid relying on color only

## 14) Difficulty Tuning
Provide 3 presets:
- Beginner: fewer stocks, lower volatility, clearer news
- Standard: more stocks, medium volatility
- Challenge: higher volatility, more “uncertain” news

## 15) MVP Definition (smallest shippable)
MVP for camp (offline):
- Create new camp game + add players
- 10–12 fictional stocks across 5 sectors
- Turn-based rounds with GM order entry
- Market orders only
- Portfolio and leaderboard
- Camp events/news cards with “why it moved” explanations
- Local save + load

Recommended numeric defaults (kid-friendly math):
- Starting cash: 1,000 “camp coins”
- Starting stock prices: multiples of 10 (e.g., 50, 60, 80, 120)
- Trade sizes: whole shares only (no fractions)
- Display percent change rounded to whole percent

This keeps arithmetic approachable and makes diversification achievable.

Example “starter script” (6 rounds) for a single session (optional):
- Round 1 (Warm-up): small mixed news; low volatility
- Round 2 (Sector boost): renewable/eco stock gets positive event; small spillover
- Round 3 (Hype rumor): one tech stock spikes on rumor (label as uncertain)
- Round 4 (Reality check): earnings-style fundamentals move prices more slowly
- Round 5 (Market wobble): broad negative shock (teaches diversification)
- Round 6 (Recovery): mixed recovery; final results + reflection

GM can run fewer or more rounds; this is just a ready-to-use example sequence.

## 16) Out of Scope (v1)
- Real-money integration
- Real stock symbols or real market data
- Complex instruments (options, margin, short selling)
- Open chat

## 17) Open Decisions (for you + me)
1. Number of players typical at camp
2. Number of rounds per day / total rounds
3. Starting cash and share price ranges (kid-friendly math)
4. How “realistic” vs “gamey” the price model should feel
5. GM controls: minimal vs richer (pause, undo, inject event)

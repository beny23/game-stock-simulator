# Stock Camp Simulator

Offline, GM-led stock market simulation for scout camp. Built with Phaser 3.

## How to run a session (GM)

- **Home → New Game**
- **Lobby:** add players, then **Start Market**
- **Market:**
	- **Overview tab** is a projector-friendly “TV” view (ticker + rotating bulletins + Market Spotlight charts).
	- **Player tabs** are where you enter trades:
		- Use `+` to **buy 1 share** and `-` to **sell 1 share** (repeat for multiple shares).
		- A confirmation dialog appears for each trade.
		- Player view includes **Recent Trades** and a **Net Worth** tracker (cash, stocks, total).
	- **GM controls** (bottom-right):
		- **Next Round (Resolve)** applies the upcoming headlines, updates prices, and returns to Overview.
		- **End Game (Results)** shows the leaderboard.
	- **Console** (bottom-left): shows activity log (newest at top). Scroll with mouse wheel over the console or `PageUp`/`PageDown`.

## Saves

- Saves are stored in browser `localStorage` on the same device/browser profile.

## Dev

- Install: `npm install`
- Run: `npm run dev`

## Build (offline)

- Build: `npm run build`
- The `dist/` folder is a static site you can open offline (or serve locally).

## Docs

- Spec: [GAME_SPEC.md](GAME_SPEC.md)
- Content: [CONTENT_PACK_V1.md](CONTENT_PACK_V1.md)

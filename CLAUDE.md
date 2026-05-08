# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Start both frontend (port 3000) and backend (port 8080)
npm run dev

# Start only frontend or backend
npm run dev:frontend
npm run dev:backend

# Build for production
npm run build

# Run backend tests (Jest)
npm run test
cd backend && npx jest --testPathPattern=stock  # run a single test file
```

## Architecture

This is a monorepo with two npm workspaces (`frontend/`, `backend/`). The database is an external SQLite file not in this repo — the backend expects it at `../data/stocks.db` (or set via `DB_DATABASE` env var).

**Frontend**: Next.js 14 App Router with Lightweight Charts (TradingView) for K-line/valuation charts, Tailwind CSS v4 for styling. All API calls go through helper functions in `frontend/lib/api.ts`, which uses `getApiUrl()` to resolve endpoints. In dev mode, Next.js rewrites `/api/*` → `http://localhost:8080/api/*` (configured in `frontend/next.config.ts`). In production, Nginx handles the proxy.

**Backend**: NestJS 11 on Express. Two database access layers coexist:
1. **TypeORM** — registered in `app.module.ts` with `synchronize: true` in dev. Used for entity definitions and module wiring, but rarely for actual queries.
2. **better-sqlite3** via `DatabaseService` — the primary data access layer. All stock queries, portfolio CRUD, and valuation lookups use raw SQL through `databaseService.query()` / `queryOne()`.

**Important**: The `StockController` delegates to `StockBetterService` (not to a TypeORM repository). Most data logic lives in `StockBetterService`, which uses raw SQL for everything including complex ranking queries with dividend yield computation.

**Stock code formats**: Main tables use `sh.600000` / `sz.000001`. Eastmoney tables (`eastmoney_dividend_ratio`, `eastmoney_eps_predict`) use `600000.SH` / `000001.SZ`. `StockBetterService` has `convertToEastmoneyCode()` / `convertFromEastmoneyCode()` helpers for this.

### Backend Structure

- `src/entities/` — TypeORM entity classes (used for module config, occasionally for typing)
- `src/controllers/` — REST controllers: `StockController` (stocks, indices, EPS), `ValuationController` (CSI 300, equity-bond spread), `PortfolioController` (CRUD), `PortfolioBacktestController` (stats)
- `src/services/` — business logic: `StockBetterService` (all stock/index/valuation queries), `PortfolioService`, `PortfolioBacktestService`
- `src/database.service.ts` — better-sqlite3 wrapper (open, query, queryOne, execute, batchInsert, backup)

### Frontend Routes (App Router)

| Route | Purpose |
|---|---|
| `/` | Home page with sample chart + stats cards |
| `/stocks` | Stock list with search |
| `/stocks/[code]` | Individual stock detail (K-line chart) |
| `/stocks/[code]/pepb-chart` | PE/PB history chart for a stock |
| `/portfolios` | Portfolio list |
| `/portfolios/create` | Create new portfolio |
| `/portfolios/[id]` | Portfolio detail |
| `/valuation` | Market valuation analysis |
| `/portfolio-valuation` | Portfolio-level valuation |
| `/equity-bond-spread` | Equity-bond yield spread chart |

### Database Tables (read-only from the app's perspective)

The app reads from an external SQLite database. Key tables:
- `stock_day_pepb_data` — daily OHLCV + PE/PB/PS/PCF per stock
- `stockinfo` — stock code → codeName lookup
- `stock_bonus_data` — dividend history per stock
- `portfolios` — user-created portfolios (this is the only table the app writes to)
- `index_valuation_data` — PE/PB/ROE for market indices
- `hushen300` — CSI 300 index daily data
- `equity_bond_spread` — precomputed equity-bond spread data
- `eastmoney_dividend_ratio` / `eastmoney_eps_predict` / `eastmoney_org_eps_predict` — data from Eastmoney

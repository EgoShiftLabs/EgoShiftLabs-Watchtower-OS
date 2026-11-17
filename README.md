# WATCHTOWER OS
### Observe. Analyze. Forecast. Advise. Learn.

A public, customizable strategic-intelligence workspace for individuals who want to connect events to decisions and measure whether their predictions were useful.

**Live GitHub Pages dashboard:** https://egoshiftlabs.github.io/EgoShiftLabs-Watchtower-OS/

**Current status:** Functional public browser prototype (V0.1). This is NOT a real AI inference engine, autonomous monitoring system, news feed, market price predictor, financial adviser or private database. No real user adoption, customer income or statistical prediction performance is asserted.

## What works now
- **Command Center** summarizes the operator's tracked signals, open forecasts, real resolved forecasts and due decisions.
- **Global Watch** captures owner-entered observations, the original source, publication date, implied effects and recheck triggers.
- **Forecast Lab** creates falsifiable binary forecasts with a deadline, disconfirming case, original probability estimate and objective resolution rule. The original record is locked. Resolved outcomes receive a deterministic Brier score.
- **Scenario Studio** computes a weighted impact from three entirely user-specified scenario weights and conditional impacts. These are illustrative assumptions, NOT model-generated odds.
- **Decision Desk** records hypotheses, Red Team counterarguments, options, follow-up actions and review dates.
- **Project Desk** captures priority and strategic execution checkpoints.
- **Agent Room** documents eight role specifications: CHIEF, WATCHTOWER, RED TEAM, TREASURY, BUILDER, SCOUT, CONCIERGE and ARCHIVIST. None of the roles currently perform autonomous tasks.
- **Settings & Data** stores local preferences and offers a JSON import/export backup.

## Getting started
1. Open the Pages dashboard and explore the clearly labeled fictional simulation.
2. Use **DEMO SANDBOX** in the top-right to switch to **LOCAL WORKSPACE**.
3. Manually add a real public-source observation, then formulate an outcome that can be objectively verified.
4. Record the countercase, evidence date, horizon and your personal probability assessment (if any).
5. Later resolve YES or NO with dated evidence and inspect historical forecast scores.
6. Export a copy of non-sensitive work if you want to keep it between browser resets.

## Strict privacy boundary
The GitHub repository and Pages source are public. The app does not have a private account or encrypted vault; manual user records are stored in your **browser's localStorage** and cannot automatically sync to another device. Do not enter confidential account credentials, customer details, private family records, medical data, sensitive holdings or API keys. A local JSON export is NOT encrypted or automatically backed up.

All fictional example records are explicitly marked simulation and excluded from real forecast calibration.

## Limits of probability and advice
This version stores human forecasts. It does NOT learn probabilities from current market data and does NOT retrieve live geopolitical events. A valid predictive engine requires legally sourced time series, explicit horizons, rolling-window out-of-sample backtesting, calibration, live source freshness and known model errors. The scenario arithmetic alone is not predictive performance.

## Development
Run a static server from the repository root: python3 -m http.server 8000
Then open http://localhost:8000. Requirements for testing: Node.js 20 or newer.
Run npm run check and npm test. GitHub Actions performs the same checks on commits.

## Documentation
- [Forecasting standard](docs/FORECASTING.md)
- [System architecture](docs/ARCHITECTURE.md)
- [Eight role contracts](docs/AGENTS.md)
- [Product and suite roadmap](docs/ROADMAP.md)
- [Privacy boundaries](docs/PRIVACY.md)
- [Commercialization and transfer plan](docs/COMMERCIALIZATION.md)

## Watchtower product family
This personal intelligence operating system is separate from [Watchtower AI / business opportunities](https://github.com/EgoShiftLabs/Watchtower-AI) and any future crypto-specific Watchtower. Each has its own mission, deployment and data boundary. Future suite features must require explicit user consent before transferring any information between products.

## 0.2 trust foundations
- New human-created forecasts include an original-field snapshot and local create/resolve event history. The interface blocks ordinary original edits and double resolution; **localStorage is editable by the device owner**, so this is not cryptographic immutability.
- Scored history displays the number of genuinely scored real records, overdue unresolved backlog, resolved-but-unscored records, mean Brier, and an explicitly labeled fixed 50% uninformed reference. That reference is not a tested event-specific baseline model.
- Signals and forecasts display self-reported source classification and freshness. This is not independent source verification.
- The [public intelligence feed](docs/PUBLIC_INTELLIGENCE.md) ships as an intentionally EMPTY, **unconfigured** JSON contract. A manual validation workflow exists; no EIA/FRED/news data is collected or modeled yet.
- Static HTML remains useful when scripts fail, and CI validates source syntax, rules and the data contract.

## Official public data pipeline (GitHub-only)

The repository now includes **a keyless GitHub Actions collector** for two real official sources: [U.S. Treasury FiscalData](https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny) and the [USGS M4.5+ past-day GeoJSON feed](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson). The workflow is configured to run twice daily (subject to GitHub Actions scheduling delays) and publish its validated, PUBLIC-only JSON snapshot. [Collector and verification details](docs/LIVE_SOURCES.md).

**Check the dashboard or raw `data/public-intel.json` for the last real retrieval timestamp and source status**. The existence of a workflow does not prove that a particular scheduled run has succeeded. If it fails, the previous data remains and eventually appears stale. No market prediction or real AI inference is performed by these feeds.

Oil-price / EIA series, current investment recommendations, user-specific financial advice, private data storage, autonomous geopolitical analysis and calibrated forecasts **remain future work**.

## V0.3 — Four intelligence integrations (November 17, 2026)

The existing repo now includes four integrated dashboard modules; each has an honest operating boundary:

1. **CHIEF Brief** — a rule-generated public evidence briefing from official indicators, plus an optional combined Markdown export with local decision reminders. Private user notes are assembled **only in the browser** and never pushed to GitHub Actions.
2. **Pattern Lab** — 140 official Treasury history observations per series (2 series) and one-step persistence/rolling-mean baseline MAE, return volatility and plotted trends. These are DESCRIPTIVE historical errors, not probabilities or investment advice.
3. **Energy Market Watch** — a tested **optional** EIA API v2 WTI spot-price adapter (server-side `EIA_API_KEY` in GitHub Actions secrets); status remains NEEDS_KEY until the secret is supplied and a live collection succeeds. A CSV import can be analyzed locally without a key (assumes date,value with positive USD/barrel values).
4. **Causal Map** — linked source-backed research templates plus user-created hypotheses with mechanisms and falsifiers. It does NOT infer causal relationships, generate AI conclusions or backfill facts.

**To activate EIA WTI:** register at https://www.eia.gov/opendata/register.php and set the secret named `EIA_API_KEY` at https://github.com/EgoShiftLabs/EgoShiftLabs-Watchtower-OS/settings/secrets/actions . The existing scheduled workflow attempts the oil-price adapter only when the secret exists; it never commits the secret. After a completed workflow, confirm `data/history.json` displays `energy.status = active` and a documented original observation date.

The current system is still a GitHub-hosted, publicly accessible prototype with browser-local, unencrypted user records. There is no secure login, real AI agent or validated predictive model. The static public CHIEF report is not a personalized AI recommendation.

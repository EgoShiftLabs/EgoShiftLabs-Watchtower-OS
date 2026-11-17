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

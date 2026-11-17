# Watchtower OS — Architecture

## Current system
Static GitHub Pages frontend: index.html, styles.css, app.js and original SVG logo. Pure deterministic data / scoring logic in core.js. Synthetic demonstrations in seed.js. Node unit tests, syntax checks and GitHub Actions deployment.

The state tree contains two separately selected workspaces: demo and live manual research. Both are local browser data, NOT an authenticated database. Users can export/import a 1 MB bounded JSON backup. No third-party API connections, telemetry, backend agents, market trades or account operations are configured.

## Modules
- Command Center: dynamic counts and review priorities.
- Global Watch: timestamped manual signals, original URL, source evidence, relevance, watch condition.
- Forecast Lab: immutable original binary forecast, deadline, human probability, objective rule, outcome resolution and scoring.
- Scenario Studio: deterministic three-outcome weighted arithmetic from explicit user assumptions.
- Decision Desk: thesis, Red Team objection, options, next review.
- Project Desk: local tasks and milestones.
- Agent Room: role definitions, inactive.
- Settings: local identity label, focus, navigation, workspace backup.

## Security assumptions
The GitHub repository and Pages code are PUBLIC. Browser localStorage is neither encrypted nor durable. Public source code is not a secret and cannot act as a protected user vault. Sensitive personal and business information must not be inserted into the codebase or demo. Static app has no authenticated user profile or API secrets. Backup files contain unencrypted JSON; store them carefully.

## Future architecture, not implemented
- Private authentication and access control.
- User-isolated encrypted database with versioned, time-stamped records.
- Approved public-source adapters / market-time-series ingestion with permissions and provenance.
- Server-side secret handling, rate limits, retry, deduplication and freshness rules.
- Separate asynchronous inference tasks with cost and time limits.
- Forecast revisions, outcome adjudication and audit records.
- Statistical model cards and tested calibration.
- Opt-in permissioned suite integrations, no implicit cross-app data sharing.
- Threat modeling, abuse testing, mobile accessibility and disaster recovery.

## Quality assurance
The current CI verifies syntax and pure forecasting/scenario rules. Browser-level tests on mobile hardware and screen-reader audits remain outstanding. Passing CI is NOT evidence of production cybersecurity, predictive accuracy or live connectivity.

## V0.2 public data architecture addendum

A GitHub Actions scheduled job fetches official US Treasury FiscalData and USGS recent quake GeoJSON, validates their source-specific structures and dates, and emits a strictly limited public-only JSON file. It commits a snapshot and independently deploys the updated Pages site. This is a backend-less **batch collection** architecture, not realtime server inference. User-entered data is never read by the collector.

There is no EIA/FRED market data integration, historical predictive model, user database, authenticated source data API, private store or independent research agent. See [LIVE_SOURCES.md](LIVE_SOURCES.md).

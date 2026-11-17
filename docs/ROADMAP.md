# Watchtower OS — Product development, validation and sale-readiness roadmap

## North star
Evidence-based event monitoring → causal analysis → accountable probabilistic forecasts → user-goal implications → structured decisions → outcomes and learning.

## Stage 0 — Public customizable prototype
- [x] No founder-specific history, personal finances or private account details in seeded code.
- [x] Responsive command center, manual global signal intake.
- [x] Falsifiable forecast journal and outcome resolver with Brier scoring.
- [x] Scenario weighting from explicit user assumptions (no invented machine odds).
- [x] Decision Desk, Project Desk, eight advisory role definitions.
- [x] Local workspace preferences, non-sensitive backup export/import and synthetic demo mode.
- [x] GitHub Pages deployment and Node-based core tests.
- [ ] Independent browser QA, iPhone UI testing, accessibility and backup corruption tests.
- [ ] Better accountless onboarding, accessible forecast explanation and progressive enhancement.

## Stage 1 — Prove forecasting UX and decision utility
- [ ] Record 15–20 REAL, timestamped signals from attributable sources.
- [ ] Publish 20 specific binary personal research hypotheses with deadlines and resolution rules.
- [ ] Accumulate outcomes before implying model skill.
- [ ] Test with at least five users across different decision archetypes; obtain consent before storing user feedback.
- [ ] Measure task completion time, source verification errors and understanding of uncertainty.
- [ ] Add immutable history of forecast updates and corrections.

## Stage 2 — Secure synchronized product
- [ ] Implement user authentication, encrypted user data and per-user access controls.
- [ ] Create read-only, permissioned feeds for official economic/energy data and licensed market data.
- [ ] Separate real observation timestamps from publish/access timestamps; show freshness.
- [ ] Add account recovery, deletion/export and private incident response.
- [ ] Add a bounded weekly briefing worker, opt-in notifications and retention policies.

## Stage 3 — Actual predictive capabilities
- [ ] Legally assemble historical datasets with traceable time-availability.
- [ ] Establish naïve and market-implied baselines; walk-forward out-of-sample test each candidate model.
- [ ] Calibration, scoring, error bands and model cards before showing algorithmic probabilities.
- [ ] Cross-domain influence graph with explicit, testable causal hypotheses.
- [ ] Risk and decision preferences integrated without automated financial trades.
- [ ] Red Team and independent outcome adjudication roles with transparent logs.

## Stage 4 — Commercial launch & suite
- [ ] Select ideal user segment from interviews, paying demand and retention.
- [ ] Establish privacy policy, terms, support expectations and allowed data use.
- [ ] Consider subscription, licensed forecasting SDK, niche research-team deployment or enterprise module.
- [ ] Keep Watchtower Business and future Crypto Watchtower as independently operated applications and data stores.
- [ ] Add optional, per-source permissioned cross-product export; no automatic sharing.
- [ ] Confirm developer IP assignments, trademark availability, third-party licenses and buyer handover package.
- [ ] Evaluate commercial sale only after real buyer interest or credible comparable transactions.

## Core risk register
1. Source manipulation or stale feeds.
2. False confidence from uncalibrated or manually guessed numbers.
3. Selective outcome resolution, hindsight revision and cherry-picked accuracy.
4. Sensitive personal data in a static public deployment.
5. Biased hypothetical investment advice.
6. User time spent building software rather than validating its utility.
7. Shared suite integrations leaking records across apps.

## Definition of success
Not the number of dashboard cards. Demonstrate objectively improved user decisions and forecast calibration relative to transparent baselines, trustworthy privacy, paid willingness to use the product, and repeatable outcomes.

## V0.2 — Trust and operational foundations (implemented in source; validate runtime)
- [x] Original forecast field snapshots and application-level append-only created/resolved event history.
- [x] Preserve past-deadline open backlog, exclude unsourced legacy/tampered records from scored calibration.
- [x] Report sample count, mean Brier and a **fixed 50% uninformed reference** on exactly the same scored events; do not mistake it for a market/base-rate forecast.
- [x] Label source classification as **self-reported** and show freshness; do not imply independent source authentication.
- [x] Static no-JavaScript fallback and explicit limitations.
- [x] Versioned, empty public-feed JSON contract and schema validation; manual workflow can verify structure.
- [ ] Real authorized EIA/FRED or other data ingestion; NO connector is currently activated.
- [ ] Independent browser-level keyboard/mobile tests, real file-import round-trips and screen-reader QA.
- [ ] Server-backed tamper-evident log if regulatory-grade audit is later required. Browser localStorage and JSON cannot prove authenticity.

### Next proof: demonstrate actual value, not forecasting theater
- [ ] Record 20 real, externally sourced, dated forecasts with objective outcome rules; separately score resolved outcomes.
- [ ] Investigate overdue unresolved forecasts and selective-reporting incentives.
- [ ] Evaluate a single *named* historical public-data series as a baseline after verifying provider terms; publish observation and retrieval dates.
- [ ] Add decision-to-forecast linkage and measure user time saved and demonstrated correction of mistakes.
- [ ] Compare simple baseline models with the same outcome labels; report sample size and uncertainty.
- [ ] Keep Watchtower Business and future Crypto Watchtower independent; suite integrations require explicit permission.

**Known limitation:** Local browser logs cannot be made truly append-only for a user who edits localStorage or exported JSON. This release prevents ordinary UI rewriting and highlights inconsistent original snapshots; it is not a cryptographic audit system.

## Immediate next milestone — official-source pipeline and defensible analytics

- [x] Add two keyless, original, officially published sources (Treasury public debt outstanding and USGS recent earthquakes).
- [x] Implement source-specific normalizers, date sanity checks, strict public JSON schema, and failure-safe collection.
- [x] Add twice-daily scheduled GitHub Actions job and on-demand run; generated public files are deployed to Pages when the collector succeeds.
- [x] Display official observation date, retrieval age, descriptive period change and source attribution.
- [ ] Confirm successful publishing and live dashboard values against sources after initial Actions run.
- [ ] Add 20–60 observations of *one comparable time series*, rather than joining unrelated latest observations into a fabricated forecast.
- [ ] Implement simple persistence and moving-average baseline with rolling-window out-of-sample error measurements.
- [ ] Verify legally accessible EIA oil data and correct licensing/attribution before adding a source-specific energy adapter.
- [ ] Add a concise weekly public-data digest with explicit source freshness, no probabilistic forecasts until backtested.

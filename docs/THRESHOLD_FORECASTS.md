# Watchtower OS — Source-linked Threshold Forecast Loop

## What it is
An accountable **browser-local binary forecast** anchored to an actual dated numeric series published by Watchtower's GitHub Actions data collector. It closes part of Observe → Forecast → Learn without inventing model probabilities, scraping news, or sharing user records with the public repository.

## Current providers
- **U.S. Treasury FiscalData** (two dated debt-stock series, latest 140 points). These are NOT market yields or predictors of stock prices.
- **EIA WTI crude-oil spot price** after an owner installs the private GitHub Actions \`EIA_API_KEY\`, the source collector succeeds, and the series status explicitly reads ACTIVE. No energy-market probability is available now.
- Manually imported CSV is deliberately NOT eligible for official-source threshold forecasts because its provenance is unverified.

## User workflow
1. Open **Forecast Lab → Source-linked forecast**. The series must have a successfully retrieved public history snapshot within 72 hours and an observation from the last 14 days.
2. Select a series, a threshold and comparison (above / at or above / below / at or below), and a future date **within 90 days**. Suggested numerical thresholds are **illustrative UI shortcuts**, not recommendations or model-derived odds.
3. Enter an optional subjective probability, rationale and falsifier. Save. The original dated observed value, source URL, threshold, subjective estimate, deadline and deterministic persistence YES/NO comparison are preserved together in the local original record.
4. Outcome rule, fixed at creation: use the **first recorded official observation on or after the target date, within seven calendar days**. No changing the outcome observation to make the prediction look accurate.
5. Before the deadline, the system will not settle either YES or NO for these fixed-date questions.
6. When the original-source history has the eligible observation, the user must inspect the source and confirm before locking the rule-derived outcome. If the source is missing for the seven-day period, the forecast remains unresolved and must not be silently assigned NO.
7. A self-reported probability (if present) can receive a **Brier score**. Separately, the fixed persistence comparison is marked correct/incorrect. Persistence produces a deterministic YES/NO call, **not a calibrated event probability**.

The combined CHIEF Brief shows locally due and overdue forecasts but these never leave the browser. Decisions can be linked to an existing forecast ID for review.

## Evidence, limitation and integrity
- All human input and linked forecast records remain in the browser's unencrypted \`localStorage\`. Exported JSON is also unencrypted.
- The original source snapshot is **application-locked**, with a copied original state and local event trail. It is **not cryptographically immutable** and can be rewritten by someone editing localStorage or the exported file.
- Public data snapshots may be delayed; always read observation date AND retrieval date/source lag.
- The mechanical persistence comparison uses the **original value** held constant. It does not learn from geopolitical conditions, build distributions, or create probabilities. Human Brier and persistence hit rate are different metrics, not numerically interchangeable.
- This is an educational and research prototype, not investment advice, a verified predictive model, or automated trading.
- If a forecast date is far in the past and the rolling published history no longer covers it, the record may require human adjudication using an attributable primary source.

## Tests
- Pure deterministic tests: \`tests/thresholds.test.js\`, \`tests/core.test.js\`.
- Headless browser: \`tests/threshold-browser.mjs\` uses a **test-only in-memory future observation** to check creation, fixed-date pending behavior, locking an outcome, Brier scoring and persistence comparison. **No fabricated future observation is published in the repository's real data files.**
- General regression: \`tests/browser-smoke.mjs\`, desktop + mobile-size screens.

## Next acceptance gates
- Expand tests for malformed/tampered bound-record imports, decision-to-forecast reference integrity, timezone boundaries and missing historical observations.
- Run a physical iPhone accessibility/keyboard audit; browser viewport tests do not replace it.
- Verify source-data rights and authentication before activating EIA price series or future inventories.
- For actual predictive statistical models, develop separately trained/validated baselines, rolling out-of-sample evaluation, and model cards first.

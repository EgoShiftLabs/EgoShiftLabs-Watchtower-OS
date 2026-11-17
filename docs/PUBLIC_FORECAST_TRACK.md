# Watchtower OS — Public Forecast Track Record

## Status
**Operating public research cohort**, separate from the user's private local Forecast Lab. Its first real precommitted questions were created by the official-source GitHub Actions pipeline on November 17, 2026. There are no known future outcomes at the moment a question is created.

The ledger lives in \`data/public-forecast-track.json\`. Its readable summary lives in \`data/public-forecast-summary.json\` and appears in **Forecast Lab → Public baseline forecast track record**.

## Purpose
Begin accumulating real, timestamped, independently checkable questions **before** future outcomes are known. Measure simple mechanical baselines honestly against original public observations. This is a **research process** and a test of prospective recordkeeping, not proof of predictive skill.

No human guesses, founder-specific notes, personal financial positions, credentials, or private user records enter the public track. Personal forecasts continue to live only in each user's browser.

## Precommitment policy — weekly-two-horizons-v1
Every successful official-source pipeline update checks whether that calendar week's questions already exist and creates no duplicates.

For each eligible, fresh official series:
- A **7-calendar-day** question: will the first official reading on or after the target date be **at least the last published value**?
- A **14-calendar-day** question: will the first eligible reading be **at least 0.1% above the last published value**?

Eligibility: valid official-source series, current successful retrieval (within 72 hours), and original observation reasonably fresh (within 10 calendar days). Current data includes two U.S. Treasury debt-stock series. The EIA WTI series becomes eligible **only after** a correct EIA_API_KEY is configured, an original API retrieval succeeds, and its status is explicitly ACTIVE.

Thresholds come from a **fixed public mechanical rule**, not from post-hoc price selection or subjective investment judgment. The two Treasury series are economically related, and different horizons overlap. **Question count is not an independent statistical sample**.

## At issue time, save permanently
- Source URL, source name, fetched timestamp.
- Original observation date and numeric value, unit and exact series ID.
- Exact target, comparison and seven-day observation-window resolution rule.
- Baseline YES/NO calls:
  - **Persistence:** keep the last published value unchanged.
  - **Trailing mean:** keep the mean of the prior seven observations unchanged.
- Human-written forecast probability: **none**.
- Forecast issue time and policy version.

Records are committed to Git history, making ordinary revisions inspectable by comparing commits. This is not a cryptographically guaranteed independent timestamp; repository owners may rewrite Git history. Stronger proof requires signed independent timestamps, branch protection and an independent witness.

## Future outcome and scoring
On each future official update, Watchtower checks the **first actual original-source observation on or after the target date**, within seven calendar days. If found, it records the observed date/value, derived YES/NO, resolution timestamp and whether each original baseline call was right.

If no eligible observation exists after the seven-day window, label **UNRESOLVED / MISSING DATA**, not a convenient NO. Preserve the original record and its missing-data status. No user should silently change the threshold or choose a later observation because it suits their narrative.

Accuracy in the report is a **simple fraction of correctly classified resolved questions**. The two mechanical predictions are not probabilistic; **there is no Brier score here**. Separately, actual personal human-probability forecasts in the local Forecast Lab may be Brier-scored. Do not compare human Brier with mechanical binary hit rate as if they were the same metric.

## Current limitations and responsible interpretation
- First real outcomes are necessarily in the future; the project cannot claim successful prediction before data arrive.
- We do not claim a profitable trading strategy, geopolitical inference, model-calibrated probabilities, statistically significant forecasting skill or better decisions.
- Only 2 related Treasury series are live as of the first cohort. Treasury debt stock is a poor stand-alone indicator for oil equity prices. Diversify into defensible energy research only after an official EIA feed is verified.
- A first cohort has only four overlapping questions. No performance conclusion should follow from a handful of correlated outcomes.
- The static site has no independent secure backend for user data.

## Technical operation
- Pure experiment logic: \`scripts/public-forecast-track.mjs\`
- Actual source ingest: \`scripts/collect-official.mjs\`
- Track update: \`scripts/update-public-track.mjs\`
- Output and tamper/error guards: \`scripts/check-public-track.mjs\`
- GitHub workflow: \`.github/workflows/live-intel.yml\` (twice daily plus on code changes, with possible scheduling delay)
- Fixtures/tests: \`tests/public-forecast-track.test.js\` — synthetic future observations ONLY inside regression tests; never in published data
- Dashboard view: Forecast Lab's **Public baseline forecast track record** panel

The collector is fail-closed on mandatory source errors, and the registered track isn't rewritten with guessed outcomes if official data is missing. Review the GitHub Actions logs and changes to the original ledger for each publication.

## Next scientific milestones
1. Collect actual outcomes and **report denominator, missing-data rate and correlated-series limitation**.
2. Examine failures and ensure missing records are not selectively hidden.
3. Offer optional human probability entry locally against identical source-linked questions, without publishing user data.
4. Compare against legitimate probability-generating baseline models only once they have out-of-sample validation and a model card.
5. Expand to oil price, inventory and supply series when legal, documented, verified official data is live.

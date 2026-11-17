# Watchtower OS — Public intelligence feed contract

**Pipeline update:** A verified-schema collector and scheduled GitHub Actions workflow for official Treasury debt and USGS earthquake data have now been committed. The feed's **actual** status and timestamp in `data/public-intel.json` indicate whether collection and publication succeeded; do not infer live data merely from code presence. EIA, FRED, news feeds and market API connections remain unconfigured.

## Intended architecture

1. Use GitHub Actions to collect a carefully selected, authorized public dataset only after checking official API documentation, attribution, permitted redistribution, rate limits and freshness.
2. Store API secrets only as GitHub Actions secrets, never in front-end JavaScript.
3. Validate dates, original source URLs, units, values and observations. Abort on source failures instead of claiming success.
4. Generate PUBLIC, sanitized JSON at data/public-intel.json and version the retrieval time.
5. Have GitHub Pages display retrieval time and observation date separately, with aging/staleness warnings.
6. Add descriptive changes and simple moving-average baselines only after reliable historical series are available.
7. Add evaluated statistical probabilities only after out-of-sample tests and calibration. The current forecast register accepts HUMAN subjective odds only.

## JSON fields

Schema: watchtower-public-intel-v1. Status: unconfigured, active, or stale. RetrievedAt: ISO UTC timestamp or null. Observations: an array of at most 60 public indicators. Each observation requires id, label, sourceName, HTTPS sourceUrl, observationDate, numeric value, and unit. Optional public fields: previousValue, changePct, retrievedAt and indicator.

No personally identifiable information, API keys, wallet records, unpublished research, sensitive account numbers, customer data, private forecasts or financial positions may be committed to this file.

The manual GitHub workflow only checks that this schema is valid. A scheduled collector does not exist yet; adding a schedule to an empty placeholder would produce noise rather than intelligence.

## Future source priorities (verify current API terms first)

- Public energy series: EIA.
- Public macro time series: FRED, including necessary attribution and third-party series restrictions.
- Labor and price releases: BLS.
- Weather or resilience data: NOAA.
- Other documented public international indicators as needed.

## Data interpretation

A fresh download of an older observation is not a fresh reading. A significant change is not automatically a reliable forecast. A commodity benchmark is not an equity price forecast. Any probabilistic claims need a named, tested model, known horizon, appropriate baseline and error measurement.

## Current live-source adapter and status verification

The [official-source collector](../scripts/collect-official.mjs) fetches two keyless official US data sources, parses them with source-specific validation, and emits only public numeric observations. The [scheduled workflow](../.github/workflows/live-intel.yml) runs at 04:17 and 16:17 UTC plus manual dispatch, can be delayed by GitHub, and aborts on invalid/failed source responses. It retries concurrent branch updates before publishing. The validator rejects unknown fields to minimize accidentally publishing user records.

Detailed sources and semantics: [LIVE_SOURCES.md](LIVE_SOURCES.md).

**Live means a recent documented retrieval**, not continuous monitoring. Treasury debt stocks are not Treasury yield quotations, and USGS quake counts are not generalized geopolitical predictors. The static dashboard displays source observation age independently from last retrieval age. 

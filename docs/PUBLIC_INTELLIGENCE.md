# Watchtower OS — Public intelligence feed contract

**CURRENT STATUS: UNCONFIGURED.** An empty JSON feed and a manual validation workflow exist. No external news, EIA, FRED, or market API is presently connected.

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

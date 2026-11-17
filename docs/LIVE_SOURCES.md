# Live official sources — Watchtower OS

## Current adapter design

Watchtower can use GitHub Actions as a small scheduled public-data processor. We have implemented adapters for TWO independent official U.S. government sources. This is a real data collector, not a paid AI inference service or a price-prediction model.

- **U.S. Treasury FiscalData, Debt to the Penny:** latest two published observations of total federal public debt outstanding and debt held by the public. Values are shown in USD **trillions**; percentage change is between consecutive published observations, not an annual growth rate or a market interest-rate signal. Source: https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny
- **U.S. Geological Survey (USGS), earthquakes M4.5+ past day:** magnitude 4.5+ event count and highest reported magnitude from the rolling 24-hour GeoJSON feed. Source: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson

No API key is needed for these two public feeds. Collection is scheduled TWICE daily (04:17 and 16:17 UTC); it can be delayed by GitHub Actions and source providers. Data is not real-time to the second.

## How it works

1. `.github/workflows/live-intel.yml` invokes `node scripts/collect-official.mjs` on its schedule, on manual dispatch, and when related collector source code changes.
2. The script retrieves official JSON with timeouts and retries. Both providers must succeed, or the run fails without overwriting the previous feed.
3. `scripts/official-normalizers.mjs` validates original dates, numbers and expected source structures; normalizes to a tightly bounded public data structure.
4. `scripts/public-intel-schema.mjs` rejects missing/unexpected observation fields.
5. The workflow commits only `data/public-intel.json` using the GitHub Actions token; it does not collect or publish personal research records.
6. The same workflow deploys an updated static artifact to GitHub Pages. The dashboard reads it and shows source, value, observation date and retrieval freshness.

## Important limitations

The source feeds are descriptive. Recent earthquakes do not imply geopolitical events, specific disaster consequences, or financial moves. Treasury debt outstanding is **not** a current market interest yield. A successful data fetch is not evidence of superior forecasting or a causal relationship between unrelated indicators.

The dashboard will remain **UNCONFIGURED** until the first successful collector workflow and published snapshot. Failed source calls retain the previous valid file and the UI should eventually indicate staleness; a missing snapshot is not silently replaced with synthetic samples.

The collector uses no secrets, but any future EIA or FRED integration must follow the provider's official terms, citation requirements and redistribution rights before activation. Those integrations are **not yet implemented**.

## How to verify

- GitHub Actions → **Refresh official public intelligence**, confirm the run and test steps.
- Inspect `data/public-intel.json` for `status: active`, current `retrievedAt`, public source links and plausible observation dates.
- Open Pages → Global Watch → Public intelligence spine. Compare displayed values with original source links.
- Check that a simulated HTTP failure does not replace the last good snapshot.

### Next engineering work

- Visible per-observation age, not only feed retrieval age.
- Time-series history for trend lines, descriptive change statistics and baseline forecasts.
- EIA oil indicators after access and terms are verified.
- Model selection, historical backtests and calibration only after reliable historical data exists.

## V0.3 — Historical baseline and energy extensions

The same GitHub Actions collector now obtains **up to 140 official Treasury debt observations** as a public dated history, published at `data/history.json`. The public CHIEF brief at `data/chief-public-brief.json` is generated deterministically from original observations with attribution. It intentionally never contains local decisions or user preferences.

The optional EIA WTI endpoint uses **API v2**: `https://api.eia.gov/v2/petroleum/pri/spt/data/`, `frequency=daily`, `data[0]=value`, `facets[series][]=RWTC`, newest 140 rows. This is only called if the encrypted `EIA_API_KEY` GitHub Actions secret is configured. See https://www.eia.gov/opendata/documentation.php and EIA's public reuse policy https://www.eia.gov/about/copyrights_reuse.php. Data receives source attribution; it cannot be modified and still called official EIA data.

New historical calculations in the browser include previous-observation change, 7-observation arithmetic mean, recent percentage-change volatility, and one-step walk-forward MAE for persistence and rolling means. These evaluate **past observations**, not forecast probabilities. Treasury public debt is a debt stock and not an interest-rate yield. The historical assessment is specific to the source's frequency and does not establish a causal relationship to markets.

The integrated **Causal Map** uses curated original EIA background references and optional user-entered, falsifiable links. The graph illustrates hypotheses, not software-verified event causation.

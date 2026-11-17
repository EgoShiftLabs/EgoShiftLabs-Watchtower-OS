# Watchtower OS — Forecasting and evidence standard

## Purpose
Watchtower is intended to connect external evidence, causal hypotheses and user-specific decisions while holding its own predictions accountable. Attractive narratives are not probability estimates.

## A valid binary forecast record
- An unambiguous, answerable YES or NO question.
- The target outcome, units, region or benchmark as appropriate.
- A closing date and precise observation / settlement convention.
- An objective resolution rule written BEFORE outcomes are observed.
- A user-entered prior probability, explicitly distinguished from model-calibrated probability.
- Dated, attributable sources and evidence reviewed when the forecast was created.
- A counterargument, falsifier and alternative outcome.
- A separately timestamped final outcome with supporting evidence.

In V0.1, original forecasts are immutable after creation. Users should create a **new** forecast if they want to update a position. An immutable historical revision ledger with cryptographic provenance is planned.

## Oil / energy market example
An appropriately testable question: "Will a specific crude benchmark settle above an explicitly stated price in USD/barrel on a specified date, according to the named exchange's final settlement data?"

Research questions: upstream supply, transport bottlenecks, inventory levels, OPEC policy, global consumption, futures term structure, dollar movements, monetary conditions, volatility and the link between commodity prices and any named energy stock.

A crude price increase does not imply any particular share price rises. Equity outcomes also depend on valuation, balance-sheet leverage, hedges, refining vs upstream margins, taxes and market pricing of the scenario.

The Scenario Studio requires user-specified weights summing to 100 and hypothetical conditional impacts. The weighted result is ARITHMETIC, not an evidence-calibrated forecast. Default weights are intentionally blank.

## Evidence classification
1. Primary record: raw official release, exchange settlement, original public record.
2. Secondary reporting: attributable reporting with reliable citation to underlying source.
3. Analysis: interpretation, market commentary, thesis.
4. Unverified: rumor or unsupported assertions.
5. Fictional example: teaching material with no evidentiary value.

Dates matter. Distinguish event date, publication date, research access date, forecast creation date and outcome date.

## Historical scoring
Brier score = (forecast probability on a 0–1 scale minus the binary observed result)^2.
Lower mean Brier indicates better performance for the evaluated sample, but does NOT establish superior skill without an appropriate benchmark, sufficient sample size and uncertainty intervals. Synthetic records must never count toward real calibration.

A NO outcome should only resolve after the event deadline, whereas a YES can resolve as soon as objective occurrence is confirmed. Early outcomes need real evidence. Scoring is not a substitute for independent adjudication.

## Roadmap for legitimate algorithmic forecasting
- Legally obtained historical datasets and time-accurate feature availability.
- Baseline models (base rate, persistence, market-implied odds where meaningful).
- Strict training versus validation separation and walk-forward out-of-sample evaluation.
- Repeated backtesting across regimes and crisis/stress cases.
- Calibration charts, Brier score, log loss, sample sizes and confidence intervals.
- Documentation of false positives, missing data, latency, selection bias and drift.
- Cross-domain causal models with explicit assumptions and falsifiable predictions.
- Forecast revision log, independent outcome review and audit events.

## No misleading claims
The V0.1 site contains no live forecasts, no tested model, no current news ingestion, no profit predictions and no executed financial transactions. Recommendations are future functionality and should be presented as alternatives and implications, not as guaranteed investment decisions.

## Local integrity controls added in version 0.2
New records store their original question, deadline, probability, resolution rule, falsifier, evidence and source references separately from final outcomes. The normal UI cannot edit originals or overwrite a resolved outcome. A local event history records creation and resolution. Inconsistent data imported into the app can be rejected.

These are **application-level defenses only**. A person with access to their own browser storage or a JSON backup can rewrite all values and associated history; neither localStorage nor an unsigned export can prove true historical provenance. Real tamper-evidence requires a trusted timestamped external ledger, signed entries, or another independent witness.

Resolved forecasts without a compatible original snapshot/history are excluded from the audit-ready scored count. The fixed 50% Brier reference of 0.250 is an intentionally weak comparison for all binary events, NOT a calibrated baseline for the event family or a claim of superior performance.

## Source-linked threshold forecasts — version 0.4
For objective number-based outcomes, Watchtower can now bind the original human question to a particular public indicator, numeric threshold, date, dated source observation and original persistence comparison. The fixed settlement convention is the first observed source value ON OR AFTER the target date within seven calendar days. This is not a live statistical probability engine.

The outcome is user-confirmed against the published source, and the human-estimated Brier score is distinct from the deterministic persistence YES/NO correctness. Missing data stays unresolved rather than silently scoring NO. See [THRESHOLD_FORECASTS.md](THRESHOLD_FORECASTS.md).

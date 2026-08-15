# Changelog

All notable changes to CsvMod.

## [1.0.0] — 2026-08-15

### Added
- Embeddable `<csvmod-importer>` web component (Shadow DOM, single script tag).
- Web Worker RFC-4180 CSV parser with delimiter / encoding / header-row sniffing.
- Virtualized 60fps review grid with in-cell validation, tooltips, Valid/Errors filters.
- Duplicate handling strategies: `reject`, `keep-first`, `overwrite`.
- DeepSeek AI zero-shot schema mapping with confidence indicators; deterministic local fallback when unconfigured.
- One-click "AI Fix Common Errors" with heuristic repair fallback.
- 4-step wizard: Upload & sniff → Smart mapping → Review grid → Ingestion (progress ring, webhook POST, `csvmod-complete` event).
- SDK: `new CSVMod({...})` with `schema`, `webhookUrl`, `onComplete`, `templates`, `brand`, `theme`.
- Template presets on the upload step.
- Marketing site: landing page with live demo + 100k-row performance test, docs, pricing.

### Fixed
- Webhook now POSTs the full result object (`validRows`, `rejected`, `total`, `meta`) instead of a bare array.
- Done screen rejected count rendered as NaN when stats used the wrong field.
- Focus trap now works inside the shadow DOM (`getRootNode().activeElement`).
- Privacy badge is always visible; tooltip reflects whether AI calls are enabled.

### Tested
- 134/134 Playwright browser tests green (wizard, edges, API, DnD, perf, a11y, features).

## [0.9.0] — 2026-08-01

### Added
- Initial proof-of-concept: single-file embed, heuristic auto-map, basic review grid.

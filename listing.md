# For Sale: csvmod.com — working embeddable CSV importer product

**What's for sale:** The domain, the brand, a fully working and tested SDK, and the deployed marketing site (currently live at csvmod.com with HTTPS).

## The name

**csvmod.com** — 6 letters, no hyphens/numbers, `.com`, category-defining ("CSV" + "mod"). Registered Dec 2025, unlocked and transfer-ready (Hostinger registrar, expires Dec 2026 — renewal covered in sale).

## The product (works today, not vaporware)

- `<csvmod-importer>` web component in Shadow DOM — zero CSS leakage, one `<script>` tag embed
- Web Worker RFC-4180 parser: delimiter/encoding/header sniffing, 100k+ rows without blocking the main thread
- Virtualized 60fps review grid: in-cell validation, hover tooltips, duplicate handling (reject/keep-first/overwrite), Valid/Errors filters
- DeepSeek AI orchestration: zero-shot column mapping with confidence indicators + one-click "AI Fix Common Errors" — with a deterministic local fallback so it works even with no API key
- 4-step UX: Upload & sniff → Smart mapping → Review grid → Ingestion with progress ring, webhook POST and `csvmod-complete` event
- `new CSVMod({...})` SDK API, landing page with live demo including a "generate 100k rows" performance test, docs page, pricing page
- Batch/OpenClaw server-side runner stub included in the repo

## Proof it works

134/134 automated browser tests pass; live demo at csvmod.com; parse + AI mapping verified in production on the deployed site.

## Why it's worth more than the domain

The hard 80% of a startup is done — a working demo is the #1 seller for developer tools. Revenue model is validated (Flatfile raised $115M on this exact pattern; OneSchema, importOK, CSVbox prove demand).

## What the buyer gets

Domain transfer, full repo + docs, deployed site (transfer VPS at cost or take the code), and a live demo they can evaluate before purchase.

## Ask

**$9,500 OBO.** Escrow-only transfer. Serious inquiries only.

## Buyer roadmap (already documented in the PRD)

- Excel (.xlsx) ingestion, un-pivot transforms, inline cell editing
- npm package + build pipeline (minification, CI)
- Usage metering backend (Stripe per-row billing)
- OpenClaw managed batch service as a second product line

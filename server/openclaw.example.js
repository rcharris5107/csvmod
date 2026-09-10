/**
 * CsvMod · OpenClaw batch runner (server-side) — example
 * ----------------------------------------------------------------------------
 * Consumes the same schema as the browser embed and runs scheduled/long-running
 * cleaning jobs (nightly de-dupe, normalization sweeps, failed-webhook replays).
 *
 * Run:  node server/openclaw.example.js  (or wire into your job scheduler)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const JOB = {
  name: 'nightly-dedupe-users',
  schedule: '0 3 * * *', // 3am daily
  inputDir: path.join(__dirname, 'in'),
  outputDir: path.join(__dirname, 'out'),
  // Mirrors the embed's schema so validation behavior is identical everywhere.
  schema: {
    fields: [
      { key: 'full_name', label: 'Full Name', required: true },
      { key: 'email', label: 'Email Address', required: true, type: 'email' },
      { key: 'role', label: 'Role', type: 'select', options: ['Admin', 'Member'] },
      { key: 'id', label: 'ID', type: 'unique' }
    ]
  }
};

function parseCSV(text, delim = ',') {
  const rows = [];
  let row = [], cell = '', i = 0, inQ = false;
  while (i < text.length) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i += 2; continue; }
      if (c === '"') { inQ = false; i++; continue; }
      cell += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === delim) { row.push(cell); cell = ''; i++; continue; }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      rows.push(row); row = [];
      i++; continue;
    }
    cell += c; i++;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ''));
}

function run() {
  if (!fs.existsSync(JOB.inputDir)) fs.mkdirSync(JOB.inputDir, { recursive: true });
  if (!fs.existsSync(JOB.outputDir)) fs.mkdirSync(JOB.outputDir, { recursive: true });

  const files = fs.readdirSync(JOB.inputDir).filter((f) => f.endsWith('.csv'));
  for (const file of files) {
    const raw = parseCSV(fs.readFileSync(path.join(JOB.inputDir, file), 'utf8'));
    const headers = raw[0];
    const rows = raw.slice(1);
    const fields = JOB.schema.fields;

    // column mapping (same fuzzy rules as the embed)
    const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
    const map = {};
    for (const f of fields) {
      const i = headers.findIndex((h) => norm(h) === norm(f.label || f.key));
      if (i !== -1) map[f.key] = i;
    }

    const clean = [];
    const seen = new Set();
    for (const r of rows) {
      const obj = {};
      for (const f of fields) {
        const i = map[f.key];
        let v = i === undefined ? '' : String(r[i] || '').trim();
        if (f.type === 'email') v = v.toLowerCase().replace(/\s+/g, '');
        if (f.type === 'unique' && v && seen.has(v)) v = ''; // de-dupe
        if (v) seen.add(String(v).toLowerCase());
        obj[f.key] = v;
      }
      if (obj[fields.find((f) => f.required).key]) clean.push(obj);
    }

    fs.writeFileSync(path.join(JOB.outputDir, file.replace('.csv', '.clean.json')),
      JSON.stringify({ rows: clean, meta: { job: JOB.name, inputRows: rows.length } }, null, 2));
    console.log(`[openclaw] ${file}: ${rows.length} rows → ${clean.length} clean`);
  }
}

if (require.main === module) run();
module.exports = { run, JOB };

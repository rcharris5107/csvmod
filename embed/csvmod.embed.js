/* ============================================================================
 * CsvMod · Embeddable CSV Importer  v0.2.0
 * Single-file embed. Web Component `<csvmod-importer>` + SDK.
 *
 * Usage:
 *   <script src="csvmod.embed.js"></script>
 *   <csvmod-importer license-key="pk_live_..." theme="auto"></csvmod-importer>
 *   <script>
 *     const importer = document.querySelector('csvmod-importer');
 *     importer.schema = { fields: [...] };
 *     importer.onComplete = async (data) => { ... };
 *     importer.open();
 *   </script>
 *
 * Or via the lazy-loading SDK class:
 *   const importer = new CSVMod({ el: '#target', licenseKey, schema, onComplete });
 * ----------------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  /* --------------------------------------------------------------------------
   * 1) SHADOW STYLES  (inlined, so the single file is fully self-contained)
   * ------------------------------------------------------------------------ */
  var CSS = [
    ':host { --cm-bg:#fff; --cm-panel:#f6f8fa; --cm-border:#d0d7de; --cm-text:#1f2328; --cm-mut:#57606a;',
    '  --cm-accent:#0969da; --cm-accent-2:#054da8; --cm-ok:#1a7f37; --cm-err:#cf222e; --cm-err-bg:#fff1f0;',
    '  --cm-amber:#9a6700; --cm-amber-bg:#fff8c5; --cm-radius:10px; --cm-font:inherit;',
    '  all:initial; display:block; font-family:var(--cm-font), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
    ':host([data-cm-theme="dark"]) { --cm-bg:#161b22; --cm-panel:#0d1117; --cm-border:#30363d; --cm-text:#e6edf3;',
    '  --cm-mut:#8b949e; --cm-err-bg:#3d1d24; --cm-amber-bg:#3a2e14; }',
    '* { box-sizing:border-box; }',
    '.cm-overlay { position:fixed; inset:0; background:rgba(13,17,23,.55); backdrop-filter:blur(3px);',
    '  display:none; align-items:flex-start; justify-content:center; padding:4vh 16px; z-index:99999; }',
    '.cm-overlay.cm-open { display:flex; }',
    '.cm-card { width:100%; max-width:960px; max-height:92vh; overflow:auto; background:var(--cm-bg); color:var(--cm-text);',
    '  border:1px solid var(--cm-border); border-radius:14px; box-shadow:0 24px 60px rgba(0,0,0,.35); padding:20px 22px; }',
    '.cm-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }',
    '.cm-brand { font-weight:700; font-size:16px; letter-spacing:.2px; }',
    '.cm-brand b { color:var(--cm-accent); }',
    '.cm-close { border:0; background:var(--cm-panel); color:var(--cm-mut); border-radius:8px; width:30px; height:30px;',
    '  cursor:pointer; font-size:15px; }',
    '.cm-close:hover { color:var(--cm-text); }',
    '.cm-steps { display:flex; gap:4px; margin-bottom:16px; }',
    '.cm-step { flex:1; text-align:center; font-size:12px; color:var(--cm-mut); padding:6px 4px; border-radius:8px;',
    '  border:1px solid var(--cm-border); background:var(--cm-panel); }',
    '.cm-step.cm-on { color:var(--cm-accent); border-color:var(--cm-accent); background:transparent; font-weight:600; }',
    '.cm-step.cm-done { color:var(--cm-ok); }',
    '.cm-panel { display:none; } .cm-panel.cm-on { display:block; }',
    '.cm-actions { display:flex; justify-content:space-between; align-items:center; margin-top:18px; gap:10px; }',
    '.cm-btn { border:0; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer;',
    '  background:var(--cm-panel); color:var(--cm-text); border:1px solid var(--cm-border); }',
    '.cm-btn-primary { background:var(--cm-accent); color:#fff; border-color:var(--cm-accent); }',
    '.cm-btn-primary:hover { background:var(--cm-accent-2); }',
    '.cm-btn:disabled { opacity:.45; cursor:not-allowed; }',
    '.cm-btn .cm-spin { display:inline-block; width:12px; height:12px; border:2px solid rgba(255,255,255,.4);',
    '  border-top-color:#fff; border-radius:50%; animation:cm-spin .7s linear infinite; vertical-align:-1px; }',
    '@keyframes cm-spin { to { transform:rotate(360deg); } }',
    '.cm-dropzone { border:2px dashed var(--cm-border); border-radius:12px; padding:44px 20px; text-align:center;',
    '  color:var(--cm-mut); cursor:pointer; transition:border-color .15s, background .15s; }',
    '.cm-dropzone.cm-over { border-color:var(--cm-accent); background:rgba(9,105,218,.06); }',
    '.cm-dropzone h3 { margin:0 0 6px; color:var(--cm-text); font-size:16px; }',
    '.cm-dropzone p { margin:0; font-size:13px; }',
    '.cm-browse { background:none; border:none; color:var(--cm-accent); text-decoration:underline; cursor:pointer; padding:0; font-size:inherit; }',
    '.cm-chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }',
    '.cm-chip { background:var(--cm-panel); border:1px solid var(--cm-border); border-radius:999px; padding:4px 12px;',
    '  font-size:12px; color:var(--cm-mut); display:flex; gap:6px; align-items:center; }',
    '.cm-chip b { color:var(--cm-text); }',
    '.cm-progress { height:4px; background:var(--cm-border); border-radius:4px; overflow:hidden; margin-top:14px; }',
    '.cm-progress i { display:block; height:100%; width:30%; background:var(--cm-accent); border-radius:4px;',
    '  animation:cm-slide 1.1s ease-in-out infinite; }',
    '@keyframes cm-slide { 0%{margin-left:-30%} 100%{margin-left:100%} }',
    '.cm-split { display:grid; grid-template-columns:1fr 1fr; gap:18px; }',
    '.cm-split h4 { margin:0 0 8px; font-size:13px; }',
    '.cm-src { background:var(--cm-panel); border:1px solid var(--cm-border); border-radius:10px; padding:12px; overflow:auto; max-height:300px; }',
    '.cm-srccol { font-size:12px; padding:4px 6px; border-bottom:1px solid var(--cm-border); }',
    '.cm-srccol b { color:var(--cm-accent); }',
    '.cm-srccol span { display:block; color:var(--cm-mut); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
    '.cm-maprow { display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:13px; }',
    '.cm-maprow > span { flex:1; }',
    '.cm-maprow em { color:var(--cm-err); font-style:normal; }',
    '.cm-maprow select { border:1px solid var(--cm-border); background:var(--cm-panel); color:var(--cm-text);',
    '  border-radius:8px; padding:6px 8px; font-size:13px; max-width:190px; }',
    '.cm-conf { width:8px; height:8px; border-radius:50%; flex:none; }',
    '.cm-conf-high { background:var(--cm-ok); } .cm-conf-mid { background:var(--cm-amber); } .cm-conf-low { background:var(--cm-err); }',
    '.cm-ai-box { margin-top:12px; }',
    '.cm-ai-note { font-size:12px; color:var(--cm-mut); margin:6px 0 0; }',
    '.cm-local { font-size:11px; color:var(--cm-ok); border:1px solid var(--cm-ok); border-radius:999px;',
    '  padding:2px 9px; margin-left:8px; white-space:nowrap; }',
    '.cm-alt { margin-top:16px; display:grid; gap:10px; }',
    '.cm-altrow { display:flex; gap:8px; align-items:center; }',
    '.cm-altrow input[type=text], .cm-altrow textarea { flex:1; border:1px solid var(--cm-border); background:var(--cm-panel);',
    '  color:var(--cm-text); border-radius:8px; padding:8px 10px; font-size:13px; font-family:inherit; resize:vertical; }',
    '.cm-tplrow { font-size:12px; color:var(--cm-mut); display:flex; align-items:center; gap:8px; }',
    '.cm-tplrow select { border:1px solid var(--cm-border); background:var(--cm-panel); color:var(--cm-text);',
    '  border-radius:8px; padding:6px 8px; font-size:13px; }',
    '.cm-sniff { display:flex; flex-wrap:wrap; gap:6px 14px; font-size:12px; color:var(--cm-mut); background:var(--cm-panel);',
    '  border:1px solid var(--cm-border); border-radius:10px; padding:9px 12px; margin-bottom:12px; }',
    '.cm-sniff b { color:var(--cm-text); }',
    '.cm-dupstrat { font-size:12px; color:var(--cm-mut); display:flex; align-items:center; gap:6px; margin-left:auto; }',
    '.cm-dupstrat select { border:1px solid var(--cm-border); background:var(--cm-panel); color:var(--cm-text);',
    '  border-radius:8px; padding:3px 6px; font-size:12px; }',
    '.cm-limit { text-align:center; padding:30px 10px; }',
    '.cm-limit h3 { margin:0 0 8px; }',
    '.cm-limit p { color:var(--cm-mut); font-size:13px; margin:0 0 18px; }',
    '.cm-limit a { text-decoration:none; }',
    '.cm-export { border:0; background:var(--cm-panel); color:var(--cm-text); border:1px solid var(--cm-border);',
    '  border-radius:8px; padding:8px 14px; font-size:13px; cursor:pointer; font-weight:600; }',
    '.cm-export:hover { border-color:var(--cm-accent); color:var(--cm-accent); }',
    '.cm-webhookst { font-size:12px; color:var(--cm-mut); margin:10px 0 0; }',
    '.cm-webhookst b { color:var(--cm-ok); }',
    '.cm-filters { display:flex; gap:8px; margin-bottom:10px; font-size:12px; flex-wrap:wrap; align-items:center; }',
    '.cm-fchip { border:1px solid var(--cm-border); background:var(--cm-panel); color:var(--cm-mut); border-radius:999px;',
    '  padding:3px 10px; cursor:pointer; }',
    '.cm-fchip.cm-on { color:#fff; background:var(--cm-accent); border-color:var(--cm-accent); }',
    '.cm-fchip .cm-bad { color:var(--cm-err); font-weight:700; }',
    '.cm-fchip.cm-on .cm-bad { color:#fff; }',
    '.cm-gridwrap { position:relative; height:320px; overflow:auto; border:1px solid var(--cm-border); border-radius:10px;',
    '  font-size:12px; background:var(--cm-bg); }',
    '.cm-gridhead { position:sticky; top:0; z-index:3; background:var(--cm-panel); display:flex; ',
    '  border-bottom:1px solid var(--cm-border); font-weight:600; }',
    '.cm-gridhead span { padding:7px 10px; flex:none; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }',
    '.cm-gbody { position:relative; }',
    '.cm-grow { position:absolute; left:0; right:0; height:28px; display:flex; border-bottom:1px solid var(--cm-border); }',
    '.cm-grow:nth-child(even) { background:rgba(127,127,127,.05); }',
    '.cm-cell { padding:5px 10px; flex:none; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;',
    '  border-right:1px solid var(--cm-border); }',
    '.cm-cell.cm-err { outline:1px solid var(--cm-err); outline-offset:-1px; background:var(--cm-err-bg); color:var(--cm-err); }',
    '.cm-cell.cm-dup { outline:1px dashed var(--cm-amber); outline-offset:-1px; }',
    '.cm-legend { font-size:11px; color:var(--cm-mut); margin:6px 0 0; display:flex; gap:14px; }',
    '.cm-legend i { width:9px; height:9px; border-radius:2px; display:inline-block; margin-right:4px; }',
    '.cm-meta { font-size:12px; color:var(--cm-mut); margin-bottom:10px; }',
    '.cm-ai-fxsum { font-size:12px; color:var(--cm-ok); margin-top:8px; }',
    '.cm-ringwrap { display:flex; align-items:center; gap:26px; padding:10px 0; }',
    '.cm-ring { width:120px; height:120px; flex:none; }',
    '.cm-ring .bg { fill:none; stroke:var(--cm-border); stroke-width:10; }',
    '.cm-ring .fg { fill:none; stroke:var(--cm-accent); stroke-width:10; stroke-linecap:round;',
    '  transition:stroke-dashoffset .12s linear; }',
    '.cm-ring text { fill:var(--cm-text); font-size:20px; font-weight:700; text-anchor:middle; dominant-baseline:middle; }',
    '.cm-kpis { flex:1; display:grid; gap:8px; font-size:13px; }',
    '.cm-kpi { display:flex; justify-content:space-between; border-bottom:1px dashed var(--cm-border); padding-bottom:6px; }',
    '.cm-kpi b { color:var(--cm-text); }',
    '.cm-done { text-align:center; padding:26px 0 8px; }',
    '.cm-done .tick { width:64px; height:64px; border-radius:50%; background:var(--cm-ok); color:#fff; font-size:32px;',
    '  display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }',
    '@media (max-width:680px) { .cm-split { grid-template-columns:1fr; } .cm-ringwrap { flex-direction:column; text-align:center; } }'
  ].join('\n');

  /* --------------------------------------------------------------------------
   * 2) WEB WORKER SOURCE (also used as main-thread fallback via new Function)
   *    - char-scan parsing (no regex) to stay safe inside a string literal
   * ------------------------------------------------------------------------ */
  var WORKER = [
    'function parseCSV(text, delim) {',
    '  var rows = []; var row = []; var cell = ""; var i = 0, inQ = false, len = text.length;',
    '  while (i < len) {',
    '    var c = text.charAt(i);',
    '    if (inQ) {',
    '      if (c === "\\"" && text.charAt(i + 1) === "\\"") { cell += "\\""; i += 2; continue; }',
    '      if (c === "\\"") { inQ = false; i++; continue; }',
    '      cell += c; i++; continue;',
    '    }',
    '    if (c === "\\"") { inQ = true; i++; continue; }',
    '    if (c === delim) { row.push(cell); cell = ""; i++; continue; }',
    '    if (c === "\\n" || c === "\\r") {',
    '      if (c === "\\r" && text.charAt(i + 1) === "\\n") i++;',
    '      row.push(cell); cell = ""; rows.push(row); row = []; i++; continue;',
    '    }',
    '    cell += c; i++;',
    '  }',
    '  if (cell !== "" || row.length > 0) { row.push(cell); rows.push(row); }',
    '  var out = [];',
    '  for (var r = 0; r < rows.length; r++) {',
    '    var has = false;',
    '    for (var c2 = 0; c2 < rows[r].length; c2++) { if (String(rows[r][c2]).trim() !== "") { has = true; break; } }',
    '    if (has) out.push(rows[r]);',
    '  }',
    '  return out;',
    '}',
    'function detectDelimiter(text, tries) {',
    '  var cands = [",", "\\t", ";", "|", "^"];',
    '  var lines = text.split("\\n"); if (lines.length > 24) lines = lines.slice(0, 24);',
    '  var best = cands[0], bestS = -1;',
    '  for (var x = 0; x < cands.length; x++) {',
    '    var d = cands[x], score = 0, consistent = 0, counts = [], ok = false;',
    '    for (var l = 0; l < lines.length; l++) {',
    '      var n = 0; var ln = lines[l];',
    '      for (var k = 0; k < ln.length; k++) if (ln.charAt(k) === d) n++;',
    '      if (n > 0) { ok = true; score += n; counts.push(n); }',
    '      if (n >= 2) consistent++;',
    '    }',
    '    if (!ok) continue;',
    '    var uniq = {};',
    '    for (var u = 0; u < counts.length; u++) uniq[counts[u]] = 1;',
    '    var penalty = 0; for (var p in uniq) penalty++;',
    '    var sc = score / (penalty || 1) + consistent * 3;',
    '    if (sc > bestS) { bestS = sc; best = d; }',
    '  }',
    '  return best;',
    '}',
    'function detectEncoding(bytes) {',
    '  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) return "UTF-8 (BOM)";',
    '  var ok = true, i = 0;',
    '  while (i < bytes.length) {',
    '    var b = bytes[i]; if (b < 0x80) { i++; continue; }',
    '    var n = 0;',
    '    if ((b & 0xE0) === 0xC0) n = 1; else if ((b & 0xF0) === 0xE0) n = 2; else if ((b & 0xF8) === 0xF0) n = 3; else { ok = false; break; }',
    '    if (i + n >= bytes.length) { ok = false; break; }',
    '    var bad = false;',
    '    for (var j = 1; j <= n; j++) { if ((bytes[i + j] & 0xC0) !== 0x80) { bad = true; break; } }',
    '    if (bad) { ok = false; break; }',
    '    i += n + 1;',
    '  }',
    '  return ok ? "UTF-8" : "ISO-8859-1 (latin1)";',
    '}',
    'function decode(bytes, enc) {',
    '  var start = (enc.indexOf("BOM") !== -1) ? 3 : 0;',
    '  var out = ""; var i = start;',
    '  while (i < bytes.length) {',
    '    var b = bytes[i];',
    '    if (b < 0x80) { out += String.fromCharCode(b); i++; continue; }',
    '    var n = 0, cp = b;',
    '    if ((b & 0xE0) === 0xC0) { n = 1; cp = b & 0x1F; }',
    '    else if ((b & 0xF0) === 0xE0) { n = 2; cp = b & 0x0F; }',
    '    else { out += "\\uFFFD"; i++; continue; }',
    '    if (i + n >= bytes.length) { out += "\\uFFFD"; break; }',
    '    var bad = false;',
    '    for (var j = 1; j <= n; j++) {',
    '      if ((bytes[i + j] & 0xC0) !== 0x80) { bad = true; break; }',
    '      cp = (cp << 6) | (bytes[i + j] & 0x3F);',
    '    }',
    '    if (bad) { out += "\\uFFFD"; i++; continue; }',
    '    out += String.fromCodePoint(cp); i += n + 1;',
    '  }',
    '  return out;',
    '}',
    'function numStats(row) {',
    '  var nonEmpty = 0, numeric = 0;',
    '  for (var i = 0; i < row.length; i++) {',
    '    var v = String(row[i]).trim();',
    '    if (v === "") continue;',
    '    nonEmpty++;',
    '    if (!isNaN(Number(v))) numeric++;',
    '  }',
    '  return { nonEmpty: nonEmpty, numeric: numeric };',
    '}',
    'function repeats(row, rows) {',
    '  var n = 0;',
    '  for (var i = 0; i < row.length; i++) {',
    '    var v = String(row[i]).trim().toLowerCase();',
    '    if (v === "") continue;',
    '    for (var r = 1; r < rows.length; r++) {',
    '      for (var c = 0; c < rows[r].length; c++) {',
    '        if (String(rows[r][c]).trim().toLowerCase() === v) { n++; r = rows.length; break; }',
    '      }',
    '    }',
    '  }',
    '  return n;',
    '}',
    'function detectHeader(rows) {',
    '  if (rows.length < 2) return 0;',
    '  var a = numStats(rows[0]), b = numStats(rows[1]);',
    '  if (a.nonEmpty === 0) return 1;',
    '  if (b.nonEmpty === 0) return 0;',
    '  if (a.numeric === 0 && b.numeric > 0) return 0;',
    '  if (b.numeric === 0 && a.numeric > 0) return 1;',
    '  var ra = repeats(rows[0], rows), rb = repeats(rows[1], rows);',
    '  if (ra === 0 && rb > 0) return 0;',
    '  if (rb === 0 && ra > 0) return 1;',
    '  return 0;',
    '}',
    'self.onmessage = function (ev) {',
    '  var t0 = Date.now();',
    '  var bytes = ev.data.bytes;',
    '  var enc = detectEncoding(bytes);',
    '  var text = decode(bytes, enc);',
    '  var delim = detectDelimiter(text);',
    '  var rows = parseCSV(text, delim);',
    '  var hdr = detectHeader(rows);',
    '  var cols = rows.length ? rows[0].length : 0;',
    '  self.postMessage({ delimiter: delim, encoding: enc, headerRowIndex: hdr, rows: rows, cols: cols, parseMs: Date.now() - t0 });',
    '};'
  ].join('\n');

  /* --------------------------------------------------------------------------
   * 3) HELPERS
   * ------------------------------------------------------------------------ */
  var ROW_H = 28;
  var COL_MIN = 120;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function fmt(n) { return Number(n).toLocaleString('en-US'); }

  function cleanValue(value, field) {
    if (value === null || value === undefined) value = '';
    value = String(value).trim();
    if (value === '') return '';
    var t = (field && field.type) || 'string';
    if (t === 'number') {
      var n = Number(String(value).replace(/[,$\s]/g, ''));
      return isNaN(n) ? value : n;
    }
    if (t === 'boolean') {
      var lv = value.toLowerCase();
      if (['true', '1', 'yes', 'y', 'on'].indexOf(lv) !== -1) return true;
      if (['false', '0', 'no', 'n', 'off'].indexOf(lv) !== -1) return false;
      return value;
    }
    if (t === 'date') {
      var d = new Date(value);
      return isNaN(d) ? value : d.toISOString().slice(0, 10);
    }
    return value;
  }

  function validateValue(field, v) {
    var msgs = [];
    var t = field.type || 'string';
    var present = v !== '' && v !== null && v !== undefined;
    if (field.required && !present) msgs.push('Required field is empty');
    if (present && field.type === 'email' && !isEmail(v)) msgs.push('Invalid email format');
    if (present && field.type === 'number' && typeof v !== 'number') msgs.push('Not a number');
    if (present && field.type === 'boolean' && typeof v !== 'boolean') msgs.push('Not a boolean (use true/false, yes/no, 1/0)');
    if (present && field.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(v)) msgs.push('Invalid date');
    if (present && field.type === 'select' && field.options && field.options.length) {
      var hit = field.options.some(function (o) { return String(o).toLowerCase() === String(v).toLowerCase(); });
      if (!hit) msgs.push('Expected one of: ' + field.options.join(', '));
    }
    return msgs;
  }

  function confScore(header, field) {
    var h = norm(header), f = norm(field.label || field.key);
    if (!h) return 0;
    if (h === f) return 1;
    if (h.indexOf(f) !== -1 || f.indexOf(h) !== -1) return 0.85;
    var hh = h.split(/_/), ff = f.split(/_/);
    var hits = 0;
    for (var i = 0; i < ff.length; i++) if (hh.indexOf(ff[i]) !== -1) hits++;
    return hits ? 0.6 + 0.1 * hits : 0;
  }

  function autoMap(headers, fields) {
    var map = {}, used = {};
    fields.forEach(function (field) {
      var best = null, bestC = 0;
      headers.forEach(function (h, idx) {
        if (used[idx]) return;
        var c = confScore(h, field);
        if (c > bestC) { bestC = c; best = idx; }
      });
      if (best !== null && bestC >= 0.4) { map[field.key] = { col: best, conf: bestC }; used[best] = true; }
    });
    return map;
  }

  /* --------------------------------------------------------------------------
   * 4) AI ORCHESTRATION (DeepSeek; local heuristics fallback when unconfigured)
   * ------------------------------------------------------------------------ */
  var aiConfig = null;
  function configureAI(cfg) { aiConfig = cfg || null; }

  function aiCall(kind, payload) {
    if (!aiConfig || !aiConfig.apiKey) return Promise.resolve(null);
    var base = aiConfig.baseURL || 'https://api.deepseek.com';
    var model = aiConfig.model || 'deepseek-chat';
    var sys = kind === 'map'
      ? 'You map CSV source columns to a target schema. Reply with JSON ONLY, no markdown, in the form {"fieldKey":{"sourceIndex":int or -1,"confidence":0..1}}. Use -1 when no column matches.'
      : 'You repair messy cell values. Reply with JSON ONLY, no markdown, in the form {"fieldKey":{"originalValue":"fixedValue"}}. Only include values you are confident about.';
    return fetch(base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + aiConfig.apiKey },
      body: JSON.stringify({
        model: model,
        temperature: 0,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: JSON.stringify(payload) }
        ]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('AI HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      var content = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (!content) return null;
      content = content.replace(/```(json)?/g, '').trim();
      var clean = content.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      return JSON.parse(clean);
    }).catch(function () { return null; });
  }

  /* --------------------------------------------------------------------------
   * 5) THE WEB COMPONENT
   * ------------------------------------------------------------------------ */
  class CsvModImporterElement extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  CsvModImporterElement.prototype._init = function () {
    var el = this;
    var root = el.attachShadow({ mode: 'open' });
    var styleTag = document.createElement('style');
    styleTag.textContent = CSS;
    root.appendChild(styleTag);
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="cm-overlay" role="dialog" aria-modal="true" aria-label="CSV importer">' +
      '<div class="cm-card">' +
      '<div class="cm-top"><span class="cm-brand">Csv<b>Mod</b> Importer</span>' +
      '<span class="cm-local" hidden title="Files are parsed in your browser — nothing is uploaded to a CsvMod server.">🔒 Parsed locally</span>' +
      '<button type="button" class="cm-close" title="Close" aria-label="Close importer">&times;</button></div>' +
      '<div class="cm-steps">' +
      '<div class="cm-step" data-s="0">1 · Upload &amp; Sniff</div>' +
      '<div class="cm-step" data-s="1">2 · Smart Mapping</div>' +
      '<div class="cm-step" data-s="2">3 · Review Grid</div>' +
      '<div class="cm-step" data-s="3">4 · Ingestion</div>' +
      '</div>' +
      '<div class="cm-panel" data-p="0">' +
      '<div class="cm-dropzone" role="button" tabindex="0" aria-label="Drop CSV file or press Enter to browse"><h3>Drop your CSV here</h3><p>or <button type="button" class="cm-browse">browse files</button> · .csv .tsv .txt</p></div>' +
      '<input type="file" accept=".csv,.tsv,.txt,text/csv" hidden>' +
      '<div class="cm-alt">' +
      '<div class="cm-altrow"><input type="text" class="cm-urlinput" placeholder="…or import from a URL (e.g. Google Sheets CSV export)" aria-label="Import URL" />' +
      '<button type="button" class="cm-btn cm-urlgo">Fetch</button></div>' +
      '<div class="cm-altrow"><textarea class="cm-paste" rows="2" placeholder="…or paste CSV text here" aria-label="Paste CSV text"></textarea>' +
      '<button type="button" class="cm-btn cm-pastego">Paste &amp; import</button></div>' +
      '<div class="cm-altrow"><span class="cm-tplrow">Template <select class="cm-tpl" aria-label="Choose import template" hidden></select></span></div>' +
      '</div>' +
      '<div class="cm-chips" hidden></div>' +
      '<div class="cm-progress" hidden><i></i></div>' +
      '</div>' +
      '<div class="cm-panel" data-p="1"></div>' +
      '<div class="cm-panel" data-p="2"></div>' +
      '<div class="cm-panel" data-p="3"></div>' +
      '<div class="cm-actions">' +
      '<button type="button" class="cm-btn cm-prev" hidden>Back</button>' +
      '<span class="cm-ai-note"></span>' +
      '<button type="button" class="cm-btn cm-next" hidden>Next</button>' +
      '</div>' +
      '</div></div>';
    while (wrap.firstChild) root.appendChild(wrap.firstChild);

    el._ = {
      root: root,
      fields: [],
      raw: [],          // raw parsed rows (arrays), incl. header row(s)
      headerRowIndex: 0,
      mapping: {},      // fieldKey -> { col, conf, seen }
      rows: [],         // evaluated objects
      msgs: [],         // per row: { fieldKey: [errors] }
      dups: {},         // rowIdx -> [fieldKey]
      theme: 'auto',
      step: 0,
      worker: null,
      fallback: false,
      parsed: false,
      prof: null,       // { delimiter, encoding, parseMs }
      licenseKey: null,
      alternate: null,
      filter: 'all',
      fixBusy: false,
      gridRenderedAt: 0,
      templates: [],
      brand: { logo: null, color: null, title: null },
      dupStrategy: 'reject',
      rowLimit: null,
      rowLimitUrl: null,
      webhookUrl: null,
      lastFocus: null
    };

    el._.$overlay = root.querySelector('.cm-overlay');
    el._.$close = root.querySelector('.cm-close');
    el._.$steps = Array.prototype.slice.call(root.querySelectorAll('.cm-step'));
    el._.$panels = Array.prototype.slice.call(root.querySelectorAll('.cm-panel'));
    el._.$prev = root.querySelector('.cm-prev');
    el._.$next = root.querySelector('.cm-next');
    el._.$dropzone = root.querySelector('.cm-dropzone');
    el._.$browse = root.querySelector('.cm-browse');
    el._.$file = root.querySelector('input[type=file]');
    el._.$chips = root.querySelector('.cm-chips');
    el._.$progress = root.querySelector('.cm-progress');
    el._.$aiNote = root.querySelector('.cm-ai-note');

    ['$overlay', '$close', '$prev', '$next', '$dropzone', '$browse', '$file', '$chips', '$progress', '$aiNote'].forEach(function (k) {
      if (!el._[k]) throw new Error('[CsvMod] shadow DOM build failed — missing node selector: ' + k);
    });

    if (global.__cmTrace) global.__cmTrace.push('guard passed');

    el._initWorker();
    el._wire();
  };

  CsvModImporterElement.prototype._initWorker = function () {
    var el = this;
    if (typeof Worker !== 'undefined') {
      try {
        var blob = new Blob([WORKER], { type: 'text/javascript' });
        var w = new Worker(URL.createObjectURL(blob));
        w.onerror = function () { URL.revokeObjectURL(blob); el._.worker = null; el._startFallback(); };
        w.onmessage = function (ev) { el._onParsed(ev.data); };
        el._.worker = w;
        el._.fallback = false;
        return;
      } catch (e) { /* continue to fallback */ }
    }
    el._startFallback();
  };

  CsvModImporterElement.prototype._startFallback = function () {
    var el = this;
    if (el._.fallback) return;
    var scope = { postMessage: function (m) { el._onParsed(m); }, onmessage: null };
    try {
      // eslint-disable-next-line no-new-func
      var fn = new Function('self', WORKER);
      fn.call(scope, scope);
      el._.fallbackCtx = scope;
      el._.fallback = true;
      console.info('[CsvMod] Web Worker unavailable - parsed on main thread');
    } catch (e) {
      el._._lastError = e;
    }
  };

  CsvModImporterElement.prototype._parseBytes = function (bytes) {
    var el = this;
    if (el._.worker) { el._.worker.postMessage({ bytes: bytes }, [bytes.buffer]); return; }
    if (el._.fallbackCtx && typeof el._.fallbackCtx.onmessage === 'function') {
      el._.fallbackCtx.onmessage({ data: { bytes: bytes } });
    }
  };

  CsvModImporterElement.prototype._wire = function () {
    var el = this, m = el._;
    m.$close.addEventListener('click', function () { el.close(); });
    m.$prev.addEventListener('click', function () { el.go(m.step - 1); });
    m.$next.addEventListener('click', function () { el.go(m.step + 1); });

    m.$browse.addEventListener('click', function (e) { e.preventDefault(); m.$file.click(); });
    m.$dropzone.addEventListener('click', function () { if (!m.parsed || m.step !== 0) m.$file.click(); });
    m.$file.addEventListener('change', function () { if (m.$file.files[0]) el.ingestFile(m.$file.files[0]); });

    var urlGo = m.root.querySelector('.cm-urlgo');
    var pasteGo = m.root.querySelector('.cm-pastego');
    var urlInput = m.root.querySelector('.cm-urlinput');
    var pasteArea = m.root.querySelector('.cm-paste');
    var tplSelect = m.root.querySelector('.cm-tpl');
    if (urlGo) urlGo.addEventListener('click', function () {
      var u = urlInput.value.trim();
      if (!u) return;
      urlGo.disabled = true; urlGo.textContent = 'Fetching…';
      fetch(u).then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)); })
        .then(function (text) { el.ingestString(text); })
        .catch(function (err) { m.$chips.hidden = false; m.$chips.innerHTML = '<span class="cm-chip" style="color:var(--cm-err)">URL fetch failed: ' + esc(err.message) + '</span>'; })
        .then(function () { urlGo.disabled = false; urlGo.textContent = 'Fetch'; });
    });
    if (pasteGo) pasteGo.addEventListener('click', function () {
      var t = pasteArea.value;
      if (!t.trim()) return;
      el.ingestString(t);
    });
    if (tplSelect) tplSelect.addEventListener('change', function () {
      var t = m.templates[tplSelect.selectedIndex - 1];
      if (!t) return;
      m.fields = t.fields || [];
      if (m.parsed) {
        m.mapping = autoMap(el.headers(), m.fields);
        el._recompute();
        el.go(1);
      }
    });

    m.$dropzone.addEventListener('dragover', function (e) { e.preventDefault(); m.$dropzone.classList.add('cm-over'); });
    m.$dropzone.addEventListener('dragleave', function () { m.$dropzone.classList.remove('cm-over'); });
    m.$dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      m.$dropzone.classList.remove('cm-over');
      if (e.dataTransfer.files[0]) el.ingestFile(e.dataTransfer.files[0]);
    });

    document.addEventListener('keydown', function (e) {
      var open = m.$overlay.classList.contains('cm-open');
      if (e.key === 'Escape' && open) { el.close(); return; }
      if (open && e.key === 'Tab') {
        var focusables = m.$overlay.querySelectorAll('button, select, input, textarea, a[href], [tabindex]:not([tabindex="-1"])');
        var list = Array.prototype.filter.call(focusables, function (n) { return !n.hidden && n.offsetParent !== null; });
        if (!list.length) return;
        var first = list[0], last = list[list.length - 1];
        var cur = m.$overlay.getRootNode().activeElement;
        if (e.shiftKey && cur === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
      }
      if (!open && document.activeElement === m.$dropzone && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        m.$file.click();
      }
      if (document.activeElement && document.activeElement.classList && document.activeElement.classList.contains('cm-fchip') &&
          (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        document.activeElement.click();
      }
    });

    m.$overlay.addEventListener('click', function (e) {
      if (e.target === m.$overlay) el.close();
    });

    // delegate: mapping selects, header select, filters, AI buttons, grid ops
    m.$overlay.addEventListener('change', function (e) {
      var t = e.target;
      if (t.matches('select[data-field]')) el._setMapping(t.dataset.field, t.value);
      if (t.matches('select[data-hdr]')) el._setHeader(Number(t.value));
      if (t.matches('select[data-trf]')) el._setTransform(t.dataset.trf, t.value);
      if (t.matches('select[data-dupstrategy]')) {
        m.dupStrategy = t.value;
        el._recompute();
        el._renderFilters();
        el._renderGridMeta();
        el._renderGrid();
      }
    });
    m.$overlay.addEventListener('click', function (e) {
      var t = e.target;
      if (t.matches('.cm-fchip')) { m.filter = t.dataset.f; el._renderGrid(); el._renderFilters(); }
      if (t.matches('[data-aiauto]')) el._aiAutoMap(true);
      if (t.matches('[data-aifix]')) el._aiFix();
      if (t.matches('[data-skipbad]')) el._import(true);
      if (t.matches('[data-import]')) el._import(false);
      if (t.matches('[data-reset]')) el.reset();
      if (t.matches('[data-export-csv]')) el._export('csv');
      if (t.matches('[data-export-json]')) el._export('json');
    });
    m.$overlay.addEventListener('scroll', function (e) {
      if (e.target.classList && e.target.classList.contains('cm-gridwrap') && m.step === 2) {
        el._renderWindow(e.target);
      }
    });

    // observe config attributes in connectedCallback (not the constructor):
    // per spec the parser sets attributes AFTER the constructor runs
  };

  CsvModImporterElement.prototype.connectedCallback = function () {
    var el = this, m = el._;
    if (m._attached) return;
    m._attached = true;
    if (el.hasAttribute('schema')) {
      try { el._.fields = JSON.parse(el.getAttribute('schema')).fields; } catch (e) { /* ignore */ }
    }
    if (el.hasAttribute('license-key')) el._.licenseKey = el.getAttribute('license-key');
    m.theme = el.getAttribute('theme') || m.theme;
    if (el.hasAttribute('webhook-url')) el._.webhookUrl = el.getAttribute('webhook-url');
    if (el.hasAttribute('dup-strategy')) el._.dupStrategy = el.getAttribute('dup-strategy') || 'reject';
    if (el.hasAttribute('row-limit')) el._.rowLimit = Number(el.getAttribute('row-limit')) || null;
    if (el.hasAttribute('row-limit-url')) el._.rowLimitUrl = el.getAttribute('row-limit-url');
    if (el.hasAttribute('brand-logo')) el._.brand.logo = el.getAttribute('brand-logo');
    if (el.hasAttribute('brand-color')) el._.brand.color = el.getAttribute('brand-color');
    if (el.hasAttribute('brand-title')) el._.brand.title = el.getAttribute('brand-title');
    if (el.hasAttribute('templates')) {
      try { var t = JSON.parse(el.getAttribute('templates')); if (Array.isArray(t) && t.length) el._.templates = t; } catch (e) { /* ignore */ }
    }
    // defer first attribute write out of the constructor: Chrome discards
    // shadow root + attributes when a custom element constructor both
    // attachShadow()s and setAttribute()s during document.createElement()
    setTimeout(function () {
      el._applyTheme();
      el._applyBrand();
    }, 0);
  };

  /* ---------------- theme ---------------- */
  CsvModImporterElement.prototype._applyTheme = function () {
    var el = this, m = el._;
    var t = m.theme;
    if (t === 'auto') t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    el.setAttribute('data-cm-theme', t);
  };

  CsvModImporterElement.prototype._applyBrand = function () {
    var el = this, m = el._;
    var b = m.brand;
    var brandEl = m.root.querySelector('.cm-brand');
    if (brandEl) {
      if (b.title) brandEl.innerHTML = esc(b.title);
      else if (b.logo) brandEl.innerHTML = '<img src="' + esc(b.logo) + '" alt="' + esc(b.title || '') + '" style="height:20px;vertical-align:-4px">';
    }
    if (b.logo && b.title) {
      var img = m.root.querySelector('.cm-brand img');
      if (img) { img.style.height = '20px'; img.style.verticalAlign = '-4px'; }
    }
    if (b.color) el.style.setProperty('--cm-accent', b.color);
  };

  /* ---------------- public schema / options ---------------- */
  Object.defineProperty(CsvModImporterElement.prototype, 'schema', {
    get: function () { return { fields: this._.fields }; },
    set: function (s) { this._.fields = (s && s.fields) ? s.fields : []; }
  });
  Object.defineProperty(CsvModImporterElement.prototype, 'licenseKey', {
    get: function () { return this._.licenseKey; },
    set: function (v) { this._.licenseKey = v; }
  });
  Object.defineProperty(CsvModImporterElement.prototype, 'theme', {
    get: function () { return this._.theme; },
    set: function (v) { this._.theme = v; this._applyTheme(); }
  });
  Object.defineProperty(CsvModImporterElement.prototype, 'templates', {
    get: function () { return this._.templates; },
    set: function (v) { this._.templates = Array.isArray(v) ? v : []; }
  });
  Object.defineProperty(CsvModImporterElement.prototype, 'brand', {
    get: function () { return this._.brand; },
    set: function (v) {
      var el = this, m = el._;
      m.brand = v && typeof v === 'object' ? {
        logo: v.logo || null, color: v.color || null, title: v.title || null
      } : { logo: null, color: null, title: null };
      el._applyBrand();
    }
  });
  Object.defineProperty(CsvModImporterElement.prototype, 'webhookUrl', {
    get: function () { return this._.webhookUrl; },
    set: function (v) { this._.webhookUrl = v || null; }
  });
  Object.defineProperty(CsvModImporterElement.prototype, 'dupStrategy', {
    get: function () { return this._.dupStrategy; },
    set: function (v) { this._.dupStrategy = v === 'keep-first' || v === 'overwrite' ? v : 'reject'; }
  });
  Object.defineProperty(CsvModImporterElement.prototype, 'rowLimit', {
    get: function () { return this._.rowLimit; },
    set: function (v) { this._.rowLimit = v === null || v === undefined ? null : Number(v); }
  });

  CsvModImporterElement.prototype.open = function () {
    var el = this, m = el._;
    if (m.licenseKey && !/^pk_/.test(m.licenseKey)) {
      console.warn('[CsvMod] licenseKey format should look like "pk_live_..."');
    }
    el._applyTheme();
    el._applyBrand();
    m.lastFocus = document.activeElement;
    m.$overlay.classList.add('cm-open');
    var localBadge = m.root.querySelector('.cm-local');
    localBadge.hidden = false;
    localBadge.title = aiConfig && aiConfig.apiKey
      ? 'Files are parsed in your browser. AI mapping/fix calls are sent to your configured model.'
      : 'Files are parsed in your browser — nothing is uploaded to a CsvMod server.';
    el.go(0);
    setTimeout(function () { m.$close.focus(); }, 0);
  };
  CsvModImporterElement.prototype.close = function () {
    var el = this, m = el._;
    m.$overlay.classList.remove('cm-open');
    if (m.lastFocus && typeof m.lastFocus.focus === 'function') {
      try { m.lastFocus.focus(); } catch (e) { /* detached */ }
    }
  };

  CsvModImporterElement.prototype.go = function (n) {
    var el = this, m = el._;
    m.step = clamp(n, 0, 3);
    m.$steps.forEach(function (s, i) {
      s.classList.toggle('cm-on', i === m.step);
      s.classList.toggle('cm-done', m.parsed && i < m.step);
      if (i === m.step) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
    });
    m.$panels.forEach(function (p, i) { p.classList.toggle('cm-on', i === m.step); });
    m.$prev.hidden = m.step === 0;
    m.$next.hidden = true;
    if (m.step === 1 && m.parsed) { m.$next.hidden = false; el._renderMapping(); }
    if (m.step === 2 && m.parsed) {
      m.$next.hidden = false;
      m.$next.textContent = 'Confirm & import →';
      el._renderReview();
    }
    if (m.step === 3 && m.parsed) { el._renderConfirm(); }
    if (m.step === 0) { el._renderUpload(); }
  };

  /* ---------------- ingestion: file or string ---------------- */
  CsvModImporterElement.prototype.ingestFile = function (file) {
    var el = this, m = el._;
    el.open();
    m.$progress.hidden = false;
    m.$chips.hidden = true;
    file.arrayBuffer().then(function (buf) {
      el._parseBytes(new Uint8Array(buf));
    }).catch(function (e) { console.error('[CsvMod] read failed', e); m.$progress.hidden = true; });
  };

  CsvModImporterElement.prototype.ingestString = function (csvText) {
    var el = this, m = el._;
    el.open();
    m.$progress.hidden = false;
    m.$chips.hidden = true;
    var enc = new TextEncoder();
    var u8 = enc.encode(csvText);
    var copy = new Uint8Array(u8.length);
    copy.set(u8);
    el._parseBytes(copy);
  };

  /* ---------------- parse result ---------------- */
  CsvModImporterElement.prototype._onParsed = function (res) {
    var el = this, m = el._;
    m.$progress.hidden = true;
    if (!res || !res.rows) { m.$chips.hidden = true; return; }
    m.raw = res.rows;
    m.headerRowIndex = clamp(res.headerRowIndex, 0, Math.max(0, res.rows.length - 1));
    m.prof = { delimiter: res.delimiter, encoding: res.encoding, parseMs: res.parseMs };
    m.fixes = {};
    m.parsed = true;
    m.mapping = autoMap(el.headers(), m.fields);
    el._recompute();
    el.go(1);
  };

  CsvModImporterElement.prototype.headers = function () {
    return this._.raw[this._.headerRowIndex] || [];
  };

  CsvModImporterElement.prototype.dataRows = function () {
    var m = this._;
    return m.headerRowIndex === -1 ? m.raw : m.raw.slice(m.headerRowIndex + 1);
  };

  /* ---------------- step 1 UI ---------------- */
  CsvModImporterElement.prototype._renderUpload = function () {
    var el = this, m = el._;
    var tpl = m.root.querySelector('.cm-tpl');
    if (tpl) {
      tpl.hidden = m.templates.length < 2;
      if (m.templates.length >= 2) {
        var opts = ['<option value="">Default schema</option>'].concat(m.templates.map(function (t, i) {
          return '<option value="' + i + '">' + esc(t.label || t.id || ('Template ' + (i + 1))) + '</option>';
        }));
        tpl.innerHTML = opts.join('');
      }
    }
    m.root.querySelector('.cm-alt').hidden = !!m.parsed;
    if (!m.parsed) { m.$chips.hidden = true; m.$next.hidden = true; return; }
    m.$chips.hidden = false;
    var rows = m.raw.length - 1 - (m.headerRowIndex === -1 ? 0 : 1);
    var cols = m.raw[0] ? m.raw[0].length : 0;
    var speed = Math.round(rows / (m.prof.parseMs / 1000));
    m.$chips.innerHTML =
      '<span class="cm-chip">Rows (incl. header) <b>' + fmt(m.raw.length) + '</b></span>' +
      '<span class="cm-chip">Data rows <b>' + fmt(Math.max(0, rows)) + '</b></span>' +
      '<span class="cm-chip">Columns <b>' + fmt(cols) + '</b></span>' +
      '<span class="cm-chip">Delimiter <b>' + esc(m.prof.delimiter === '\t' ? 'TAB' : m.prof.delimiter) + '</b></span>' +
      '<span class="cm-chip">Encoding <b>' + esc(m.prof.encoding) + '</b></span>' +
      '<span class="cm-chip">Parsed in <b>' + m.prof.parseMs + ' ms</b></span>' +
      '<span class="cm-chip">Throughput <b>' + fmt(speed) + ' rows/s</b></span>';
    m.$next.hidden = false;
    m.$next.textContent = 'Map columns →';
  };

  /* ---------------- step 2: mapping ---------------- */
  CsvModImporterElement.prototype._renderMapping = function () {
    var el = this, m = el._;
    var headers = el.headers();
    var data = el.dataRows();
    var aiOn = !!(aiConfig && aiConfig.apiKey);

    var hdrOpts = ['<option value="-1">No header row</option>'];
    for (var i = 0; i < Math.min(6, m.raw.length); i++) {
      var label = m.raw[i].slice(0, 3).join(' | ') || 'Row ' + (i + 1);
      hdrOpts.push('<option value="' + i + '"' + (m.headerRowIndex === i ? ' selected' : '') + '>Row ' + (i + 1) + ' — ' + esc(label) + '</option>');
    }
    if (m.raw.length > 6) hdrOpts.push('<option value="0" disabled>…more rows</option>');

    var srcBlock = headers.map(function (h, idx) {
      var samples = [];
      for (var d = 0; d < Math.min(5, data.length) && samples.length < 3; d++) {
        if (data[d][idx] !== undefined && String(data[d][idx]).trim() !== '' && samples.indexOf(String(data[d][idx])) === -1) {
          samples.push(String(data[d][idx]));
        }
      }
      return '<div class="cm-srccol"><b>Col ' + (idx + 1) + ' · ' + esc(h || '(unnamed)') + '</b>' +
        '<span>' + samples.map(esc).join(' · ') + '</span></div>';
    }).join('');

    var mapBlock = m.fields.map(function (f) {
      var cur = m.mapping[f.key];
      var opts = ['<option value="">(skip)</option>'].concat(headers.map(function (h, i) {
        return '<option value="' + i + '"' + (cur && cur.col === i ? ' selected' : '') + '>' +
          esc(h || ('Col ' + (i + 1))) + '</option>';
      }));
      var conf = cur ? cur.conf : 0;
      var confCls = conf >= 0.75 ? 'cm-conf-high' : conf >= 0.5 ? 'cm-conf-mid' : 'cm-conf-low';
      var trOpts = ['<option value="">no transform</option>',
        '<option value="trim"' + (cur && cur.transform === 'trim' ? ' selected' : '') + '>trim whitespace</option>',
        '<option value="lower"' + (cur && cur.transform === 'lower' ? ' selected' : '') + '>lowercase</option>',
        '<option value="upper"' + (cur && cur.transform === 'upper' ? ' selected' : '') + '>UPPERCASE</option>',
        '<option value="split0"' + (cur && cur.transform === 'split0' ? ' selected' : '') + '>split → first part</option>',
        '<option value="split1"' + (cur && cur.transform === 'split1' ? ' selected' : '') + '>split → last part</option>'
      ];
      return '<div class="cm-maprow"><span>' + esc(f.label || f.key) + (f.required ? ' <em>*</em>' : '') + ' <i class="cm-conf ' + confCls + '" title="confidence ' + Math.round(conf * 100) + '%"></i></span>' +
        '<select data-field="' + esc(f.key) + '">' + opts.join('') + '</select>' +
        '<select data-trf="' + esc(f.key) + '">' + trOpts.join('') + '</select></div>';
    }).join('');

    var unmapped = m.fields.filter(function (f) { return !m.mapping[f.key]; });
    var aiBtn = '<button type="button" class="cm-btn cm-btn-primary" data-aiauto="1">' +
      (aiOn ? '✨ AI Auto-Map' : '✨ AI Auto-Map (simulated)') + '</button>';

    m.$panels[1].innerHTML =
      '<div class="cm-sniff">' +
      '<span>Data rows <b>' + fmt(el.dataRows().length) + '</b></span>' +
      '<span>Delimiter <b>' + esc(m.prof.delimiter === '\t' ? 'TAB' : m.prof.delimiter) + '</b></span>' +
      '<span>Encoding <b>' + esc(m.prof.encoding) + '</b></span>' +
      '<span>Header row <b>#' + (m.headerRowIndex + 1) + '</b></span>' +
      '<span>Columns <b>' + fmt(el.headers().length) + '</b></span>' +
      '<span>Parsed <b>' + m.prof.parseMs + ' ms</b> in ' + (m.fallback ? 'main thread' : 'a web worker') + '</span>' +
      '</div>' +
      '<div class="cm-ai-box">' + aiBtn +
      '<p class="cm-ai-note">' + (aiOn
        ? 'DeepSeek inspects headers + ' + (aiConfig.model || 'deepseek-chat') + ' to propose map &amp; confidence.'
        : 'No API key configured — using deterministic heuristic mapping. Set one via CsvMod.configureAI({ apiKey }).') + '</p></div>' +
      '<div class="cm-split">' +
      '<div><h4>Header row</h4><select data-hdr>' + hdrOpts.join('') + '</select><br><br>' +
      '<h4>Source columns + samples</h4><div class="cm-src">' + srcBlock + '</div></div>' +
      '<div><h4>Target schema fields</h4>' + mapBlock + '</div>' +
      '</div>' +
      (unmapped.length ? '<p class="cm-ai-note">⚠ ' + unmapped.map(function (f) { return f.label || f.key; }).join(', ') + ' unmapped' +
        (unmapped.some(function (f) { return f.required; }) ? ' · required fields must be mapped' : ' · optional fields will be skipped') + '</p>' : '');
    m.$next.textContent = 'Review data →';
  };

  CsvModImporterElement.prototype._setMapping = function (fieldKey, val) {
    var el = this, m = el._;
    var f = m.fields.filter(function (x) { return x.key === fieldKey; })[0];
    if (!f) return;
    if (val === '') {
      delete m.mapping[fieldKey];
    } else {
      var col = Number(val);
      var conf = confScore(el.headers()[col], f);
      m.mapping[fieldKey] = { col: col, conf: conf };
    }
    el._recompute();
    el._renderMapping();
  };

  CsvModImporterElement.prototype._setHeader = function (n) {
    var el = this, m = el._;
    m.headerRowIndex = n;
    m.mapping = autoMap(el.headers(), m.fields);
    el._recompute();
    el._renderMapping();
  };

  CsvModImporterElement.prototype._setTransform = function (fieldKey, val) {
    var el = this, m = el._;
    if (!m.mapping[fieldKey]) return;
    m.mapping[fieldKey].transform = val || undefined;
    el._recompute();
    el._renderMapping();
  };

  CsvModImporterElement.prototype._aiAutoMap = function () {
    var el = this, m = el._;
    if (m.aiBusy) return;
    m.aiBusy = true;
    var headers = el.headers();
    var samples = el.dataRows().slice(0, 5);
    el._paintAiBtn('Mapping…');
    aiCall('map', { headers: headers, schema: m.fields.map(function (f) { return { key: f.key, label: f.label || f.key, type: f.type, required: !!f.required }; }) }).then(function (res) {
      if (res) {
        m.fields.forEach(function (f) {
          var r = res[f.key] || res[(f.label || f.key)];
          if (!r) return;
          if (r.sourceIndex === -1) { delete m.mapping[f.key]; return; }
          m.mapping[f.key] = { col: r.sourceIndex, conf: clamp(Number(r.confidence) || 0, 0, 1) };
        });
      } else {
        m.mapping = autoMap(headers, m.fields);
      }
      el._recompute();
      el._renderMapping();
      m.aiBusy = false;
    });
  };

  CsvModImporterElement.prototype._paintAiBtn = function (label) {
    var el = this, m = el._;
    var btn = m.$panels[1].querySelector('[data-aiauto]');
    if (btn) {
      btn.textContent = label;
      if (label.indexOf('…') !== -1) btn.disabled = true;
    }
  };

  CsvModImporterElement.prototype._applyTransform = function () {
    // transforms are applied per-field via select[data-trf]; kept for delegate safety
  };

  /* ---------------- evaluation ---------------- */
  CsvModImporterElement.prototype._recompute = function () {
    var el = this, m = el._;
    var data = el.dataRows();
    var fields = m.fields;

    function applyT(v, t) {
      if (t === 'trim' || !t) return v;
      if (t === 'lower') return String(v).toLowerCase();
      if (t === 'upper') return String(v).toUpperCase();
      if (t === 'split0' || t === 'split1') {
        var parts = String(v).split(/\s+/);
        return t === 'split0' ? (parts[0] || '') : (parts[parts.length - 1] || '');
      }
      return v;
    }

    m.rows = data.map(function (r) {
      var obj = {};
      fields.forEach(function (f) {
        if (!m.mapping[f.key]) return;
        var v = r[m.mapping[f.key].col];
        v = v === undefined ? '' : v;
        v = applyT(v, m.mapping[f.key].transform);
        obj[f.key] = cleanValue(v, f);
      });
      return obj;
    });

    Object.keys(m.fixes || {}).forEach(function (key) {
      var p = key.indexOf(':');
      var i = +key.slice(0, p), fk = key.slice(p + 1);
      if (m.rows[i] && fk in m.rows[i]) m.rows[i][fk] = m.fixes[key];
    });

    // validation
    m.msgs = m.rows.map(function (row) {
      var out = {};
      fields.forEach(function (f) {
        if (!m.mapping[f.key]) {
          if (f.required) out[f.key] = ['Not mapped'];
          return;
        }
        var errs = validateValue(f, row[f.key]);
        if (errs.length) out[f.key] = errs;
      });
      return out;
    });

    // duplicates on unique fields
    m.dups = {};
    function markDup(i, fk) {
      if (!m.dups[i]) m.dups[i] = [];
      if (m.dups[i].indexOf(fk) === -1) m.dups[i].push(fk);
    }
    fields.forEach(function (f) {
      if (f.type !== 'unique') return;
      var seen = {};
      m.rows.forEach(function (row, i) {
        var v = row[f.key];
        if (v === '' || v === undefined || v === null) return;
        var key = String(v).toLowerCase();
        if (seen[key] !== undefined) {
          if (m.dupStrategy === 'keep-first') markDup(i, f.key);
          else if (m.dupStrategy === 'overwrite') markDup(seen[key], f.key);
          else { markDup(i, f.key); markDup(seen[key], f.key); }
        } else seen[key] = i;
      });
    });
  };

  CsvModImporterElement.prototype._rowErrorCount = function (i) {
    var m = this._;
    var c = 0;
    if (m.msgs[i]) for (var k in m.msgs[i]) c += m.msgs[i][k].length;
    if (m.dups[i] && m.dupStrategy !== 'overwrite') c += m.dups[i].length;
    return c;
  };

  CsvModImporterElement.prototype._stats = function () {
    var el = this, m = el._;
    var total = m.rows.length;
    var bad = 0;
    for (var i = 0; i < total; i++) if (el._rowErrorCount(i)) bad++;
    return { total: total, bad: bad, good: total - bad };
  };

  /* ---------------- step 3: virtualized grid ---------------- */
  CsvModImporterElement.prototype._renderReview = function () {
    var el = this, m = el._;
    var fields = m.fields.filter(function (f) { return m.mapping[f.key]; });

    m.$panels[2].innerHTML =
      '<div class="cm-filters">' +
      '<span class="cm-fchip cm-on" data-f="all" role="button" tabindex="0">All <b id="cm-fall"></b></span>' +
      '<span class="cm-fchip" data-f="good" role="button" tabindex="0">Valid <b id="cm-fgood"></b></span>' +
      '<span class="cm-fchip" data-f="bad" role="button" tabindex="0">Errors <b class="cm-bad" id="cm-fbad"></b></span>' +
      '<button type="button" class="cm-btn" data-aifix>✨ AI Fix Common Errors</button>' +
      '<button type="button" class="cm-btn" data-reset>↺ Re-upload</button>' +
      '<label class="cm-dupstrat">Duplicates ' +
      '<select data-dupstrategy aria-label="Duplicate handling">' +
      '<option value="reject"' + (m.dupStrategy === 'reject' ? ' selected' : '') + '>flag both · reject</option>' +
      '<option value="keep-first"' + (m.dupStrategy === 'keep-first' ? ' selected' : '') + '>keep first</option>' +
      '<option value="overwrite"' + (m.dupStrategy === 'overwrite' ? ' selected' : '') + '>overwrite by key</option>' +
      '</select></label>' +
      '</div>' +
      '<div class="cm-meta" id="cm-meta"></div>' +
      '<div class="cm-gridwrap"></div>' +
      '<div class="cm-legend"><span><i style="background:#cf222e"></i> invalid cell (hover for reason)</span>' +
      '<span><i style="background:#9a6700"></i> duplicate</span></div>' +
      '<p class="cm-ai-fxsum" id="cm-fxsum" hidden></p>';

    el._renderFilters();
    el._renderGridMeta();
    el._renderGrid();
  };

  CsvModImporterElement.prototype._renderFilters = function () {
    var el = this, m = el._;
    var s = el._stats();
    var chips = m.$panels[2].querySelectorAll('.cm-fchip');
    chips.forEach(function (c) { c.classList.toggle('cm-on', c.dataset.f === m.filter); });
    var fAll = m.$panels[2].querySelector('#cm-fall');
    if (fAll) fAll.textContent = '(' + fmt(s.total) + ')';
    var fG = m.$panels[2].querySelector('#cm-fgood');
    if (fG) fG.textContent = '(' + fmt(s.good) + ')';
    var fB = m.$panels[2].querySelector('#cm-fbad');
    if (fB) fB.textContent = '(' + fmt(s.bad) + ')';
  };

  CsvModImporterElement.prototype._renderGridMeta = function () {
    var el = this, m = el._;
    var s = el._stats();
    var pct = s.total ? Math.round((s.good / s.total) * 100) : 100;
    var meta = m.$panels[2].querySelector('#cm-meta');
    if (meta) meta.textContent = fmt(s.total) + ' rows · ' + fmt(s.good) + ' valid (' + pct + '%) · ' + fmt(s.bad) + ' with errors';
  };

  CsvModImporterElement.prototype._visibleIndices = function () {
    var el = this, m = el._;
    var idx = [];
    for (var i = 0; i < m.rows.length; i++) {
      if (m.filter === 'all' ||
          (m.filter === 'good' && !el._rowErrorCount(i)) ||
          (m.filter === 'bad' && el._rowErrorCount(i))) idx.push(i);
    }
    return idx;
  };

  CsvModImporterElement.prototype._renderGrid = function () {
    var el = this, m = el._;
    var wrap = m.$panels[2].querySelector('.cm-gridwrap');
    if (!wrap) return;
    var fields = m.fields.filter(function (f) { return m.mapping[f.key]; });
    var idx = el._visibleIndices();

    var widths = fields.map(function (f) {
      return Math.max(COL_MIN, (f.label || f.key).length * 8 + 44);
    });

    wrap.innerHTML =
      '<div class="cm-gridhead">' +
      '<span style="width:52px;flex:none">#</span>' +
      fields.map(function (f, i) {
        return '<span style="width:' + widths[i] + 'px" title="' + esc(f.label || f.key) + '">' + esc(f.label || f.key) + '</span>';
      }).join('') +
      '</div>' +
      '<div class="cm-gbody"></div>';

    var body = wrap.querySelector('.cm-gbody');
    body.style.height = (idx.length * ROW_H) + 'px';
    m.gridIndices = idx;
    m.gbody = body;
    m.gridW = fields;
    m.gridCols = widths;
    el._renderWindow(wrap);
  };

  CsvModImporterElement.prototype._renderWindow = function (wrap) {
    var el = this, m = el._;
    var body = m.gbody;
    if (!body || !wrap) return;
    var st = wrap.scrollTop - 0;
    var first = Math.max(0, Math.floor(st / ROW_H) - 2);
    var last = Math.min(m.gridIndices.length, Math.ceil((st + wrap.clientHeight) / ROW_H) + 2);
    var html = '';
    for (var i = first; i < last; i++) {
      var ri = m.gridIndices[i];
      var row = m.rows[ri];
      html += '<div class="cm-grow" style="top:' + (i * ROW_H) + 'px">' +
        '<span class="cm-cell" style="width:52px;flex:none;color:var(--cm-mut)">' + (ri + 1) + '</span>';
      for (var k = 0; k < m.gridW.length; k++) {
        var w = m.gridCols[k];
        var f = m.gridW[k];
        var v = row[f.key];
        var cls = '';
        var tips = [];
        if (m.msgs[ri] && m.msgs[ri][f.key]) tips = m.msgs[ri][f.key];
        var isDup = m.dups[ri] && m.dups[ri].indexOf(f.key) !== -1;
        if (tips.length) cls = 'cm-err';
        else if (isDup) cls = 'cm-dup';
        var shown = v;
        if (v === null || v === undefined) shown = '';
        else if (v === true) shown = 'true';
        else if (v === false) shown = 'false';
        html += '<span class="cm-cell ' + cls + '" style="width:' + w + 'px"' +
          (tips.length ? ' title="' + esc(tips.join(' · ')) + '"' : isDup ? ' title="' +
            (m.dupStrategy === 'overwrite' ? 'Will be overwritten by a later row on import' : 'Duplicate value') + '"' : '') + '>' +
          esc(shown) + '</span>';
      }
      html += '</div>';
    }
    body.innerHTML = html;
    m.lastRender = Date.now();
  };

  /* ---------------- AI fix (with local heuristic fallback) ---------------- */
  CsvModImporterElement.prototype._aiFix = function () {
    var el = this, m = el._;
    if (m.fixBusy) return;
    m.fixBusy = true;
    var btn = m.$panels[2].querySelector('[data-aifix]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="cm-spin"></span> Fixing…'; }

    var dirty = {};
    var samples = {};
    m.fields.forEach(function (f) {
      var colDirty = {};
      m.rows.forEach(function (row, i) {
        if (!m.msgs[i] || !m.msgs[i][f.key]) return;
        var v = String(row[f.key]);
        if (colDirty[v] === undefined) colDirty[v] = { idx: i };
      });
      if (Object.keys(colDirty).length) {
        dirty[f.key] = colDirty;
        var vals = Object.keys(colDirty).slice(0, 20);
        samples[f.key] = vals;
      }
    });

    aiCall('fix', { fields: m.fields.map(function (f) { return { key: f.key, type: f.type, options: f.options }; }), cells: samples }).then(function (res) {
      var fixed = 0;
      if (res) {
        Object.keys(res).forEach(function (fk) {
          var fees = res[fk];
          Object.keys(fees).forEach(function (orig) {
            var fix = fees[orig];
            if (fix === null || fix === undefined || String(fix) === String(orig)) return;
            m.rows.forEach(function (row, i) {
              if (String(row[fk]) === String(orig) && m.msgs[i] && m.msgs[i][fk]) {
                row[fk] = cleanValue(fix, m.fields.filter(function (x) { return x.key === fk; })[0]);
                m.fixes[i + ':' + fk] = row[fk];
                fixed++;
              }
            });
          });
        });
      } else {
        fixed = el._localFix(dirty);
      }
      el._recompute();
      el._renderFilters();
      el._renderGridMeta();
      el._renderGrid();
      var sum = m.$panels[2].querySelector('#cm-fxsum');
      if (sum) {
        sum.hidden = false;
        sum.textContent = fixed ? '✨ Fixed ' + fixed + ' cell' + (fixed > 1 ? 's' : '') + (res ? ' via DeepSeek' : ' via local repair rules') +
          ' — review the grid above.' : 'No safe auto-fixes found — hover the red cells to see what is needed.';
      }
      if (btn) { btn.disabled = false; btn.textContent = '✨ AI Fix Common Errors'; }
      m.fixBusy = false;
    });
  };

  CsvModImporterElement.prototype._localFix = function (dirty) {
    var el = this, m = el._;
    var fixed = 0;
    m.fields.forEach(function (f) {
      if (!dirty[f.key]) return;
      var type = f.type;
      m.rows.forEach(function (row, i) {
        if (!m.msgs[i] || !m.msgs[i][f.key]) return;
        var v = String(row[f.key]);
        var nv = v;
        if (type === 'email') {
          nv = v.toLowerCase().replace(/\s+/g, '').replace(/@+/g, '@');
          if (nv.indexOf('@') === -1) nv = v; // cannot fabricate a domain
          else if (nv.split('@')[1].indexOf('.') === -1) nv = v;
        } else if (type === 'number') {
          var n = Number(v.replace(/[$,\s]/g, ''));
          if (!isNaN(n)) nv = n;
        } else if (type === 'boolean') {
          var lv = v.toLowerCase();
          if (['true', '1', 'yes', 'y', 'on'].indexOf(lv) !== -1) nv = true;
          else if (['false', '0', 'no', 'n', 'off'].indexOf(lv) !== -1) nv = false;
        } else if (type === 'date') {
          var parts = v.split(/[\/\-. ]/).filter(Boolean);
          if (parts.length === 3) {
            var y, mo, d;
            if (parts[0].length === 4) { y = parts[0]; mo = parts[1]; d = parts[2]; }
            else if (Number(parts[0]) > 12) { d = parts[0]; mo = parts[1]; y = parts[2]; }
            else { mo = parts[0]; d = parts[1]; y = parts[2]; }
            if (y && mo && d && Number(mo) >= 1 && Number(mo) <= 12 && Number(d) >= 1 && Number(d) <= 31) {
              nv = y + '-' + ('0' + mo).slice(-2) + '-' + ('0' + d).slice(-2);
            }
          }
        } else if (type === 'select' && f.options && f.options.length) {
          var hit = null;
          f.options.forEach(function (o) { if (String(o).toLowerCase() === v.toLowerCase()) hit = String(o); });
          if (hit) nv = hit;
        } else {
          nv = v.replace(/\s{2,}/g, ' ').trim();
        }
        if (String(nv) !== v) { row[f.key] = cleanValue(nv, f); m.fixes[i + ':' + f.key] = row[f.key]; fixed++; }
      });
    });
    return fixed;
  };

  /* ---------------- step 4: confirm + ingest ---------------- */
  CsvModImporterElement.prototype._renderConfirm = function () {
    var el = this, m = el._;
    var s = el._stats();
    var C = 2 * Math.PI * 54;
    m.$panels[3].innerHTML =
      '<div class="cm-ringwrap">' +
      '<div class="cm-ring"><svg width="120" height="120" viewBox="0 0 120 120">' +
      '<circle class="bg" cx="60" cy="60" r="54"></circle>' +
      '<circle class="fg" cx="60" cy="60" r="54" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"></circle>' +
      '<text x="60" y="60">0%</text></svg></div>' +
      '<div class="cm-kpis">' +
      '<div class="cm-kpi"><span>Total rows</span><b>' + fmt(s.total) + '</b></div>' +
      '<div class="cm-kpi"><span>Validated &amp; clean</span><b class="cm-ok">' + fmt(s.good) + '</b></div>' +
      '<div class="cm-kpi"><span>Rejected</span><b class="cm-err">' + fmt(s.bad) + '</b></div>' +
      '<div class="cm-kpi"><span>Payload</span><b id="cm-paysize">—</b></div>' +
      '</div></div>';
    m.$next.hidden = true;
    m.$prev.hidden = false;
    var payload = el._cleanPayload(false);
    m.$panels[3].querySelector('#cm-paysize').textContent = fmt(Math.round(JSON.stringify(payload).length / 1024)) + ' KB JSON';

    var exports = '<div class="cm-actions" style="justify-content:flex-start;margin-top:6px">' +
      '<button type="button" class="cm-export" data-export-csv>⬇ Download clean CSV</button>' +
      '<button type="button" class="cm-export" data-export-json>⬇ Download JSON</button>' +
      '</div>';

    var overLimit = m.rowLimit && s.total > m.rowLimit;
    var btns;
    if (overLimit) {
      btns = '<div class="cm-limit">' +
        '<h3>This file has ' + fmt(s.total) + ' rows — your plan covers ' + fmt(m.rowLimit) + '</h3>' +
        '<p>Rows are parsed and validated locally, but delivery is gated by your plan. Upgrade to import the full file.</p>' +
        '<a class="cm-btn cm-btn-primary" href="' + esc(m.rowLimitUrl || 'https://csvmod.com/pricing') + '" target="_blank" rel="noopener">Upgrade plan</a>' +
        '</div>';
    } else {
      btns = '<div class="cm-actions" style="margin-top:20px;justify-content:flex-end">' +
        '<button type="button" class="cm-btn" data-skipbad' + (s.bad ? '' : ' disabled') + '>Skip invalid &amp; import ' + fmt(s.good) + ' valid</button>' +
        '<button type="button" class="cm-btn cm-btn-primary" data-import' + (s.bad ? ' disabled' : '') + '>Import ' + fmt(s.total) + ' rows</button>' +
        '</div>';
    }
    m.$panels[3].insertAdjacentHTML('beforeend', exports + btns);
  };

  CsvModImporterElement.prototype._cleanPayload = function (skipInvalid) {
    var el = this, m = el._;
    var out = [];
    m.rows.forEach(function (row, i) {
      if (skipInvalid && el._rowErrorCount(i)) return;
      out.push(row);
    });
    return out;
  };

  CsvModImporterElement.prototype._buildCSV = function (payload) {
    var m = this._;
    var cols = m.fields.filter(function (f) { return m.mapping[f.key]; });
    var escCell = function (s) { return '"' + String(s === null || s === undefined ? '' : s).replace(/"/g, '""') + '"'; };
    var lines = [cols.map(function (f) { return escCell(f.label || f.key); }).join(',')];
    payload.forEach(function (row) {
      lines.push(cols.map(function (f) { return escCell(row[f.key]); }).join(','));
    });
    return lines.join('\r\n');
  };

  CsvModImporterElement.prototype._export = function (kind) {
    var el = this, m = el._;
    var stats = el._stats();
    var payload = el._cleanPayload(stats.bad > 0 && m.dupStrategy !== 'overwrite');
    var stamp = new Date();
    var pad = function (n) { return ('0' + n).slice(-2); };
    var name = 'csvmod-export-' + stamp.getFullYear() + pad(stamp.getMonth() + 1) + pad(stamp.getDate()) +
      '-' + pad(stamp.getHours()) + pad(stamp.getMinutes()) + (kind === 'csv' ? '.csv' : '.json');
    var content = kind === 'csv' ? el._buildCSV(payload) : JSON.stringify(payload, null, 2);
    var type = kind === 'csv' ? 'text/csv;charset=utf-8' : 'application/json';
    var blob = new Blob([content], { type: type });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  };

  CsvModImporterElement.prototype._import = function (skipInvalid) {
    var el = this, m = el._;
    var s = el._stats();
    if (m.rowLimit && s.total > m.rowLimit) return; // plan-gated: upgrade prompt shown in _renderConfirm
    var toSend = skipInvalid ? s.good : s.total;
    if (!skipInvalid && s.bad) return; // guard: use explicit skip button
    var payload = el._cleanPayload(skipInvalid && s.bad > 0);
    var panel = m.$panels[3];
    if (panel.querySelector('.cm-done')) return;
    var act = panel.querySelector('.cm-actions');
    if (act) act.remove();

    var C = 2 * Math.PI * 54;
    var ring = panel.querySelector('.cm-ring .fg');
    var pctTxt = panel.querySelector('.cm-ring text');

    var t0 = Date.now();
    var done = false;
    var iv = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / 1200);
      var offset = C * (1 - p);
      ring.style.strokeDashoffset = offset;
      pctTxt.textContent = Math.round(p * 100) + '%';
      if (p >= 1 && !done) {
        done = true;
        clearInterval(iv);
        var meta = {
          licenseKey: m.licenseKey || null,
          ai: !!(aiConfig && aiConfig.apiKey),
          local: !m.fallback,
          webhook: m.webhookUrl || null,
          delimiter: m.prof.delimiter,
          encoding: m.prof.encoding,
          parseMs: m.prof.parseMs,
          total: s.total, rejected: s.bad, sent: payload.length,
          worker: m.fallback ? 'main-thread' : 'web-worker'
        };
        var result = {
          validRows: payload,
          rejected: s.bad,
          total: s.total,
          meta: meta
        };
        var pr = null;
        try { pr = el.onComplete ? el.onComplete(result) : null; }
        catch (e) { console.error('[CsvMod] onComplete threw', e); }
        var finish = function (webhookStatus) {
          panel.innerHTML = '<div class="cm-done"><div class="tick">✓</div>' +
            '<h3 style="margin:0 0 4px">Delivered ' + fmt(payload.length) + ' rows to your host</h3>' +
            '<p style="color:var(--cm-mut);font-size:13px;margin:0">' + fmt(s.bad) + ' rejected · ' +
            (m.prof.parseMs) + ' ms parse · event <code>csvmod-complete</code> fired.</p>' +
            (webhookStatus ? '<p class="cm-webhookst">Webhook <b>' + esc(webhookStatus) + '</b></p>' : '') +
            '<button type="button" class="cm-btn cm-btn-primary" data-import-again style="margin-top:18px">Import another file</button></div>';
          panel.querySelector('[data-import-again]').addEventListener('click', function () { el.reset(); el.go(0); });
        };
        var afterHost = function () {
          if (m.webhookUrl) {
            fetch(m.webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(result)
            }).then(function (r) { return r.status + ' ' + r.statusText; })
              .catch(function () { return 'failed — payload was still delivered to onComplete'; })
              .then(function (st) { finish(st); });
          } else {
            finish();
          }
        };
        if (pr && typeof pr.then === 'function') { pr.then(afterHost).catch(afterHost); }
        else afterHost();
        el.dispatchEvent(new CustomEvent('csvmod-complete', { detail: result }));
      }
    }, 30);
    // immediately remove action buttons
    m.$next.hidden = true; m.$prev.hidden = true;
  };

  /* ---------------- reset ---------------- */
  CsvModImporterElement.prototype.reset = function () {
    var el = this, m = el._;
    m.parsed = false;
    m.raw = [];
    m.headerRowIndex = 0;
    m.mapping = {};
    m.rows = [];
    m.msgs = [];
    m.dups = {};
    m.filter = 'all';
    m.$file.value = '';
    m.$chips.hidden = true;
    el.go(0);
  };

  /* --------------------------------------------------------------------------
   * 6) SDK CLASS  (matches PRD: `new CSVMod({ ... })`)
   * ------------------------------------------------------------------------ */
  function CSVMod(options) {
    if (!(this instanceof CSVMod)) return new CSVMod(options);
    options = options || {};
    var el = document.createElement('csvmod-importer');
    el.schema = options.schema || { fields: [] };
    el.licenseKey = options.licenseKey || null;
    el.theme = options.theme || 'auto';
    if (options.webhookUrl) el.webhookUrl = options.webhookUrl;
    if (options.dupStrategy) el.dupStrategy = options.dupStrategy;
    if (options.rowLimit) el.rowLimit = options.rowLimit;
    if (options.rowLimitUrl) el.rowLimitUrl = options.rowLimitUrl;
    if (options.templates) el.templates = options.templates;
    if (options.brand) el.brand = options.brand;
    if (typeof options.onComplete === 'function') el.onComplete = options.onComplete;
    var mount = options.el || (typeof options.container === 'string' ? document.querySelector(options.container) : null);
    (mount || document.body).appendChild(el);
    this.el = el;
    this.open = function () { el.open(); };
    this.close = function () { el.close(); };
    this.destroy = function () { el.remove(); };
    this.ingestFile = function (f) { el.ingestFile(f); };
    this.ingestString = function (s) { el.ingestString(s); };
  }

  if (!global.customElements.get('csvmod-importer')) {
    global.customElements.define('csvmod-importer', CsvModImporterElement);
  }

  global.CsvMod = {
    create: function (opts) { return new CSVMod(opts); },
    configureAI: configureAI,
    SDK: CSVMod
  };
  global.CSVMod = CSVMod;

})(typeof window !== 'undefined' ? window : this);
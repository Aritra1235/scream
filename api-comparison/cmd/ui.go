package main

const dashboardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>API Benchmark Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0d1117;--card:#161b22;--border:#30363d;--text:#c9d1d9;--text2:#8b949e;--accent:#58a6ff;--green:#3fb950;--red:#f85149;--orange:#d29922;--purple:#bc8cff;--cyan:#39d4d4}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.header{background:var(--card);border-bottom:1px solid var(--border);padding:20px 32px;display:flex;align-items:center;justify-content:space-between}
.header h1{font-size:22px;font-weight:700;color:#fff}
.header .badge{background:var(--accent);color:#000;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600}
.container{max-width:1400px;margin:0 auto;padding:24px}
.config-panel{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:24px}
.config-panel h2{font-size:16px;margin-bottom:16px;color:#fff}
.config-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:16px}
.config-grid label{font-size:12px;color:var(--text2);display:block;margin-bottom:4px}
.config-grid input{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:8px 12px;color:var(--text);font-size:14px}
.config-grid input:focus{outline:none;border-color:var(--accent)}
.module-overrides{margin-top:16px;border-top:1px solid var(--border);padding-top:16px}
.module-overrides summary{cursor:pointer;color:var(--accent);font-size:13px;margin-bottom:8px}
.module-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}
.module-grid .item{display:flex;align-items:center;gap:8px;font-size:12px}
.module-grid .item input{width:80px}
.btn-row{display:flex;gap:12px;margin-top:16px}
.btn{padding:10px 24px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s}
.btn-primary{background:var(--accent);color:#000}.btn-primary:hover{opacity:.9}
.btn-primary:disabled{opacity:.4;cursor:not-allowed}
.btn-secondary{background:var(--border);color:var(--text)}.btn-secondary:hover{background:#444c56}
.status-bar{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px 16px;margin-bottom:24px;display:flex;align-items:center;gap:12px;font-size:14px}
.status-bar .dot{width:10px;height:10px;border-radius:50%;background:var(--text2)}
.status-bar .dot.running{background:var(--green);animation:pulse 1s infinite}
.status-bar .dot.done{background:var(--green)}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.progress{flex:1;background:var(--bg);border-radius:4px;height:6px;overflow:hidden}
.progress-fill{height:100%;background:var(--accent);transition:width .1s;width:0}
.charts-section h2{font-size:18px;margin-bottom:16px;color:#fff}
.chart-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(600px,1fr));gap:20px;margin-bottom:32px}
.chart-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;position:relative}
.chart-card h3{font-size:14px;margin-bottom:12px;color:var(--text2)}
.chart-card canvas{width:100%!important;height:250px!important}
.stats-section{margin-top:32px}
.stats-table{width:100%;border-collapse:collapse;font-size:13px}
.stats-table th,.stats-table td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--border)}
.stats-table th{background:var(--card);color:var(--text2);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px;position:sticky;top:0}
.stats-table td{font-variant-numeric:tabular-nums}
.stats-table tr:hover td{background:rgba(88,166,255,.05)}
.winner{color:var(--green);font-weight:600}
.loser{color:var(--text2)}
.empty{text-align:center;padding:60px;color:var(--text2)}
</style>
</head>
<body>
<div class="header">
  <h1>API Performance Dashboard</h1>
  <span class="badge">Bun/Elysia vs Go/Chi</span>
</div>
<div class="container">
  <div class="config-panel">
    <h2>Benchmark Configuration</h2>
    <div class="config-grid">
      <div><label>Requests per module (default)</label><input type="number" id="globalReqs" value="100" min="1"></div>
      <div><label>Concurrency</label><input type="number" id="concurrency" value="10" min="1" max="500"></div>
    </div>
    <details class="module-overrides">
      <summary>Per-module request overrides (optional)</summary>
      <div class="module-grid" id="moduleOverrides"></div>
    </details>
    <div class="btn-row">
      <button class="btn btn-primary" id="btnRun" onclick="startBenchmark()">Run Benchmark</button>
    </div>
  </div>

  <div class="status-bar" id="statusBar" style="display:none">
    <div class="dot" id="statusDot"></div>
    <span id="statusText">Idle</span>
    <div class="progress"><div class="progress-fill" id="progressFill"></div></div>
    <span id="progressText"></span>
  </div>

  <div class="charts-section" id="chartsSection" style="display:none">
    <h2>Live Latency Charts</h2>
    <div class="chart-grid" id="chartGrid"></div>
  </div>

  <div class="stats-section" id="statsSection" style="display:none">
    <h2 style="font-size:18px;margin-bottom:16px;color:#fff">Detailed Metrics</h2>
    <div style="overflow-x:auto">
      <table class="stats-table">
        <thead><tr>
          <th>Module</th><th>Backend</th><th>Reqs</th><th>OK</th><th>Fail</th>
          <th>Mean</th><th>Median</th><th>P90</th><th>P95</th><th>P99</th>
          <th>Min</th><th>Max</th><th>StdDev</th><th>Req/s</th><th>Total</th>
        </tr></thead>
        <tbody id="statsBody"></tbody>
      </table>
    </div>
  </div>

  <div class="empty" id="emptyState">Configure parameters above and click <b>Run Benchmark</b> to start.</div>
</div>

<script>
const BUN_COLOR = 'rgba(248,113,113,1)';
const GO_COLOR = 'rgba(56,189,248,1)';
const BUN_BG = 'rgba(248,113,113,0.15)';
const GO_BG = 'rgba(56,189,248,0.15)';

let charts = {};
let chartData = {};
let modules = [];
let evtSource = null;
let totalModuleDone = 0;
let totalModules = 0;
let allStats = [];

async function init() {
  const res = await fetch('/api/modules');
  modules = await res.json();
  const grid = document.getElementById('moduleOverrides');
  modules.forEach(m => {
    const d = document.createElement('div');
    d.className = 'item';
    d.innerHTML = '<span>' + m.name + '</span><input type="number" data-module="' + m.name + '" placeholder="default" min="0">';
    grid.appendChild(d);
  });
}
init();

function startBenchmark() {
  const cfg = {
    globalRequests: parseInt(document.getElementById('globalReqs').value) || 100,
    concurrency: parseInt(document.getElementById('concurrency').value) || 10,
    moduleRequests: {}
  };
  document.querySelectorAll('[data-module]').forEach(el => {
    const v = parseInt(el.value);
    if (v > 0) cfg.moduleRequests[el.dataset.module] = v;
  });

  document.getElementById('btnRun').disabled = true;
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('statusBar').style.display = 'flex';
  document.getElementById('chartsSection').style.display = 'block';
  document.getElementById('statsSection').style.display = 'block';

  charts = {};
  chartData = {};
  totalModuleDone = 0;
  totalModules = modules.length * 2;
  allStats = [];
  document.getElementById('chartGrid').innerHTML = '';
  document.getElementById('statsBody').innerHTML = '';

  modules.forEach(m => {
    chartData[m.name] = {bun: [], go: []};
    createChart(m.name);
  });

  if (evtSource) evtSource.close();
  evtSource = new EventSource('/api/events');
  evtSource.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    handleEvent(msg);
  };

  fetch('/api/run', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(cfg)});
}

function createChart(name) {
  const card = document.createElement('div');
  card.className = 'chart-card';
  card.innerHTML = '<h3>' + name + '</h3><canvas id="chart_' + name.replace(/[^a-zA-Z0-9]/g,'_') + '"></canvas>';
  document.getElementById('chartGrid').appendChild(card);

  const ctx = card.querySelector('canvas').getContext('2d');
  charts[name] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {label:'Bun/Elysia', data:[], borderColor:BUN_COLOR, backgroundColor:BUN_BG, borderWidth:1.5, pointRadius:0, fill:true, tension:.3},
        {label:'Go/Chi', data:[], borderColor:GO_COLOR, backgroundColor:GO_BG, borderWidth:1.5, pointRadius:0, fill:true, tension:.3}
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false, animation:{duration:0},
      interaction:{mode:'index',intersect:false},
      plugins:{legend:{labels:{color:'#8b949e',font:{size:11}}}},
      scales:{
        x:{display:false},
        y:{grid:{color:'#21262d'},ticks:{color:'#8b949e',font:{size:10}},title:{display:true,text:'ms',color:'#8b949e'}}
      }
    }
  });
}

function handleEvent(msg) {
  const {type, data} = msg;

  if (type === 'status') {
    const dot = document.getElementById('statusDot');
    const txt = document.getElementById('statusText');
    if (data.phase === 'signing_in') {txt.textContent = 'Signing in...'; dot.className = 'dot running';}
    else if (data.phase === 'running') {txt.textContent = 'Running benchmarks...'; dot.className = 'dot running';}
    else if (data.phase === 'done') {
      txt.textContent = 'Complete!'; dot.className = 'dot done';
      document.getElementById('btnRun').disabled = false;
      document.getElementById('progressFill').style.width = '100%';
      document.getElementById('progressText').textContent = '';
      if (evtSource) evtSource.close();
    }
  }

  if (type === 'module_start') {
    document.getElementById('statusText').textContent = 'Testing: ' + data.module + ' (' + data.backend + ')';
  }

  if (type === 'result') {
    const key = data.backend.includes('Bun') ? 'bun' : 'go';
    const cd = chartData[data.module];
    if (!cd) return;
    cd[key].push(data.latencyMs);

    const chart = charts[data.module];
    if (!chart) return;

    const dsIdx = key === 'bun' ? 0 : 1;
    chart.data.datasets[dsIdx].data = cd[key];
    const maxLen = Math.max(cd.bun.length, cd.go.length);
    chart.data.labels = Array.from({length:maxLen}, (_,i) => i+1);
    chart.update('none');

    document.getElementById('progressText').textContent = data.module + ' ' + data.backend + ': ' + data.reqIndex + '/' + data.total;
  }

  if (type === 'module_done') {
    totalModuleDone++;
    const pct = Math.round(totalModuleDone / totalModules * 100);
    document.getElementById('progressFill').style.width = pct + '%';
    allStats.push(data);
    updateStatsTable();
  }
}

function updateStatsTable() {
  const body = document.getElementById('statsBody');
  body.innerHTML = '';

  const grouped = {};
  allStats.forEach(s => {
    if (!grouped[s.module]) grouped[s.module] = {};
    grouped[s.module][s.backend] = s;
  });

  for (const mod in grouped) {
    const entries = grouped[mod];
    for (const be in entries) {
      const s = entries[be];
      const other = Object.values(entries).find(x => x.backend !== be);
      const isFaster = other ? s.meanMs < other.meanMs : false;
      const cls = other ? (isFaster ? 'winner' : 'loser') : '';

      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + s.module + '</td>' +
        '<td class="' + cls + '">' + s.backend + '</td>' +
        '<td>' + s.totalRequests + '</td>' +
        '<td style="color:var(--green)">' + s.successful + '</td>' +
        '<td style="color:' + (s.failed?'var(--red)':'var(--text2)') + '">' + s.failed + '</td>' +
        '<td class="' + cls + '">' + s.meanMs + '</td>' +
        '<td>' + s.medianMs + '</td>' +
        '<td>' + s.p90Ms + '</td>' +
        '<td>' + s.p95Ms + '</td>' +
        '<td>' + s.p99Ms + '</td>' +
        '<td>' + s.minMs + '</td>' +
        '<td>' + s.maxMs + '</td>' +
        '<td>' + s.stdDevMs + '</td>' +
        '<td>' + s.reqPerSec + '</td>' +
        '<td>' + s.totalTimeMs + 'ms</td>';
      body.appendChild(tr);
    }
  }
}
</script>
</body>
</html>`

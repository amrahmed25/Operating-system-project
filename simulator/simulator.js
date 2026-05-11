
let procs = [];
const COLORS = ['#22d3ee', '#fb923c', '#a78bfa', '#fbbf24', '#34d399', '#f472b6', '#60a5fa', '#2dd4bf', '#f87171', '#a3e635'];

function getColor(id) { const i = procs.findIndex(p => p.id === id); return COLORS[i % COLORS.length]; }

/* ── ADD / REMOVE ── */
function addProc() {
  const idEl = document.getElementById('i-id');
  const atEl = document.getElementById('i-at');
  const btEl = document.getElementById('i-bt');
  const errEl = document.getElementById('add-err');
  [idEl, atEl, btEl].forEach(e => e.classList.remove('err'));
  errEl.classList.remove('show');
  const id = idEl.value.trim().toUpperCase();
  const at = parseInt(atEl.value);
  const bt = parseInt(btEl.value);
  if (!id) { showErr(errEl, 'Process ID is required.'); idEl.classList.add('err'); return; }
  if (procs.find(p => p.id === id)) { showErr(errEl, `Duplicate ID: ${id}`); idEl.classList.add('err'); return; }
  if (isNaN(at) || at < 0) { showErr(errEl, 'Arrival time must be ≥ 0.'); atEl.classList.add('err'); return; }
  if (isNaN(bt) || bt <= 0) { showErr(errEl, 'Burst time must be > 0.'); btEl.classList.add('err'); return; }
  procs.push({ id, at, bt });
  idEl.value = ''; atEl.value = ''; btEl.value = '';
  renderList();
  idEl.focus();
}
function removeProc(id) { procs = procs.filter(p => p.id !== id); renderList(); }
function renderList() {
  const list = document.getElementById('proc-list');
  [...list.querySelectorAll('.proc-row')].forEach(r => r.remove());
  document.getElementById('proc-empty').style.display = procs.length ? 'none' : 'block';
  procs.forEach(p => {
    const c = getColor(p.id);
    const row = document.createElement('div'); row.className = 'proc-row';
    row.innerHTML = `<div class="proc-dot" style="background:${c}"></div>
      <div class="proc-id" style="color:${c}">${p.id}</div>
      <div class="proc-vals">AT:${p.at} &nbsp;BT:${p.bt}</div>
      <button class="proc-del" onclick="removeProc('${p.id}')">×</button>`;
    list.appendChild(row);
  });
}
function showErr(el, msg) { el.textContent = '⚠ ' + msg; el.classList.add('show'); }

/* ── SCENARIOS ── */
function load(n) {
  const sc = {
    basic: {
      q: 3,
      procs: [
        { id: 'P1', at: 0, bt: 8 }, { id: 'P2', at: 1, bt: 4 }, { id: 'P3', at: 2, bt: 9 },
        { id: 'P4', at: 3, bt: 5 }, { id: 'P5', at: 4, bt: 2 }, { id: 'P6', at: 5, bt: 1 }
      ]
    },
    shortjob: {
      q: 2,
      procs: [
        { id: 'P1', at: 0, bt: 2 }, { id: 'P2', at: 0, bt: 3 }, { id: 'P3', at: 1, bt: 1 },
        { id: 'P4', at: 2, bt: 4 }, { id: 'P5', at: 3, bt: 2 }
      ]
    },
    fairness: {
      q: 4,
      procs: [
        { id: 'P1', at: 0, bt: 10 }, { id: 'P2', at: 0, bt: 10 }, { id: 'P3', at: 0, bt: 10 }
      ]
    },
    longjob: {
      q: 4,
      procs: [
        { id: 'P1', at: 0, bt: 20 }, { id: 'P2', at: 1, bt: 2 }, { id: 'P3', at: 2, bt: 3 }, { id: 'P4', at: 3, bt: 1 }
      ]
    },
    validation: {
      q: 0,
      procs: [],
      note: 'Scenario E is for manual validation testing. Try invalid inputs (empty PID, negative AT, zero BT, duplicate PID, or quantum <= 0).'
    }
  };
  if (!sc[n]) return;
  procs = sc[n].procs.map(p => ({ ...p }));
  renderList();
  if (Number.isInteger(sc[n].q)) document.getElementById('quantum').value = String(sc[n].q);
  const runErr = document.getElementById('run-err');
  runErr.classList.remove('show');
  if (sc[n].note) showErr(runErr, sc[n].note);
}

/* ── ALGORITHMS ── */
function runRR(inp, q) {
  const p = inp.map(x => ({ ...x, rem: x.bt, wt: 0, tat: 0, rt: -1, fin: 0 }));
  p.sort((a, b) => a.at - b.at);
  let t = 0, done = 0, n = p.length, gantt = [], arrived = 0, queue = [], inQ = new Set();
  const enq = proc => { if (!inQ.has(proc.id)) { queue.push(proc); inQ.add(proc.id); } };
  while (arrived < n && p[arrived].at <= t) enq(p[arrived++]);
  if (!queue.length && arrived < n) { t = p[arrived].at; enq(p[arrived++]); }
  while (done < n) {
    if (!queue.length) {
      const nxt = p.filter(x => x.rem > 0).sort((a, b) => a.at - b.at)[0];
      gantt.push({ pid: 'IDLE', s: t, e: nxt.at }); t = nxt.at;
      while (arrived < n && p[arrived].at <= t) enq(p[arrived++]);
      continue;
    }
    const cur = queue.shift(); inQ.delete(cur.id);
    if (cur.rt === -1) cur.rt = t - cur.at;
    const run = Math.min(q, cur.rem);
    gantt.push({ pid: cur.id, s: t, e: t + run });
    t += run; cur.rem -= run;
    while (arrived < n && p[arrived].at <= t) enq(p[arrived++]);
    if (cur.rem > 0) enq(cur);
    else { cur.fin = t; cur.tat = cur.fin - cur.at; cur.wt = cur.tat - cur.bt; done++; }
  }
  return { gantt, procs: p };
}
function runSJFNP(inp) {
  const p = inp.map(x => ({ ...x, rem: x.bt, wt: 0, tat: 0, rt: -1, fin: 0 }));
  let t = 0, done = 0, gantt = [], ds = new Set();
  while (done < p.length) {
    const avail = p.filter(x => x.at <= t && !ds.has(x.id));
    if (!avail.length) { const nxt = p.filter(x => !ds.has(x.id)).sort((a, b) => a.at - b.at)[0]; gantt.push({ pid: 'IDLE', s: t, e: nxt.at }); t = nxt.at; continue; }
    avail.sort((a, b) => a.bt - b.bt || a.at - b.at);
    const cur = avail[0]; cur.rt = t - cur.at;
    gantt.push({ pid: cur.id, s: t, e: t + cur.bt });
    t += cur.bt; cur.fin = t; cur.tat = cur.fin - cur.at; cur.wt = cur.tat - cur.bt;
    ds.add(cur.id); done++;
  }
  return { gantt, procs: p };
}
function runSRTF(inp) {
  const p = inp.map(x => ({ ...x, rem: x.bt, wt: 0, tat: 0, rt: -1, fin: 0 }));
  let t = 0, done = 0, gantt = [];
  while (done < p.length) {
    const avail = p.filter(x => x.at <= t && x.rem > 0);
    if (!avail.length) {
      const nxt = p.filter(x => x.rem > 0).sort((a, b) => a.at - b.at)[0];
      if (gantt.length && gantt[gantt.length - 1].pid === 'IDLE') gantt[gantt.length - 1].e = nxt.at;
      else gantt.push({ pid: 'IDLE', s: t, e: nxt.at });
      t = nxt.at; continue;
    }
    avail.sort((a, b) => a.rem - b.rem || a.at - b.at);
    const cur = avail[0];
    if (cur.rt === -1) cur.rt = t - cur.at;
    if (gantt.length && gantt[gantt.length - 1].pid === cur.id) gantt[gantt.length - 1].e++;
    else gantt.push({ pid: cur.id, s: t, e: t + 1 });
    cur.rem--; t++;
    if (cur.rem === 0) { cur.fin = t; cur.tat = cur.fin - cur.at; cur.wt = cur.tat - cur.bt; done++; }
  }
  const m = [];
  for (const g of gantt) { if (m.length && m[m.length - 1].pid === g.pid) m[m.length - 1].e = g.e; else m.push({ ...g }); }
  return { gantt: m, procs: p };
}
function avg(list, k) { return (list.reduce((s, x) => s + x[k], 0) / list.length).toFixed(2); }

/* ── SIMULATE ── */
function runSim() {
  const runErr = document.getElementById('run-err');
  runErr.classList.remove('show');
  if (procs.length < 2) { showErr(runErr, 'Add at least 2 processes.'); return; }
  const q = parseInt(document.getElementById('quantum').value);
  if (isNaN(q) || q <= 0) { showErr(runErr, 'Time quantum must be a positive integer.'); return; }
  const rrR = runRR(procs, q);
  const sjfNPR = runSJFNP(procs);
  const srtfR = runSRTF(procs);
  const rrA = { wt: avg(rrR.procs, 'wt'), tat: avg(rrR.procs, 'tat'), rt: avg(rrR.procs, 'rt') };
  const sjfA = { wt: avg(sjfNPR.procs, 'wt'), tat: avg(sjfNPR.procs, 'tat'), rt: avg(sjfNPR.procs, 'rt') };
  const srtfA = { wt: avg(srtfR.procs, 'wt'), tat: avg(srtfR.procs, 'tat'), rt: avg(srtfR.procs, 'rt') };
  const right = document.getElementById('right');
  right.innerHTML = ''; right.classList.add('fade-up');
  // Gantt
  const gs = document.createElement('div');
  gs.innerHTML = '<div class="sec-head">Gantt Charts</div>';
  const sp = document.createElement('div'); sp.className = 'split';
  sp.appendChild(ganttCard('rr-h', 'rr-t', `ROUND ROBIN · Q=${q}`, rrR.gantt));
  sp.appendChild(ganttCard('sjf-h', 'sjf-t', 'SJF · NON-PREEMPTIVE', sjfNPR.gantt));
  sp.appendChild(ganttCard('srtf-h', 'srtf-t', 'SJF · PREEMPTIVE (SRTF)', srtfR.gantt));
  gs.appendChild(sp); right.appendChild(gs);
  // Metrics
  const ms = document.createElement('div');
  ms.innerHTML = '<div class="sec-head">Per-Process Metrics</div>';
  ms.appendChild(metricsCard(rrR.procs, sjfNPR.procs, srtfR.procs, rrA, sjfA, srtfA));
  right.appendChild(ms);
  // Comparison
  const cs = document.createElement('div');
  cs.innerHTML = '<div class="sec-head">Comparison Summary</div>';
  cs.appendChild(cmpCard(rrA, sjfA, srtfA, q));
  right.appendChild(cs);
}

/* ── GANTT CARD ── */
function ganttCard(headCls, titleCls, title, gantt) {
  const card = document.createElement('div'); card.className = 'card';
  const total = gantt.length ? gantt[gantt.length - 1].e : 1;
  let blocks = '';
  gantt.forEach(g => {
    const w = ((g.e - g.s) / total * 100).toFixed(2);
    const c = g.pid === 'IDLE' ? '' : 'background:' + getColor(g.pid) + ';color:#000;';
    const cls = g.pid === 'IDLE' ? 'g-block g-idle' : 'g-block';
    blocks += `<div class="${cls}" style="width:${w}%;${c}" title="${g.pid} [${g.s}→${g.e}]">${g.pid}</div>`;
  });
  const times = new Set(); gantt.forEach(g => { times.add(g.s); times.add(g.e); });
  let markers = '';
  [...times].sort((a, b) => a - b).forEach(t => {
    const l = (t / total * 100).toFixed(2);
    markers += `<span class="g-time" style="left:${l}%">${t}</span>`;
  });
  card.innerHTML = `
    <div class="card-head ${headCls}"><span class="card-title ${titleCls}">${title}</span></div>
    <div class="card-body">
      <div class="gantt-lbl">EXECUTION TIMELINE</div>
      <div class="gantt-wrap">
        <div class="gantt-track">${blocks}</div>
        <div class="g-times" style="position:relative;min-width:100%;height:16px;">${markers}</div>
      </div>
    </div>`;
  return card;
}

/* ── METRICS CARD ── */
function metricsCard(rrP, sjfP, srtfP, rrA, sjfA, srtfA) {
  const card = document.createElement('div'); card.className = 'card';
  let rows = '';
  rrP.forEach(rp => {
    const sp = sjfP.find(x => x.id === rp.id);
    const tp = srtfP.find(x => x.id === rp.id);
    const c = getColor(rp.id);
    rows += `<tr>
      <td style="color:${c};font-weight:700">${rp.id}</td>
      <td style="color:var(--text2)">${rp.at}</td>
      <td style="color:var(--text2)">${rp.bt}</td>
      <td>${rp.wt}</td><td>${rp.tat}</td><td>${rp.rt}</td>
      <td>${sp.wt}</td><td>${sp.tat}</td><td>${sp.rt}</td>
      <td>${tp.wt}</td><td>${tp.tat}</td><td>${tp.rt}</td>
    </tr>`;
  });
  card.innerHTML = `<div class="tbl-wrap"><table class="mtbl">
    <thead>
      <tr>
        <th class="base" rowspan="2">PID</th>
        <th class="base" rowspan="2">AT</th>
        <th class="base" rowspan="2">BT</th>
        <th class="rr-th" colspan="3">▶ ROUND ROBIN</th>
        <th class="sjf-th" colspan="3">▶ SJF NON-PREEMPTIVE</th>
        <th class="srtf-th" colspan="3">▶ SJF PREEMPTIVE (SRTF)</th>
      </tr>
      <tr>
        <th class="rr-th">WT</th><th class="rr-th">TAT</th><th class="rr-th">RT</th>
        <th class="sjf-th">WT</th><th class="sjf-th">TAT</th><th class="sjf-th">RT</th>
        <th class="srtf-th">WT</th><th class="srtf-th">TAT</th><th class="srtf-th">RT</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="avg">
        <td colspan="3">AVG</td>
        <td>${rrA.wt}</td><td>${rrA.tat}</td><td>${rrA.rt}</td>
        <td>${sjfA.wt}</td><td>${sjfA.tat}</td><td>${sjfA.rt}</td>
        <td>${srtfA.wt}</td><td>${srtfA.tat}</td><td>${srtfA.rt}</td>
      </tr>
    </tbody>
  </table></div>`;
  return card;
}

/* ── COMPARISON CARD ── */
function cmpCard(rrA, sjfA, srtfA, q) {
  const card = document.createElement('div'); card.className = 'card';
  function w3(a, b, c) {
    const min = Math.min(+a, +b, +c);
    const w = [];
    if (+a === min) w.push('rr'); if (+b === min) w.push('sjf'); if (+c === min) w.push('srtf');
    return w.length === 3 ? 'tie' : w[0];
  }
  function winLabel(w) { return w === 'rr' ? 'RR WINS' : w === 'sjf' ? 'SJF NP WINS' : w === 'srtf' ? 'SRTF WINS' : 'TIE'; }
  function mbox(name, rv, sv, tv) {
    const win = w3(rv, sv, tv);
    return `<div class="cmp-box">
      <div class="cmp-name">Avg ${name}</div>
      <div class="cmp-vals">
        <div class="cmp-val"><span class="cmp-num rr ${win === 'rr' ? 'winner' : ''}">${rv}</span><span class="cmp-sub">RR</span></div>
        <div class="cmp-val"><span class="cmp-num sjf ${win === 'sjf' ? 'winner' : ''}">${sv}</span><span class="cmp-sub">SJF NP</span></div>
        <div class="cmp-val"><span class="cmp-num srtf ${win === 'srtf' ? 'winner' : ''}">${tv}</span><span class="cmp-sub">SRTF</span></div>
      </div>
      <span class="w-tag w-${win === 'tie' ? 'tie' : win}">${winLabel(win)}</span>
    </div>`;
  }
  const lines = [];
  const wtWin = w3(rrA.wt, sjfA.wt, srtfA.wt);
  const wtName = wtWin === 'rr' ? `Round Robin (${rrA.wt})` : wtWin === 'sjf' ? `SJF Non-Preemptive (${sjfA.wt})` : wtWin === 'srtf' ? `SRTF (${srtfA.wt})` : 'all (tied)';
  lines.push(`► Lowest avg waiting time: <span style="color:var(--green);font-weight:700">${wtName}</span>.`);
  const rtWin = w3(rrA.rt, sjfA.rt, srtfA.rt);
  const rtName = rtWin === 'rr' ? 'Round Robin' : rtWin === 'sjf' ? 'SJF Non-Preemptive' : rtWin === 'srtf' ? 'SRTF' : 'all (tied)';
  lines.push(`► Best avg response time: <span style="color:var(--green);font-weight:700">${rtName}</span>. ${rtWin === 'rr' ? 'RR excels at quick first response for interactive workloads.' : rtWin === 'srtf' ? 'SRTF preempts immediately when a shorter job arrives, minimising response delay.' : 'SJF NP picks the shortest ready job, yielding low wait for short bursts.'}`);
  lines.push(`► Round Robin (Q=${q}) ensures fairness and prevents starvation by cycling all ready processes equally, at the cost of higher context-switching overhead.`);
  lines.push(`► SJF Non-Preemptive selects the shortest ready job and runs it to completion — optimal for throughput but may starve long processes and cannot respond to shorter arrivals mid-execution.`);
  lines.push(`► SJF Preemptive (SRTF) preempts the running process whenever a shorter remaining-time job arrives, achieving the best possible average waiting time theoretically, but at the cost of frequent preemptions.`);
  const tatWin = w3(rrA.tat, sjfA.tat, srtfA.tat);
  const recName = tatWin === 'rr' ? 'Round Robin' : tatWin === 'sjf' ? 'SJF Non-Preemptive' : tatWin === 'srtf' ? 'SJF Preemptive (SRTF)' : 'None (equal performance)';
  lines.push(`► Recommendation: <span style="color:var(--green);font-weight:700">${recName}</span> — based on lowest overall avg turnaround time.`);
  card.innerHTML = `<div class="card-body">
    <div class="cmp-grid">
      ${mbox('Wait Time', rrA.wt, sjfA.wt, srtfA.wt)}
      ${mbox('Turnaround', rrA.tat, sjfA.tat, srtfA.tat)}
      ${mbox('Response', rrA.rt, sjfA.rt, srtfA.rt)}
    </div>
    <div class="concl">
      <div class="sec-head" style="margin-bottom:10px;">Conclusion</div>
      <p>${lines.join('<br><br>')}</p>
    </div>
  </div>`;
  return card;
}

/* ── RESET ── */
function resetAll() {
  procs = []; renderList();
  ['add-err', 'run-err'].forEach(id => document.getElementById(id).classList.remove('show'));
  document.getElementById('quantum').value = '2';
  document.getElementById('right').innerHTML = `
    <div class="placeholder">
      <div class="ph-ring"><span>⚙</span></div>
      <div class="ph-text">ADD PROCESSES &amp; RUN SIMULATION<br>
        <span style="font-size:9px;opacity:.5;">RESULTS WILL APPEAR HERE</span></div>
    </div>`;
}

/* ── KEYBOARD ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
    const ids = ['i-id', 'i-at', 'i-bt'];
    const idx = ids.indexOf(document.activeElement.id);
    if (idx < ids.length - 1) document.getElementById(ids[idx + 1]).focus();
    else addProc();
  }
});
renderList();

/* Leonida Platinum Atlas — tracker logic.
   Data comes from data/trophies.js (window.TROPHY_DATA) so the guide works
   from file:// with the network off; trophies.json is the same data for tools.
   Progress lives only in localStorage; export/import move it as JSON. */
(function () {
  'use strict';

  var STORE_KEY = 'leonida-platinum-atlas-v1';
  var DEMO_EARNED = [2, 3, 4, 8, 20, 21, 33, 37, 44, 45, 46, 51, 55];
  var POINTS = { Platinum: 180, Gold: 90, Silver: 30, Bronze: 15 };
  var KIND_LABELS = {
    story: 'Story', strangers: 'Strangers', activities: 'Activities',
    collectibles: 'Collectibles', crime: 'Crime', combat: 'Combat',
    money: 'Money', secret: 'Secret & misc', completion: 'Completion'
  };

  var data = window.TROPHY_DATA || null;
  var trophies = data ? data.trophies.slice() : [];
  var roadmap = data ? data.roadmap : [];
  var missableNotes = data ? data.missables : [];
  var byId = {};
  trophies.forEach(function (t) { byId[t.id] = t; });

  var state = loadState();
  var params = new URLSearchParams(window.location.search);
  var demo = params.get('demo') === '1';
  if (demo) {
    DEMO_EARNED.forEach(function (id) { state.earned[id] = true; });
  }
  var showSpoilers = params.get('spoilers') === '1' || state.spoilers === true;

  var els = {
    stats: document.getElementById('stats'),
    fill: document.getElementById('progressFill'),
    bar: document.getElementById('progressBar'),
    line: document.getElementById('progressLine'),
    search: document.getElementById('search'),
    kind: document.getElementById('kindFilter'),
    grade: document.getElementById('gradeFilter'),
    status: document.getElementById('statusFilter'),
    spoiler: document.getElementById('spoilerToggle'),
    grid: document.getElementById('grid'),
    hint: document.getElementById('listHint'),
    roadmap: document.getElementById('roadmap'),
    missables: document.getElementById('missables'),
    detail: document.getElementById('detail'),
    detailBody: document.getElementById('detailBody')
  };

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return { earned: {}, notes: {}, spoilers: false };
      var parsed = JSON.parse(raw);
      return {
        earned: parsed.earned || {},
        notes: parsed.notes || {},
        spoilers: !!parsed.spoilers
      };
    } catch (e) {
      return { earned: {}, notes: {}, spoilers: false };
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) { /* storage full or blocked: the page still works in memory */ }
  }

  function earnedCount() {
    return trophies.filter(function (t) { return state.earned[t.id]; }).length;
  }

  function earnedPoints() {
    return trophies.reduce(function (sum, t) {
      return sum + (state.earned[t.id] ? POINTS[t.grade] : 0);
    }, 0);
  }

  function isConcealed(t) {
    return t.hidden && !showSpoilers && !state.earned[t.id];
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function missableLabel(t) {
    if (t.missable === 'possible') return 'POSSIBLY MISSABLE';
    if (t.missable === 'partner') return 'PARTNER-GATED';
    return null;
  }

  function renderStats() {
    var n = earnedCount();
    var grades = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0 };
    trophies.forEach(function (t) { if (state.earned[t.id]) grades[t.grade]++; });
    var pct = trophies.length ? Math.round((n / trophies.length) * 100) : 0;
    els.stats.innerHTML =
      '<span class="stat"><b>' + n + ' / ' + trophies.length + '</b> trophies earned</span>' +
      '<span class="stat"><b>' + pct + '%</b> to platinum</span>' +
      '<span class="stat"><b>' + earnedPoints() + ' / 1,230</b> PSN points</span>' +
      '<span class="stat">Platinum ' + grades.Platinum + '/1 &middot; Gold ' + grades.Gold + '/2 &middot; Silver ' + grades.Silver + '/6 &middot; Bronze ' + grades.Bronze + '/46</span>' +
      '<span class="stat"><b>1,000G</b> Xbox total</span>';
    els.fill.style.width = pct + '%';
    els.bar.setAttribute('aria-valuenow', String(n));
    var remaining = trophies.length - n;
    els.line.innerHTML = n === trophies.length
      ? '<b>Platinum earned — you are a Leonida Legend.</b>'
      : 'You have <b>' + remaining + ' trophies</b> left. ' +
        (state.earned[28] ? '' : 'Do <b>Positive Mental Attitude (#28)</b> early — it is the one possibly missable trophy. ');
  }

  function trophyMatches(t) {
    var q = els.search.value.trim().toLowerCase();
    if (q) {
      var hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    if (els.kind.value !== 'all' && t.kind !== els.kind.value) return false;
    if (els.grade.value !== 'all' && t.grade !== els.grade.value) return false;
    var st = els.status.value;
    if (st === 'earned' && !state.earned[t.id]) return false;
    if (st === 'remaining' && state.earned[t.id]) return false;
    if (st === 'missable' && !t.missable) return false;
    if (st === 'hidden' && !t.hidden) return false;
    return true;
  }

  function renderGrid() {
    var shown = trophies.filter(trophyMatches);
    els.hint.textContent = shown.length + ' of 55 trophies shown' +
      (showSpoilers ? ' — spoilers on: hidden names visible.' : ' — spoiler-safe: hidden trophies stay hidden until earned.');
    if (!shown.length) {
      els.grid.innerHTML = '<p class="empty">No trophies match those filters. Clear the search or widen a filter.</p>';
      return;
    }
    els.grid.innerHTML = shown.map(function (t) {
      var concealed = isConcealed(t);
      var earned = !!state.earned[t.id];
      var warn = missableLabel(t);
      var name = concealed ? 'Hidden trophy #' + t.id : t.name;
      var desc = concealed ? 'Hidden on PlayStation until earned — tick it when it pops, or switch spoilers on to see it.' : t.description;
      var guide = concealed ? '' : '<p class="guide">' + escapeHtml(t.guide) + '</p>';
      var pills = '<span class="pill grade-' + t.grade + '">' + t.grade + '</span>' +
        '<span class="pill">' + KIND_LABELS[t.kind] + '</span>' +
        (t.hidden ? '<span class="pill hidden-pill">Hidden</span>' : '') +
        (t.gamerscore ? '<span class="pill">' + t.gamerscore + 'G Xbox</span>' : '<span class="pill">0G Xbox</span>') +
        (t.targetLabel ? '<span class="pill">' + escapeHtml(t.targetLabel) + '</span>' : '') +
        '<span class="pill">' + escapeHtml(t.rarity) + '</span>' +
        (warn ? '<span class="pill warn">' + warn + '</span>' : '');
      var note = state.notes[t.id] || '';
      return '<article class="card' + (earned ? ' earned' : '') + (t.missable ? ' missable-flag' : '') + '" data-id="' + t.id + '">' +
        '<div class="card-head">' +
          '<input type="checkbox" class="check" data-id="' + t.id + '"' + (earned ? ' checked' : '') + ' aria-label="Mark ' + escapeHtml(name) + ' earned">' +
          '<div><span class="num">#' + t.id + ' / 55</span><h3>' + escapeHtml(name) + '</h3></div>' +
        '</div>' +
        '<p class="desc">' + escapeHtml(desc) + '</p>' + guide +
        '<div class="meta">' + pills + '</div>' +
        (concealed ? '' : '<p class="src">Source: ' + escapeHtml(t.source) + '</p>') +
        '<textarea class="note" data-id="' + t.id + '" placeholder="Your note — e.g. where you found it…" aria-label="Note for ' + escapeHtml(name) + '">' + escapeHtml(note) + '</textarea>' +
        '<div class="card-actions"><button type="button" class="detailBtn" data-id="' + t.id + '">Full guide</button></div>' +
      '</article>';
    }).join('');
  }

  function renderRoadmap() {
    els.roadmap.innerHTML = roadmap.map(function (phase) {
      var done = phase.ids.filter(function (id) { return state.earned[id]; }).length;
      var pct = Math.round((done / phase.ids.length) * 100);
      var items = phase.ids.map(function (id) {
        var t = byId[id];
        var label = isConcealed(t) ? 'Hidden trophy #' + id : t.name;
        return '<li class="' + (state.earned[id] ? 'done' : '') + '">' +
          (state.earned[id] ? '✓ ' : '○ ') + escapeHtml(label) + ' (' + t.grade + ')</li>';
      }).join('');
      return '<div class="phase"><h3>Phase ' + phase.phase + ' — ' + escapeHtml(phase.title) +
        ' (' + done + '/' + phase.ids.length + ')</h3><p>' + escapeHtml(phase.note) + '</p>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div><ul>' + items + '</ul></div>';
    }).join('');
  }

  function renderMissables() {
    els.missables.innerHTML = missableNotes.map(function (m) {
      var t = byId[m.id];
      var name = isConcealed(t) ? 'Hidden trophy #' + m.id : t.name;
      return '<div class="alert"><h3>#' + m.id + ' — ' + escapeHtml(name) + ' — ' + escapeHtml(m.level) + '</h3>' +
        '<p>' + escapeHtml(t.description) + '</p>' +
        '<p>' + escapeHtml(t.guide) + '</p>' +
        '<p><strong>What to do:</strong> ' + escapeHtml(m.note) + '</p>' +
        '<p class="src">Source: ' + escapeHtml(t.source) + '</p></div>';
    }).join('') +
    '<p><strong>Everything else:</strong> no other trophy is flagged missable. Story trophies come from playing the story; the rest are counts and collectibles you can finish after the final mission.</p>';
  }

  function renderAll() {
    renderStats();
    renderGrid();
    renderRoadmap();
    renderMissables();
  }

  function openDetail(id) {
    var t = byId[id];
    if (!t) return;
    var concealed = isConcealed(t);
    var warn = missableLabel(t);
    els.detailBody.innerHTML =
      '<p class="num">#' + t.id + ' / 55 &middot; ' + t.grade + ' &middot; ' + KIND_LABELS[t.kind] +
      (t.hidden ? ' &middot; Hidden' : '') + '</p>' +
      '<h3>' + escapeHtml(concealed ? 'Hidden trophy #' + t.id : t.name) + '</h3>' +
      '<p class="desc">' + escapeHtml(concealed ? 'Hidden on PlayStation until earned.' : t.description) + '</p>' +
      (concealed ? '' : '<p>' + escapeHtml(t.guide) + '</p>') +
      '<p>' + (t.targetLabel ? 'PSN progress target: <b>' + escapeHtml(t.targetLabel) + '</b>. ' : '') +
      'Xbox: <b>' + t.gamerscore + 'G</b>. PSN rarity (19 Nov 2026 snapshot): <b>' + escapeHtml(t.rarity) + '</b>.</p>' +
      (warn ? '<p><b>' + warn + '.</b></p>' : '') +
      (concealed ? '' : '<p class="src">Source: ' + escapeHtml(t.source) + '</p>') +
      '<p>Status: <b>' + (state.earned[t.id] ? 'Earned ✓' : 'Not yet earned') + '</b></p>';
    if (typeof els.detail.showModal === 'function') els.detail.showModal();
  }

  function switchView(name) {
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === name);
    });
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + name);
    });
  }

  function exportProgress() {
    var payload = {
      app: 'leonida-platinum-atlas',
      exported: new Date().toISOString(),
      earned: Object.keys(state.earned).filter(function (id) { return state.earned[id]; }).map(Number),
      notes: state.notes
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophies-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        var earned = parsed.earned || parsed.trophies || [];
        var fresh = { earned: {}, notes: parsed.notes || {} };
        earned.forEach(function (id) {
          if (byId[id] || byId[Number(id)]) fresh.earned[Number(id)] = true;
        });
        state.earned = fresh.earned;
        state.notes = fresh.notes;
        saveState();
        renderAll();
      } catch (e) {
        window.alert('That file is not a valid progress export.');
      }
    };
    reader.readAsText(file);
  }

  /* Events — delegated where the DOM is re-rendered. */
  els.grid.addEventListener('change', function (e) {
    var el = e.target;
    if (el.classList.contains('check')) {
      var id = Number(el.dataset.id);
      state.earned[id] = el.checked;
      if (!el.checked) delete state.earned[id];
      saveState();
      renderAll();
    }
  });
  els.grid.addEventListener('input', function (e) {
    if (e.target.classList.contains('note')) {
      var id = Number(e.target.dataset.id);
      if (e.target.value) state.notes[id] = e.target.value;
      else delete state.notes[id];
      saveState();
    }
  });
  els.grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.detailBtn');
    if (btn) openDetail(Number(btn.dataset.id));
  });
  [els.search, els.kind, els.grade, els.status].forEach(function (el) {
    el.addEventListener('input', renderGrid);
    el.addEventListener('change', renderGrid);
  });
  els.spoiler.addEventListener('change', function () {
    showSpoilers = els.spoiler.checked;
    state.spoilers = showSpoilers;
    saveState();
    renderAll();
  });
  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { switchView(b.dataset.view); });
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importBtn').addEventListener('click', function () {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', function () {
    if (window.confirm('Clear all earned trophies and notes?')) {
      state.earned = {};
      state.notes = {};
      saveState();
      renderAll();
    }
  });

  els.spoiler.checked = showSpoilers;

  /* Boot: prefer the bundled data; fall back to fetching the JSON over http. */
  if (trophies.length === 55) {
    renderAll();
  } else {
    fetch('data/trophies.json').then(function (r) { return r.json(); }).then(function (d) {
      data = d;
      trophies = d.trophies.slice();
      roadmap = d.roadmap;
      missableNotes = d.missables;
      trophies.forEach(function (t) { byId[t.id] = t; });
      renderAll();
    }).catch(function () {
      els.grid.innerHTML = '<p class="empty">Trophy data could not be loaded. Open the guide from its own files (data/trophies.js must sit next to index.html).</p>';
    });
  }

  /* Deep links used for screenshots: ?view=roadmap|missables|sources and ?trophy=28. */
  var view = params.get('view');
  if (view && ['checklist', 'roadmap', 'missables', 'sources'].indexOf(view) !== -1) switchView(view);
  var trophyParam = Number(params.get('trophy'));
  if (trophyParam && byId[trophyParam]) {
    setTimeout(function () { openDetail(trophyParam); }, 50);
  }
})();

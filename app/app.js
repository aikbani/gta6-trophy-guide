/* Leonida Platinum Atlas — offline tracker. No network: data comes from data/trophies.js
   (same list as data/trophies.json, the gate-checked file). Progress lives in localStorage only. */
(function () {
  'use strict';
  var KEY = 'gta6-platinum-atlas-v1';
  var POINTS = { platinum: 180, gold: 90, silver: 30, bronze: 15 };
  var KIND_LABEL = {
    story: 'Story', stranger: 'Strangers', activity: 'Activity', combat: 'Combat',
    collectible: 'Collectible', crime: 'Crime', money: 'Money', misc: 'Secret & misc',
    platinum: 'Platinum', completion: '100% completion'
  };

  function $(id) { return document.getElementById(id); }
  function loadState() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function saveState() { localStorage.setItem(KEY, JSON.stringify(state)); }

  var state = loadState();
  state.earned = state.earned || [];
  state.notes = state.notes || {};
  state.spoilers = !!state.spoilers;
  var earned = new Set(state.earned);

  var params = new URLSearchParams(location.search);
  // Demo seeding for screenshots only (?demo=1): 13 earned, mixed grades/kinds.
  if (params.get('demo') === '1' && !state.demoSeeded) {
    [2, 3, 4, 8, 14, 15, 16, 19, 20, 21, 33, 35, 46].forEach(function (id) { earned.add(id); });
    state.demoSeeded = true;
  }
  if (params.get('spoilers') === '1') state.spoilers = true;
  if (params.get('spoilers') === '0') state.spoilers = false;

  var DATA = window.GTA6_DATA;
  if (!DATA) { document.getElementById('grid').innerHTML = '<p>Data failed to load.</p>'; return; }
  var TROPHIES = DATA.trophies;
  var byId = {};
  TROPHIES.forEach(function (t) { byId[t.id] = t; });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function medalLetter(g) { return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[g] || '?'; }
  function isHidden(t) { return !!t.hidden; }
  function isSpoiled(t) { return state.spoilers || earned.has(t.id) || !isHidden(t); }

  /* ---------- stats ---------- */
  function renderStats() {
    var n = earned.size;
    var pts = 0;
    TROPHIES.forEach(function (t) { if (earned.has(t.id)) pts += POINTS[t.grade]; });
    $('statEarned').textContent = n;
    $('statPct').textContent = Math.round(n / TROPHIES.length * 100) + '%';
    $('statPts').textContent = pts.toLocaleString();
    $('progressFill').style.width = (n / TROPHIES.length * 100) + '%';
    $('progressLab').textContent = n + ' of 55 earned — ' +
      (n === 55 ? 'Platinum! Vice Got a Price! is yours.' : (55 - n) + ' to go to Vice Got a Price!');
  }

  /* ---------- checklist ---------- */
  function currentFilter() {
    return {
      q: ($('search').value || '').trim().toLowerCase(),
      kind: $('kind').value, grade: $('grade').value, status: $('status').value
    };
  }
  function visible(t, f) {
    if (f.kind !== 'all' && t.kind !== f.kind) return false;
    if (f.grade !== 'all' && t.grade !== f.grade) return false;
    if (f.status === 'earned' && !earned.has(t.id)) return false;
    if (f.status === 'remaining' && earned.has(t.id)) return false;
    if (f.status === 'missable' && !(t.missable === 'possible' || t.missable === 'caution')) return false;
    if (f.status === 'hidden' && !t.hidden) return false;
    if (f.q) {
      var hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + KIND_LABEL[t.kind] + ' ' + t.grade).toLowerCase();
      if (hay.indexOf(f.q) === -1) return false;
    }
    return true;
  }
  function chip(t) {
    var out = '<span class="chip">' + esc(KIND_LABEL[t.kind]) + '</span>' +
      '<span class="chip">' + esc(t.grade) + ' · ' + POINTS[t.grade] + ' pts</span>';
    if (t.target) out += '<span class="chip">PSN target: ' + esc(t.target.need.toLocaleString()) + ' ' + esc(t.target.unit) + '</span>';
    if (t.rarity_psn) out += '<span class="chip rare">PSN rarity ' + esc(t.rarity_psn) + ' (19 Nov 2026)</span>';
    if (t.xbox_g) out += '<span class="chip">' + t.xbox_g + 'G on Xbox</span>';
    if (t.hidden) out += '<span class="chip hidden-chip">HIDDEN — spoiler</span>';
    if (t.missable === 'possible') out += '<span class="chip miss-chip">⚠ POSSIBLY MISSABLE</span>';
    if (t.missable === 'caution') out += '<span class="chip caut-chip">⚠ DO WITH PARTNER</span>';
    return out;
  }
  function cardHtml(t) {
    var got = earned.has(t.id);
    var spoiled = isSpoiled(t);
    var cls = 'card' + (got ? ' earned' : '') + ((t.missable !== 'no') ? ' missable-flag' : '');
    var body;
    if (!spoiled) {
      body = '<p class="desc spoiler-hidden">Hidden trophy — its name and description stay hidden until you earn it or switch spoilers on. (Spoiler-safe mode is on.)</p>' +
        '<p class="guide">Grade: <b>' + esc(t.grade) + '</b> · ' + esc(KIND_LABEL[t.kind]) + '. Reveal it by earning it, or toggle “Show story spoilers” above.</p>';
    } else {
      body = '<p class="desc">“' + esc(t.description) + '”</p>' +
        '<p class="guide"><b>Guide:</b> ' + esc(t.guide) + '</p>' +
        (t.missable_note ? '<p class="guide"><b>⚠ Missable note:</b> ' + esc(t.missable_note) + '</p>' : '');
    }
    var note = state.notes[t.id] || '';
    return '<article class="' + cls + '" data-id="' + t.id + '" tabindex="0">' +
      '<div class="card-top"><span class="medal ' + esc(t.grade) + '">' + medalLetter(t.grade) + '</span>' +
      '<h3><span class="num">#' + t.id + ' · </span>' + (spoiled ? esc(t.name) : 'Hidden trophy') + '</h3>' +
      '<label class="check"><input type="checkbox" data-check="' + t.id + '"' + (got ? ' checked' : '') + '> Earned</label></div>' +
      body +
      '<div class="meta">' + chip(t) + '</div>' +
      (spoiled ? '<p class="src">Sources: ' + esc(t.sources) + '</p>' : '') +
      '<input class="note-input" data-note="' + t.id + '" placeholder="Your note — e.g. “2 of 5 vaults done”" value="' + esc(note) + '">' +
      '</article>';
  }
  function renderGrid() {
    var f = currentFilter();
    var list = TROPHIES.filter(function (t) { return visible(t, f); });
    $('grid').innerHTML = list.map(cardHtml).join('');
    $('emptyMsg').hidden = list.length > 0;
    $('countLine').textContent = 'Showing ' + list.length + ' of 55 trophies' +
      (f.q ? ' for “' + f.q + '”' : '') + ' · ' + earned.size + ' earned';
    renderStats();
  }

  /* ---------- roadmap ---------- */
  function renderRoadmap() {
    $('roadmap').innerHTML = DATA.roadmap.map(function (p) {
      var done = p.trophies.filter(function (id) { return earned.has(id); }).length;
      var chips = p.trophies.map(function (id) {
        var t = byId[id];
        return '<span class="chip' + (earned.has(id) ? ' done' : '') + '" data-open="' + id + '">' +
          (earned.has(id) ? '✓ ' : '') + '#' + id + ' ' + esc(t.name) + ' (' + t.grade + ')</span>';
      }).join('');
      return '<div class="phase"><h2><span class="ph-num">Phase ' + p.phase + '</span> — ' + esc(p.title) + '</h2>' +
        '<p>' + esc(p.note) + '</p><p class="phase-prog">' + done + ' of ' + p.trophies.length + ' earned in this phase</p>' +
        '<div class="phase-chips">' + chips + '</div></div>';
    }).join('');
  }

  /* ---------- missables ---------- */
  function renderMissables() {
    var flagged = TROPHIES.filter(function (t) { return t.missable !== 'no'; });
    $('missableList').innerHTML = flagged.map(function (t) {
      return '<div class="phase"><h2><span class="ph-num">#' + t.id + '</span> — ' + esc(t.name) + ' <span class="chip ' +
        (t.missable === 'possible' ? 'miss-chip' : 'caut-chip') + '">' +
        (t.missable === 'possible' ? 'POSSIBLY MISSABLE' : 'PARTNER-GATED — DO EARLY') + '</span></h2>' +
        '<p>“' + esc(t.description) + '” — ' + esc(t.grade) + ', ' + esc(KIND_LABEL[t.kind]) + '.</p>' +
        '<p><strong>Guide:</strong> ' + esc(t.guide) + '</p>' +
        '<p><strong>Why it is flagged:</strong> ' + esc(t.missable_note || '') + '</p>' +
        '<p class="src">Sources: ' + esc(t.sources) + '</p></div>';
    }).join('');
  }

  /* ---------- detail dialog ---------- */
  function openDetail(id) {
    var t = byId[id];
    if (!t) return;
    var got = earned.has(id);
    $('detailBody').innerHTML =
      '<div class="card-top"><span class="medal ' + esc(t.grade) + '">' + medalLetter(t.grade) + '</span>' +
      '<h2 id="detailTitle">#' + t.id + ' — ' + esc(t.name) + '</h2></div>' +
      '<p class="desc">Official description: “' + esc(t.description) + '”</p>' +
      '<div class="meta">' + chip(t) + '</div>' +
      '<h4>Guide — our own words</h4><p class="guide">' + esc(t.guide) + '</p>' +
      (t.missable_note ? '<h4>Missable note</h4><p>' + esc(t.missable_note) + '</p>' : '') +
      '<h4>Sources</h4><p class="src">' + esc(t.sources) + '</p>' +
      '<h4>Your progress</h4><p>' + (got ? '✓ Earned — ticked in your checklist.' : 'Not earned yet. Tick it on the checklist when it pops.') +
      (t.target ? ' PSN target: ' + esc(t.target.need.toLocaleString()) + ' ' + esc(t.target.unit) + '.' : '') + '</p>';
    $('detail').hidden = false;
  }
  function closeDetail() { $('detail').hidden = true; }
  $('detailClose').addEventListener('click', closeDetail);
  $('detailBackdrop').addEventListener('click', closeDetail);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDetail();
    if (e.key === '?' && document.activeElement !== $('search')) { e.preventDefault(); $('search').focus(); }
  });

  /* ---------- events ---------- */
  $('grid').addEventListener('change', function (e) {
    var cb = e.target.closest('[data-check]');
    if (cb) {
      var id = +cb.getAttribute('data-check');
      if (cb.checked) earned.add(id); else earned.delete(id);
      state.earned = Array.from(earned); saveState();
      renderGrid(); renderRoadmap(); renderMissables();
    }
  });
  $('grid').addEventListener('input', function (e) {
    var n = e.target.closest('[data-note]');
    if (n) { state.notes[+n.getAttribute('data-note')] = n.value; saveState(); }
  });
  $('grid').addEventListener('click', function (e) {
    if (e.target.closest('input') || e.target.closest('label')) return;
    var card = e.target.closest('.card');
    if (card) openDetail(+card.getAttribute('data-id'));
  });
  $('roadmap').addEventListener('click', function (e) {
    var c = e.target.closest('[data-open]');
    if (c) openDetail(+c.getAttribute('data-open'));
  });
  ['search', 'kind', 'grade', 'status'].forEach(function (id) {
    $(id).addEventListener('input', renderGrid);
    $(id).addEventListener('change', renderGrid);
  });
  $('spoilers').addEventListener('change', function () {
    state.spoilers = $('spoilers').checked; saveState(); renderGrid();
  });
  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () { showView(tab.getAttribute('data-view')); });
  });
  function showView(name) {
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-view') === name);
    });
    document.querySelectorAll('.view').forEach(function (v) {
      v.hidden = v.id !== 'view-' + name;
    });
    $('controls').style.display = name === 'checklist' ? '' : 'none';
  }

  /* ---------- export / import / reset ---------- */
  $('exportBtn').addEventListener('click', function () {
    var payload = {
      app: 'Leonida Platinum Atlas', game: 'Grand Theft Auto VI', platform: 'PlayStation 5',
      exported_at: new Date().toISOString(), earned: Array.from(earned).sort(function (a, b) { return a - b; }),
      notes: state.notes, spoilers: state.spoilers
    };
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    a.download = 'gta6-trophy-progress.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  $('importFile').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var ids = data.earned || data;
        if (!Array.isArray(ids)) throw new Error('bad file');
        earned = new Set(ids.filter(function (id) { return byId[id]; }));
        if (data.notes) state.notes = data.notes;
        state.earned = Array.from(earned); saveState();
        renderGrid(); renderRoadmap(); renderMissables();
      } catch (err) { alert('Could not import that file — it is not a Leonida Platinum Atlas export.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
  $('resetBtn').addEventListener('click', function () {
    if (!confirm('Reset all progress and notes? This only clears this browser.')) return;
    earned = new Set(); state.notes = {}; state.earned = []; state.demoSeeded = false; saveState();
    renderGrid(); renderRoadmap(); renderMissables();
  });

  /* ---------- boot ---------- */
  $('spoilers').checked = state.spoilers;
  renderGrid(); renderRoadmap(); renderMissables();
  var view = params.get('view');
  if (view && ['checklist', 'roadmap', 'missables', 'sources'].indexOf(view) !== -1) showView(view);
  var openId = parseInt(params.get('trophy') || '', 10);
  if (openId && byId[openId]) openDetail(openId);
  var scrollY = parseInt(params.get('scroll') || '', 10);
  if (scrollY) setTimeout(function () { window.scrollTo(0, scrollY); }, 60);
  if (state.demoSeeded && params.get('demo') === '1') { state.earned = Array.from(earned); saveState(); }
})();

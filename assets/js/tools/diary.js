/* Headache diary: stored only in this browser (localStorage). */
(function () {
  'use strict';
  var G = window.G44, esc = G.esc, KEY = 'g44-diary', root = document.getElementById('diary');
  if (!root) return;
  var types = [];
  try { types = JSON.parse(document.getElementById('types-data').textContent); } catch (e) {}
  var TRIG = ['Poor sleep', 'Stress', 'Missed meal', 'Not enough water', 'Alcohol', 'Caffeine change', 'Long screen time', 'Weather change', 'Period or hormones', 'Bright light', 'Strong smell', 'Exercise', 'Other'];
  var MED = { none: 'None', simple: 'Simple pain reliever', triptan: 'Triptan', combo: 'Combination pain reliever', opioid: 'Opioid', other: 'Other' };
  var data = G.store.get(KEY, []), view = new Date(); view.setDate(1);
  var today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  function save() { G.store.set(KEY, data); }
  function lvl(n) { return n >= 7 ? 3 : n >= 4 ? 2 : n >= 1 ? 1 : 0; }

  root.innerHTML =
    '<div class="split"><form class="tool-card" id="d-form">' +
    '<h2 class="h3">Log a headache</h2>' +
    '<div class="row2"><div class="field"><label for="d-date">Date</label><input id="d-date" type="date" name="date" required value="' + today + '"></div>' +
    '<div class="field"><label for="d-start">Start time</label><input id="d-start" type="time" name="start"></div></div>' +
    '<div class="row2"><div class="field"><label for="d-dur">Hours it lasted</label><input id="d-dur" type="number" name="hours" min="0" max="72" step="0.25" value="2"></div>' +
    '<div class="field"><label for="d-int">Pain 0 to 10: <output id="d-int-out">5</output></label><input id="d-int" type="range" name="pain" min="0" max="10" value="5"></div></div>' +
    '<div class="row2"><div class="field"><label for="d-type">Type (if known)</label><select id="d-type" name="type"><option value="">Not sure</option>' + types.map(function (t) { return '<option value="' + esc(t.slug) + '">' + esc(t.name) + '</option>'; }).join('') + '</select></div>' +
    '<div class="field"><label for="d-where">Where</label><select id="d-where" name="where"><option>Both sides</option><option>One side</option><option>Around one eye</option><option>Forehead</option><option>Back of head and neck</option><option>Whole head</option></select></div></div>' +
    '<div class="row2"><div class="field"><label for="d-med">Medicine taken</label><select id="d-med" name="med">' + Object.keys(MED).map(function (k) { return '<option value="' + k + '">' + MED[k] + '</option>'; }).join('') + '</select></div>' +
    '<div class="field"><label for="d-relief">Did it help?</label><select id="d-relief" name="relief"><option>Not applicable</option><option>No</option><option>A little</option><option>Fully</option></select></div></div>' +
    '<fieldset class="q"><legend class="label">Possible triggers</legend><div class="chips">' + TRIG.map(function (t, k) { return '<label class="check" style="margin:0 .6rem .3rem 0"><input type="checkbox" name="trig" value="' + esc(t) + '" id="tr' + k + '"> <span>' + esc(t) + '</span></label>'; }).join('') + '</div></fieldset>' +
    '<div class="field"><label for="d-notes">Notes</label><textarea id="d-notes" name="notes" rows="2"></textarea></div>' +
    '<button class="btn btn-primary" type="submit">Save entry</button><p class="fine mt1">Saved only in this browser on this device. We never see it.</p></form>' +
    '<div><div class="tool-card"><div class="cal-head"><button class="round" type="button" data-d-prev aria-label="Previous month">&lsaquo;</button><h2 class="h3" id="d-month" style="margin:0"></h2><button class="round" type="button" data-d-next aria-label="Next month">&rsaquo;</button></div><div class="cal" id="d-cal"></div>' +
    '<p class="fine mt1">Colour shows the worst pain that day: light for 1 to 3, amber for 4 to 6, red for 7 to 10.</p></div>' +
    '<div class="statrow" id="d-stats"></div><div id="d-alert"></div></div></div>' +
    '<div class="section-tight"><div class="section-head"><h2 class="h3">Entries this month</h2><div class="hero-actions" style="margin:0"><button class="btn btn-quiet btn-sm" type="button" data-d-csv>Export CSV</button><button class="btn btn-quiet btn-sm" type="button" data-d-print>Print report</button><button class="btn btn-quiet btn-sm" type="button" data-d-clear>Delete all</button></div></div><ul class="entries" id="d-list"></ul></div>';

  var form = document.getElementById('d-form');
  form.pain.addEventListener('input', function () { document.getElementById('d-int-out').value = form.pain.value; });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var trig = Array.prototype.slice.call(form.querySelectorAll('[name=trig]:checked')).map(function (x) { return x.value; });
    data.push({ id: Date.now(), date: form.date.value, start: form.start.value, hours: +form.hours.value || 0, pain: +form.pain.value, type: form.type.value, where: form.where.value, med: form.med.value, relief: form.relief.value, trig: trig, notes: form.notes.value.trim() });
    data.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id; });
    save();
    var d = new Date(form.date.value + 'T12:00'); view = new Date(d.getFullYear(), d.getMonth(), 1);
    form.notes.value = ''; form.querySelectorAll('[name=trig]').forEach(function (x) { x.checked = false; });
    draw();
    var b = form.querySelector('[type=submit]'); b.textContent = 'Saved'; setTimeout(function () { b.textContent = 'Save entry'; }, 1500);
  });

  function monthKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  function draw() {
    var mk = monthKey(view), month = data.filter(function (x) { return x.date.slice(0, 7) === mk; });
    document.getElementById('d-month').textContent = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    var byDay = {};
    month.forEach(function (x) { byDay[x.date] = Math.max(byDay[x.date] || 0, x.pain || 1); });
    var first = (view.getDay() + 6) % 7, days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), cells = '';
    ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(function (d) { cells += '<span class="dow">' + d + '</span>'; });
    for (var k = 0; k < first; k++) cells += '<span aria-hidden="true" style="background:none"></span>';
    for (var d = 1; d <= days; d++) {
      var key = mk + '-' + String(d).padStart(2, '0'), l = byDay[key] ? lvl(byDay[key]) : 0;
      cells += '<span data-l="' + l + '"' + (key === today ? ' class="today"' : '') + ' title="' + key + (byDay[key] ? ': worst pain ' + byDay[key] : '') + '">' + d + '</span>';
    }
    document.getElementById('d-cal').innerHTML = cells;
    var hd = Object.keys(byDay).length, avg = month.length ? (month.reduce(function (s, x) { return s + x.pain; }, 0) / month.length).toFixed(1) : '0';
    var medDays = {}, simpleDays = {}, otherDays = {};
    month.forEach(function (x) { if (x.med !== 'none') { medDays[x.date] = 1; if (x.med === 'simple') simpleDays[x.date] = 1; else otherDays[x.date] = 1; } });
    var md = Object.keys(medDays).length, sd = Object.keys(simpleDays).length, od = Object.keys(otherDays).length;
    var tc = {}; month.forEach(function (x) { (x.trig || []).forEach(function (t) { tc[t] = (tc[t] || 0) + 1; }); });
    var topT = Object.keys(tc).sort(function (a, b) { return tc[b] - tc[a]; })[0];
    document.getElementById('d-stats').innerHTML = '<div class="stat"><b>' + hd + '</b><span>Headache days</span></div><div class="stat"><b>' + avg + '</b><span>Average pain</span></div><div class="stat"><b>' + md + '</b><span>Medicine days</span></div><div class="stat"><b style="font-size:1.05rem">' + esc(topT || 'None yet') + '</b><span>Top trigger</span></div>';
    var alert = '';
    if (od >= 10 || sd >= 15 || md >= 10) alert = '<div class="result-box r-bad"><h3>Over the rebound-headache line</h3><p>You logged medicine on ' + md + ' days this month. Regular use at this level can cause medication-overuse headache. <a href="tools/rebound-risk.html">Check the details</a> and talk to your doctor.</p></div>';
    else if (od >= 7 || sd >= 10 || md >= 8) alert = '<div class="result-box r-warn"><h3>Getting close to the line</h3><p>' + md + ' medicine days this month. <a href="tools/rebound-risk.html">See the limits</a>.</p></div>';
    else if (hd >= 4) alert = '<div class="result-box r-warn"><h3>4 or more headache days this month</h3><p>That is when many specialists discuss prevention. <a href="get-care.html?need=specialist">Get matched with care</a>.</p></div>';
    document.getElementById('d-alert').innerHTML = alert;
    document.getElementById('d-list').innerHTML = month.length ? month.map(function (x) {
      var t = types.filter(function (y) { return y.slug === x.type; })[0];
      return '<li><span><b>' + esc(x.date) + '</b><br><span class="fine">' + esc(x.start || '') + (x.hours ? ' for ' + x.hours + ' h' : '') + '</span></span><span>Pain ' + x.pain + '/10' + (t ? ', ' + esc(t.name) : '') + ', ' + esc(x.where) + '. Medicine: ' + esc(MED[x.med] || x.med) + (x.relief && x.relief !== 'Not applicable' ? ' (helped: ' + esc(x.relief.toLowerCase()) + ')' : '') + (x.trig && x.trig.length ? '. Triggers: ' + esc(x.trig.join(', ')) : '') + (x.notes ? '. ' + esc(x.notes) : '') + '</span><button class="linkbtn" type="button" data-d-del="' + x.id + '">Delete</button></li>';
    }).join('') : '<li><span class="muted">No entries this month yet.</span></li>';
  }
  root.addEventListener('click', function (e) {
    if (e.target.closest('[data-d-prev]')) { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); draw(); }
    if (e.target.closest('[data-d-next]')) { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); draw(); }
    var del = e.target.closest('[data-d-del]');
    if (del) { data = data.filter(function (x) { return String(x.id) !== del.getAttribute('data-d-del'); }); save(); draw(); }
    var clr = e.target.closest('[data-d-clear]');
    if (clr) {
      if (clr.getAttribute('data-armed')) { data = []; save(); draw(); clr.removeAttribute('data-armed'); clr.textContent = 'Delete all'; }
      else { clr.setAttribute('data-armed', '1'); clr.textContent = 'Press again to delete everything'; setTimeout(function () { clr.removeAttribute('data-armed'); clr.textContent = 'Delete all'; }, 4000); }
    }
    if (e.target.closest('[data-d-csv]')) {
      var rows = [['date', 'start', 'hours', 'pain', 'type', 'where', 'medicine', 'helped', 'triggers', 'notes']].concat(data.map(function (x) { return [x.date, x.start, x.hours, x.pain, x.type, x.where, MED[x.med] || x.med, x.relief, (x.trig || []).join('; '), x.notes]; }));
      var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'g44-headache-diary.csv'; document.body.appendChild(a); a.click(); a.remove();
    }
    if (e.target.closest('[data-d-print]')) window.print();
  });
  draw();
})();

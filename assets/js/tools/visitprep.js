/* Doctor visit planner: builds a printable one-page summary. */
(function () {
  'use strict';
  var G = window.G44, esc = G.esc, root = document.getElementById('visitprep');
  if (!root) return;
  var QS = [
    'What type of headache do you think I have, and why?',
    'Do I need any tests or scans?',
    'Could any of my medicines be causing or worsening my headaches?',
    'Am I at risk of medication-overuse headache?',
    'What should I take when a headache starts, and how often is too often?',
    'Would a preventive treatment make sense for me?',
    'Are there drug-free options I should try, such as physiotherapy or therapy?',
    'Which warning signs mean I should seek urgent care?',
    'Should I see a neurologist or headache specialist?',
    'Are there clinical studies I could join?'
  ];
  var diary = G.store.get('g44-diary', []), finder = G.store.get('g44-finder', null);
  var cut = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  var recent = diary.filter(function (x) { return x.date >= cut; });
  var dDays = {}, mDays = {}; recent.forEach(function (x) { dDays[x.date] = 1; if (x.med !== 'none') mDays[x.date] = 1; });
  var diaryLine = diary.length ? 'From my G44 diary, last 30 days: ' + Object.keys(dDays).length + ' headache days, medicine on ' + Object.keys(mDays).length + ' days.' : '';
  root.innerHTML = '<form class="tool-card no-print" id="vp-form">' +
    '<div class="row2"><div class="field"><label for="vp-since">When did your headaches start?</label><input id="vp-since" name="since" placeholder="For example, 2 years ago, after a cold"></div>' +
    '<div class="field"><label for="vp-often">How often now?</label><input id="vp-often" name="often" placeholder="For example, 6 days a month"></div></div>' +
    '<div class="row2"><div class="field"><label for="vp-long">How long does one last?</label><input id="vp-long" name="long" placeholder="For example, 4 to 8 hours"></div>' +
    '<div class="field"><label for="vp-where">Where and what it feels like</label><input id="vp-where" name="where" placeholder="For example, left temple, throbbing"></div></div>' +
    '<div class="field"><label for="vp-with">What comes with it</label><input id="vp-with" name="with" placeholder="For example, nausea, light sensitivity, watery eye"></div>' +
    '<div class="field"><label for="vp-take">What you take, and on how many days a month</label><textarea id="vp-take" name="take" rows="2" placeholder="For example, ibuprofen 400 mg, about 8 days a month"></textarea></div>' +
    '<div class="field"><label for="vp-tried">What you have tried, and what happened</label><textarea id="vp-tried" name="tried" rows="2"></textarea></div>' +
    '<div class="field"><label for="vp-impact">How it affects your life</label><input id="vp-impact" name="impact" placeholder="For example, missed 3 work days last month"></div>' +
    '<div class="field"><label for="vp-worry">What worries you most</label><input id="vp-worry" name="worry"></div>' +
    '<fieldset class="q"><legend class="label">Questions to ask</legend>' + QS.map(function (q, k) { return '<label class="check"><input type="checkbox" name="q" value="' + k + '"' + (k < 5 ? ' checked' : '') + '> <span>' + esc(q) + '</span></label>'; }).join('') + '</fieldset>' +
    '<button class="btn btn-primary" type="submit">Build my summary</button></form><div id="vp-out" class="tool-out"></div>';
  var form = document.getElementById('vp-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = function (n) { return form[n].value.trim(); };
    var rows = [['Started', f('since')], ['How often', f('often')], ['How long', f('long')], ['Where and feel', f('where')], ['Comes with', f('with')], ['Medicines and days', f('take')], ['Tried so far', f('tried')], ['Impact', f('impact')], ['Main worry', f('worry')]].filter(function (r) { return r[1]; });
    var qs = Array.prototype.slice.call(form.querySelectorAll('[name=q]:checked')).map(function (x) { return QS[+x.value]; });
    var txt = 'MY HEADACHE SUMMARY (prepared with G44.com)\n\n' + rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') + (diaryLine ? '\n' + diaryLine : '') + (finder && finder.top ? '\nType finder best match: ' + finder.top : '') + '\n\nQUESTIONS\n' + qs.map(function (q, k) { return (k + 1) + '. ' + q; }).join('\n');
    document.getElementById('vp-out').innerHTML = '<div class="tool-card"><h2 class="h3">My headache summary</h2><table class="codes-table">' + rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('') + (diaryLine ? '<tr><th scope="row">Diary</th><td>' + esc(diaryLine) + '</td></tr>' : '') + '</table>' +
      '<h3 class="h4 mt1">Questions</h3><ol>' + qs.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' +
      '<div class="hero-actions no-print"><button class="btn btn-primary" type="button" data-vp-print>Print</button><button class="btn btn-quiet" type="button" data-vp-copy>Copy text</button></div></div>';
    document.getElementById('vp-out')._txt = txt;
    document.getElementById('vp-out').scrollIntoView({ behavior: 'smooth' });
  });
  root.addEventListener('click', function (e) {
    if (e.target.closest('[data-vp-print]')) window.print();
    var c = e.target.closest('[data-vp-copy]');
    if (c && navigator.clipboard) navigator.clipboard.writeText(document.getElementById('vp-out')._txt).then(function () { c.textContent = 'Copied'; });
  });
})();

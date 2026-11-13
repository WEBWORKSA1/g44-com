/* Headache type finder: scores answers against ICHD-3-style features. Educational, not a diagnosis. */
(function () {
  'use strict';
  var G = window.G44, esc = G.esc, root = document.getElementById('finder');
  if (!root) return;
  var types = {};
  try { JSON.parse(document.getElementById('types-data').textContent).forEach(function (t) { types[t.slug] = t; }); } catch (e) {}
  var TT = 'tension-type', MOH = 'medication-overuse', NDPH = 'new-daily-persistent', PTH = 'post-traumatic', TAC = 'other-tacs', STAB = 'primary-stabbing', EXC = 'exertional-and-cough', CAF = 'caffeine-withdrawal';
  function s(o) { return o; }
  var Q = [
    { id: 'where', q: 'Where is the pain usually?', opts: [
      ['band', 'A tight band all around', s({ 'tension-type': 3, 'medication-overuse': 1, 'new-daily-persistent': 1 })],
      ['forehead', 'Forehead', s({ 'tension-type': 2, sinus: 2, migraine: 1, 'caffeine-withdrawal': 1 })],
      ['temple', 'Temple, one side', s({ migraine: 3, 'primary-stabbing': 1, 'other-tacs': 1 })],
      ['eye', 'Around or behind one eye', s({ cluster: 3, 'other-tacs': 2, migraine: 1 })],
      ['crown', 'Top of the head', s({ 'tension-type': 2, 'primary-stabbing': 1, 'exertional-and-cough': 1 })],
      ['neck', 'Back of the head and neck', s({ cervicogenic: 3, 'tension-type': 2, 'post-traumatic': 1 })],
      ['face', 'Cheeks and face', s({ sinus: 3, migraine: 1, cluster: 1 })],
      ['whole', 'The whole head', s({ 'medication-overuse': 2, 'new-daily-persistent': 2, 'post-traumatic': 1, 'caffeine-withdrawal': 1, 'exertional-and-cough': 1, hypnic: 1 })]
    ] },
    { id: 'side', q: 'Which side of the head?', opts: [
      ['same', 'One side, and always the same side', s({ cluster: 3, 'other-tacs': 3, cervicogenic: 2, migraine: 1 })],
      ['switch', 'One side, but it can switch', s({ migraine: 3, 'primary-stabbing': 1 })],
      ['both', 'Both sides', s({ 'tension-type': 3, 'medication-overuse': 1, 'caffeine-withdrawal': 1, hypnic: 1, 'new-daily-persistent': 1, sinus: 1 })]
    ] },
    { id: 'feel', q: 'What does it feel like?', opts: [
      ['press', 'Pressing or tight, like a band or a weight', s({ 'tension-type': 3, cervicogenic: 1, 'medication-overuse': 1, 'new-daily-persistent': 1 })],
      ['throb', 'Throbbing or pulsing', s({ migraine: 3, 'caffeine-withdrawal': 1, 'exertional-and-cough': 1 })],
      ['bore', 'Boring, burning or drilling, and very intense', s({ cluster: 3, 'other-tacs': 2 })],
      ['jab', 'Brief jabs, like an ice pick', s({ 'primary-stabbing': 4, 'other-tacs': 1 })],
      ['dull', 'A dull, nagging ache', s({ 'tension-type': 1, 'medication-overuse': 2, 'caffeine-withdrawal': 2, hypnic: 1, sinus: 1, 'post-traumatic': 1 })]
    ] },
    { id: 'severity', q: 'How bad is it at its worst?', opts: [
      ['mild', 'Mild to moderate. I can keep going', s({ 'tension-type': 2, 'medication-overuse': 1, 'caffeine-withdrawal': 1, hypnic: 1, cervicogenic: 1 })],
      ['bad', 'Moderate to severe. It stops me', s({ migraine: 2, 'medication-overuse': 1, 'post-traumatic': 1, 'exertional-and-cough': 1, 'new-daily-persistent': 1 })],
      ['extreme', 'Excruciating. The worst pain I know', s({ cluster: 3, 'other-tacs': 2 })],
      ['sudden', 'It hit suddenly, worst ever, and peaked within a minute', s({ thunderclap: 6 }), 'emergency']
    ] },
    { id: 'length', q: 'How long does one attack last without treatment?', opts: [
      ['secs', 'Seconds', s({ 'primary-stabbing': 4, 'other-tacs': 2 })],
      ['mins', '2 to 30 minutes', s({ 'other-tacs': 3, cluster: 1, 'exertional-and-cough': 1 })],
      ['hours3', '15 minutes to 3 hours', s({ cluster: 3, hypnic: 2, 'exertional-and-cough': 1 })],
      ['days3', '4 hours to 3 days', s({ migraine: 3, 'tension-type': 1, sinus: 1 })],
      ['constant', 'Days on end, or it never fully stops', s({ 'tension-type': 1, 'medication-overuse': 2, 'new-daily-persistent': 3, 'post-traumatic': 1, 'caffeine-withdrawal': 1, 'other-tacs': 1 })]
    ] },
    { id: 'start', q: 'Which best describes how it starts?', opts: [
      ['gradual', 'It builds up gradually, with no clear trigger', s({ 'tension-type': 1, migraine: 1 })],
      ['sleep', 'It wakes me from sleep', s({ cluster: 2, hypnic: 3, 'medication-overuse': 1 })],
      ['injury', 'It began after a head or neck injury', s({ 'post-traumatic': 5, cervicogenic: 1 })],
      ['strain', 'Coughing, straining, exercise or sex sets it off', s({ 'exertional-and-cough': 4 })],
      ['coffee', 'When I miss or delay my usual coffee', s({ 'caffeine-withdrawal': 5 })],
      ['oneday', 'It started on one day I remember and never stopped', s({ 'new-daily-persistent': 5 })],
      ['neckmove', 'Neck movement or posture sets it off', s({ cervicogenic: 4, 'tension-type': 1 })],
      ['cold', 'With a cold, a blocked nose and fever', s({ sinus: 4 })],
      ['thunder', 'Suddenly, reaching full force within a minute', s({ thunderclap: 6 }), 'emergency']
    ] },
    { id: 'also', multi: true, q: 'Does any of this come with it?', hint: 'Choose all that apply.', opts: [
      ['nausea', 'Nausea or vomiting', s({ migraine: 3, 'post-traumatic': 1 })],
      ['light', 'Light and sound are hard to bear', s({ migraine: 3, 'post-traumatic': 1 })],
      ['aura', 'Zigzag lines, flashing lights or blind spots beforehand', s({ migraine: 3 })],
      ['eyenose', 'A red or watery eye, runny or blocked nostril, or drooping eyelid on the painful side', s({ cluster: 3, 'other-tacs': 3 })],
      ['restless', 'I cannot keep still; I pace or rock', s({ cluster: 3, 'other-tacs': 1 })],
      ['stiff', 'Neck pain or reduced neck movement', s({ cervicogenic: 2, 'tension-type': 1, 'post-traumatic': 1 })],
      ['mucus', 'Thick, discoloured mucus and face pressure', s({ sinus: 3 })],
      ['fog', 'Dizziness or poor concentration since an injury', s({ 'post-traumatic': 2 })],
      ['none', 'None of these', s({ 'tension-type': 2, 'medication-overuse': 1 })],
      ['neuro', 'Weakness, numbness, confusion, trouble speaking or loss of vision', s({}), 'emergency'],
      ['fever', 'Fever with a stiff neck, or a rash', s({}), 'emergency']
    ] },
    { id: 'often', q: 'How often do you get it?', opts: [
      ['rare', 'A few times a year', s({ 'tension-type': 1, migraine: 1, 'exertional-and-cough': 1, sinus: 1, 'caffeine-withdrawal': 1 })],
      ['some', '1 to 14 days a month', s({ 'tension-type': 2, migraine: 2, 'primary-stabbing': 1 })],
      ['most', '15 or more days a month', s({ 'medication-overuse': 3, 'tension-type': 1, 'new-daily-persistent': 2, hypnic: 1, 'post-traumatic': 1, migraine: 1 })],
      ['bouts', 'Daily for weeks, then gone for months', s({ cluster: 4, 'other-tacs': 1 })],
      ['nightly', 'Most nights', s({ hypnic: 2, cluster: 2 })]
    ] },
    { id: 'meds', q: 'On how many days a month do you take something for headache?', opts: [
      ['m0', '0 to 4 days', s({})],
      ['m5', '5 to 9 days', s({ 'medication-overuse': 1 })],
      ['m10', '10 to 14 days', s({ 'medication-overuse': 3 })],
      ['m15', '15 days or more', s({ 'medication-overuse': 5 })]
    ] },
    { id: 'age', q: 'How old are you?', opts: [
      ['u18', 'Under 18', s({ migraine: 1, 'tension-type': 1 })],
      ['a18', '18 to 49', s({})],
      ['a50', '50 or older', s({ hypnic: 3 }), 'over50']
    ] }
  ];
  var ans = {}, i = 0;
  var pre = G.params.get('where');
  if (pre && Q[0].opts.some(function (o) { return o[0] === pre; })) ans.where = pre;

  function render() {
    var q = Q[i], cur = ans[q.id], type = q.multi ? 'checkbox' : 'radio';
    root.innerHTML = '<p class="steps-count">Question ' + (i + 1) + ' of ' + Q.length + '</p><div class="steps-bar"><i style="width:' + ((i + 1) / Q.length * 100) + '%"></i></div>' +
      '<fieldset class="q"><legend tabindex="-1">' + esc(q.q) + '</legend>' + (q.hint ? '<p class="hint">' + esc(q.hint) + '</p>' : '') +
      '<div class="optgrid">' + q.opts.map(function (o) {
        var on = q.multi ? (cur || []).indexOf(o[0]) > -1 : cur === o[0];
        return '<label class="opt"><input type="' + type + '" name="' + q.id + '" value="' + o[0] + '"' + (on ? ' checked' : '') + '><span><b>' + esc(o[1]) + '</b></span></label>';
      }).join('') + '</div></fieldset>' +
      '<div class="stepnav">' + (i > 0 ? '<button class="btn btn-quiet" type="button" data-f-back>Back</button>' : '<span></span>') +
      '<button class="btn btn-primary" type="button" data-f-next>' + (i === Q.length - 1 ? 'See my matches' : 'Next') + '</button></div>';
  }
  function read() {
    var q = Q[i], vals = Array.prototype.slice.call(root.querySelectorAll('input:checked')).map(function (x) { return x.value; });
    if (q.multi) { if (vals.indexOf('none') > -1 && vals.length > 1) vals = vals.filter(function (v) { return v !== 'none'; }); ans[q.id] = vals; return vals.length > 0; }
    ans[q.id] = vals[0];
    return !!vals[0];
  }
  function result() {
    var score = {}, flags = {};
    Q.forEach(function (q) {
      var v = ans[q.id];
      (q.multi ? v || [] : [v]).forEach(function (id) {
        var o = q.opts.filter(function (x) { return x[0] === id; })[0];
        if (!o) return;
        Object.keys(o[2]).forEach(function (k) { score[k] = (score[k] || 0) + o[2][k]; });
        if (o[3]) flags[o[3]] = true;
      });
    });
    var ranked = Object.keys(score).filter(function (k) { return types[k]; }).sort(function (a, b) { return score[b] - score[a]; }).slice(0, 3);
    var top = ranked.length ? score[ranked[0]] : 1, html = '';
    if (flags.emergency) {
      html += '<div class="result-box r-bad" role="alert"><h3>Get emergency help now</h3><p>You described a warning sign that needs urgent medical assessment. Call your local emergency number (911 in the US and Canada, 999 in the UK, 112 in the EU and India) or go to the nearest emergency department. Do not drive yourself.</p></div>';
    }
    html += '<h2 class="h3">Your closest matches</h2>';
    html += ranked.map(function (k, n) {
      var pct = Math.round(score[k] / top * 100), t = types[k];
      var lab = n === 0 ? 'Best match' : pct >= 75 ? 'Close match' : 'Possible';
      return '<div class="match"><div><a href="types/' + esc(k) + '.html"><b>' + esc(t.name) + '</b></a> <span class="fine mono">' + esc(t.code) + '</span><br><span class="muted">' + esc(t.short) + '</span></div><span class="lvl ' + (n === 0 ? 'lvl-mod' : 'lvl-low') + '">' + lab + '</span><div class="meter"><i style="width:' + pct + '%"></i></div></div>';
    }).join('');
    if (ans.meds === 'm10' || ans.meds === 'm15') html += '<div class="result-box r-warn"><h3>Check your pain-relief days</h3><p>Taking something for headache on 10 or more days a month can cause medication-overuse headache. <a href="tools/rebound-risk.html">Run the rebound-risk check</a>.</p></div>';
    if (flags.over50) html += '<div class="result-box r-warn"><h3>New headaches after 50 need a check</h3><p>If this is a new kind of headache for you, book a doctor\'s appointment soon, and the same day if you have scalp tenderness, jaw pain when chewing or vision changes.</p></div>';
    html += '<p class="fine mt1">This matches your answers to published headache features (ICHD-3). It is not a diagnosis. Take it to a clinician along with a <a href="tools/headache-diary.html">headache diary</a>.</p>';
    var best = ranked[0] || '';
    html += '<div class="hero-actions"><a class="btn btn-primary" href="get-care.html?need=specialist&amp;headache_type=' + esc(best) + '">Get matched with care</a><a class="btn btn-quiet" href="tools/visit-prep.html">Plan my doctor visit</a><button class="btn btn-quiet" type="button" data-f-restart>Start over</button></div>';
    root.innerHTML = html;
    G.store.set('g44-finder', { date: new Date().toISOString().slice(0, 10), top: best, answers: ans });
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  root.addEventListener('click', function (e) {
    if (e.target.closest('[data-f-next]')) {
      if (!read()) { var l = root.querySelector('legend'); l.insertAdjacentHTML('afterend', root.querySelector('.form-msg') ? '' : '<p class="form-msg err" role="alert">Choose an answer to continue.</p>'); return; }
      if (i === Q.length - 1) { result(); return; }
      i++; render(); root.querySelector('legend').focus();
    }
    if (e.target.closest('[data-f-back]')) { read(); i = Math.max(0, i - 1); render(); root.querySelector('legend').focus(); }
    if (e.target.closest('[data-f-restart]')) { ans = {}; i = 0; render(); }
  });
  root.addEventListener('change', function (e) {
    if (e.target.type === 'radio') setTimeout(function () { if (read()) { if (i === Q.length - 1) result(); else { i++; render(); root.querySelector('legend').focus(); } } }, 200);
  });
  if (ans.where) i = 1;
  render();
})();

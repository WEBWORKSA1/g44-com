/* Rebound-risk check: compares medicine days with ICHD-3 medication-overuse thresholds. */
(function () {
  'use strict';
  var root = document.getElementById('moh');
  if (!root) return;
  var C = [
    ['simple', 'Simple pain relievers', 'Paracetamol (acetaminophen), ibuprofen, aspirin, naproxen', 15],
    ['triptan', 'Triptans', 'Sumatriptan, rizatriptan, zolmitriptan and others', 10],
    ['combo', 'Combination pain relievers', 'Tablets mixing pain relievers with caffeine or codeine', 10],
    ['opioid', 'Opioids', 'Codeine, tramadol, oxycodone and others', 10],
    ['ergot', 'Ergots', 'Ergotamine, dihydroergotamine', 10]
  ];
  root.innerHTML = '<div class="row2"><div class="field"><label for="m-hd">Headache days in a typical month</label><input id="m-hd" type="number" min="0" max="31" value="8"></div>' +
    '<div class="field"><label for="m-dur">Has this pattern lasted more than 3 months?</label><select id="m-dur"><option value="1">Yes</option><option value="0">No</option></select></div></div>' +
    '<h2 class="h4">Days a month you take each type</h2>' + C.map(function (c) {
      return '<div class="field"><label for="m-' + c[0] + '">' + c[1] + ' <span class="fine">(' + c[2] + ')</span></label><input id="m-' + c[0] + '" type="number" min="0" max="31" value="0" data-c="' + c[0] + '"><div class="meter" style="margin-top:.35rem"><i id="mm-' + c[0] + '" style="width:0"></i></div><span class="fine">Overuse line: ' + c[3] + ' days a month</span></div>';
    }).join('') +
    '<div class="field"><label for="m-total">Total days you take any of these (count each day once)</label><input id="m-total" type="number" min="0" max="31" value="0"><span class="fine">Filled in for you; lower it if you take two types on the same day.</span></div>' +
    '<div class="tool-out" aria-live="polite" id="m-out"></div>';
  var touchedTotal = false;
  function num(id) { var v = +document.getElementById(id).value; return isNaN(v) ? 0 : Math.max(0, Math.min(31, v)); }
  function update(e) {
    if (e && e.target.id === 'm-total') touchedTotal = true;
    var sum = 0, over = [], near = [], used = 0;
    C.forEach(function (c) {
      var v = num('m-' + c[0]); sum += v; if (v > 0) used++;
      var pct = Math.min(100, v / c[3] * 100), bar = document.getElementById('mm-' + c[0]);
      bar.style.width = pct + '%';
      bar.parentNode.className = 'meter' + (v >= c[3] ? ' bad' : v >= c[3] * 0.7 ? ' warn' : '');
      if (v >= c[3]) over.push(c[1]); else if (v >= Math.ceil(c[3] * 0.7)) near.push(c[1]);
    });
    var tot = document.getElementById('m-total');
    if (!touchedTotal) tot.value = Math.min(31, sum);
    var total = num('m-total'), hd = num('m-hd'), long = document.getElementById('m-dur').value === '1';
    var comboOver = !over.length && used > 1 && total >= 10;
    var out = document.getElementById('m-out'), html;
    if (over.length || comboOver) {
      var why = over.length ? over.join(' and ') + ' at or above the line' : 'a mix of types on ' + total + ' days in total';
      if (hd >= 15 && long) html = '<div class="result-box r-bad"><h3>This matches the pattern of medication-overuse headache</h3><p>You reported headache on ' + hd + ' days a month for more than 3 months, with ' + why + '. That is the ICHD-3 definition of medication-overuse headache. It is very treatable: see a doctor to plan how to cut back and start prevention.</p>';
      else html = '<div class="result-box r-warn"><h3>Your medicine days are over the line</h3><p>You reported ' + why + '. Keep this up for 3 months and headaches can become more frequent. Talk to your doctor about prevention.</p>';
      if (num('m-opioid') > 0) html += '<p><strong>Opioids and some combination tablets must be reduced slowly under medical care. Do not stop them suddenly on your own.</strong></p>';
      html += '<a class="btn btn-primary" href="get-care.html?need=specialist&amp;headache_type=medication-overuse">Get matched with care</a></div>';
    } else if (near.length || total >= 8) {
      html = '<div class="result-box r-warn"><h3>Getting close</h3><p>' + (near.length ? near.join(' and ') + ' near the line. ' : '') + 'Plan ahead: keep treatment days to two or three a week, and ask your doctor about prevention if headaches are frequent.</p></div>';
    } else {
      html = '<div class="result-box r-ok"><h3>Within the limits</h3><p>Your medicine days are below the overuse thresholds. Keep counting: a <a href="tools/headache-diary.html">headache diary</a> does it automatically.</p></div>';
    }
    out.innerHTML = html;
  }
  root.addEventListener('input', update);
  root.addEventListener('change', update);
  update();
})();

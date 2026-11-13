/* Breathing pacer. The circle grows on the in-breath and shrinks on the out-breath. */
(function () {
  'use strict';
  var root = document.getElementById('breathe');
  if (!root) return;
  var P = {
    slow: { name: 'Slow breathing, 6 a minute', seq: [['Breathe in', 5], ['Breathe out', 5]] },
    box: { name: 'Box breathing, 4-4-4-4', seq: [['Breathe in', 4], ['Hold', 4], ['Breathe out', 4], ['Hold', 4]] },
    calm: { name: '4-7-8 wind-down', seq: [['Breathe in', 4], ['Hold', 7], ['Breathe out', 8]] }
  };
  root.innerHTML = '<div class="split"><div class="tool-card"><div class="breathe-orb" id="br-orb" aria-hidden="true"></div><p class="breathe-cue" id="br-cue" aria-live="polite">Press start</p><p class="steps-count" id="br-left" style="text-align:center"></p>' +
    '<div class="hero-actions" style="justify-content:center"><button class="btn btn-primary" type="button" data-br-go>Start</button></div></div>' +
    '<div><div class="field"><label for="br-p">Pattern</label><select id="br-p">' + Object.keys(P).map(function (k) { return '<option value="' + k + '">' + P[k].name + '</option>'; }).join('') + '</select></div>' +
    '<div class="field"><label for="br-m">Length</label><select id="br-m"><option value="1">1 minute</option><option value="3" selected>3 minutes</option><option value="5">5 minutes</option><option value="10">10 minutes</option></select></div>' +
    '<p class="fine">Breathe gently through your nose if you can. If you feel light-headed, stop and breathe normally.</p></div></div>';
  var orb = document.getElementById('br-orb'), cue = document.getElementById('br-cue'), leftEl = document.getElementById('br-left');
  var running = false, t1 = null, t2 = null, end = 0;
  function stop(msg) {
    running = false; clearTimeout(t1); clearInterval(t2);
    orb.style.transitionDuration = '1s'; orb.style.transform = 'scale(.62)';
    cue.textContent = msg || 'Press start'; leftEl.textContent = '';
    root.querySelector('[data-br-go]').textContent = 'Start';
  }
  function phase(seq, k) {
    if (!running) return;
    if (Date.now() >= end) { stop('Done. Notice how you feel.'); return; }
    var p = seq[k % seq.length];
    cue.textContent = p[0];
    orb.style.transitionDuration = p[1] + 's';
    if (p[0] === 'Breathe in') orb.style.transform = 'scale(1)';
    if (p[0] === 'Breathe out') orb.style.transform = 'scale(.62)';
    t1 = setTimeout(function () { phase(seq, k + 1); }, p[1] * 1000);
  }
  root.addEventListener('click', function (e) {
    if (!e.target.closest('[data-br-go]')) return;
    if (running) { stop(); return; }
    running = true;
    e.target.textContent = 'Stop';
    end = Date.now() + (+document.getElementById('br-m').value) * 60000;
    t2 = setInterval(function () { var s = Math.max(0, Math.round((end - Date.now()) / 1000)); leftEl.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + ' left'; }, 500);
    phase(P[document.getElementById('br-p').value].seq, 0);
  });
})();

/* Desk-break timer: work interval, then a guided eye and neck break. */
(function () {
  'use strict';
  var root = document.getElementById('deskbreak');
  if (!root) return;
  var steps = [
    ['Eyes: look far away', 'Look at something at least 6 metres (20 feet) away and let your eyes relax.', 20],
    ['Chin tucks', 'Sit tall. Gently glide your chin straight back, as if making a double chin. Hold 3 seconds, release. Repeat 5 times.', 25],
    ['Side bend, left', 'Tilt your left ear towards your left shoulder until you feel a gentle stretch. Breathe slowly.', 20],
    ['Side bend, right', 'Now tilt your right ear towards your right shoulder. Keep your shoulders down.', 20],
    ['Shoulder rolls', 'Roll both shoulders up, back and down, slowly, 8 times.', 20],
    ['Upper back opener', 'Clasp your hands behind you, squeeze your shoulder blades together and lift your chest. Hold, then release.', 20],
    ['Water', 'Take a few sips of water before you start again.', 10]
  ];
  var mins = 20, left = mins * 60, mode = 'idle', si = 0, timer = null, sound = false;
  root.innerHTML = '<div class="split"><div class="tool-card"><p class="steps-count" id="db-mode">Ready</p><p class="timer-face" id="db-time" aria-live="off">20:00</p>' +
    '<div id="db-step" aria-live="polite"></div><div class="hero-actions" style="justify-content:center"><button class="btn btn-primary" type="button" data-db-go>Start</button><button class="btn btn-quiet" type="button" data-db-reset>Reset</button><button class="btn btn-quiet" type="button" data-db-break>Break now</button></div></div>' +
    '<div><div class="field"><label for="db-mins">Work interval</label><select id="db-mins"><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option></select></div>' +
    '<label class="check"><input type="checkbox" id="db-sound"> <span>Play a soft chime when it is time for a break</span></label>' +
    '<label class="check"><input type="checkbox" id="db-note"> <span>Show a notification if this tab is in the background</span></label>' +
    '<p class="fine">Stop any stretch that causes pain, tingling or dizziness.</p></div></div>';
  var $ = function (id) { return document.getElementById(id); };
  function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function chime() {
    if (!sound) return;
    try { var A = new (window.AudioContext || window.webkitAudioContext)(), o = A.createOscillator(), g = A.createGain(); o.frequency.value = 528; g.gain.setValueAtTime(0.0001, A.currentTime); g.gain.exponentialRampToValueAtTime(0.15, A.currentTime + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + 1.2); o.connect(g); g.connect(A.destination); o.start(); o.stop(A.currentTime + 1.3); } catch (e) {}
  }
  function notify(t) { try { if ($('db-note').checked && document.hidden && window.Notification && Notification.permission === 'granted') new Notification('G44 desk break', { body: t }); } catch (e) {} }
  function draw() {
    $('db-time').textContent = fmt(left);
    $('db-mode').textContent = mode === 'work' ? 'Working. Next break in' : mode === 'break' ? 'Break: step ' + (si + 1) + ' of ' + steps.length : mode === 'paused' ? 'Paused' : 'Ready';
    $('db-step').innerHTML = mode === 'break' ? '<div class="result-box r-ok"><h3>' + steps[si][0] + '</h3><p>' + steps[si][1] + '</p></div>' : '';
  }
  function startBreak() { mode = 'break'; si = 0; left = steps[0][2]; chime(); notify('Time for a 2-minute eye and neck break.'); run(); }
  function tick() {
    left--;
    if (left <= 0) {
      if (mode === 'work') { startBreak(); return; }
      if (mode === 'break') { si++; if (si < steps.length) { left = steps[si][2]; chime(); } else { mode = 'work'; left = mins * 60; chime(); notify('Break done. Back to it.'); } }
    }
    draw();
  }
  function run() { clearInterval(timer); timer = setInterval(tick, 1000); root.querySelector('[data-db-go]').textContent = 'Pause'; draw(); }
  root.addEventListener('click', function (e) {
    if (e.target.closest('[data-db-go]')) {
      if (mode === 'work' || mode === 'break') { clearInterval(timer); root._resume = mode; mode = 'paused'; e.target.textContent = 'Resume'; draw(); return; }
      if (mode === 'paused') { mode = root._resume || 'work'; run(); return; }
      mode = 'work'; left = mins * 60; run();
    }
    if (e.target.closest('[data-db-reset]')) { clearInterval(timer); mode = 'idle'; left = mins * 60; root.querySelector('[data-db-go]').textContent = 'Start'; draw(); }
    if (e.target.closest('[data-db-break]')) startBreak();
  });
  root.addEventListener('change', function (e) {
    if (e.target.id === 'db-mins') { mins = +e.target.value; if (mode === 'idle') { left = mins * 60; draw(); } }
    if (e.target.id === 'db-sound') sound = e.target.checked;
    if (e.target.id === 'db-note' && e.target.checked && window.Notification && Notification.permission === 'default') Notification.requestPermission();
  });
  draw();
})();

/* Caffeine counter. Values are typical amounts; brands vary. */
(function () {
  'use strict';
  var root = document.getElementById('caffeine');
  if (!root) return;
  var G = window.G44, KEY = 'g44-caffeine';
  var items = [
    ['Brewed coffee, 240 ml (8 oz)', 95], ['Espresso, single shot', 63], ['Instant coffee, 240 ml', 62],
    ['Black tea, 240 ml', 47], ['Green tea, 240 ml', 28], ['Cola, 355 ml (12 oz) can', 34],
    ['Energy drink, 250 ml', 80], ['Energy drink, 473 ml (16 oz)', 160], ['Dark chocolate, 28 g (1 oz)', 24],
    ['Headache tablet with caffeine, per tablet', 65], ['Pre-workout drink, 1 scoop', 200]
  ];
  var saved = G.store.get(KEY, null), today = new Date().toISOString().slice(0, 10);
  var n = saved && saved.date === today ? saved.n : items.map(function () { return 0; });
  root.innerHTML = '<div class="split"><div>' + items.map(function (it, k) {
    return '<div class="counter"><span>' + it[0] + ' <span class="fine">about ' + it[1] + ' mg</span></span><button class="round" type="button" data-dec="' + k + '" aria-label="Remove one: ' + it[0] + '">&minus;</button><output id="cf' + k + '">0</output><button class="round" type="button" data-inc="' + k + '" aria-label="Add one: ' + it[0] + '">+</button></div>';
  }).join('') + '<p class="fine mt1">Typical amounts. Check labels: brands and serving sizes vary a lot. <button class="linkbtn" type="button" data-reset>Reset today</button></p></div>' +
    '<div class="tool-card"><p class="timer-face" id="cf-total" aria-live="polite">0 mg</p><div class="meter"><i id="cf-bar" style="width:0"></i></div><p class="fine">Bar runs to 400 mg, the most the U.S. FDA says is not generally linked to dangerous effects in healthy adults.</p><div id="cf-msg"></div></div></div>';
  function draw() {
    var total = 0;
    n.forEach(function (v, k) { total += v * items[k][1]; document.getElementById('cf' + k).value = v; });
    document.getElementById('cf-total').textContent = total + ' mg';
    var bar = document.getElementById('cf-bar');
    bar.style.width = Math.min(100, total / 400 * 100) + '%';
    bar.parentNode.className = 'meter' + (total > 400 ? ' bad' : total > 200 ? ' warn' : '');
    var m;
    if (total > 400) m = '<div class="result-box r-bad"><h3>Above 400 mg</h3><p>That is more than the usual safe ceiling for healthy adults. High intake can cause headaches, poor sleep and a racing heart, and makes withdrawal headaches more likely. Cut back gradually.</p></div>';
    else if (total > 200) m = '<div class="result-box r-warn"><h3>Over 200 mg</h3><p>Regular intake above about 200 mg a day is linked to <a href="types/caffeine-withdrawal.html">withdrawal headaches</a> when you miss a dose, and adds to <a href="types/medication-overuse.html">rebound-headache</a> risk for people with frequent headaches.</p></div>';
    else m = '<div class="result-box r-ok"><h3>Moderate</h3><p>Keep your caffeine steady from day to day, including weekends. Big swings matter more than the exact amount.</p></div>';
    document.getElementById('cf-msg').innerHTML = m;
    G.store.set(KEY, { date: today, n: n });
  }
  root.addEventListener('click', function (e) {
    var a = e.target.closest('[data-inc]'), b = e.target.closest('[data-dec]');
    if (a) n[+a.getAttribute('data-inc')]++;
    if (b) { var k = +b.getAttribute('data-dec'); n[k] = Math.max(0, n[k] - 1); }
    if (e.target.closest('[data-reset]')) n = n.map(function () { return 0; });
    if (a || b || e.target.closest('[data-reset]')) draw();
  });
  draw();
})();

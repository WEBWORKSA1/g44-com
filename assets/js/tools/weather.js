/* Headache weather: 72-hour air-pressure change outlook from Open-Meteo. */
(function () {
  'use strict';
  var G = window.G44, C = G.config, esc = G.esc, KEY = 'g44-loc';
  var GEO = C.geoApi || 'https://geocoding-api.open-meteo.com/v1/search';
  var WX = C.weatherApi || 'https://api.open-meteo.com/v1/forecast';

  function level(s) {
    if (s < 3) return { t: 'Low', c: 'low', tip: 'Little pressure change. A steady day for most people.' };
    if (s < 6) return { t: 'Moderate', c: 'mod', tip: 'Some change. If weather is one of your triggers, keep water and your usual plan handy.' };
    if (s < 10) return { t: 'High', c: 'high', tip: 'A marked swing. Protect sleep, meals and fluids, and log any headache in your diary.' };
    return { t: 'Very high', c: 'high', tip: 'A big swing, often with a front or storm. Plan a lighter day if you can.' };
  }
  function geocode(q) {
    return fetch(GEO + '?count=6&language=en&format=json&name=' + encodeURIComponent(q)).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { return (j.results || []).map(function (x) { return { name: [x.name, x.admin1, x.country].filter(Boolean).join(', '), lat: x.latitude, lon: x.longitude }; }); });
  }
  function forecast(loc) {
    var u = WX + '?latitude=' + loc.lat + '&longitude=' + loc.lon + '&hourly=pressure_msl,temperature_2m&past_days=1&forecast_days=4&timezone=auto';
    return fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); });
  }
  function analyse(j) {
    var t = j.hourly.time, p = j.hourly.pressure_msl, tp = j.hourly.temperature_2m;
    var nowKey = new Date(Date.now() + (j.utc_offset_seconds || 0) * 1000).toISOString().slice(0, 13);
    var ni = t.findIndex(function (x) { return x.slice(0, 13) === nowKey; });
    if (ni < 24) ni = 24;
    var days = [];
    for (var d = 0; d < 3; d++) {
      var s = ni + d * 24, e = Math.min(s + 24, p.length), drop = 0, rise = 0, lo = Infinity, hi = -Infinity;
      for (var h = s; h < e; h++) {
        if (p[h] == null || p[h - 24] == null) continue;
        var dl = p[h] - p[h - 24];
        if (dl < drop) drop = dl;
        if (dl > rise) rise = dl;
        if (tp[h] != null) { lo = Math.min(lo, tp[h]); hi = Math.max(hi, tp[h]); }
      }
      var swing = Math.max(-drop, rise * 0.7);
      days.push({ start: t[s], drop: drop, rise: rise, swing: swing, temp: isFinite(hi - lo) ? hi - lo : 0, lv: level(swing) });
    }
    return { ni: ni, t: t, p: p, days: days, now: p[ni] };
  }
  function dayName(iso, d) {
    if (d === 0) return 'Next 24 hours';
    var dt = new Date(iso);
    return isNaN(dt) ? 'Day ' + (d + 1) : dt.toLocaleDateString(undefined, { weekday: 'long' });
  }
  function chart(a) {
    var s = a.ni - 24, e = Math.min(a.ni + 72, a.p.length), pts = [];
    for (var i = s; i < e; i++) if (a.p[i] != null) pts.push([i - s, a.p[i]]);
    if (pts.length < 2) return '';
    var min = Math.min.apply(null, pts.map(function (x) { return x[1]; })) - 1, max = Math.max.apply(null, pts.map(function (x) { return x[1]; })) + 1;
    var W = 600, H = 150, L = 44, n = e - s - 1;
    var X = function (i) { return L + i / n * (W - L - 6); }, Y = function (v) { return 8 + (max - v) / (max - min) * (H - 30); };
    var line = pts.map(function (q, k) { return (k ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); }).join(' ');
    var area = line + ' L' + X(pts[pts.length - 1][0]).toFixed(1) + ' ' + (H - 22) + ' L' + X(pts[0][0]).toFixed(1) + ' ' + (H - 22) + ' Z';
    var nx = X(24).toFixed(1);
    return '<svg class="wx-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Air pressure from yesterday to three days ahead, between ' + Math.round(min + 1) + ' and ' + Math.round(max - 1) + ' hectopascals">' +
      '<path class="ar" d="' + area + '"/><path class="ln" d="' + line + '"/>' +
      '<line class="nw" x1="' + nx + '" x2="' + nx + '" y1="4" y2="' + (H - 22) + '"/>' +
      '<text x="0" y="16">' + Math.round(max - 1) + '</text><text x="0" y="' + (H - 26) + '">' + Math.round(min + 1) + '</text>' +
      '<text x="' + (L) + '" y="' + (H - 4) + '">Yesterday</text><text x="' + (+nx + 4) + '" y="' + (H - 4) + '">Now</text><text x="' + (W - 70) + '" y="' + (H - 4) + '">+3 days</text></svg>';
  }
  function locForm(el, msg) {
    el.innerHTML = (msg ? '<p class="feed-status">' + esc(msg) + '</p>' : '<p>See how air pressure will change where you are over the next three days.</p>') +
      '<form class="wx-loc" data-wx-search><label class="sr" for="wx-q-' + el.id + '">City or town</label><input id="wx-q-' + el.id + '" name="q" required placeholder="City or town" autocomplete="address-level2">' +
      '<button class="btn btn-primary btn-sm" type="submit">Search</button><button class="btn btn-quiet btn-sm" type="button" data-wx-geo>Use my location</button></form><div data-wx-results></div>';
  }
  function render(el) {
    var loc = G.store.get(KEY, null), full = el.getAttribute('data-weather') === 'full';
    if (!loc) { locForm(el); return; }
    el.innerHTML = '<p class="feed-status">Loading the outlook for ' + esc(loc.name) + '...</p>';
    forecast(loc).then(function (j) {
      var a = analyse(j), top = a.days.reduce(function (m, d) { return d.swing > m.swing ? d : m; }, a.days[0]);
      var html = '<p class="wx-where"><strong>' + esc(loc.name) + '</strong>. Pressure now ' + Math.round(a.now) + ' hPa. <button class="linkbtn" type="button" data-wx-change>Change place</button></p>';
      html += '<div class="wx-days">' + a.days.map(function (d, k) {
        return '<div class="wx-day"><b>' + esc(dayName(d.start, k)) + '</b><span class="lvl lvl-' + d.lv.c + '">' + d.lv.t + '</span><small>' +
          (d.drop < -0.5 ? 'Falls up to ' + Math.abs(d.drop).toFixed(1) + ' hPa' : d.rise > 0.5 ? 'Rises up to ' + d.rise.toFixed(1) + ' hPa' : 'Steady') + ' in 24 h</small></div>';
      }).join('') + '</div>';
      html += chart(a);
      if (full) {
        html += '<div class="result-box r-' + (top.lv.c === 'low' ? 'ok' : top.lv.c === 'mod' ? 'warn' : 'bad') + '"><h3>Biggest swing: ' + esc(dayName(top.start, a.days.indexOf(top))) + '</h3><p>' + esc(top.lv.tip) + '</p>' +
          (top.temp >= 10 ? '<p>Temperature also swings by about ' + Math.round(top.temp) + '°C that day.</p>' : '') + '</div>';
      } else {
        html += '<p class="fine">' + esc(top.lv.tip) + ' <a href="tools/headache-weather.html">Full outlook</a></p>';
      }
      el.innerHTML = html;
    }).catch(function () {
      el.innerHTML = '<p class="feed-status">Weather data is not reachable right now. Try again in a few minutes.</p><button class="linkbtn" type="button" data-wx-change>Change place</button>';
    });
  }
  function bind(el) {
    el.addEventListener('submit', function (e) {
      var f = e.target.closest('[data-wx-search]');
      if (!f) return;
      e.preventDefault();
      var out = el.querySelector('[data-wx-results]'), q = f.q.value.trim();
      if (!q) return;
      out.innerHTML = '<p class="feed-status">Searching...</p>';
      geocode(q).then(function (list) {
        if (!list.length) { out.innerHTML = '<p class="feed-status">No place found with that name. Try the nearest larger town.</p>'; return; }
        out.innerHTML = '<ul class="plain">' + list.map(function (x, k) { return '<li><button class="linkbtn" type="button" data-wx-pick="' + k + '">' + esc(x.name) + '</button></li>'; }).join('') + '</ul>';
        out._list = list;
      }).catch(function () { out.innerHTML = '<p class="feed-status">Place search is not reachable right now.</p>'; });
    });
    el.addEventListener('click', function (e) {
      var pick = e.target.closest('[data-wx-pick]');
      if (pick) { var list = el.querySelector('[data-wx-results]')._list; G.store.set(KEY, list[+pick.getAttribute('data-wx-pick')]); renderAll(); return; }
      if (e.target.closest('[data-wx-change]')) { locForm(el); return; }
      if (e.target.closest('[data-wx-geo]')) {
        if (!navigator.geolocation) { locForm(el, 'Location is not available in this browser. Search for your town instead.'); return; }
        navigator.geolocation.getCurrentPosition(function (pos) {
          G.store.set(KEY, { name: 'Your location', lat: +pos.coords.latitude.toFixed(3), lon: +pos.coords.longitude.toFixed(3) });
          renderAll();
        }, function () { locForm(el, 'Location permission was not given. Search for your town instead.'); }, { timeout: 10000, maximumAge: 3600e3 });
      }
    });
  }
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-weather]'));
  function renderAll() { els.forEach(render); }
  els.forEach(function (el, k) { if (!el.id) el.id = 'wx' + k; bind(el); });
  renderAll();
})();

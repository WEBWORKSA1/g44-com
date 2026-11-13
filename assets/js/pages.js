/* Page helpers: support tiers, contest theme and countdown, site search, thank-you messages, care-form study preview. */
(function () {
  'use strict';
  var G = window.G44, $ = G.$, $$ = G.$$, esc = G.esc, C = G.config;

  /* Support page */
  var sup = $('[data-support]');
  if (sup) {
    var amount = 15, freq = 'once';
    var payBox = $('[data-paylinks]', sup), pledge = $('#pledge');
    var sync = function () {
      $$('.tier', sup).forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-amount') === amount ? 'true' : 'false'); });
      $$('[data-freq]', sup).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-freq') === freq ? 'true' : 'false'); });
      var d = C.donate || {}, links = [];
      var stripe = freq === 'monthly' ? d.stripeMonthly : d.stripe;
      if (stripe) links.push('<a class="btn btn-primary btn-lg" href="' + esc(stripe) + '" target="_blank" rel="noopener">Give with card</a>');
      if (d.paypal) links.push('<a class="btn btn-quiet btn-lg" href="' + esc(d.paypal) + '" target="_blank" rel="noopener">Give with PayPal</a>');
      if (d.bmc) links.push('<a class="btn btn-quiet btn-lg" href="' + esc(d.bmc) + '" target="_blank" rel="noopener">Buy us a coffee</a>');
      payBox.innerHTML = links.length ? links.join(' ') + '<p class="fine mt1">You choose the final amount on the payment page.</p>' :
        '<a class="btn btn-primary btn-lg" href="support.html#pledge" data-to-pledge>Pledge US$' + amount + (freq === 'monthly' ? ' a month' : '') + '</a><p class="fine mt1">Card and PayPal checkout is being set up. Pledge now and we will send you a secure payment link.</p>';
      if (pledge) { pledge.elements.amount.value = amount; pledge.elements.frequency.value = freq === 'monthly' ? 'Monthly' : 'One time'; }
    };
    sup.addEventListener('click', function (e) {
      var t = e.target.closest('.tier');
      if (t) { amount = +t.getAttribute('data-amount'); sync(); }
      var f = e.target.closest('[data-freq]');
      if (f) { freq = f.getAttribute('data-freq'); sync(); }
      if (e.target.closest('[data-to-pledge]') && pledge) {
        e.preventDefault();
        pledge.scrollIntoView({ behavior: 'smooth' });
        pledge.elements.supporter_name.focus({ preventScroll: true });
      }
    });
    sync();
  }

  /* Contests page */
  var cd = $('[data-contest]');
  if (cd) {
    try {
      var themes = JSON.parse($('#contest-data').textContent), now = new Date();
      var th = themes[now.getMonth() % themes.length];
      var end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      $('[data-c-title]').textContent = th.title;
      $('[data-c-brief]').textContent = th.brief;
      $('[data-c-month]').textContent = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      $('[data-c-end]').textContent = end.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
      $$('[data-c-prize]').forEach(function (el) { el.textContent = (C.contest || {}).prize || 'a gift card'; });
      $$('[data-c-runner]').forEach(function (el) { el.textContent = (C.contest || {}).runnerUp || 'a digital badge'; });
      if ((C.contest || {}).sponsor) $('[data-c-sponsor]').textContent = 'This month’s prizes are sponsored by ' + C.contest.sponsor + '.';
      var theme = $('#entry [name=theme]');
      if (theme) theme.value = th.title;
      var clock = $('[data-c-clock]');
      var tick = function () {
        var ms = end - new Date();
        if (ms < 0) { clock.textContent = 'Closed'; return; }
        var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
        clock.textContent = d + 'd ' + h + 'h ' + m + 'm';
      };
      tick(); setInterval(tick, 30000);
    } catch (e) {}
  }

  /* Site search */
  var sb = $('[data-search]');
  if (sb) {
    var input = $('input', sb), res = $('[data-search-results]'), idx = null;
    var run = function () {
      var q = input.value.trim().toLowerCase();
      if (!idx) return;
      if (q.length < 2) { res.innerHTML = '<p class="feed-status">Type at least two letters.</p>'; return; }
      var words = q.split(/\s+/);
      var hits = idx.map(function (p) {
        var hay = (p.title + ' ' + p.description + ' ' + (p.code || '') + ' ' + (p.keywords || '')).toLowerCase(), s = 0;
        words.forEach(function (w) { if (hay.indexOf(w) > -1) s += (p.title.toLowerCase().indexOf(w) > -1 ? 3 : 1); else s -= 5; });
        return { p: p, s: s };
      }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 25);
      res.innerHTML = hits.length ? '<ul class="feed">' + hits.map(function (h) { return '<li><a href="' + esc(h.p.url.replace(/^\//, '')) + '">' + esc(h.p.title) + '</a><small>' + esc(h.p.description) + '</small></li>'; }).join('') + '</ul>' :
        '<p class="feed-status">Nothing matched "' + esc(q) + '". Try a symptom such as "eye", "neck" or "morning", or a code such as G44.2.</p>';
    };
    fetch('search.json').then(function (r) { return r.json(); }).then(function (j) { idx = j; if (G.params.get('q')) input.value = G.params.get('q'); if (input.value) run(); });
    input.addEventListener('input', run);
    sb.addEventListener('submit', function (e) { e.preventDefault(); run(); });
  }

  /* Thank-you page */
  var ty = $('[data-thanks]');
  if (ty) {
    var M = {
      care: ['Your request is in.', 'A member of our matching team will email you within two business days with options that fit what you told us. Check your spam folder if you do not see it.'],
      partner: ['Thanks for reaching out.', 'Our partnerships team will reply within two business days with the media kit and next steps.'],
      apply: ['Application received.', 'We review every application and reply to shortlisted people within two weeks.'],
      entry: ['Your entry is in.', 'Good luck. Winners are announced on the Contests page and emailed within 14 days after the month closes.'],
      pledge: ['Thank you for backing G44.', 'We will email you a secure payment link for your pledge within two business days.']
    };
    var m = M[G.params.get('f')];
    if (m) { $('[data-thanks-title]').textContent = m[0]; $('[data-thanks-body]').textContent = m[1]; }
  }

  /* Care form: show studies recruiting for the chosen headache type */
  var care = $('#care-form');
  if (care && window.G44Feeds) {
    var sel = care.querySelector('[name=headache_type]'), box = $('[data-care-trials]');
    var upd = function () {
      var o = sel.options[sel.selectedIndex], cond = o && o.getAttribute('data-cond');
      if (!cond) { box.hidden = true; return; }
      box.hidden = false;
      var el = $('.care-trials-list', box);
      el.setAttribute('data-trials', cond);
      el.setAttribute('data-max', '3');
      window.G44Feeds.renderTrials(el);
    };
    sel.addEventListener('change', upd);
    if (sel.value) upd();
  }
})();

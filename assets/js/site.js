/* G44 core behaviour: theme, navigation, ads, video, forms, daily tip, cookie notice. */
(function () {
  'use strict';
  var C = window.G44_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var params = new URLSearchParams(location.search);
  window.G44 = { $: $, $$: $$, esc: esc, store: store, config: C, params: params };

  /* Low-light mode */
  var root = document.documentElement;
  function syncTheme() {
    var dim = root.getAttribute('data-theme') === 'dim';
    $$('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', dim ? 'true' : 'false'); });
  }
  $$('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var dim = root.getAttribute('data-theme') === 'dim';
      if (dim) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'dim');
      try { localStorage.setItem('g44-theme', dim ? '' : 'dim'); } catch (e) {}
      syncTheme();
    });
  });
  syncTheme();

  /* Navigation */
  var nt = $('.nav-toggle'), nav = $('#site-nav');
  if (nt && nav) nt.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    nt.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) {
    $$('details.more[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') $$('details.more[open]').forEach(function (d) { d.removeAttribute('open'); });
  });

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Cookie notice */
  var ck = $('#cookie');
  if (ck && C.cookieNotice !== false && !store.get('g44-consent', false)) ck.hidden = false;
  $$('[data-cookie-ok]').forEach(function (b) {
    b.addEventListener('click', function () { store.set('g44-consent', true); if (ck) ck.hidden = true; });
  });

  /* Ad units: render only when a slot ID is configured; Auto ads cover the rest. */
  $$('.ad-slot').forEach(function (el) {
    var id = (C.adSlots || {})[el.getAttribute('data-ad')];
    if (!id) { el.parentNode.removeChild(el); return; }
    el.hidden = false;
    el.innerHTML = '<p class="ad-label">Advertisement</p><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6620975821265271" data-ad-slot="' + esc(id) + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  });

  /* Lightweight YouTube embeds: the player loads only when someone presses play. */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.yt-play');
    if (!b) return;
    var id = b.getAttribute('data-id');
    if (!/^[\w-]{11}$/.test(id)) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    f.title = b.getAttribute('aria-label') || 'YouTube video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    b.parentNode.replaceChild(f, b);
  });

  /* Tip of the day */
  var tipEl = $('[data-tip]'), tipsData = $('#tips-data');
  if (tipEl && tipsData) {
    try {
      var tips = JSON.parse(tipsData.textContent), d = new Date();
      var doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
      var t = tips[doy % tips.length];
      tipEl.innerHTML = '<p class="tip">' + esc(t.text) + '</p>' + (t.url ? '<a href="' + esc(t.url) + '">' + esc(t.link || 'Learn more') + '</a>' : '');
    } catch (e) {}
  }

  /* Prefill any form field from the URL, e.g. get-care.html?need=studies */
  params.forEach(function (v, k) {
    if (!/^[a-z_]{2,20}$/.test(k)) return;
    $$('form [name="' + k + '"]').forEach(function (f) {
      if (f.type === 'radio' || f.type === 'checkbox') { if (f.value === v) f.checked = true; }
      else if (f.tagName === 'SELECT' || f.type === 'text' || f.type === 'hidden') {
        if (f.tagName !== 'SELECT' || $$('option', f).some(function (o) { return o.value === v; })) f.value = v;
      }
    });
  });

  /* Multi-step forms */
  $$('form[data-steps]').forEach(function (form) {
    var steps = $$('.step', form), i = 0, bar = $('.steps-bar i', form), count = $('.steps-count', form);
    function show(n, focus) {
      steps.forEach(function (s, k) { s.hidden = k !== n; });
      i = n;
      if (bar) bar.style.width = ((n + 1) / steps.length * 100) + '%';
      if (count) count.textContent = 'Step ' + (n + 1) + ' of ' + steps.length;
      if (focus) { var h = $('legend, h2, h3', steps[n]); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
    }
    function valid(n) {
      var ok = true;
      $$('input, select, textarea', steps[n]).forEach(function (f) { if (ok && !f.checkValidity()) { f.reportValidity(); ok = false; } });
      return ok;
    }
    form.addEventListener('click', function (e) {
      if (e.target.closest('[data-next]')) { e.preventDefault(); if (valid(i)) show(Math.min(i + 1, steps.length - 1), true); }
      if (e.target.closest('[data-back]')) { e.preventDefault(); show(Math.max(i - 1, 0), true); }
    });
    form.addEventListener('change', function (e) {
      var st = e.target.closest('.step[data-auto]');
      if (st && e.target.type === 'radio' && steps.indexOf(st) === i) setTimeout(function () { if (valid(i)) show(Math.min(i + 1, steps.length - 1), true); }, 220);
    });
    var start = 0;
    if (form.hasAttribute('data-skip-prefilled') && steps[0] && $('input[type=radio]:checked', steps[0])) start = 1;
    show(start, false);
  });

  /* Forms: sent through FormSubmit. The inbox is decoded only at send time. */
  function inbox() {
    if (C.formAlias) return C.formAlias;
    return (C.inbox || []).map(function (v, k) { return String.fromCharCode((v ^ 21) - 7 * ((k % 5) + 1)); }).join('');
  }
  function collect(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) {
      if (k === '_honey' || v === '') return;
      o[k] = o[k] !== undefined ? o[k] + ', ' + v : v;
    });
    return o;
  }
  function send(form) {
    var o = collect(form);
    o._subject = 'G44.com: ' + (form.getAttribute('data-subject') || 'Website form');
    o._template = 'table';
    o._captcha = 'false';
    o['Sent from'] = location.href.split('?')[0];
    return fetch((C.formEndpoint || 'https://formsubmit.co/ajax/') + inbox(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(o)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().catch(function () { return {}; });
    }).then(function (j) {
      if (j && (j.success === false || j.success === 'false')) throw new Error(j.message || 'Rejected');
      return j;
    });
  }
  window.G44.send = send;
  $$('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('[name=_honey]');
      if (hp && hp.value) return;
      if (!form.reportValidity()) return;
      var btn = form.querySelector('[type=submit]'), label = btn ? btn.textContent : '';
      var msg = form.querySelector('.form-msg');
      if (!msg) { msg = document.createElement('p'); msg.className = 'form-msg'; msg.hidden = true; form.appendChild(msg); }
      msg.setAttribute('role', 'status');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      send(form).then(function () {
        var to = form.getAttribute('data-redirect');
        if (to) { location.href = to; return; }
        msg.hidden = false;
        msg.className = 'form-msg ok';
        msg.textContent = form.getAttribute('data-ok') || 'Thanks. Your message is on its way and we will reply soon.';
        form.reset();
      }).catch(function () {
        msg.hidden = false;
        msg.className = 'form-msg err';
        msg.textContent = 'Your message did not send. Check your connection and try again. If it keeps failing, use the contact link at the top of the page.';
      }).then(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      });
    });
  });
})();

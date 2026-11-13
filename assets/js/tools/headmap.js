/* Home page head map: tap where it hurts, see which headaches usually live there. */
(function () {
  'use strict';
  var G = window.G44, esc = G.esc, box = document.querySelector('[data-headmap]');
  if (!box) return;
  var types = {};
  try { JSON.parse(document.getElementById('types-data').textContent).forEach(function (t) { types[t.slug] = t; }); } catch (e) {}
  var Z = {
    crown: { label: 'Top of the head', list: ['tension-type', 'primary-stabbing', 'exertional-and-cough'] },
    forehead: { label: 'Forehead', list: ['tension-type', 'sinus', 'caffeine-withdrawal'] },
    temple: { label: 'Temple, one side', list: ['migraine', 'primary-stabbing', 'other-tacs'], warn: 'Over 50 with a new temple headache, a tender scalp or jaw pain when chewing? See a doctor today: these can signal giant cell arteritis, which needs prompt treatment to protect sight.' },
    eye: { label: 'Around or behind one eye', list: ['cluster', 'other-tacs', 'migraine'], warn: 'A painful red eye with blurred vision or halos around lights needs emergency eye care.' },
    face: { label: 'Cheeks and face', list: ['sinus', 'migraine', 'tension-type'] },
    neck: { label: 'Back of the head and neck', list: ['cervicogenic', 'tension-type', 'post-traumatic'], warn: 'A stiff neck with fever, or neck pain after a fall or crash, needs urgent medical care.' },
    band: { label: 'A tight band all around', list: ['tension-type', 'medication-overuse', 'new-daily-persistent'] },
    whole: { label: 'The whole head', list: ['medication-overuse', 'new-daily-persistent', 'post-traumatic'] },
    sudden: { label: 'It hit suddenly, worst ever', list: ['thunderclap'], warn: 'A sudden, severe headache that peaks within a minute is a medical emergency. Call your local emergency number now.' }
  };
  var out = box.querySelector('.hm-result');
  function pick(z) {
    var d = Z[z];
    if (!d) return;
    box.querySelectorAll('[data-zone]').forEach(function (el) {
      var on = el.getAttribute('data-zone') === z;
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', on ? 'true' : 'false');
      else el.classList.toggle('is-on', on);
    });
    var items = d.list.map(function (s) {
      var t = types[s];
      return t ? '<li><a href="types/' + esc(t.slug) + '.html">' + esc(t.name) + '</a><span>' + esc(t.short) + '</span></li>' : '';
    }).join('');
    out.innerHTML = '<h3 class="h4">' + esc(d.label) + ': the usual suspects</h3>' + (d.warn ? '<p class="hm-warn">' + esc(d.warn) + '</p>' : '') +
      '<ol>' + items + '</ol><a class="btn btn-primary btn-sm" href="tools/type-finder.html?where=' + encodeURIComponent(z) + '">Narrow it down in 60 seconds</a>';
  }
  box.addEventListener('click', function (e) {
    var el = e.target.closest('[data-zone]');
    if (el) pick(el.getAttribute('data-zone'));
  });
  box.addEventListener('keydown', function (e) {
    var el = e.target.closest && e.target.closest('svg [data-zone]');
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(el.getAttribute('data-zone')); }
  });
})();

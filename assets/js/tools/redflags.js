/* Warning-sign checker: sorts answers into emergency, same-day or routine. */
(function () {
  'use strict';
  var root = document.getElementById('redflags');
  if (!root) return;
  var items = [
    ['e', 'It came on suddenly and reached full strength within about a minute'],
    ['e', 'I have weakness, numbness, a drooping face, trouble speaking or confusion'],
    ['e', 'I have lost vision or have double vision'],
    ['e', 'I have a fever with a stiff neck, or a rash that does not fade when pressed'],
    ['e', 'It started after a head injury and I am vomiting, drowsy or getting worse'],
    ['e', 'I fainted or had a seizure'],
    ['e', 'I have a painful red eye with blurred vision or haloes around lights'],
    ['e', 'I am pregnant or recently gave birth, and have a severe headache, vision changes or swelling'],
    ['u', 'I am over 50 and this is a new kind of headache'],
    ['u', 'I am over 50 with a tender scalp, temple pain, or jaw pain when chewing'],
    ['u', 'I have cancer, HIV or a weakened immune system, and this headache is new'],
    ['u', 'It is clearly worse when lying down, or when standing up'],
    ['u', 'Coughing, sneezing or straining brings it on, and this is new'],
    ['u', 'It has got steadily worse over days or weeks'],
    ['u', 'It wakes me from sleep, and this is new'],
    ['s', 'My usual headaches have changed in pattern or feel'],
    ['s', 'I get headaches on 4 or more days a month'],
    ['s', 'I take pain relief on 10 or more days a month'],
    ['s', 'Headaches are affecting my work, studies, sleep or mood']
  ];
  root.innerHTML = '<fieldset class="q"><legend>Tick everything that is true right now</legend>' + items.map(function (x, k) {
    return '<label class="check"><input type="checkbox" value="' + x[0] + '" id="rf' + k + '"> <span>' + x[1] + '</span></label>';
  }).join('') + '</fieldset><div class="tool-out" aria-live="polite" id="rf-out"></div>';
  var out = document.getElementById('rf-out');
  function update() {
    var v = Array.prototype.slice.call(root.querySelectorAll('input:checked')).map(function (x) { return x.value; });
    if (v.indexOf('e') > -1) out.innerHTML = '<div class="result-box r-bad" role="alert"><h3>Call for emergency help now</h3><p>Call your local emergency number: 911 in the US and Canada, 999 in the UK, 112 in the EU and India. Do not drive yourself. Tell them when the headache started and what you ticked here.</p></div>';
    else if (v.indexOf('u') > -1) out.innerHTML = '<div class="result-box r-warn"><h3>See a doctor today</h3><p>Contact your doctor for a same-day appointment, an urgent care clinic, or a nurse line such as NHS 111 in the UK. If things get worse while you wait, call your emergency number.</p></div>';
    else if (v.indexOf('s') > -1) out.innerHTML = '<div class="result-box r-ok"><h3>Book a routine appointment</h3><p>Nothing you ticked needs emergency care, but your headaches deserve a proper review. A diary and a short summary make the visit far more useful.</p><div class="hero-actions"><a class="btn btn-primary" href="get-care.html?need=specialist">Get matched with care</a><a class="btn btn-quiet" href="tools/visit-prep.html">Plan the visit</a></div></div>';
    else out.innerHTML = '<p class="muted">Nothing ticked yet. If none of these apply, your headache is very unlikely to be an emergency. Keep an eye on it, and come back if anything changes.</p>';
  }
  root.addEventListener('change', update);
  update();
})();

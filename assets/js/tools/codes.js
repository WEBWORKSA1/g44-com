/* G44 code explorer: search and filter every code in the category. */
(function () {
  'use strict';
  var G = window.G44, esc = G.esc, root = document.getElementById('codes');
  if (!root) return;
  var cats = JSON.parse(document.getElementById('codes-data').textContent), filter = 'all';
  var input = root.querySelector('input'), body = root.querySelector('tbody'), count = root.querySelector('[data-count]');
  root.querySelector('.chips').innerHTML = '<button class="chip" type="button" data-cat="all" aria-pressed="true">All</button>' + cats.map(function (c, k) {
    return '<button class="chip" type="button" data-cat="' + k + '" aria-pressed="false">' + esc(c.cat.replace(/^G44\.\d\s*/, '')) + '</button>';
  }).join('');
  function draw() {
    var q = input.value.trim().toLowerCase(), n = 0, html = '';
    cats.forEach(function (c, k) {
      if (filter !== 'all' && +filter !== k) return;
      var rows = c.codes.filter(function (x) { return !q || (x.code + ' ' + x.title + ' ' + x.plain).toLowerCase().indexOf(q) > -1; });
      if (!rows.length) return;
      n += rows.length;
      html += '<tr class="cat"><td colspan="4">' + esc(c.cat) + '</td></tr>' + rows.map(function (x) {
        return '<tr><td>' + esc(x.code) + '</td><td>' + esc(x.title) + '</td><td>' + esc(x.plain) + '</td><td>' + (x.slug ? '<a href="types/' + esc(x.slug) + '.html">Guide</a> ' : '') + '<button class="linkbtn" type="button" data-copy="' + esc(x.code) + '">Copy</button></td></tr>';
      }).join('');
    });
    body.innerHTML = html || '<tr><td colspan="4">No codes match "' + esc(q) + '". Try a word such as cluster, chronic or injury.</td></tr>';
    count.textContent = n + (n === 1 ? ' code' : ' codes');
  }
  input.addEventListener('input', draw);
  root.addEventListener('click', function (e) {
    var c = e.target.closest('[data-cat]');
    if (c) { filter = c.getAttribute('data-cat'); root.querySelectorAll('[data-cat]').forEach(function (b) { b.setAttribute('aria-pressed', b === c ? 'true' : 'false'); }); draw(); }
    var cp = e.target.closest('[data-copy]');
    if (cp && navigator.clipboard) navigator.clipboard.writeText(cp.getAttribute('data-copy')).then(function () { cp.textContent = 'Copied'; setTimeout(function () { cp.textContent = 'Copy'; }, 1500); });
  });
  if (G.params.get('q')) input.value = G.params.get('q');
  draw();
})();

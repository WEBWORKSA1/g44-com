/* Live research feeds: newest PubMed papers and recruiting ClinicalTrials.gov studies. */
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function cacheGet(k) { try { var o = JSON.parse(sessionStorage.getItem(k)); if (o && Date.now() - o.t < 6 * 3600e3) return o.v; } catch (e) {} return null; }
  function cacheSet(k, v) { try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v: v })); } catch (e) {} }
  function getJSON(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); }
  var EU = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

  function pubmed(term, max) {
    var key = 'pm:' + term + ':' + max, c = cacheGet(key);
    if (c) return Promise.resolve(c);
    return getJSON(EU + 'esearch.fcgi?db=pubmed&retmode=json&sort=pub_date&tool=g44com&retmax=' + max + '&term=' + encodeURIComponent(term)).then(function (s) {
      var ids = (s.esearchresult && s.esearchresult.idlist) || [];
      if (!ids.length) return [];
      return getJSON(EU + 'esummary.fcgi?db=pubmed&retmode=json&tool=g44com&id=' + ids.join(',')).then(function (d) {
        var out = ids.map(function (id) {
          var x = d.result && d.result[id];
          if (!x) return null;
          var au = x.authors || [];
          return { id: id, title: x.title, journal: x.fulljournalname || x.source, date: x.pubdate, author: au[0] ? au[0].name + (au.length > 1 ? ' et al.' : '') : '' };
        }).filter(Boolean);
        cacheSet(key, out);
        return out;
      });
    });
  }

  function trials(cond, max) {
    var key = 'ct2:' + cond + ':' + max, c = cacheGet(key);
    if (c) return Promise.resolve(c);
    var u = 'https://clinicaltrials.gov/api/v2/studies?format=json&countTotal=true&pageSize=' + max +
      '&filter.overallStatus=RECRUITING&fields=NCTId,BriefTitle,LocationCountry,Phase&query.cond=' + encodeURIComponent(cond) +
      '&query.titles=' + encodeURIComponent(cond);
    return getJSON(u).then(function (j) {
      var list = (j.studies || []).map(function (s) {
        var p = s.protocolSection || {}, idm = p.identificationModule || {};
        var loc = (p.contactsLocationsModule && p.contactsLocationsModule.locations) || [];
        var seen = {}, countries = [];
        loc.forEach(function (l) { if (l.country && !seen[l.country]) { seen[l.country] = 1; countries.push(l.country); } });
        var ph = ((p.designModule && p.designModule.phases) || []).filter(function (x) { return x !== 'NA'; })
          .map(function (x) { return x.replace('EARLY_PHASE', 'Early phase ').replace('PHASE', 'Phase '); });
        return { id: idm.nctId, title: idm.briefTitle, countries: countries, phase: ph.join(' / ') };
      });
      var out = { total: j.totalCount || list.length, list: list };
      cacheSet(key, out);
      return out;
    });
  }

  function renderPubmed(el) {
    var term = el.getAttribute('data-pubmed'), max = +el.getAttribute('data-max') || 6;
    el.innerHTML = '<p class="feed-status">Loading the newest papers...</p>';
    return pubmed(term, max).then(function (items) {
      if (!items.length) { el.innerHTML = '<p class="feed-status">No new papers for this topic yet.</p>'; return; }
      el.innerHTML = '<ul class="feed">' + items.map(function (x) {
        return '<li><a href="https://pubmed.ncbi.nlm.nih.gov/' + esc(x.id) + '/" target="_blank" rel="noopener">' + esc(x.title) + '</a><small>' + esc(x.journal) + ', ' + esc(x.date) + (x.author ? ', ' + esc(x.author) : '') + '</small></li>';
      }).join('') + '</ul><p class="fine">Live from PubMed (U.S. National Library of Medicine). Newest first. Research papers are not advice; talk to your clinician before changing treatment.</p>';
    }).catch(function () {
      el.innerHTML = '<p class="feed-status">The live feed is not reachable right now. <a href="https://pubmed.ncbi.nlm.nih.gov/?sort=date&term=' + encodeURIComponent(term) + '" target="_blank" rel="noopener">See the newest papers on PubMed</a>.</p>';
    });
  }

  function renderTrials(el) {
    var cond = el.getAttribute('data-trials'), max = +el.getAttribute('data-max') || 6;
    var link = 'https://clinicaltrials.gov/search?aggFilters=status:rec&cond=' + encodeURIComponent(cond);
    el.innerHTML = '<p class="feed-status">Checking studies that are recruiting now...</p>';
    return trials(cond, max).then(function (r) {
      if (!r.list.length) { el.innerHTML = '<p class="feed-status">No studies are recruiting for this topic right now. <a href="get-care.html?need=studies">Ask us to tell you when one opens</a>.</p>'; return; }
      el.innerHTML = '<p><strong>' + r.total + '</strong> ' + (r.total === 1 ? 'study is' : 'studies are') + ' recruiting for ' + esc(cond) + '.</p><ul class="feed">' + r.list.map(function (x) {
        var where = x.countries.length ? 'Sites in ' + x.countries.slice(0, 3).join(', ') + (x.countries.length > 3 ? ' and ' + (x.countries.length - 3) + ' more countries' : '') : 'Locations on the study page';
        return '<li><a href="https://clinicaltrials.gov/study/' + esc(x.id) + '" target="_blank" rel="noopener">' + esc(x.title) + '</a><small>' + esc(x.id) + (x.phase ? ', ' + esc(x.phase) : '') + '. ' + esc(where) + '</small></li>';
      }).join('') + '</ul><p class="fine">Live from ClinicalTrials.gov. <a href="' + link + '" target="_blank" rel="noopener">See every recruiting study</a>.</p>';
    }).catch(function () {
      el.innerHTML = '<p class="feed-status">The study registry is not reachable right now. <a href="' + link + '" target="_blank" rel="noopener">Search recruiting studies on ClinicalTrials.gov</a>.</p>';
    });
  }

  window.G44Feeds = { pubmed: pubmed, trials: trials, renderPubmed: renderPubmed, renderTrials: renderTrials };
  document.querySelectorAll('[data-pubmed]').forEach(renderPubmed);
  document.querySelectorAll('[data-trials]').forEach(renderTrials);

  /* Topic switchers: <div data-feed-topics> <button data-term="..." data-cond="..."> */
  document.querySelectorAll('[data-feed-topics]').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-term]');
      if (!b) return;
      group.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var pm = document.querySelector(group.getAttribute('data-pubmed-target'));
      var ct = document.querySelector(group.getAttribute('data-trials-target'));
      if (pm) { pm.setAttribute('data-pubmed', b.getAttribute('data-term')); renderPubmed(pm); }
      if (ct) { ct.setAttribute('data-trials', b.getAttribute('data-cond')); renderTrials(ct); }
    });
  });
})();

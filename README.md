# G44.com: every headache, decoded

G44 is the ICD-10 category for "other headache syndromes": tension-type, cluster, medication-overuse, post-traumatic, thunderclap, hypnic, cervicogenic and more. G44.com turns that code family into a free headache hub: a "where does it hurt?" head map, a type finder, a headache diary, a live pressure-change outlook, a rebound-risk calculator, a plain-English library of every G44 headache, live research and recruiting-study feeds, and a free care-matching service.

Static Jekyll site. GitHub Pages builds and hosts it for free from the `main` branch.

**Live:** https://webworksa1.github.io/g44-com/ (moves to https://g44.com once the domain is attached; no code change needed)

- `RESEARCH.md`: the concept, the numbers behind it, and the 38-site benchmark review
- `PROMPTS.md`: phase-by-phase prompts to rebuild or extend the site

## How it is built

GitHub Pages runs Jekyll on every push. Pages are HTML or Markdown with front matter; the header, footer, owner contact bar and AdSense code live once in `_layouts/` and `_includes/`.

Every page writes a `<base href>` computed from its depth and all internal links are relative, so the same build works at `https://webworksa1.github.io/g44-com/` and at `https://g44.com/`.

| Folder / file | What it holds |
| --- | --- |
| `types/` | Headache library (Markdown). Add one by copying a file and adding a row to `_data/types.yml` |
| `tools/` | Interactive tools (scripts in `assets/js/tools/`) |
| `guides/` | Long-form guides (Markdown) |
| `_data/` | Lists that drive the code explorer, menus, cards, videos, tips and contests |
| `assets/js/config.js` | Payment links, ad slot IDs, contest prize, form settings and other switches |

## Self-updating parts (no server needed)

- **Headache weather**: 72-hour pressure-change outlook from the Open-Meteo API for the visitor's city
- **Latest research**: newest PubMed papers per headache type, fetched live from NCBI E-utilities
- **Studies recruiting now**: live ClinicalTrials.gov v2 API results on the research and get-care pages
- **Daily tip** and **monthly contest theme** rotate by date

Each feed falls back to a direct link if the source is unreachable.

## One-time setup checklist

1. **Pages**: Settings → Pages → Build and deployment → *Deploy from a branch* → `main` / `(root)` → Save.
2. **Custom domain** (required for AdSense approval): Settings → Pages → Custom domain `g44.com` → Save. At the registrar set A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and a `www` CNAME to `webworksa1.github.io`. Tick *Enforce HTTPS* once the certificate is issued.
3. **Forms**: submit any form once. FormSubmit sends a one-time activation message to the site inbox; click *Activate*. The inbox address is stored encoded in `assets/js/config.js` and never appears in page source. After activation FormSubmit also offers a random alias; paste it into `formAlias` in `config.js` so the address never travels in requests either.
4. **AdSense**: add `g44.com` in AdSense, keep `ads.txt` at the root, turn on Auto ads, and enable Google's consent message for EEA/UK/Switzerland under *Privacy & messaging*. After approval, paste display-unit slot IDs into `adSlots` in `config.js`.
5. **Payments**: paste PayPal / Stripe / Buy Me a Coffee links into `donate` in `config.js`. Until then the Support page collects pledges.
6. **Open-Meteo**: free for non-commercial use. Once the site earns, switch `weatherApi` in `config.js` to a commercial Open-Meteo plan endpoint.

Local preview (needs Ruby): `gem install jekyll jekyll-sitemap && jekyll serve`

Website, domain, sponsorship, advertising and partnership enquiries: https://web.works/contact

# G44.com: phase-by-phase build prompts

Copy each prompt into Claude in order. Each phase assumes the previous ones are done. The constraints block applies to every phase.

## Constraints (paste with every phase)

```
Project: G44.com, a headache hub built on the ICD-10 code G44 ("other headache syndromes").
Repo: github.com/WEBWORKSA1/g44-com, branch main, served by GitHub Pages (free plan, Jekyll).
- Static site only. No server code. All dynamic data is fetched in the browser.
- Every page: owner bar at the very top reading "Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership", linking to https://web.works/contact.
- AdSense in <head> of every content page:
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>
  plus ads.txt with: google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0
- One inbox for every form, never visible anywhere: store it encoded in assets/js/config.js, decode only at send time, send through FormSubmit AJAX.
- No use of "G44" as a product or firearm reference. Include a trademark and copyright disclosure page.
- Health content: educational, cited, dated, never diagnostic. Emergency guidance on every condition page.
- Relative links plus a computed <base href> so the site works at webworksa1.github.io/g44-com/ and at g44.com.
```

## Master prompt (everything in one go)

```
Build G44.com as a complete, AdSense-ready Jekyll site in the repo above, following the constraints.
Concept: "Every headache, decoded." Plain-English guides to every G44 headache plus migraine,
sinus and caffeine-withdrawal headache; free browser tools; live research and recruiting-study feeds;
a free care-matching lead funnel; donations, contests, careers and a partner page.
Research at least 35 leading headache, health and care-matching sites first and record what you take
from each in RESEARCH.md. Then build in the phases below, test locally, push to main and switch on Pages.
```

## Phase 1. Foundation

```
Create the Jekyll skeleton: _config.yml (title G44, url https://g44.com, jekyll-sitemap, defaults by folder),
_layouts (default, page, type, guide, tool), _includes (head with computed base href, SEO meta, canonical,
JSON-LD WebSite, AdSense script, google-adsense-account meta; owner bar; header with nav and a Low-light
toggle; footer with newsletter form, legal links and disclaimers; ad slot; lead CTA band; red-flag box;
lightweight YouTube embed). Add ads.txt, robots.txt with the sitemap, site.webmanifest, an SVG favicon,
a JavaScript-based base href for 404.html, and README.md with a setup checklist.
```

## Phase 2. Design system

```
Design for people reading with a headache. Low-glare palette: night ink #1F2A44, mist #E9EEF3,
paper #F8FAFC, lamp amber #F2A541 for primary actions, signal red #B7382F for emergencies only,
sage #3F7563 for calm and success. A full Low-light mode (dim theme) saved in localStorage.
Type: Atkinson Hyperlegible Next for everything, Atkinson Hyperlegible Mono for codes.
Layout: left-aligned, 70ch prose, ruled ledgers for lists instead of identical card grids.
The one bold element: an interactive "Where does it hurt?" head map in the home hero.
Respect reduced motion, visible focus, 44px targets, WCAG 2.2 AA contrast.
```

## Phase 3. Content library

```
Write _data/types.yml and one Markdown page per type: tension-type, cluster, other TACs
(paroxysmal hemicrania, SUNCT, hemicrania continua), medication-overuse, post-traumatic, thunderclap,
new daily persistent, hypnic, cervicogenic, primary stabbing, cough/exertional/sexual-activity, plus
neighbours migraine, sinus and caffeine-withdrawal. Each page: code chip, at-a-glance facts, what it
feels like, causes, what helps now, prevention, when to get help, 3 to 5 cited sources, related types,
MedicalWebPage JSON-LD. Base criteria on ICHD-3. Add _data/codes.yml with every ICD-10-CM G44 code
and a plain-English meaning, and four practical guides.
```

## Phase 4. Tools

```
Build browser-only tools: type finder (10 scored questions, red-flag short-circuit), warning-sign checker
(emergency / same day / routine), headache diary (localStorage, calendar heatmap, monthly stats, rebound
warnings, CSV export, print), headache weather (Open-Meteo 72-hour pressure swing), rebound-risk check
(ICHD-3 day thresholds), caffeine counter, desk-break timer, breathing pacer, doctor visit planner and a
searchable G44 code explorer. Each tool page carries an explanation of how it works for content value.
```

## Phase 5. Lead generation

```
Build get-care.html: a 4-step funnel (need, headache details, location, contact) with option cards,
auto-advance, URL prefill (?need=studies), progress bar, explicit consent (details shared only after the
person approves a specific partner), 18+ handling, trust bullets, an FAQ, and a live "studies recruiting
now" panel for the chosen type from the ClinicalTrials.gov v2 API. Redirect to thank-you.html?f=care.
Repeat the lead band on type, guide and tool pages. Build partners.html for clinics, CROs, telehealth,
device brands and injury-case firms, with a media-kit request form and partner rules.
```

## Phase 6. Monetization

```
AdSense: Auto ads first; named slots (in-content, sidebar, home-mid) render only when slot IDs are set
in config.js; label units "Advertisement"; no ads on thank-you or 404. Partner links and sponsorship
slots switched on from config.js. Never place ads inside forms or next to emergency guidance.
```

## Phase 7. Support, contests and careers

```
support.html: one-time/monthly toggle, five tiers with concrete outcomes, budget allocation bars
(operations, medical review, hiring, promotion, prizes), payment buttons from config (Stripe, PayPal,
Buy Me a Coffee) with a pledge form fallback. contests.html: theme rotates monthly from _data/contests.yml,
countdown, prizes from config, entry form, full official rules (no purchase necessary, 18+, Quebec excluded,
skill-testing question for Canada, licence to publish). careers.html: eight roles and an application form.
```

## Phase 8. Self-updating features

```
Add live, keyless, browser-side feeds with graceful fallbacks: PubMed E-utilities (newest papers per
headache type, cached 6 hours), ClinicalTrials.gov v2 (recruiting studies), Open-Meteo (pressure outlook),
plus a daily tip and monthly contest theme chosen by date. research.html gets topic chips for every type.
```

## Phase 9. Compliance and SEO

```
Pages: about, editorial policy (sources hierarchy, AI-assisted drafting disclosed, human check, corrections),
medical disclaimer, privacy (FormSubmit, AdSense cookies with Google links, EEA consent, GDPR, PIPEDA,
Quebec Law 25, CCPA, India DPDP, children), terms, trademark and copyright disclosure, accessibility,
contact. Add search.json and search.html, FAQPage JSON-LD on the home page, sitemap and robots.
```

## Phase 10. QA and launch

```
Validate every YAML front matter block, syntax-check every script, build and screenshot desktop, mobile
and low-light mode, run an internal link check, test every form end to end with the request intercepted,
and scan the repo and build for the inbox address (must be zero hits). Push to main, set Pages to
"Deploy from a branch: main / root", confirm the live URL, then attach g44.com and enforce HTTPS.
```

## Phase 11. Growth

```
Weekly: one new long-tail guide (for example "headache that wakes me at 3am", "G44.209 meaning").
Monthly: contest announcement, newsletter, one YouTube explainer per headache type.
Quarterly: refresh reviewed dates, add a medical reviewer byline, add Spanish, Hindi and French versions
of the top ten pages, and sign at least one new lead-buying partner.
```

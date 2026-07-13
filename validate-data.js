#!/usr/bin/env node
// validate-data.js
// Cross-file data-integrity checker for sandiegocoffee.co.
//
// Catches the drift that the 4-file and 2-file update patterns are prone to:
// dangling location references, hand-maintained mirrors (news JSON-LD, wiki
// highlights list) falling out of sync, missing images on disk, and stale
// generated files.
//
// Usage:  node validate-data.js
// Exit:   0 = clean (no ERRORs), 1 = one or more ERRORs found.
//         WARNs are printed but never fail the build / block a push.
//
// Pure local file reads. Zero network, zero API calls, no writes, no deploy.

const L = require('./lib/data-loaders');

const errors = [];
const warnings = [];
const err  = (cat, msg) => errors.push({ cat, msg });
const warn = (cat, msg) => warnings.push({ cat, msg });

// ── Load everything (a parse failure for one file shouldn't hide the rest) ──────
function tryLoad(label, fn) {
  try { return fn(); }
  catch (e) { err('LOAD', `${label}: ${e.message}`); return null; }
}

const locations    = tryLoad('locations.js', L.loadLocations);
const highlights   = tryLoad('highlights.js', L.loadHighlights);
const blogPosts    = tryLoad('blog.js', L.loadBlogPosts);
const neighborhoods = tryLoad('neighborhoods.js', L.loadNeighborhoods);
const guides       = tryLoad('guides.js', L.loadGuides);
const sdcg         = tryLoad('sdcoffeeguide.js', L.loadSdcgRatings);
const wikiData     = tryLoad('wiki_data.js', L.loadWikiData);
const newsItems    = tryLoad('news.js', L.loadNewsItems);
const locationCount = tryLoad('location-count.js', L.loadLocationCount);

const locIds = new Set((locations || []).map(l => l.id));
const blogIds = new Set((blogPosts || []).map(p => p.id));
const highlightIds = (highlights || []).map(h => h.id);
const neighborhoodNames = new Set((neighborhoods || []).map(n => n.name));

function locIdFromUrl(url) {
  // 'location.html?id=loc_118'  ->  'loc_118'
  const m = (url || '').match(/loc_\d+/);
  return m ? m[0] : null;
}

// ── A. Referential integrity (ERROR) ────────────────────────────────────────────

// Highlights -> locations
if (highlights) {
  highlights.forEach(h => {
    const via = locIdFromUrl(h.locationUrl);
    if (via && !locIds.has(via)) {
      err('REF', `highlight ${h.id}: locationUrl points to ${via} which is not in locations.js`);
    }
    (h.relatedLocationIds || []).forEach(id => {
      if (!locIds.has(id)) {
        err('REF', `highlight ${h.id}: relatedLocationIds has ${id} which is not in locations.js`);
      }
    });
  });
}

// SDCG ratings -> locations
if (sdcg) {
  Object.keys(sdcg).forEach(id => {
    if (!locIds.has(id)) err('REF', `sdcoffeeguide.js: SDCG_RATINGS key ${id} is not in locations.js`);
  });
}

// Wiki data -> locations
if (wikiData) {
  Object.keys(wikiData).forEach(id => {
    if (!locIds.has(id)) err('REF', `wiki_data.js: WIKI_DATA key ${id} is not in locations.js`);
  });
}

// Guides -> locations, count consistency, dupes
if (guides) {
  guides.forEach(g => {
    const locs = g.locations || [];
    // 'reviewer' guides (sdcoffeeguide) are hydrated at runtime from SDCG_RATINGS,
    // so their static locations[] is empty by design — skip the count check.
    if (g.type !== 'reviewer' && typeof g.locationCount === 'number' && g.locationCount !== locs.length) {
      err('GUIDE', `guide ${g.id}: locationCount=${g.locationCount} but locations[] has ${locs.length}`);
    }
    const seen = new Set();
    locs.forEach(item => {
      const id = item.locationId;
      if (id && !locIds.has(id)) {
        err('REF', `guide ${g.id}: locationId ${id} is not in locations.js`);
      }
      if (id && seen.has(id)) {
        err('GUIDE', `guide ${g.id}: duplicate locationId ${id} within the guide`);
      }
      if (id) seen.add(id);
    });
  });
}

// News -> blog posts (internal links; legacy ?id=blog_XXX and clean /blog/{slug})
if (newsItems) {
  newsItems.forEach(n => {
    const url = n.url || '';
    let blogId = null;
    const legacy = url.match(/blog-post\.html\?id=(blog_[a-z0-9-]+)/i);
    const clean = url.match(/^\/blog\/([a-z0-9-]+)/i);
    if (legacy) blogId = legacy[1];
    else if (clean) blogId = 'blog_' + clean[1];
    if (blogId && !blogIds.has(blogId)) {
      err('REF', `news ${n.id}: links to blog post ${blogId} which is not in blog.js`);
    }
  });
}

// Neighborhoods coverage (WARN — not every neighborhood needs a landing page,
// so this is collapsed to a single informational line to keep signal high).
if (locations && neighborhoods) {
  const missing = new Set();
  locations.forEach(l => {
    const hood = l.coffeeDetails && l.coffeeDetails.neighborhood;
    if (hood && !neighborhoodNames.has(hood)) missing.add(hood);
  });
  if (missing.size) {
    warn('HOOD', `${missing.size} neighborhood(s) used in locations.js have no /neighborhoods page (informational): ${[...missing].join(', ')}`);
  }
}

// ── B. Hand-maintained mirror drift (ERROR — the documented danger zones) ────────

// News.js  <->  news.html JSON-LD
if (newsItems) {
  let ldHeadlines = null;
  try {
    const html = L.readRoot('news.html');
    const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!block) throw new Error('no ld+json block found');
    const arr = JSON.parse(block[1]);
    ldHeadlines = new Set(arr.map(e => e.headline || e.name).filter(Boolean));
  } catch (e) {
    err('MIRROR', `news.html JSON-LD could not be parsed: ${e.message}`);
  }
  if (ldHeadlines) {
    const newsTitles = new Set(newsItems.map(n => n.title));
    newsItems.forEach(n => {
      if (!ldHeadlines.has(n.title)) {
        err('MIRROR', `news ${n.id} ("${n.title}") has no matching JSON-LD entry in news.html`);
      }
    });
    ldHeadlines.forEach(h => {
      if (!newsTitles.has(h)) {
        err('MIRROR', `news.html JSON-LD entry "${h}" has no matching item in news.js`);
      }
    });
  }
}

// Highlights.js  <->  wiki_single_page.html hardcoded "Roaster Deep Dives" list
if (highlights) {
  try {
    const wiki = L.readRoot('wiki_single_page.html');
    const seg = wiki.match(/Roaster Deep Dives:([\s\S]*?)<\/p>/);
    if (!seg) throw new Error('could not find "Roaster Deep Dives:" paragraph');
    const listed = new Set((seg[1].match(/highlight_[a-z0-9-]+/g) || []));
    const inHighlights = new Set(highlightIds);
    inHighlights.forEach(id => {
      if (!listed.has(id)) err('MIRROR', `highlight ${id} is in highlights.js but missing from the wiki_single_page.html deep-dives list (~line 35)`);
    });
    listed.forEach(id => {
      if (!inHighlights.has(id)) err('MIRROR', `wiki_single_page.html deep-dives list has ${id} which is not in highlights.js`);
    });
  } catch (e) {
    err('MIRROR', `wiki_single_page.html highlights list could not be checked: ${e.message}`);
  }
}

// ── C. Images on disk ────────────────────────────────────────────────────────────
function checkImage(cat, level, refLabel, imgPath) {
  if (!imgPath || /^https?:\/\//i.test(imgPath)) return; // skip external URLs
  if (!L.fileExists(imgPath)) {
    (level === 'error' ? err : warn)(cat, `${refLabel}: image not found on disk -> ${imgPath}`);
  }
}

if (highlights) highlights.forEach(h => checkImage('IMG', 'error', `highlight ${h.id}`, h.image));
if (blogPosts)  blogPosts.forEach(p => checkImage('IMG', 'error', `blog ${p.id}`, p.image));
if (newsItems)  newsItems.forEach(n => checkImage('IMG', 'error', `news ${n.id}`, n.image));
if (guides) guides.forEach(g => {
  checkImage('IMG', 'error', `guide ${g.id} heroImage`, g.heroImage);
  if (g.cardImage && g.cardImage !== g.heroImage) checkImage('IMG', 'warn', `guide ${g.id} cardImage`, g.cardImage);
});

// ── D. Consistency (WARN) ────────────────────────────────────────────────────────

// instagramReviewUrl  <->  SDCG_RATINGS (canonical-workflow divergence)
if (locations && sdcg) {
  const sdcgKeys = new Set(Object.keys(sdcg));
  locations.forEach(l => {
    const hasIg = !!(l.coffeeDetails && l.coffeeDetails.instagramReviewUrl);
    const hasRating = sdcgKeys.has(l.id);
    if (hasIg && !hasRating) warn('SDCG', `location ${l.id} has coffeeDetails.instagramReviewUrl but no SDCG_RATINGS entry`);
    if (hasRating && !hasIg) warn('SDCG', `location ${l.id} has an SDCG_RATINGS entry but no coffeeDetails.instagramReviewUrl`);
  });
}

// location-count.js  ==  actual count
if (locations && locationCount != null && locationCount !== locations.length) {
  warn('COUNT', `location-count.js says ${locationCount} but locations.js has ${locations.length} (re-run sync-locations.js)`);
}

// sitemap.xml staleness (WARN)
if (locations) {
  try {
    const sitemap = L.readRoot('sitemap.xml');
    const missing = [];
    locations.forEach(l => {
      const url = '/locations/' + L.locationSlug(l, locations);
      if (!sitemap.includes(url + '<') && !sitemap.includes(url + '</loc>')) missing.push(url);
    });
    (guides || []).forEach(g => { if (!sitemap.includes('/guides/' + g.id)) missing.push('/guides/' + g.id); });
    (neighborhoods || []).forEach(n => { if (!sitemap.includes('/neighborhoods/' + n.id)) missing.push('/neighborhoods/' + n.id); });
    if (missing.length) {
      warn('SITEMAP', `${missing.length} URL(s) missing from sitemap.xml (re-run generate-sitemap.js). First few: ${missing.slice(0, 5).join(', ')}`);
    }
  } catch (e) {
    warn('SITEMAP', `sitemap.xml could not be checked: ${e.message}`);
  }
}

// ── Report ──────────────────────────────────────────────────────────────────────
function print(list, label) {
  if (!list.length) return;
  console.log(`\n${label} (${list.length}):`);
  list.forEach(({ cat, msg }) => console.log(`  [${cat}] ${msg}`));
}

console.log('\n🔎 validate-data.js — cross-file integrity check');
print(errors, '❌ ERRORS');
print(warnings, '⚠️  WARNINGS');

if (!errors.length && !warnings.length) {
  console.log('\n✅ All checks passed. No drift found.\n');
} else {
  console.log(`\n${errors.length ? '❌' : '✅'} ${errors.length} error(s), ${warnings.length} warning(s).` +
    (errors.length ? ' Fix errors before pushing.\n' : ' No blocking errors.\n'));
}

process.exit(errors.length ? 1 : 0);

// lib/data-loaders.js
// Shared parsing for the site's browser-global data files so that
// generate-sitemap.js and validate-data.js never fork their parsing logic.
//
// Every loader reads from the project root (the parent of /lib) and pulls the
// `window.XXX = ...` assignment out of the file. Files that are strict JSON
// (double-quoted) are JSON.parse'd; files that use JS object literals
// (single-quoted keys/values, trailing content) are evaluated via Function.
//
// Pure local file reads — no network, no API keys, no side effects.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readRoot(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath.replace(/^\//, '')));
}

// ── Slug logic (must stay identical to locationSlug() in location.html and
//    the mirror in netlify/edge-functions/og-meta.js) ──────────────────────────
function slugify(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function locationSlug(loc, allLocs) {
  var base = slugify(loc.basicInfo.name);
  var nameDupes = allLocs.filter(function (l) { return slugify(l.basicInfo.name) === base; });
  if (nameDupes.length <= 1) return base;
  var hood = (loc.coffeeDetails && loc.coffeeDetails.neighborhood) || '';
  if (!hood) return base + '-' + loc.id;
  var hoodSlug = slugify(hood);
  var withHood = base + '-' + hoodSlug;
  var hoodDupes = nameDupes.filter(function (l) {
    return slugify((l.coffeeDetails && l.coffeeDetails.neighborhood) || '') === hoodSlug;
  });
  if (hoodDupes.length <= 1) return withHood;
  var fullAddr = (loc.basicInfo && loc.basicInfo.address && loc.basicInfo.address.fullAddress) || '';
  if (fullAddr) {
    var streetName = fullAddr.split(',')[0].replace(/^\d+\s+/, '').trim();
    var streetS = slugify(streetName);
    if (streetS) return withHood + '-' + streetS;
  }
  return withHood + '-' + loc.id;
}

// ── Loaders ────────────────────────────────────────────────────────────────────
function evalMatch(raw, re, label) {
  var m = raw.match(re);
  if (!m) throw new Error('Could not parse ' + label);
  return Function('"use strict"; return ' + m[1])();
}

function loadLocations() {
  var raw = readRoot('locations.js');
  var m = raw.match(/window\.COFFEE_LOCATIONS\s*=\s*(\[[\s\S]*?\]);\s*$/m);
  if (!m) throw new Error('Could not parse window.COFFEE_LOCATIONS from locations.js');
  return JSON.parse(m[1]);
}

function loadHighlights() {
  return evalMatch(readRoot('highlights.js'),
    /window\.highlights\s*=\s*(\[[\s\S]*\]);?\s*$/m, 'window.highlights from highlights.js');
}

function loadBlogPosts() {
  return evalMatch(readRoot('blog.js'),
    /window\.BLOG_POSTS\s*=\s*(\[[\s\S]*\]);?\s*$/m, 'window.BLOG_POSTS from blog.js');
}

function loadNeighborhoods() {
  return evalMatch(readRoot('neighborhoods.js'),
    /window\.NEIGHBORHOODS\s*=\s*(\[[\s\S]*?\]);\s*\n/m, 'window.NEIGHBORHOODS from neighborhoods.js');
}

function loadGuides() {
  return evalMatch(readRoot('guides.js'),
    /window\.GUIDES\s*=\s*(\[[\s\S]*?\]);\s*\n/m, 'window.GUIDES from guides.js');
}

function loadSdcgRatings() {
  return evalMatch(readRoot('sdcoffeeguide.js'),
    /window\.SDCG_RATINGS\s*=\s*(\{[\s\S]*\})\s*;?\s*$/m, 'window.SDCG_RATINGS from sdcoffeeguide.js');
}

function loadWikiData() {
  var raw = readRoot('wiki_data.js');
  var m = raw.match(/window\.WIKI_DATA\s*=\s*(\{[\s\S]*\})\s*;?\s*$/m);
  if (!m) throw new Error('Could not parse window.WIKI_DATA from wiki_data.js');
  return JSON.parse(m[1]);
}

function loadNewsItems() {
  var raw = readRoot('news.js');
  var m = raw.match(/window\.NEWS_ITEMS\s*=\s*(\[[\s\S]*\])\s*;?\s*$/m);
  if (!m) throw new Error('Could not parse window.NEWS_ITEMS from news.js');
  return JSON.parse(m[1]);
}

function loadLocationCount() {
  var raw = readRoot('location-count.js');
  var m = raw.match(/window\.LOCATION_COUNT\s*=\s*(\d+)/);
  if (!m) throw new Error('Could not parse window.LOCATION_COUNT from location-count.js');
  return Number(m[1]);
}

module.exports = {
  ROOT,
  readRoot,
  fileExists,
  slugify,
  locationSlug,
  loadLocations,
  loadHighlights,
  loadBlogPosts,
  loadNeighborhoods,
  loadGuides,
  loadSdcgRatings,
  loadWikiData,
  loadNewsItems,
  loadLocationCount,
};

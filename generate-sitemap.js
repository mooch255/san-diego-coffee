// generate-sitemap.js
// Generates sitemap.xml from locations.js and highlights.js.
//
// Usage:
//   node generate-sitemap.js
//
// Output: sitemap.xml in the project root

const fs   = require('fs');
const path = require('path');

const BASE_URL      = 'https://sandiegocoffee.co';
const OUTPUT_FILE   = path.join(__dirname, 'sitemap.xml');
const LOCATIONS_FILE = path.join(__dirname, 'locations.js');
const HIGHLIGHTS_FILE = path.join(__dirname, 'highlights.js');
const BLOG_FILE = path.join(__dirname, 'blog.js');

// ── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

function safeDate(str) {
  if (!str) return today();
  var d = new Date(str);
  return isNaN(d.getTime()) ? today() : d.toISOString().slice(0, 10);
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function locationSlug(loc, allLocs) {
  var base = slugify(loc.basicInfo.name);
  var dupes = allLocs.filter(function(l) { return slugify(l.basicInfo.name) === base; });
  if (dupes.length <= 1) return base;
  var hood = (loc.coffeeDetails && loc.coffeeDetails.neighborhood) || '';
  var withHood = hood ? base + '-' + slugify(hood) : base + '-' + loc.id;
  // If adding the neighborhood still collides, fall back to the unique loc ID
  var hoodDupes = allLocs.filter(function(l) {
    var b = slugify(l.basicInfo.name);
    var h = (l.coffeeDetails && l.coffeeDetails.neighborhood) || '';
    return (h ? b + '-' + slugify(h) : b + '-' + l.id) === withHood;
  });
  return hoodDupes.length <= 1 ? withHood : base + '-' + loc.id;
}

function loadLocations() {
  var raw = fs.readFileSync(LOCATIONS_FILE, 'utf8');
  var m = raw.match(/window\.COFFEE_LOCATIONS\s*=\s*(\[[\s\S]*?\]);\s*$/m);
  if (!m) throw new Error('Could not parse window.COFFEE_LOCATIONS from locations.js');
  return JSON.parse(m[1]);
}

function loadHighlights() {
  var raw = fs.readFileSync(HIGHLIGHTS_FILE, 'utf8');
  // highlights.js uses unquoted JS object keys — evaluate safely via Function
  var m = raw.match(/window\.highlights\s*=\s*(\[[\s\S]*\]);?\s*$/m);
  if (!m) throw new Error('Could not parse window.highlights from highlights.js');
  return Function('"use strict"; return ' + m[1])();
}

function loadBlogPosts() {
  var raw = fs.readFileSync(BLOG_FILE, 'utf8');
  var m = raw.match(/window\.BLOG_POSTS\s*=\s*(\[[\s\S]*\]);?\s*$/m);
  if (!m) throw new Error('Could not parse window.BLOG_POSTS from blog.js');
  return Function('"use strict"; return ' + m[1])();
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return [
    '  <url>',
    '    <loc>' + loc + '</loc>',
    '    <lastmod>' + lastmod + '</lastmod>',
    '    <changefreq>' + changefreq + '</changefreq>',
    '    <priority>' + priority + '</priority>',
    '  </url>',
  ].join('\n');
}

// ── Static pages ──────────────────────────────────────────────────────────────

var staticPages = [
  { path: '/',                        changefreq: 'weekly',  priority: '1.0' },
  { path: '/map.html',                changefreq: 'weekly',  priority: '0.9' },
  { path: '/roaster-highlights.html', changefreq: 'weekly',  priority: '0.8' },
  { path: '/blog.html',               changefreq: 'weekly',  priority: '0.7' },
  { path: '/about.html',              changefreq: 'monthly', priority: '0.5' },
  { path: '/submit.html',             changefreq: 'monthly', priority: '0.5' },
];

// ── Build ─────────────────────────────────────────────────────────────────────

console.log('\n🗺  Generating sitemap.xml\n');

var locations  = loadLocations();
var highlights = loadHighlights();
var blogPosts  = loadBlogPosts();

console.log('  ✓ Loaded ' + locations.length + ' locations');
console.log('  ✓ Loaded ' + highlights.length + ' highlights');
console.log('  ✓ Loaded ' + blogPosts.length + ' blog posts');

var entries = [];

// Static pages
staticPages.forEach(function(p) {
  entries.push(urlEntry(BASE_URL + p.path, today(), p.changefreq, p.priority));
});

// Location pages
locations.forEach(function(loc) {
  var lastmod = safeDate(loc.coffeeDetails && loc.coffeeDetails.lastUpdated);
  var url = BASE_URL + '/locations/' + locationSlug(loc, locations);
  entries.push(urlEntry(url, lastmod, 'monthly', '0.8'));
});

// Highlight pages
highlights.forEach(function(h) {
  var lastmod = safeDate(h.date);
  var url = BASE_URL + '/highlight.html?id=' + h.id;
  entries.push(urlEntry(url, lastmod, 'monthly', '0.8'));
});

// Blog posts
blogPosts.forEach(function(p) {
  var lastmod = safeDate(p.date);
  var url = BASE_URL + '/blog-post.html?id=' + p.id;
  entries.push(urlEntry(url, lastmod, 'monthly', '0.8'));
});

var xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  entries.join('\n'),
  '</urlset>',
].join('\n');

fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');

console.log('  ✓ ' + entries.length + ' URLs written to sitemap.xml');
console.log('    — ' + staticPages.length + ' static pages');
console.log('    — ' + locations.length + ' location pages');
console.log('    — ' + highlights.length + ' highlight pages');
console.log('    — ' + blogPosts.length + ' blog posts');
console.log('\n✅ Done. Remember to re-run this script whenever you add new locations, highlights, or blog posts.\n');

// generate-sitemap.js
// Generates sitemap.xml from locations.js and highlights.js.
//
// Usage:
//   node generate-sitemap.js
//
// Output: sitemap.xml in the project root

const fs   = require('fs');
const path = require('path');
const L    = require('./lib/data-loaders');

const BASE_URL      = 'https://sandiegocoffee.co';
const OUTPUT_FILE   = path.join(__dirname, 'sitemap.xml');

// Loaders + slug logic are shared with validate-data.js via ./lib/data-loaders
// so the parsing/slug rules never fork. Must stay identical to locationSlug()
// in location.html and the mirror in netlify/edge-functions/og-meta.js.
const locationSlug     = L.locationSlug;
const loadLocations    = L.loadLocations;
const loadHighlights   = L.loadHighlights;
const loadBlogPosts    = L.loadBlogPosts;
const loadNeighborhoods = L.loadNeighborhoods;
const loadGuides       = L.loadGuides;

// ── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

function safeDate(str) {
  if (!str) return today();
  var d = new Date(str);
  return isNaN(d.getTime()) ? today() : d.toISOString().slice(0, 10);
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
  { path: '/guides.html',             changefreq: 'weekly',  priority: '0.8' },
  { path: '/roaster-highlights.html', changefreq: 'weekly',  priority: '0.8' },
  { path: '/blog.html',               changefreq: 'weekly',  priority: '0.7' },
  { path: '/news.html',               changefreq: 'weekly',  priority: '0.7' },
  { path: '/about.html',              changefreq: 'monthly', priority: '0.5' },
  { path: '/submit.html',             changefreq: 'monthly', priority: '0.5' },
];

// ── Build ─────────────────────────────────────────────────────────────────────

console.log('\n🗺  Generating sitemap.xml\n');

var locations     = loadLocations();
var highlights    = loadHighlights();
var blogPosts     = loadBlogPosts();
var neighborhoods = loadNeighborhoods();
var guides        = loadGuides();

console.log('  ✓ Loaded ' + locations.length + ' locations');
console.log('  ✓ Loaded ' + highlights.length + ' highlights');
console.log('  ✓ Loaded ' + blogPosts.length + ' blog posts');
console.log('  ✓ Loaded ' + neighborhoods.length + ' neighborhood pages');
console.log('  ✓ Loaded ' + guides.length + ' guides');

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
  var url = BASE_URL + '/blog/' + p.id.replace(/^blog_/, '');
  entries.push(urlEntry(url, lastmod, 'monthly', '0.8'));
});

// Neighborhood pages
neighborhoods.forEach(function(n) {
  var url = BASE_URL + '/neighborhoods/' + n.id;
  entries.push(urlEntry(url, today(), 'weekly', '0.8'));
});

// Guide pages
guides.forEach(function(g) {
  var url = BASE_URL + '/guides/' + g.id;
  var lastmod = safeDate(g.updatedDate || g.publishedDate);
  entries.push(urlEntry(url, lastmod, 'monthly', '0.9'));
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
console.log('    — ' + neighborhoods.length + ' neighborhood pages');
console.log('    — ' + guides.length + ' guide pages');
console.log('    — ' + highlights.length + ' highlight pages');
console.log('    — ' + blogPosts.length + ' blog posts');
console.log('\n✅ Done. Remember to re-run this script whenever you add new locations, highlights, or blog posts.\n');

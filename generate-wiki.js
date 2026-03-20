#!/usr/bin/env node
// generate-wiki.js — Generates a Reddit wiki Markdown file for r/SanDiegoCoffeeBeans
// Usage: node generate-wiki.js
// Output: wiki-output.md (paste into Reddit wiki editor)
//         wiki-snapshot.json (diff source for next run)

const fs = require('fs');
const path = require('path');

// ─── Load locations.js via window shim ───────────────────────────────────────
global.window = {};
eval(fs.readFileSync(path.join(__dirname, 'locations.js'), 'utf8'));
const rawLocations = global.window.COFFEE_LOCATIONS || [];

// De-duplicate by ID (last occurrence wins — matches snapshot save behaviour)
const locMap = new Map();
for (const loc of rawLocations) locMap.set(loc.id, loc);
const locations = [...locMap.values()];

if (rawLocations.length !== locations.length) {
  console.warn(`⚠️  Duplicate IDs detected in locations.js: ${rawLocations.length} entries → ${locations.length} unique. Run sync-locations.js to fix.`);
}

// ─── Region map (matches map.html) ───────────────────────────────────────────
const REGION_MAP = {
  'North County Coastal':   ['Carlsbad', 'Cardiff-by-the-Sea', 'Encinitas', 'Oceanside', 'Solana Beach'],
  'North County Inland':    ['Escondido', 'Poway', 'San Marcos', 'Vista'],
  'North San Diego Inland': ['Carmel Mountain Ranch', 'Carmel Valley', 'Mira Mesa', 'Rancho Bernardo', 'Scripps Ranch', 'Sorrento Valley'],
  'Downtown & Uptown':      ['Bankers Hill', 'Downtown', 'Golden Hill', 'Hillcrest', 'Mission Hills', 'Normal Heights', 'North Park', 'San Diego', 'South Park', 'University Heights'],
  'Beach Communities':      ['Bay Park', 'Bird Rock', 'Coronado', 'La Jolla', 'Ocean Beach', 'Pacific Beach', 'Point Loma'],
  'Central & East SD':      ['Allied Gardens', 'Barrio Logan', 'City Heights', 'College Area', 'Del Cerro', 'El Cajon', 'La Mesa', 'Lemon Grove', 'Logan Heights', 'Mission Valley', 'Old Town', 'Santee'],
  'South Bay':              ['Chula Vista', 'Imperial Beach', 'National City', 'Otay Ranch'],
};

const ALL_MAPPED = new Set(Object.values(REGION_MAP).flat());

// City → region (handles locations in distinct SD-county cities not in REGION_MAP)
const CITY_REGION = {
  'Carlsbad': 'North County Coastal', 'Encinitas': 'North County Coastal',
  'Oceanside': 'North County Coastal', 'Solana Beach': 'North County Coastal',
  'Del Mar': 'North County Coastal', 'Cardiff-by-the-Sea': 'North County Coastal',
  'San Marcos': 'North County Inland', 'Vista': 'North County Inland',
  'Escondido': 'North County Inland', 'Poway': 'North County Inland',
  'Coronado': 'Beach Communities',
  'National City': 'South Bay', 'Chula Vista': 'South Bay', 'Imperial Beach': 'South Bay',
  'El Cajon': 'Central & East SD', 'La Mesa': 'Central & East SD',
  'Santee': 'Central & East SD', 'Lemon Grove': 'Central & East SD',
  'Spring Valley': 'Central & East SD',
};

// Coordinate bounding-box fallback — priority-ordered, first match wins
function getRegionByCoords(lat, lng) {
  if (lat < 32.683)                            return 'South Bay';
  if (lat > 32.95 && lng < -117.25)            return 'North County Coastal';
  if (lat > 32.95)                             return 'North County Inland';
  if (lat > 32.845 && lng > -117.23)           return 'North San Diego Inland';
  if (lng < -117.205)                          return 'Beach Communities';
  if (lng > -117.10)                           return 'Central & East SD';
  return 'Downtown & Uptown';
}

// 3-tier lookup: neighborhood string → city name → coordinates
function getRegion(neighborhood, city, coords) {
  if (neighborhood) {
    for (const [region, hoods] of Object.entries(REGION_MAP)) {
      if (hoods.includes(neighborhood)) return region;
    }
  }
  if (city && CITY_REGION[city]) return CITY_REGION[city];
  if (coords?.lat != null && coords?.lng != null) return getRegionByCoords(coords.lat, coords.lng);
  return 'Other San Diego';
}

// ─── Tracked fields for snapshot / diff ──────────────────────────────────────
const TRACKED_FIELDS = [
  'name', 'neighborhood', 'description', 'amenities',
  'roastScale', 'roastStyle', 'visitorExperience', 'roastersServed',
  'brewingOptions', 'yearEstablished',
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function locUrl(loc) {
  return `https://sandiegocoffee.co/locations/${slugify(loc.basicInfo?.name || loc.id)}`;
}

function snapshotOf(loc) {
  const cd = loc.coffeeDetails || {};
  return {
    name:              loc.basicInfo?.name || '',
    neighborhood:      cd.neighborhood || '',
    description:       cd.description || loc.legacyData?.originalDescription || '',
    amenities:         cd.amenities || [],
    roastScale:        cd.roastScale || '',
    roastStyle:        cd.roastStyle || '',
    visitorExperience: cd.visitorExperience || '',
    roastersServed:    cd.roastersServed || null,
    brewingOptions:    cd.brewingOptions || null,
    yearEstablished:   cd.yearEstablished || null,
  };
}

// ─── Load previous snapshot ───────────────────────────────────────────────────
const SNAPSHOT_PATH = path.join(__dirname, 'wiki-snapshot.json');
let prevSnapshot = null;
if (fs.existsSync(SNAPSHOT_PATH)) {
  try {
    prevSnapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
  } catch (e) {
    console.warn('Warning: could not parse wiki-snapshot.json, treating as first run.');
  }
}
const isFirstRun = !prevSnapshot;

// ─── Compute diff ─────────────────────────────────────────────────────────────
const newEntries = [];
const changedEntries = [];

if (!isFirstRun) {
  const prevLocs = prevSnapshot.locations || {};
  for (const loc of locations) {
    const id = loc.id;
    const curr = snapshotOf(loc);
    if (!prevLocs[id]) {
      newEntries.push(loc);
    } else {
      const prev = prevLocs[id];
      const changes = [];
      if (curr.name !== prev.name) changes.push('name updated');
      if (curr.neighborhood !== prev.neighborhood) changes.push('neighborhood updated');
      if (curr.description !== prev.description) changes.push('description updated');
      if (JSON.stringify(curr.amenities) !== JSON.stringify(prev.amenities)) changes.push('amenities updated');
      if (curr.roastScale !== prev.roastScale) changes.push('roast scale updated');
      if (curr.roastStyle !== prev.roastStyle) changes.push('roast style updated');
      if (curr.visitorExperience !== prev.visitorExperience) changes.push('visitor experience updated');
      if (JSON.stringify(curr.roastersServed) !== JSON.stringify(prev.roastersServed)) changes.push('roasters served updated');
      if (JSON.stringify(curr.brewingOptions) !== JSON.stringify(prev.brewingOptions)) changes.push('brewing options updated');
      if (curr.yearEstablished !== prev.yearEstablished) changes.push('year established updated');
      if (changes.length > 0) {
        changedEntries.push({ loc, changes });
      }
    }
  }
}

// ─── Brand name normalizer (mirrors about.html logic) ────────────────────────
function normalizeBrandName(name) {
  return name
    .replace(/\s*[-–—@]\s*.+$/, '')
    .replace(/\s*\(.*?\)\s*$/, '')
    .replace(/\s+roaster\s*$/i, '')
    .replace(/\s+(north|south|east|west|downtown|gaslamp|hillcrest|north park|south park|la jolla|mission hills|liberty station|little italy|ocean beach|pacific beach|point loma|kensington|normal heights|university heights|clairemont|mission valley|del mar|encinitas|carlsbad|solana beach|chula vista|el cajon|santee|lakeside|poway|rancho bernardo|san marcos|city heights|coronado|imperial beach|vista|escondido|oceanside|on park)\s*$/i, '')
    .trim().toLowerCase();
}

// ─── Stats ────────────────────────────────────────────────────────────────────
const physical = locations.filter(l => !l.basicInfo?.onlineOnly);
const onlineOnly = locations.filter(l => l.basicInfo?.onlineOnly);

// ─── Roaster Highlights (manually maintained — update when new highlights added) ─
const HIGHLIGHTS = [
  { name: 'Frequent Coffee',         url: 'https://sandiegocoffee.co/highlight.html?id=highlight_frequent-coffee' },
  { name: 'Visitor Coffee Roasters', url: 'https://sandiegocoffee.co/highlight.html?id=highlight_visitor-coffee-roasters' },
  { name: 'Excelsa Coffee',          url: 'https://sandiegocoffee.co/highlight.html?id=highlight_excelsa-coffee' },
  { name: 'Torque Coffee',           url: 'https://sandiegocoffee.co/highlight.html?id=highlight_torque-coffee' },
  { name: 'Big Step Coffee',         url: 'https://sandiegocoffee.co/highlight.html?id=highlight_big-step-coffee' },
];
const physicalRoasters = physical.filter(l => l.basicInfo?.type === 'roaster');
const physicalCafes = physical.filter(l => l.basicInfo?.type === 'cafe');

// Roaster count: all roasters (physical + online) deduplicated by normalized name — matches about.html
const allRoasters = locations.filter(l => l.basicInfo?.type === 'roaster');
const uniqueRoasterBrands = new Set(allRoasters.map(l => normalizeBrandName(l.basicInfo?.name || ''))).size;
const uniqueCafeBrands = new Set(physicalCafes.map(l => normalizeBrandName(l.basicInfo?.name || ''))).size;

const neighborhoods = new Set(
  physical.map(l => l.coffeeDetails?.neighborhood).filter(Boolean)
);
const neighborhoodCount = neighborhoods.size;

// ─── Helper: amenities line ───────────────────────────────────────────────────
const AMENITY_SHORT = {
  'Offers Food / Pastries':      'Food',
  'Good for Working (Wifi)':     'Wifi',
  'Dog Friendly':                'Dog Friendly',
  'Sells Beans Online':          'Sells Beans Online',
  'Outdoor Seating':             'Outdoor Seating',
  'Drive-Through Available':     'Drive-Through',
  'Decaf Espresso Available':                        'Decaf Espresso',
  'Espresso Options (Choice between different beans)': 'Espresso Options',
  'Subscription Available':      'Subscription',
  'Wholesale Available':         'Wholesale',
};

function fmtAmenities(amenities) {
  if (!amenities || amenities.length === 0) return '';
  return amenities.map(a => AMENITY_SHORT[a] || a).join(' · ');
}

// ─── Render a physical roaster entry ─────────────────────────────────────────
function renderRoaster(loc) {
  const cd = loc.coffeeDetails || {};
  const name = loc.basicInfo?.name || '(Unknown)';
  const url = locUrl(loc);
  const neighborhood = cd.neighborhood || '';
  const year = cd.yearEstablished ? `Est. ${cd.yearEstablished}` : '';
  const roastScale = cd.roastScale || '';
  const visExp = cd.visitorExperience ? cd.visitorExperience.split(' (')[0] : '';

  const line1parts = [`**[${name}](${url})**`];
  if (neighborhood) line1parts.push(neighborhood);
  if (year) line1parts.push(year);
  if (roastScale) line1parts.push(roastScale);
  if (visExp) line1parts.push(visExp);
  const line1 = line1parts.join(' · ');

  const description = cd.description || loc.legacyData?.originalDescription || '';
  const line2 = description ? `*"${description}"*` : '';

  const amenities = fmtAmenities(cd.amenities);
  const line3 = amenities ? `Amenities: ${amenities}` : '';

  return [line1, line2, line3].filter(Boolean).join('  \n');
}

// ─── Render a cafe entry ──────────────────────────────────────────────────────
function renderCafe(loc) {
  const cd = loc.coffeeDetails || {};
  const name = loc.basicInfo?.name || '(Unknown)';
  const url = locUrl(loc);
  const neighborhood = cd.neighborhood || '';
  const year = cd.yearEstablished ? `Est. ${cd.yearEstablished}` : '';
  const specialtyBarista = cd.specialtyBarista === 'Yes' ? 'Specialty Barista: Yes' : '';

  const line1parts = [`**[${name}](${url})**`];
  if (neighborhood) line1parts.push(neighborhood);
  if (year) line1parts.push(year);
  if (specialtyBarista) line1parts.push(specialtyBarista);
  const line1 = line1parts.join(' · ');

  const description = cd.description || loc.legacyData?.originalDescription || '';
  const line2 = description ? `*"${description}"*` : '';

  const roasters = Array.isArray(cd.roastersServed) && cd.roastersServed.length
    ? `Roasters: ${cd.roastersServed.join(' · ')}`
    : '';
  const brewing = Array.isArray(cd.brewingOptions) && cd.brewingOptions.length
    ? `Brewing: ${cd.brewingOptions.join(', ')}`
    : '';
  const line3 = [roasters, brewing].filter(Boolean).join(' | ');

  const amenities = fmtAmenities(cd.amenities);
  const line4 = amenities ? `Amenities: ${amenities}` : '';

  return [line1, line2, line3, line4].filter(Boolean).join('  \n');
}

// ─── Slug for anchor links (Reddit wiki format: wiki_ prefix + underscores) ───
function slugify(text) {
  return 'wiki_' + text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/-/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

// Heading text for output — replaces & with "and" so Reddit's anchor matches slugify
function headingText(text) {
  return text.replace(/&/g, 'and');
}

// ─── Build ordered region data (roasters + cafes per region) ─────────────────
function getRegionData() {
  const REGION_ORDER = [...Object.keys(REGION_MAP), 'Other San Diego'];
  const regions = {};
  for (const r of REGION_ORDER) regions[r] = { name: r, roasters: [], cafes: [] };

  for (const loc of physicalRoasters) {
    const r = getRegion(loc.coffeeDetails?.neighborhood, loc.basicInfo?.address?.city, loc.basicInfo?.address?.coordinates);
    if (!regions[r]) regions[r] = { name: r, roasters: [], cafes: [] };
    regions[r].roasters.push(loc);
  }
  for (const loc of physicalCafes) {
    const r = getRegion(loc.coffeeDetails?.neighborhood, loc.basicInfo?.address?.city, loc.basicInfo?.address?.coordinates);
    if (!regions[r]) regions[r] = { name: r, roasters: [], cafes: [] };
    regions[r].cafes.push(loc);
  }
  const sort = arr => arr.sort((a, b) => (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || ''));
  return REGION_ORDER
    .map(r => regions[r])
    .filter(r => r.roasters.length > 0 || r.cafes.length > 0)
    .map(r => ({ ...r, roasters: sort(r.roasters), cafes: sort(r.cafes) }));
}

// ─── Build "What's New" section ───────────────────────────────────────────────
function buildWhatsNew() {
  if (isFirstRun) {
    return `## 🆕 What's New Since Last Update\n\n*This is the first generated snapshot — diff will appear on next run.*\n`;
  }

  const lines = [`## 🆕 What's New Since Last Update\n`];

  if (newEntries.length === 0 && changedEntries.length === 0) {
    lines.push('*No changes since last update.*\n');
    return lines.join('\n');
  }

  if (newEntries.length > 0) {
    lines.push(`**Added (${newEntries.length} new):**`);
    for (const loc of newEntries.sort((a, b) => (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || ''))) {
      const type = loc.basicInfo?.type === 'cafe' ? 'Cafe' : (loc.basicInfo?.onlineOnly ? 'Online Roaster' : 'Roaster');
      const nbhd = loc.coffeeDetails?.neighborhood;
      lines.push(`- **${loc.basicInfo?.name}**${nbhd ? ` (${nbhd})` : ''} — ${type}`);
    }
    lines.push('');
  }

  if (changedEntries.length > 0) {
    lines.push(`**Updated (${changedEntries.length} locations):**`);
    for (const { loc, changes } of changedEntries.sort((a, b) => (a.loc.basicInfo?.name || '').localeCompare(b.loc.basicInfo?.name || ''))) {
      lines.push(`- **${loc.basicInfo?.name}** — ${changes.join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Build Roaster Highlights section ────────────────────────────────────────
function buildHighlightsSection() {
  const links = HIGHLIGHTS.map(h => `[${h.name}](${h.url})`).join(' · ');
  return [
    `## 🎙️ Roaster Deep Dives`,
    '',
    `We've interviewed founders and roasters across San Diego — get the full story behind the coffee:`,
    '',
    links,
  ].join('\n');
}

function buildHighlightsSectionHtml() {
  const links = HIGHLIGHTS.map(h => `<a href="${esc(h.url)}">${esc(h.name)}</a>`).join(' · ');
  return [
    `<h2>🎙️ Roaster Deep Dives</h2>`,
    `<p>We've interviewed founders and roasters across San Diego — get the full story behind the coffee:</p>`,
    `<p>${links}</p>`,
  ].join('\n');
}

// ─── Quick Find helpers ───────────────────────────────────────────────────────
function getAmenityLocations(amenityKey) {
  const seen = new Set();
  const result = [];
  for (const loc of [...physical].sort((a, b) => (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || ''))) {
    const amenities = loc.coffeeDetails?.amenities || [];
    if (!amenities.includes(amenityKey)) continue;
    const brand = normalizeBrandName(loc.basicInfo?.name || '');
    if (seen.has(brand)) continue;
    seen.add(brand);
    result.push(loc);
  }
  return result;
}

function buildQuickFind() {
  function row(emoji, label, locs, overrideCell) {
    if (overrideCell) return `| ${emoji} ${label} | ${overrideCell} |`;
    const cell = locs.map(l => `[${l.basicInfo?.name}](https://sandiegocoffee.co/locations/${slugify(l.basicInfo?.name || l.id)})`).join(', ');
    return `| ${emoji} ${label} | ${cell || '—'} |`;
  }
  const lines = [
    `## 🔍 Quick Find`,
    '',
    '| Looking for... | Where to go |',
    '|---|---|',
    row('🐕', 'Dog Friendly',          getAmenityLocations('Dog Friendly')),
    row('🍩', 'Food & Pastries',        getAmenityLocations('Offers Food / Pastries')),
    row('📶', 'Wifi / Work-Friendly',   getAmenityLocations('Good for Working (Wifi)')),
  ];
  return lines.join('\n');
}

function buildQuickFindHtml() {
  function row(emoji, label, locs, overrideCell) {
    const cell = overrideCell
      ? overrideCell
      : locs.map(l => `<a href="https://sandiegocoffee.co/locations/${slugify(l.basicInfo?.name || l.id)}">${esc(l.basicInfo?.name)}</a>`).join(', ') || '—';
    return `<tr><td>${emoji} ${esc(label)}</td><td>${cell}</td></tr>`;
  }
  const beansAnchor = slugify('🛍️ Beans for Sale');
  return [
    `<h2>🔍 Quick Find</h2>`,
    `<table><thead><tr><th>Looking for...</th><th>Where to go</th></tr></thead><tbody>`,
    row('🐕', 'Dog Friendly',        getAmenityLocations('Dog Friendly')),
    row('🍩', 'Food & Pastries',     getAmenityLocations('Offers Food / Pastries')),
    row('📶', 'Wifi / Work-Friendly',getAmenityLocations('Good for Working (Wifi)')),
    `</tbody></table>`,
  ].join('\n');
}

// ─── Build Beans for Sale section (online-only + physical-ships) ─────────────
function buildBeansForSaleSection() {
  const lines = [];

  // Subsection 1: Online-Only Roasters
  lines.push('### Online-Only Roasters');
  lines.push('');
  const sortedOnline = [...onlineOnly].sort((a, b) =>
    (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || '')
  );
  lines.push('| Name | Roast Style | Website |');
  lines.push('|------|------------|---------|');
  for (const loc of sortedOnline) {
    const cd = loc.coffeeDetails || {};
    const name = loc.basicInfo?.name || '';
    const url = `https://sandiegocoffee.co/locations/${slugify(loc.basicInfo?.name || loc.id)}`;
    const roastStyle = cd.roastStyle || '—';
    const website = loc.basicInfo?.contact?.website || cd.onlineWebsite || '';
    const websiteDisplay = website
      ? `[${website.replace(/^https?:\/\//, '').replace(/\/$/, '')}](${website})`
      : '—';
    lines.push(`| [${name}](${url}) | ${roastStyle} | ${websiteDisplay} |`);
  }

  lines.push('');

  // Subsection 2: Physical roasters/cafes that also ship beans
  const seen = new Set();
  const physicalBeans = [...physical]
    .filter(l => (l.coffeeDetails?.amenities || []).includes('Sells Beans Online'))
    .sort((a, b) => (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || ''))
    .filter(l => {
      const brand = normalizeBrandName(l.basicInfo?.name || '');
      if (seen.has(brand)) return false;
      seen.add(brand);
      return true;
    });

  lines.push('### Roasters with Cafes — Also Ships Beans');
  lines.push('');
  if (physicalBeans.length > 0) {
    const REGION_ORDER = [...Object.keys(REGION_MAP), 'Other San Diego'];
    const byRegion = {};
    for (const loc of physicalBeans) {
      const r = getRegion(loc.coffeeDetails?.neighborhood, loc.basicInfo?.address?.city, loc.basicInfo?.address?.coordinates);
      if (!byRegion[r]) byRegion[r] = [];
      byRegion[r].push(loc);
    }
    for (const region of REGION_ORDER) {
      const locs = byRegion[region];
      if (!locs || locs.length === 0) continue;
      const links = locs.map(l => `[${l.basicInfo?.name}](https://sandiegocoffee.co/locations/${slugify(l.basicInfo?.name || l.id)})`).join(' · ');
      lines.push(`**${headingText(region)}:** ${links}`);
      lines.push('');
    }
  } else {
    lines.push('*No physical locations with online bean sales found.*');
  }

  return lines.join('\n');
}

// ─── HTML helpers ────────────────────────────────────────────────────────────
function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderRoasterHtml(loc) {
  const cd = loc.coffeeDetails || {};
  const name = loc.basicInfo?.name || '(Unknown)';
  const url = `https://sandiegocoffee.co/locations/${slugify(loc.basicInfo?.name || loc.id)}`;
  const metaParts = [];
  if (cd.neighborhood) metaParts.push(esc(cd.neighborhood));
  if (cd.yearEstablished) metaParts.push(`Est. ${cd.yearEstablished}`);
  if (cd.roastScale) metaParts.push(esc(cd.roastScale));
  if (cd.visitorExperience) metaParts.push(esc(cd.visitorExperience.split(' (')[0]));
  const description = cd.description || loc.legacyData?.originalDescription || '';
  const amenities = fmtAmenities(cd.amenities);

  const lines = [];
  lines.push(`<p><strong><a href="${url}">${esc(name)}</a></strong><br><em>${metaParts.join(' · ')}</em></p>`);
  if (description) lines.push(`<blockquote><p>${esc(description)}</p></blockquote>`);
  if (amenities) lines.push(`<p><strong>Amenities:</strong> ${esc(amenities)}</p>`);
  lines.push('<p>&nbsp;</p>');
  return lines.join('\n');
}

function renderCafeHtml(loc) {
  const cd = loc.coffeeDetails || {};
  const name = loc.basicInfo?.name || '(Unknown)';
  const url = `https://sandiegocoffee.co/locations/${slugify(loc.basicInfo?.name || loc.id)}`;
  const metaParts = [];
  if (cd.neighborhood) metaParts.push(esc(cd.neighborhood));
  if (cd.yearEstablished) metaParts.push(`Est. ${cd.yearEstablished}`);
  if (cd.specialtyBarista === 'Yes') metaParts.push('Specialty Barista');
  const description = cd.description || loc.legacyData?.originalDescription || '';
  const roasters = Array.isArray(cd.roastersServed) && cd.roastersServed.length
    ? cd.roastersServed.filter(r => r !== 'Unknown').join(' · ') : '';
  const brewing = Array.isArray(cd.brewingOptions) && cd.brewingOptions.length
    ? cd.brewingOptions.join(', ') : '';
  const amenities = fmtAmenities(cd.amenities);

  const lines = [];
  lines.push(`<p><strong><a href="${url}">${esc(name)}</a></strong><br><em>${metaParts.join(' · ')}</em></p>`);
  if (description) lines.push(`<blockquote><p>${esc(description)}</p></blockquote>`);
  if (roasters) lines.push(`<p><strong>Roasters served:</strong> ${esc(roasters)}</p>`);
  if (brewing) lines.push(`<p><strong>Brewing methods:</strong> ${esc(brewing)}</p>`);
  if (amenities) lines.push(`<p><strong>Amenities:</strong> ${esc(amenities)}</p>`);
  lines.push('<p>&nbsp;</p>');
  return lines.join('\n');
}


function buildWhatsNewHtml() {
  const lines = ['<h2>🆕 What\'s New Since Last Update</h2>'];
  if (isFirstRun) {
    lines.push('<p><em>This is the first generated snapshot — diff will appear on next run.</em></p>');
    return lines.join('\n');
  }
  if (newEntries.length === 0 && changedEntries.length === 0) {
    lines.push('<p><em>No changes since last update.</em></p>');
    return lines.join('\n');
  }
  if (newEntries.length > 0) {
    lines.push(`<p><strong>Added (${newEntries.length} new):</strong></p><ul>`);
    for (const loc of newEntries.sort((a, b) => (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || ''))) {
      const type = loc.basicInfo?.type === 'cafe' ? 'Cafe' : (loc.basicInfo?.onlineOnly ? 'Online Roaster' : 'Roaster');
      const nbhd = loc.coffeeDetails?.neighborhood;
      lines.push(`<li><strong>${esc(loc.basicInfo?.name)}</strong>${nbhd ? ` (${esc(nbhd)})` : ''} — ${type}</li>`);
    }
    lines.push('</ul>');
  }
  if (changedEntries.length > 0) {
    lines.push(`<p><strong>Updated (${changedEntries.length} locations):</strong></p><ul>`);
    for (const { loc, changes } of changedEntries.sort((a, b) => (a.loc.basicInfo?.name || '').localeCompare(b.loc.basicInfo?.name || ''))) {
      lines.push(`<li><strong>${esc(loc.basicInfo?.name)}</strong> — ${esc(changes.join(', '))}</li>`);
    }
    lines.push('</ul>');
  }
  return lines.join('\n');
}

function buildBeansForSaleHtml() {
  const lines = [];

  // Subsection 1: Online-Only Roasters
  lines.push('<h3>Online-Only Roasters</h3>');
  lines.push('<table><thead><tr><th>Name</th><th>Roast Style</th><th>Website</th></tr></thead><tbody>');
  const sortedOnline = [...onlineOnly].sort((a, b) =>
    (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || '')
  );
  for (const loc of sortedOnline) {
    const cd = loc.coffeeDetails || {};
    const name = loc.basicInfo?.name || '';
    const url = `https://sandiegocoffee.co/locations/${slugify(loc.basicInfo?.name || loc.id)}`;
    const roastStyle = cd.roastStyle || '—';
    const website = loc.basicInfo?.contact?.website || cd.onlineWebsite || '';
    const websiteCell = website
      ? `<a href="${esc(website)}">${esc(website.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>`
      : '—';
    lines.push(`<tr><td><a href="${url}">${esc(name)}</a></td><td>${esc(roastStyle)}</td><td>${websiteCell}</td></tr>`);
  }
  lines.push('</tbody></table>');

  // Subsection 2: Physical-ships
  const seen = new Set();
  const physicalBeans = [...physical]
    .filter(l => (l.coffeeDetails?.amenities || []).includes('Sells Beans Online'))
    .sort((a, b) => (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || ''))
    .filter(l => {
      const brand = normalizeBrandName(l.basicInfo?.name || '');
      if (seen.has(brand)) return false;
      seen.add(brand);
      return true;
    });

  lines.push('<h3>Roasters with Cafes — Also Ships Beans</h3>');
  if (physicalBeans.length > 0) {
    const REGION_ORDER = [...Object.keys(REGION_MAP), 'Other San Diego'];
    const byRegion = {};
    for (const loc of physicalBeans) {
      const r = getRegion(loc.coffeeDetails?.neighborhood, loc.basicInfo?.address?.city, loc.basicInfo?.address?.coordinates);
      if (!byRegion[r]) byRegion[r] = [];
      byRegion[r].push(loc);
    }
    for (const region of REGION_ORDER) {
      const locs = byRegion[region];
      if (!locs || locs.length === 0) continue;
      const links = locs.map(l => `<a href="https://sandiegocoffee.co/locations/${slugify(l.basicInfo?.name || l.id)}">${esc(l.basicInfo?.name)}</a>`).join(' · ');
      lines.push(`<p><strong>${esc(headingText(region))}:</strong> ${links}</p>`);
    }
  } else {
    lines.push('<p><em>No physical locations with online bean sales found.</em></p>');
  }

  return lines.join('\n');
}

function buildHtml() {
  const h = [];
  h.push(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>San Diego Specialty Coffee — Reddit Wiki</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; color: #1c1c1c; line-height: 1.65; background: #faf8f5; }
  .copy-banner { background: #fff8e1; border: 1px solid #f9a825; border-radius: 8px; padding: 0.9rem 1.1rem; margin-bottom: 2rem; font-size: 0.9rem; }
  .copy-banner strong { display: block; font-size: 1rem; margin-bottom: 0.3rem; }
  h1 { font-size: 1.75rem; margin: 0 0 0.25rem; }
  h2 { font-size: 1.2rem; font-weight: 700; margin: 2.5rem 0 0.75rem; padding-bottom: 0.4rem; border-bottom: 2px solid #e0d8d0; }
  h3 { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin: 1.75rem 0 0.5rem; }
  p { margin: 0 0 0.5rem; }
  a { color: #b84c27; }
  blockquote { border-left: 3px solid #c0392b; margin: 0.4rem 0 0.6rem; padding: 0.4rem 0.85rem; color: #444; background: #fff; border-radius: 0 4px 4px 0; }
  blockquote p { margin: 0; font-style: italic; }
  ul { margin: 0.25rem 0 0.75rem 1.25rem; padding: 0; }
  li { margin-bottom: 0.2rem; }
  table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
  th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.88rem; }
  th { background: #f0ebe4; font-weight: 600; }
  hr { border: none; border-top: 1px solid #ddd; margin: 2rem 0; }
  .subtitle { color: #666; font-size: 0.9rem; margin-bottom: 0; }
  .stats-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 0.75rem 0 1rem; list-style: none; padding: 0; }
  .stats-grid li { background: #fff; border: 1px solid #e0d8d0; border-radius: 8px; padding: 0.6rem 1rem; min-width: 100px; }
  .stats-grid li strong { display: block; font-size: 1.6rem; line-height: 1.1; color: #b84c27; }
  .stats-grid li span { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: #666; }
</style>
</head>
<body>`);

  h.push(`<h1>☕ San Diego Specialty Coffee Directory</h1>`);
  h.push(`<p class="subtitle"><em>Last updated: ${monthLabel} · <a href="https://sandiegocoffee.co">sandiegocoffee.co</a> · <a href="https://reddit.com/r/SanDiegoCoffeeBeans">r/SanDiegoCoffeeBeans</a></em></p>`);

  h.push(buildWhatsNewHtml());

  h.push(buildHighlightsSectionHtml());

  h.push(`<h2>📊 By the Numbers</h2>
<table>
<thead><tr>
  <th>Total Locations</th>
  <th>Roasters</th>
  <th>Multi-Roaster Cafes</th>
  <th>Online-Only</th>
  <th>Neighborhoods</th>
</tr></thead>
<tbody><tr>
  <td>${locations.length}</td>
  <td>${uniqueRoasterBrands}</td>
  <td>${uniqueCafeBrands}</td>
  <td>${onlineOnly.length}</td>
  <td>${neighborhoodCount}</td>
</tr></tbody>
</table>`);

  h.push(`<h2>📖 How to Read This Directory</h2>
<p>Each entry links to its full profile on sandiegocoffee.co — photos, hours, contact info, and Google Maps.</p>
<p><strong>Roast Scale</strong></p>
<ul>
  <li><strong>Micro-Batch</strong> — very small-batch roasting, often single-origin focused</li>
  <li><strong>Production</strong> — larger commercial roasting operation</li>
</ul>
<p><strong>Visitor Experience</strong></p>
<ul>
  <li><strong>Full Cafe</strong> — open daily with seating</li>
  <li><strong>Tasting Room</strong> — limited hours, manufacturing facility</li>
  <li><strong>Production Only</strong> — no public access</li>
  <li><strong>Public Cuppings / Events Only</strong> — open for scheduled events only</li>
</ul>
<p><strong>Coffee Details</strong></p>
<ul>
  <li><strong>Decaf Espresso</strong> — serves a decaf espresso option</li>
  <li><strong>Espresso Options</strong> — offers a choice between different espresso beans</li>
</ul>`);

  h.push(buildQuickFindHtml());

  // Beans for Sale
  const beansSlug = slugify('🛍️ Beans for Sale');
  const hasBeansSection = onlineOnly.length > 0 || physical.some(l => (l.coffeeDetails?.amenities || []).includes('Sells Beans Online'));
  if (hasBeansSection) {
    h.push(`<hr><h2 id="${beansSlug}">🛍️ Beans for Sale</h2>`);
    h.push(`<p>Whether you're looking for online-only roasters or a local roaster that ships direct — this is your starting point.</p>`);
    h.push(buildBeansForSaleHtml());
  }

  // Browse by Area TOC
  const rd = getRegionData();
  h.push(`<hr><h2>📍 Browse by Area</h2>`);
  h.push(`<p>${rd.map(r => `<a href="#${slugify(r.name)}">${esc(r.name)}</a>`).join(' · ')}</p>`);

  // Region sections
  for (const region of rd) {
    const hasBoth = region.roasters.length > 0 && region.cafes.length > 0;
    h.push(`<hr><h2 id="${slugify(region.name)}">${esc(headingText(region.name))}</h2>`);
    if (hasBoth) h.push(`<p><strong>Roasters</strong></p>`);
    for (const loc of region.roasters) h.push(renderRoasterHtml(loc));
    if (hasBoth) h.push(`<p><strong>Multi-Roaster Cafes</strong></p>`);
    for (const loc of region.cafes) h.push(renderCafeHtml(loc));
  }

  h.push(`<hr><h2>➕ Add a Spot</h2>
<p>Know a roaster or cafe we're missing? <a href="https://sandiegocoffee.co/submit.html">Submit it here</a> — community submissions are reviewed and added regularly.</p>
<p><em>This directory is maintained by the <a href="https://reddit.com/r/SanDiegoCoffeeBeans">r/SanDiegoCoffeeBeans</a> community and powered by <a href="https://sandiegocoffee.co">sandiegocoffee.co</a>.</em></p>`);

  h.push(`</body></html>`);
  return h.join('\n');
}

// ─── Now generate current month label ─────────────────────────────────────────
const now = new Date();
const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// ─── Assemble wiki output ─────────────────────────────────────────────────────
const wikiLines = [];

wikiLines.push(`# ☕ San Diego Specialty Coffee Directory`);
wikiLines.push('');
wikiLines.push(`*Last updated: ${monthLabel} · [sandiegocoffee.co](https://sandiegocoffee.co) · [r/SanDiegoCoffeeBeans](https://reddit.com/r/SanDiegoCoffeeBeans)*`);
wikiLines.push('');
wikiLines.push('---');
wikiLines.push('');

// What's New
wikiLines.push(buildWhatsNew());
wikiLines.push('---');
wikiLines.push('');

// Roaster Deep Dives
wikiLines.push(buildHighlightsSection());
wikiLines.push('');
wikiLines.push('---');
wikiLines.push('');

// Stats
wikiLines.push('## 📊 By the Numbers');
wikiLines.push('');
wikiLines.push(`- **${locations.length}** total locations · **${uniqueRoasterBrands}** roasters (incl. **${onlineOnly.length}** online-only) · **${uniqueCafeBrands}** multi-roaster cafes`);
wikiLines.push(`- **${neighborhoodCount}** neighborhoods covered`);
wikiLines.push('');
wikiLines.push('---');
wikiLines.push('');

// How to Read
wikiLines.push('## 📖 How to Read This Directory');
wikiLines.push('');
wikiLines.push('Each entry links to its full profile on [sandiegocoffee.co](https://sandiegocoffee.co), which includes photos, hours, contact info, and a direct Google Maps link.');
wikiLines.push('');
wikiLines.push('**Roast Scale**');
wikiLines.push('- **Micro-Batch** — very small-batch roasting, often single-origin focused');
wikiLines.push('- **Production** — larger commercial roasting operation');
wikiLines.push('');
wikiLines.push('**Visitor Experience**');
wikiLines.push('- **Full Cafe** — open daily with seating');
wikiLines.push('- **Tasting Room** — limited hours, manufacturing facility');
wikiLines.push('- **Production Only** — no public access');
wikiLines.push('- **Public Cuppings / Events Only** — open for scheduled events only');
wikiLines.push('');
wikiLines.push('**Coffee Details**');
wikiLines.push('- **Decaf Espresso** — serves a decaf espresso option');
wikiLines.push('- **Espresso Options** — offers a choice between different espresso beans');
wikiLines.push('');
wikiLines.push('---');
wikiLines.push('');

// Quick Find
wikiLines.push(buildQuickFind());
wikiLines.push('');
wikiLines.push('---');
wikiLines.push('');

// Beans for Sale
if (onlineOnly.length > 0 || physical.some(l => (l.coffeeDetails?.amenities || []).includes('Sells Beans Online'))) {
  wikiLines.push('## Beans for Sale');
  wikiLines.push('');
  wikiLines.push('Whether you\'re looking for online-only roasters or a local roaster that ships direct — this is your starting point.');
  wikiLines.push('');
  wikiLines.push(buildBeansForSaleSection());
  wikiLines.push('');
  wikiLines.push('---');
  wikiLines.push('');
}

// Browse by Area — TOC
const regionData = getRegionData();
wikiLines.push('## 📍 Browse by Area');
wikiLines.push('');
const tocParts = regionData.map(r => `[${r.name}](#${slugify(r.name)})`);
wikiLines.push(tocParts.join(' · '));
wikiLines.push('');
wikiLines.push('---');
wikiLines.push('');

// Region sections
for (const region of regionData) {
  wikiLines.push(`## ${headingText(region.name)}`);
  wikiLines.push('');
  const hasBoth = region.roasters.length > 0 && region.cafes.length > 0;
  if (hasBoth) wikiLines.push('**Roasters**\n');
  for (const loc of region.roasters) { wikiLines.push(renderRoaster(loc)); wikiLines.push(''); }
  if (hasBoth) { wikiLines.push('**Multi-Roaster Cafes**\n'); }
  for (const loc of region.cafes) { wikiLines.push(renderCafe(loc)); wikiLines.push(''); }
  wikiLines.push('---');
  wikiLines.push('');
}

// Footer CTA
wikiLines.push('## Add a Spot');
wikiLines.push('');
wikiLines.push('Know a roaster or cafe we\'re missing? [Submit it here](https://sandiegocoffee.co/submit.html) — community submissions are reviewed and added regularly.');
wikiLines.push('');
wikiLines.push('*This directory is maintained by the [r/SanDiegoCoffeeBeans](https://reddit.com/r/SanDiegoCoffeeBeans) community and powered by [sandiegocoffee.co](https://sandiegocoffee.co).*');

const wikiOutput = wikiLines.join('\n');
fs.writeFileSync(path.join(__dirname, 'wiki-output.md'), wikiOutput, 'utf8');
console.log(`✅ wiki-output.md written (${wikiOutput.length.toLocaleString()} chars)`);

// ─── Write HTML output ────────────────────────────────────────────────────────
const htmlOutput = buildHtml();
const HTML_PATH = path.join(__dirname, 'wiki-output.html');
fs.writeFileSync(HTML_PATH, htmlOutput, 'utf8');
console.log(`✅ wiki-output.html written — open in browser, Ctrl+A, Ctrl+C, paste into Reddit`);

// ─── Save snapshot ─────────────────────────────────────────────────────────────
const newSnapshot = {
  generatedAt: now.toISOString(),
  locations: {},
};
for (const loc of locations) {
  newSnapshot.locations[loc.id] = snapshotOf(loc);
}
fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(newSnapshot, null, 2), 'utf8');
console.log(`✅ wiki-snapshot.json saved (${locations.length} locations)`);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('');
console.log(`📊 Stats: ${locations.length} total locations · ${uniqueRoasterBrands} roasters · ${uniqueCafeBrands} cafes · ${onlineOnly.length} online-only · ${neighborhoodCount} neighborhoods`);
if (!isFirstRun) {
  console.log(`🆕 Changes: ${newEntries.length} new locations · ${changedEntries.length} updated`);
} else {
  console.log('ℹ️  First run — snapshot saved. Run again to see diffs.');
}

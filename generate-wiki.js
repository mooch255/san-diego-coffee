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
  'South Bay':              ['Chula Vista', 'Imperial Beach', 'National City'],
};

const ALL_MAPPED = new Set(Object.values(REGION_MAP).flat());

function getRegion(neighborhood) {
  if (!neighborhood) return 'Other San Diego';
  for (const [region, hoods] of Object.entries(REGION_MAP)) {
    if (hoods.includes(neighborhood)) return region;
  }
  return 'Other San Diego';
}

// ─── Tracked fields for snapshot / diff ──────────────────────────────────────
const TRACKED_FIELDS = [
  'name', 'neighborhood', 'description', 'amenities',
  'roastScale', 'roastStyle', 'visitorExperience', 'roastersServed',
  'brewingOptions', 'yearEstablished',
];

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
  'Decaf Espresso Available':    'Decaf Espresso',
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
  const id = loc.id;
  const url = `https://sandiegocoffee.co/location.html?id=${id}`;
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
  const id = loc.id;
  const url = `https://sandiegocoffee.co/location.html?id=${id}`;
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

// ─── Build section for a group of locations ───────────────────────────────────
function buildRegionSection(locs, renderFn) {
  // Group by region
  const byRegion = {};
  for (const loc of locs) {
    const region = getRegion(loc.coffeeDetails?.neighborhood);
    if (!byRegion[region]) byRegion[region] = [];
    byRegion[region].push(loc);
  }

  // Sort regions in canonical order, overflow at end
  const regionOrder = [
    ...Object.keys(REGION_MAP),
    'Other San Diego',
  ];

  const lines = [];
  for (const region of regionOrder) {
    if (!byRegion[region]) continue;
    const sorted = byRegion[region].sort((a, b) =>
      (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || '')
    );
    lines.push(`### ${region}`);
    lines.push('');
    for (const loc of sorted) {
      lines.push(renderFn(loc));
      lines.push('');
    }
  }
  return lines.join('\n');
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

// ─── Build online-only table ──────────────────────────────────────────────────
function buildOnlineTable() {
  const sorted = onlineOnly.sort((a, b) =>
    (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || '')
  );

  const lines = [];
  lines.push('| Name | Roast Style | Website |');
  lines.push('|------|------------|---------|');

  for (const loc of sorted) {
    const cd = loc.coffeeDetails || {};
    const name = loc.basicInfo?.name || '';
    const id = loc.id;
    const url = `https://sandiegocoffee.co/location.html?id=${id}`;
    const roastStyle = cd.roastStyle || '—';
    const website = loc.basicInfo?.contact?.website || cd.onlineWebsite || '';
    const websiteDisplay = website
      ? `[${website.replace(/^https?:\/\//, '').replace(/\/$/, '')}](${website})`
      : '—';

    lines.push(`| [${name}](${url}) | ${roastStyle} | ${websiteDisplay} |`);
  }

  return lines.join('\n');
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
wikiLines.push('Each entry links to its full profile on sandiegocoffee.co, which includes photos, hours, contact info, and a direct Google Maps link.');
wikiLines.push('');
wikiLines.push('**Roast Scale** describes production volume:');
wikiLines.push('- **Micro-Batch** — very small-batch roasting, often single-origin focused');
wikiLines.push('- **Production** — larger commercial roasting operation');
wikiLines.push('');
wikiLines.push('**Visitor Experience** describes what you\'ll find on-site:');
wikiLines.push('- **Full Cafe** — open daily with seating and full service');
wikiLines.push('- **Limited Seating** — coffee bar or counter, minimal seating');
wikiLines.push('- **Roastery Only** — roasting facility, call ahead or retail only');
wikiLines.push('- **Production Only** — wholesale/online operation, no public access');
wikiLines.push('');
wikiLines.push('---');
wikiLines.push('');

// Roasters
wikiLines.push('## 📍 Roasters');
wikiLines.push('');
wikiLines.push(buildRegionSection(physicalRoasters, renderRoaster));
wikiLines.push('---');
wikiLines.push('');

// Multi-Roaster Cafes
if (physicalCafes.length > 0) {
  wikiLines.push('## ☕ Multi-Roaster Cafes');
  wikiLines.push('');
  wikiLines.push(buildRegionSection(physicalCafes, renderCafe));
  wikiLines.push('---');
  wikiLines.push('');
}

// Online-Only Roasters
if (onlineOnly.length > 0) {
  wikiLines.push('## 🌐 Online-Only Roasters');
  wikiLines.push('');
  wikiLines.push('These roasters are San Diego-based but operate primarily or exclusively online. Order direct from their websites.');
  wikiLines.push('');
  wikiLines.push(buildOnlineTable());
  wikiLines.push('');
  wikiLines.push('---');
  wikiLines.push('');
}

// Footer CTA
wikiLines.push('## ➕ Add a Spot');
wikiLines.push('');
wikiLines.push('Know a roaster or cafe we\'re missing? [Submit it here](https://sandiegocoffee.co/submit.html) — community submissions are reviewed and added regularly.');
wikiLines.push('');
wikiLines.push('*This directory is maintained by the [r/SanDiegoCoffeeBeans](https://reddit.com/r/SanDiegoCoffeeBeans) community and powered by [sandiegocoffee.co](https://sandiegocoffee.co).*');

const wikiOutput = wikiLines.join('\n');
fs.writeFileSync(path.join(__dirname, 'wiki-output.md'), wikiOutput, 'utf8');
console.log(`✅ wiki-output.md written (${wikiOutput.length.toLocaleString()} chars)`);

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

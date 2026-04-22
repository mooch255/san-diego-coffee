// ─────────────────────────────────────────────────────────────────────────────
// sync-locations.js
// Fetches coffee details from Google Sheets and merges them into locations.js.
// Also inserts brand-new locations found in Sheets that aren't in locations.js yet.
//
// Usage:
//   node sync-locations.js
//
// For new location insertion, set your Places API key:
//   GOOGLE_PLACES_API_KEY=your_key node sync-locations.js
// ─────────────────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

// Load .env
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^"|"$/g, '');
  });
} catch {}

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBRiGUsyU5HIHC-VWTlcRXMxT5gCCvbuDFkwF7nxRC6fa9jDrpAhZTr6CuurQHpAc/exec';
const LOCATIONS_FILE  = path.join(__dirname, 'locations.js');
const API_KEY         = process.env.GOOGLE_PLACES_API_KEY || '';

async function fetchSheet(sheetName) {
  const url = `${APPS_SCRIPT_URL}?sheet=${sheetName}`;
  console.log(`  Fetching ${sheetName} tab...`);
  const res  = await fetch(url);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected response from ${sheetName}: ${JSON.stringify(data)}`);
  console.log(`  ✓ Got ${data.length} rows from ${sheetName}`);
  return data;
}

async function fetchPlaceDetails(placeId) {
  const fields = [
    'displayName', 'formattedAddress', 'location',
    'nationalPhoneNumber', 'websiteUri', 'googleMapsUri',
    'rating', 'userRatingCount', 'regularOpeningHours', 'addressComponents',
  ].join(',');
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&key=${API_KEY}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Places API HTTP ${res.status}`);
  return await res.json();
}

function parseAddressComponents(components) {
  const get = (type, nameType = 'longText') =>
    (components.find(c => c.types.includes(type)) || {})[nameType] || '';
  return {
    street: [get('street_number'), get('route')].filter(Boolean).join(' '),
    city:   get('locality') || get('sublocality_level_1'),
    state:  get('administrative_area_level_1', 'shortText'),
    zip:    get('postal_code'),
  };
}

function buildCoffeeDetails(type, row) {
  if (type === 'roaster') {
    return {
      neighborhood:      row.neighborhood      || '',
      yearEstablished:   row.yearEstablished   || '',
      roastScale:        row.roastScale        || '',
      roastStyle:        row.roastStyle        || '',
      visitorExperience: row.visitorExperience || '',
      multipleLocations: row.multipleLocations || '',
      amenities:         row.amenities ? row.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      notes:             row.notes             || '',
      description:       row.description       || '',
      onlineWebsite:        row.onlineWebsite        || '',
      onlineInstagram:      row.onlineInstagram      || '',
      instagramReviewUrl:   row.instagramReviewUrl   || '',
      reviewUrl:            row.reviewUrl            || '',
      embedYoutubeUrl:      row.embedYoutubeUrl      || '',
      embedInstagramUrl:    row.embedInstagramUrl    || '',
      shopUrl:              row.shopUrl              || '',
      promoCode:            row.promoCode            || '',
      promoOffer:           row.promoOffer           || '',
      lastUpdated:          row.timestamp            || '',
    };
  }
  return {
    neighborhood:      row.neighborhood      || '',
    yearEstablished:   row.yearEstablished   || '',
    visitorExperience: row.visitorExperience || 'Full Cafe (Open daily with seating)',
    multipleLocations: row.multipleLocations || '',
    specialtyBarista:  row.specialtyBarista  || '',
    roastersServed:    row.roastersServed    ? row.roastersServed.split(',').map(r => r.trim()).filter(Boolean) : [],
    brewingOptions:    row.brewingOptions    ? row.brewingOptions.split(',').map(b => b.trim()).filter(Boolean) : [],
    amenities:         row.amenities         ? row.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
    notes:               row.notes               || '',
    description:         row.description         || '',
    instagramReviewUrl:  row.instagramReviewUrl  || '',
    reviewUrl:           row.reviewUrl           || '',
    embedYoutubeUrl:     row.embedYoutubeUrl     || '',
    embedInstagramUrl:   row.embedInstagramUrl   || '',
    shopUrl:             row.shopUrl             || '',
    promoCode:           row.promoCode           || '',
    promoOffer:          row.promoOffer          || '',
    lastUpdated:         row.timestamp           || '',
  };
}

function buildOnlineLocation(id, type, row) {
  return {
    id,
    basicInfo: {
      name: row.locationName || '',
      type,
      onlineOnly: true,
      address: {
        street:       '',
        fullAddress:  'San Diego, CA',
        neighborhood: row.neighborhood || '',
        city:         'San Diego',
        state:        'CA',
        zip:          '',
        coordinates:  { lat: 0, lng: 0 },
      },
      contact: {
        phone:         '',
        website:       row.onlineWebsite || '',
        googleMapsUrl: '',
      },
    },
    googleData: {
      placeId:          '',
      hasGoogleListing: false,
      lastSynced:       new Date().toISOString(),
    },
    googleRating: { rating: null, reviewCount: 0 },
    hours:        { weekdayDescriptions: [], openNow: false },
    googlePhotos: [],
    localImage:   null,
    localImage2:  null,
    localImage3:  null,
    metadata: {
      status:          'active',
      importedFrom:    'admin',
      importDate:      new Date().toISOString(),
      needsEnrichment: false,
    },
    coffeeDetails: buildCoffeeDetails(type, row),
  };
}

async function buildNewLocation(id, type, row) {
  if (!row.placeId) throw new Error('no placeId in sheet row');

  const place  = await fetchPlaceDetails(row.placeId);
  const addr   = parseAddressComponents(place.addressComponents || []);
  const hood   = row.neighborhood || addr.city || '';

  const amenitiesList = row.amenities ? row.amenities.split(',').map(a => a.trim()) : [];
  const isOnlineOnly  = amenitiesList.includes('Online-only (no physical storefront)');

  return {
    id,
    basicInfo: {
      name: row.locationName || place.displayName?.text || '',
      type,
      ...(isOnlineOnly && { onlineOnly: true }),
      address: {
        street:       addr.street,
        fullAddress:  place.formattedAddress  || '',
        neighborhood: hood,
        city:         addr.city,
        state:        addr.state,
        zip:          addr.zip,
        coordinates: {
          lat: place.location?.latitude  || 0,
          lng: place.location?.longitude || 0,
        },
      },
      contact: {
        phone:         place.nationalPhoneNumber || '',
        website:       place.websiteUri          || '',
        googleMapsUrl: place.googleMapsUri       || '',
      },
    },
    googleData: {
      placeId:          row.placeId,
      hasGoogleListing: true,
      lastSynced:       new Date().toISOString(),
    },
    googleRating: {
      rating:      place.rating           || null,
      reviewCount: place.userRatingCount  || 0,
    },
    hours: {
      weekdayDescriptions: place.regularOpeningHours?.weekdayDescriptions || [],
      openNow: false,
    },
    googlePhotos: [],
    localImage:   null,
    localImage2:  null,
    localImage3:  null,
    metadata: {
      status:         'active',
      importedFrom:   'admin',
      importDate:     new Date().toISOString(),
      needsEnrichment: false,
    },
    coffeeDetails: buildCoffeeDetails(type, row),
  };
}

async function main() {
  console.log('\n🔄 Syncing Google Sheets → locations.js\n');

  // ── 1. Fetch both sheets ──────────────────────────────────────────────────
  const [roasterRows, cafeRows] = await Promise.all([
    fetchSheet('Roasters'),
    fetchSheet('Cafes'),
  ]);

  const roasterData = {};
  roasterRows.forEach(row => { if (row.id) roasterData[row.id] = row; });

  const cafeData = {};
  cafeRows.forEach(row => { if (row.id) cafeData[row.id] = row; });

  console.log(`\n  Total sheet entries: ${Object.keys(roasterData).length + Object.keys(cafeData).length}`);

  // ── 2. Read existing locations.js ─────────────────────────────────────────
  console.log('\n  Reading locations.js...');
  const raw = fs.readFileSync(LOCATIONS_FILE, 'utf8');

  const match = raw.match(/window\.COFFEE_LOCATIONS\s*=\s*(\[[\s\S]*\]);/);
  if (!match) throw new Error('Could not parse window.COFFEE_LOCATIONS from locations.js');

  let locations;
  try {
    locations = JSON.parse(match[1]);
  } catch (e) {
    throw new Error('Could not JSON.parse the COFFEE_LOCATIONS array: ' + e.message);
  }
  console.log(`  ✓ Loaded ${locations.length} locations from locations.js`);

  // ── 3. Merge sheet data into existing locations ───────────────────────────
  console.log('\n  Merging sheet data...');
  let updated = 0;
  let skipped = 0;

  locations = locations.map(loc => {
    const id   = loc.id;
    const type = loc.basicInfo?.type;
    const sheetRow = type === 'roaster' ? roasterData[id] : cafeData[id];

    if (!sheetRow) { skipped++; return loc; }

    updated++;
    if (sheetRow.locationName) loc.basicInfo.name = sheetRow.locationName;
    loc.coffeeDetails = { ...loc.coffeeDetails, ...buildCoffeeDetails(type, sheetRow) };
    // Sync onlineOnly flag from amenities checkbox
    const amenitiesList = sheetRow.amenities ? sheetRow.amenities.split(',').map(a => a.trim()) : [];
    if (amenitiesList.includes('Online-only (no physical storefront)')) {
      loc.basicInfo.onlineOnly = true;
    } else {
      delete loc.basicInfo.onlineOnly;
    }
    return loc;
  });

  console.log(`  ✓ Updated: ${updated} locations`);
  console.log(`  ○ No sheet data yet: ${skipped} locations`);

  // ── 4. Insert brand-new locations from Sheets ─────────────────────────────
  const existingIds = new Set(locations.map(loc => loc.id));

  const newRows = [
    ...roasterRows.filter(r => r.id && !existingIds.has(r.id)).map(r => ({ ...r, _type: 'roaster' })),
    ...cafeRows.filter(r => r.id && !existingIds.has(r.id)).map(r => ({ ...r, _type: 'cafe' })),
  ];

  if (newRows.length > 0) {
    console.log(`\n  Found ${newRows.length} new location(s) to insert...`);

    // Online-only: no placeId — insert directly, no API call needed
    const onlineRows   = newRows.filter(r => !r.placeId);
    const physicalRows = newRows.filter(r =>  r.placeId);

    if (onlineRows.length > 0) {
      console.log(`\n  Inserting ${onlineRows.length} online-only location(s)...`);
      for (const row of onlineRows) {
        const name = row.locationName || row.id;
        process.stdout.write(`  ↓  ${name} (online only) ... `);
        locations.push(buildOnlineLocation(row.id, row._type, row));
        console.log('✓');
      }
    }

    // Physical: requires Places API key
    if (physicalRows.length > 0) {
      console.log(`\n  Inserting ${physicalRows.length} physical location(s)...`);
      if (!API_KEY) {
        console.log('  ⚠️  GOOGLE_PLACES_API_KEY not set — skipping physical location insertion.');
        console.log('     Run: GOOGLE_PLACES_API_KEY=your_key node sync-locations.js');
      } else {
        let inserted = 0;
        let insertFailed = 0;

        for (const row of physicalRows) {
          const name = row.locationName || row.id;
          try {
            process.stdout.write(`  ↓  ${name} ... `);
            const newLoc = await buildNewLocation(row.id, row._type, row);
            locations.push(newLoc);
            inserted++;
            console.log('✓');
          } catch (err) {
            insertFailed++;
            console.log(`✗  (${err.message})`);
          }
        }

        console.log(`  ✓ Inserted: ${inserted} new location(s)`);
        if (insertFailed > 0) console.log(`  ✗ Failed:   ${insertFailed} (check placeId in Sheets)`);
      }
    }
  }

  // ── 4.5. Auto-detect multiple locations by name ───────────────────────────
  console.log('\n  Detecting multiple locations by name...');

  const nameGroups = {};
  locations.forEach(loc => {
    const name = (loc.basicInfo?.name || '').toLowerCase().trim();
    if (!name) return;
    if (!nameGroups[name]) nameGroups[name] = [];
    nameGroups[name].push(loc);
  });

  let multiUpdated = 0;
  Object.values(nameGroups).forEach(group => {
    if (group.length > 1) {
      group.forEach(loc => {
        if (loc.coffeeDetails && loc.coffeeDetails.multipleLocations !== 'Yes') {
          loc.coffeeDetails.multipleLocations = 'Yes';
          multiUpdated++;
        }
      });
    }
  });

  if (multiUpdated > 0) {
    console.log(`  ✓ Auto-set multipleLocations: Yes on ${multiUpdated} location(s)`);
  } else {
    console.log(`  ✓ No new multiple-location groups detected`);
  }

  // ── 5. Write updated locations.js ─────────────────────────────────────────
  console.log('\n  Writing locations.js...');

  const json   = JSON.stringify(locations);
  const output = `// Auto-generated by sync-locations.js — do not edit the coffeeDetails blocks manually\n// Last synced: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}\n\nwindow.COFFEE_LOCATIONS = ${json};\n`;

  fs.writeFileSync(LOCATIONS_FILE + '.backup', raw, 'utf8');
  fs.writeFileSync(LOCATIONS_FILE, output, 'utf8');

  console.log(`  ✓ locations.js updated`);
  console.log(`  ✓ Backup saved to locations.js.backup`);

  // ── 6. Regenerate sitemap.xml ──────────────────────────────────────────────
  console.log('\n  Regenerating sitemap.xml...');

  const BASE_URL      = 'https://sandiegocoffee.co';
  const SITEMAP_FILE  = path.join(__dirname, 'sitemap.xml');
  const HIGHLIGHTS_FILE = path.join(__dirname, 'highlights.js');

  function safeDate(str) {
    if (!str) return new Date().toISOString().slice(0, 10);
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
  }

  function urlEntry(loc, lastmod, changefreq, priority) {
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  const staticPages = [
    { p: '/',                        cf: 'weekly',  pri: '1.0' },
    { p: '/map.html',                cf: 'weekly',  pri: '0.9' },
    { p: '/roaster-highlights.html', cf: 'weekly',  pri: '0.8' },
    { p: '/about.html',              cf: 'monthly', pri: '0.5' },
    { p: '/submit.html',             cf: 'monthly', pri: '0.5' },
  ];

  const sitemapEntries = [];

  staticPages.forEach(pg => {
    sitemapEntries.push(urlEntry(BASE_URL + pg.p, todayStr, pg.cf, pg.pri));
  });

  locations.forEach(loc => {
    const lastmod = safeDate(loc.coffeeDetails && loc.coffeeDetails.lastUpdated);
    sitemapEntries.push(urlEntry(`${BASE_URL}/locations/${loc.id}`, lastmod, 'monthly', '0.8'));
  });

  let highlightCount = 0;
  try {
    const hlRaw = fs.readFileSync(HIGHLIGHTS_FILE, 'utf8');
    const hlMatch = hlRaw.match(/window\.highlights\s*=\s*(\[[\s\S]*\]);?\s*$/m);
    if (hlMatch) {
      const highlights = Function('"use strict"; return ' + hlMatch[1])();
      highlights.forEach(h => {
        sitemapEntries.push(urlEntry(`${BASE_URL}/highlight.html?id=${h.id}`, safeDate(h.date), 'monthly', '0.8'));
      });
      highlightCount = highlights.length;
    }
  } catch (e) {
    console.log('  ⚠️  Could not read highlights.js — highlight URLs skipped');
  }

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    sitemapEntries.join('\n'),
    '</urlset>',
  ].join('\n');

  fs.writeFileSync(SITEMAP_FILE, sitemapXml, 'utf8');
  console.log(`  ✓ sitemap.xml updated — ${sitemapEntries.length} URLs (${staticPages.length} static, ${locations.length} locations, ${highlightCount} highlights)`);

  console.log('\n✅ Sync complete! Run:\n');
  console.log('   GOOGLE_PLACES_API_KEY=your_key node migrate-photos.js');
  console.log('   git add locations.js images/locations/ sitemap.xml');
  console.log('   git commit -m "Sync and add new locations"');
  console.log('   git push\n');
  console.log('📋 To update the Reddit wiki:');
  console.log('   python build_wiki.py');
  console.log('   Then open wiki_output.html, copy, and paste into Reddit.\n');
}

main().catch(err => {
  console.error('\n❌ Sync failed:', err.message);
  process.exit(1);
});

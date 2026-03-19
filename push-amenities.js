// ─────────────────────────────────────────────────────────────────────────────
// push-amenities.js
// Reads locations.js and pushes coffeeDetails (including updated amenities)
// back to Google Sheets via the Apps Script endpoint.
//
// Only sends locations where type is 'roaster' or 'cafe' AND coffeeDetails
// exists. Online-only roasters (no placeId / type='roaster' with no address)
// are included too — they're on the Roasters sheet.
//
// Usage:
//   node push-amenities.js              -- push all locations
//   node push-amenities.js --dry-run    -- preview payloads without sending
//   node push-amenities.js --id loc_001 -- push a single location
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
const DELAY_MS        = 300; // pause between requests to avoid overwhelming Apps Script

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const dryRun  = args.includes('--dry-run');
const idIndex = args.indexOf('--id');
const onlyId  = idIndex !== -1 ? args[idIndex + 1] : null;

// ── Load locations.js ─────────────────────────────────────────────────────────
const raw = fs.readFileSync(LOCATIONS_FILE, 'utf8');
// Strip the JS assignment wrapper: "window.COFFEE_LOCATIONS = [...]\n;"
const jsonText = raw.replace(/^window\.COFFEE_LOCATIONS\s*=\s*/, '').replace(/;\s*$/, '');
const locations = JSON.parse(jsonText);

// ── Build payload for one location ───────────────────────────────────────────
function buildPayload(loc) {
  const type = loc.basicInfo?.type;           // 'roaster' | 'cafe'
  const cd   = loc.coffeeDetails || {};
  const amenitiesStr = Array.isArray(cd.amenities) ? cd.amenities.join(', ') : (cd.amenities || '');

  if (type === 'roaster') {
    return {
      sheet:             'Roasters',
      locationType:      'roaster',
      id:                loc.id,
      locationName:      loc.basicInfo?.name         || '',
      neighborhood:      cd.neighborhood             || '',
      yearEstablished:   cd.yearEstablished          || '',
      roastScale:        cd.roastScale               || '',
      roastStyle:        cd.roastStyle               || '',
      visitorExperience: cd.visitorExperience        || '',
      multipleLocations: cd.multipleLocations        || '',
      amenities:         amenitiesStr,
      notes:             cd.notes                    || '',
      description:       cd.description              || '',
      onlineWebsite:     cd.onlineWebsite            || '',
      onlineInstagram:   cd.onlineInstagram          || '',
    };
  }

  if (type === 'cafe') {
    return {
      sheet:             'Cafes',
      locationType:      'cafe',
      id:                loc.id,
      locationName:      loc.basicInfo?.name         || '',
      neighborhood:      cd.neighborhood             || '',
      yearEstablished:   cd.yearEstablished          || '',
      multipleLocations: cd.multipleLocations        || '',
      specialtyBarista:  cd.specialtyBarista         || '',
      roastersServed:    cd.roastersServed           || '',
      brewingOptions:    cd.brewingOptions           || '',
      amenities:         amenitiesStr,
      notes:             cd.notes                    || '',
      description:       cd.description             || '',
    };
  }

  return null; // unknown type — skip
}

// ── Send one payload to Apps Script ──────────────────────────────────────────
async function pushOne(payload) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: text.slice(0, 200) };
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const targets = onlyId
    ? locations.filter(l => l.id === onlyId)
    : locations.filter(l => l.coffeeDetails);

  console.log(`\n📦 push-amenities.js`);
  console.log(`   Mode    : ${dryRun ? 'DRY RUN (no requests sent)' : 'LIVE'}`);
  console.log(`   Filter  : ${onlyId ? `id = ${onlyId}` : 'all locations with coffeeDetails'}`);
  console.log(`   Count   : ${targets.length} locations\n`);

  if (targets.length === 0) {
    console.log('Nothing to push.');
    return;
  }

  let ok = 0, skipped = 0, failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const loc     = targets[i];
    const payload = buildPayload(loc);

    if (!payload) {
      console.log(`  [${i + 1}/${targets.length}] SKIP  ${loc.id}  (unknown type: ${loc.basicInfo?.type})`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`  [${i + 1}/${targets.length}] DRY   ${loc.id}  → ${payload.sheet}  amenities: "${payload.amenities}"`);
      ok++;
      continue;
    }

    try {
      const result = await pushOne(payload);
      if (result.success) {
        console.log(`  [${i + 1}/${targets.length}] OK    ${loc.id}  → ${result.action || 'updated'}`);
        ok++;
      } else {
        console.log(`  [${i + 1}/${targets.length}] FAIL  ${loc.id}  → ${result.error || JSON.stringify(result)}`);
        failed++;
      }
    } catch (err) {
      console.log(`  [${i + 1}/${targets.length}] ERR   ${loc.id}  → ${err.message}`);
      failed++;
    }

    if (i < targets.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n✅ Done — ${ok} ok, ${skipped} skipped, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });

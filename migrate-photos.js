// ─────────────────────────────────────────────────────────────────────────────
// migrate-photos.js
// Downloads Google Places photos for each location and saves them to
// /images/locations/{id}.jpg (primary), {id}b.jpg, {id}c.jpg (secondary).
// Updates locations.js with localImage / localImage2 / localImage3 fields.
//
// Usage:
//   node migrate-photos.js                 — normal run, skip already-done
//   node migrate-photos.js --refresh-refs  — re-fetch fresh photo tokens for
//                                            locations missing secondary photos
//
// Safe to re-run — already-migrated locations are skipped automatically.
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

const API_KEY        = process.env.GOOGLE_PLACES_API_KEY;
const LOCATIONS_FILE = path.join(__dirname, 'locations.js');
const IMAGES_DIR     = path.join(__dirname, 'images', 'locations');
const DELAY_MS       = 250; // pause between requests to avoid rate limiting

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadPhoto(photoName, destPath) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

async function fetchPhotoRef(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return (data.photos || []).slice(0, 5).map(p => ({
    name:     p.name,
    widthPx:  p.widthPx  || 0,
    heightPx: p.heightPx || 0,
  }));
}

async function main() {
  const refreshRefs = process.argv.includes('--refresh-refs');

  if (!API_KEY) {
    console.error('\n❌ Missing GOOGLE_PLACES_API_KEY');
    console.error('   Run: GOOGLE_PLACES_API_KEY=your_key node migrate-photos.js\n');
    process.exit(1);
  }

  // Create images directory if it doesn't exist
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log('  Created /images/locations/');
  }

  // Read and parse locations.js
  const raw   = fs.readFileSync(LOCATIONS_FILE, 'utf8');
  const match = raw.match(/window\.COFFEE_LOCATIONS\s*=\s*(\[[\s\S]*\]);/);
  if (!match) throw new Error('Could not parse window.COFFEE_LOCATIONS from locations.js');
  const locations = JSON.parse(match[1]);

  console.log(`\n📸 Migrating photos for ${locations.length} locations\n`);

  let downloaded = 0;
  let downloaded2 = 0;
  let downloaded3 = 0;
  let alreadyDone = 0;
  let noPhoto = 0;
  let failed = 0;
  const failures = [];

  for (const loc of locations) {
    const name = loc.basicInfo?.name || loc.id;

    // Track whether primary photo is already done
    let primaryDone = !!loc.localImage;

    if (primaryDone) {
      alreadyDone++;
      console.log(`  ⟳  ${name} (primary already done)`);
      // fall through to check secondary photos
    } else {
      // If image file already exists on disk, just register it without downloading
      const existingPath = path.join(IMAGES_DIR, `${loc.id}.jpg`);
      if (fs.existsSync(existingPath)) {
        loc.localImage = `/images/locations/${loc.id}.jpg`;
        downloaded++;
        primaryDone = true;
        console.log(`  ✓  ${name} (used existing file)`);
      } else {
        // If no photo references stored, try fetching them from Places API using placeId
        let photos = loc.googlePhotos;
        if ((!photos || !photos.length || !photos[0]?.name) && loc.googleData?.placeId) {
          try {
            process.stdout.write(`  ⟳  ${name} (fetching photo ref) ... `);
            photos = await fetchPhotoRef(loc.googleData.placeId);
            loc.googlePhotos = photos;
            console.log(photos.length ? `got ${photos.length}` : 'none found');
            await sleep(DELAY_MS);
          } catch (err) {
            console.log(`✗  (${err.message})`);
          }
        }

        if (!photos || !photos.length || !photos[0]?.name) {
          noPhoto++;
          console.log(`  ○  ${name} (no photo reference)`);
          continue;
        }

        const destPath = path.join(IMAGES_DIR, `${loc.id}.jpg`);

        try {
          process.stdout.write(`  ↓  ${name} ... `);
          await downloadPhoto(photos[0].name, destPath);
          loc.localImage = `/images/locations/${loc.id}.jpg`;
          downloaded++;
          primaryDone = true;
          console.log('✓');
        } catch (err) {
          failed++;
          failures.push({ name, error: err.message });
          console.log(`✗  (${err.message})`);
        }

        await sleep(DELAY_MS);
      }
    }

    // ── Refresh photo refs if requested and secondary photos are missing ──
    if (refreshRefs && primaryDone && loc.googleData?.placeId &&
        (!loc.localImage2 || !loc.localImage3)) {
      try {
        process.stdout.write(`  ⟳  ${name} (refreshing photo refs) ... `);
        const freshPhotos = await fetchPhotoRef(loc.googleData.placeId);
        loc.googlePhotos = freshPhotos;
        console.log(`got ${freshPhotos.length}`);
        await sleep(DELAY_MS);
      } catch (err) {
        console.log(`✗  (${err.message})`);
      }
    }

    // ── Secondary photo 2 ──
    const photos = loc.googlePhotos;
    if (photos?.[1]?.name && !loc.localImage2) {
      const dest2 = path.join(IMAGES_DIR, `${loc.id}b.jpg`);
      if (fs.existsSync(dest2)) {
        loc.localImage2 = `/images/locations/${loc.id}b.jpg`;
      } else if (primaryDone) {
        try {
          process.stdout.write(`  ↓  ${name} (photo 2) ... `);
          await downloadPhoto(photos[1].name, dest2);
          loc.localImage2 = `/images/locations/${loc.id}b.jpg`;
          downloaded2++;
          console.log('✓');
        } catch (err) {
          failed++;
          console.log(`✗  (${err.message})`);
        }
        await sleep(DELAY_MS);
      }
    }

    // ── Secondary photo 3 ──
    if (photos?.[2]?.name && !loc.localImage3) {
      const dest3 = path.join(IMAGES_DIR, `${loc.id}c.jpg`);
      if (fs.existsSync(dest3)) {
        loc.localImage3 = `/images/locations/${loc.id}c.jpg`;
      } else if (primaryDone) {
        try {
          process.stdout.write(`  ↓  ${name} (photo 3) ... `);
          await downloadPhoto(photos[2].name, dest3);
          loc.localImage3 = `/images/locations/${loc.id}c.jpg`;
          downloaded3++;
          console.log('✓');
        } catch (err) {
          failed++;
          console.log(`✗  (${err.message})`);
        }
        await sleep(DELAY_MS);
      }
    }
  }

  // Write updated locations.js (preserving the same header format as sync-locations.js)
  const json   = JSON.stringify(locations, null, 2);
  const output = `// Auto-generated by sync-locations.js — do not edit the coffeeDetails blocks manually\n// Last synced: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}\n\nwindow.COFFEE_LOCATIONS = ${json};\n`;

  fs.writeFileSync(LOCATIONS_FILE + '.backup', raw, 'utf8');
  fs.writeFileSync(LOCATIONS_FILE, output, 'utf8');

  // Summary
  console.log('\n─────────────────────────────');
  console.log(`✅ Done!`);
  console.log(`   Downloaded (primary):  ${downloaded}`);
  console.log(`   Downloaded (photo 2):  ${downloaded2}`);
  console.log(`   Downloaded (photo 3):  ${downloaded3}`);
  console.log(`   Already done:          ${alreadyDone}`);
  console.log(`   No photo ref:          ${noPhoto}`);
  console.log(`   Failed:                ${failed}`);

  if (failures.length) {
    console.log('\n⚠️  Failed locations (photo references may have expired):');
    failures.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
    console.log('\n   Re-run with --refresh-refs to fetch fresh tokens and retry:');
    console.log('   node migrate-photos.js --refresh-refs');
  }

  console.log('\nNext steps:');
  console.log('  git add images/locations/ locations.js');
  console.log('  git commit -m "Migrate location photos to self-hosted"');
  console.log('  git push\n');
}

main().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});

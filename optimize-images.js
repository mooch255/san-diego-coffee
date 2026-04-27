// optimize-images.js
// Re-saves location/highlight images as progressive JPEG, quality 85, max 1200px.
// Overwrites in-place only if the result is smaller. Safe to re-run.
//
// Usage: node optimize-images.js           (optimize all)
//        node optimize-images.js --dry-run (preview savings only)

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const MAX_DIM = 1200;
const QUALITY = 85;
const SKIP_BELOW_KB = 80; // don't bother with already-small files

const DIRS = [
  './images/locations',
  './images/highlights',
  './images/guides',
  './images/news',
];

async function optimizeFile(filePath) {
  const originalSize = fs.statSync(filePath).size;
  if (originalSize < SKIP_BELOW_KB * 1024) return null;

  const tmpPath = filePath + '.tmp';

  try {
    await sharp(filePath)
      .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, progressive: true, mozjpeg: false })
      .toFile(tmpPath);
  } catch (e) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    return null;
  }

  const newSize = fs.statSync(tmpPath).size;

  if (newSize >= originalSize) {
    fs.unlinkSync(tmpPath);
    return null;
  }

  if (!DRY_RUN) {
    fs.renameSync(tmpPath, filePath);
  } else {
    fs.unlinkSync(tmpPath);
  }

  return { originalSize, newSize, saved: originalSize - newSize };
}

async function run() {
  console.log(DRY_RUN ? '-- DRY RUN --\n' : '-- OPTIMIZING --\n');

  let totalOriginal = 0;
  let totalNew = 0;
  let count = 0;
  let skipped = 0;

  for (const dir of DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg)$/i.test(f));

    for (const file of files) {
      const filePath = path.join(dir, file);
      const result = await optimizeFile(filePath);

      if (!result) {
        skipped++;
        continue;
      }

      const savedKB = Math.round(result.saved / 1024);
      const pct = Math.round((result.saved / result.originalSize) * 100);
      console.log(`${savedKB.toString().padStart(5)}KB saved (${pct}%)  ${path.relative('.', filePath)}`);

      totalOriginal += result.originalSize;
      totalNew += result.newSize;
      count++;
    }
  }

  const totalSavedMB = ((totalOriginal - totalNew) / 1024 / 1024).toFixed(1);
  const totalOrigMB = (totalOriginal / 1024 / 1024).toFixed(1);
  const totalNewMB = (totalNew / 1024 / 1024).toFixed(1);

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Files optimized : ${count}`);
  console.log(`Files skipped   : ${skipped} (already small)`);
  console.log(`Before          : ${totalOrigMB} MB`);
  console.log(`After           : ${totalNewMB} MB`);
  console.log(`Total saved     : ${totalSavedMB} MB`);
  if (DRY_RUN) console.log('\nRun without --dry-run to apply.');
}

run().catch(console.error);

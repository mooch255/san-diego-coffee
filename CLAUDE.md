# sandiegocoffee.co — Claude Code Context

## Project Overview
A specialty coffee directory and interactive map for the [r/SanDiegoCoffeeBeans](https://reddit.com/r/SanDiegoCoffeeBeans) Reddit community. Hosted at **sandiegocoffee.co** on Netlify with GitHub-based auto-deploy. Features 151+ coffee locations across San Diego neighborhoods, targeting "coffee data nerds" who want detailed roast profiles, brew methods, and visitor info — not just basic listings.

## Tech Stack
- **Frontend:** Plain HTML, CSS, JavaScript (no React/frameworks)
- **Hosting:** Netlify (GitHub integration, auto-deploy on push)
- **Database:** Google Sheets (lightweight backend)
- **Maps:** Google Maps API + Google Places API (legacy and new versions)
- **Photos:** Google Photos API
- **Community:** Reddit API (via Netlify serverless functions to handle CORS)
- **Local dev:** `netlify dev`
- **Version control:** GitHub Desktop + git CLI

## Key Architecture Decisions
- Google Sheets as database — intentionally simple, no complex DB systems
- Plain HTML/CSS/JS over React — easier to iterate and deploy
- Manual review process for community submissions — quality over automation
- Netlify serverless functions for any API calls that need CORS handling

## Data Flow
**Admin workflow — adding a new location:**
1. Admin panel → search for location → fill in form → Save (writes to Google Sheets including `placeId`)
2. `node sync-locations.js` — updates existing locations + auto-inserts new ones by fetching full data from Places API using `placeId`
3. `node migrate-photos.js` — downloads the hero photo for any location missing a local image
4. Test locally with `netlify dev`
5. Commit via GitHub Desktop and push → Netlify auto-deploys

**Admin workflow — editing an existing location:**
1. Admin panel → search → select existing location → edit form → Save (updates Google Sheets)
2. `node sync-locations.js` — merges updated `coffeeDetails` into `locations.js`
3. Commit and push

**Submission flow:** Community form → Google Sheets → manual review → publish

## Photos
- Location photos are **self-hosted** in `/images/locations/{id}.jpg` — no live Places API calls on page load
- Each location has a primary hero photo stored as `loc.localImage` in `locations.js`; some locations also have `loc.localImage2` and `loc.localImage3` for additional photos (`{id}b.jpg`, `{id}c.jpg`)
- `migrate-photos.js` handles downloading photos — safe to re-run, skips already-migrated locations
- For new locations added via admin, `migrate-photos.js` auto-fetches the photo reference from Places API using `placeId` if `googlePhotos` is empty
- Location pages show the hero image + a "More photos on Google Maps ↗" link using the stored `placeId`

**To manually add a photo for a location:**
1. Find the location's `id` in `locations.js` (search by name, e.g. `loc_153`)
2. Drop any image into `/images/locations/` named `{id}.jpg` (e.g. `loc_153.jpg`)
3. Run `node migrate-photos.js` — detects the file and registers it in `locations.js` without any API calls
4. Commit and push

## Google Sheets Setup
- **Roasters** and **Cafes** tabs both require a `placeId` column header — the Apps Script maps payload fields to headers automatically, so no Apps Script changes are needed when adding new columns
- The Apps Script at `netlify/functions/admin-to-sheets.js` handles insert vs. update by matching on column A (`id`)

## Critical: 4-File Update Pattern
Whenever a **new data field/column** is added to Google Sheets, ALL FOUR of these files must be updated:
1. `admin-to-sheets.js` — add field to payload sent to Sheets
2. `admin.html` — add form field + include in payload
3. `sync-locations.js` — add field to `coffeeDetails` object
4. `location.html` — add display logic for the new field

Never update just one or two — all four must stay in sync.

## Site Features
- Split-panel map interface (map + location cards)
- Geolocation-based sorting
- Neighborhood search with smart geographic detection (29 San Diego areas)
- Location detail pages with photo galleries
- Online-only roaster support (no physical location required)
- Admin tools for real-time data management
- Community submission forms
- News & Events page with structured data (JSON-LD)
- Reddit post integration from subreddit

## Environment Variables
(Check `.env` or Netlify dashboard for actual values — never commit secrets)
- `GOOGLE_PLACES_API_KEY` — used by `sync-locations.js` and `migrate-photos.js` for new location insertion and photo downloads
- Google Maps API key (hardcoded in `map.html`, `location.html`, `index.html` — move to env if rotating)
- Google Sheets API credentials / Apps Script URL
- Reddit API credentials

## Deployment
- **Never deploy frequently** — be mindful of Netlify build credits
- Always test with `netlify dev` locally before pushing
- Use GitHub Desktop or `git` CLI to commit and push
- Netlify auto-deploys on push to main branch

## Design Philosophy
- Editorial aesthetic inspired by publications like Eater
- Warm coffee-themed color palette
- Typography: Playfair Display (headings), clean sans-serif (body)
- Data-dense layouts for enthusiast audience
- Mobile-first responsive design (ongoing priority)

## Current Priorities / Known Work Areas
- Mobile optimization of split-panel interface
- Responsive design across all pages
- PWA capabilities (future consideration)
- "Been here" voting/tracking system (future consideration)
- Deeper Reddit community integration (future consideration)

## Community Context
- Co-moderated with a Reddit partner
- 500+ subreddit subscribers (grown in ~5 weeks)
- Content is community-submitted but editorially reviewed
- Reddit community is core to the project's identity

## Critical: News & Events 2-File Update Pattern
Whenever a **new item is added to `news.js`**, BOTH files must be updated:
1. `news.js` — add the item to `window.NEWS_ITEMS`
2. `news.html` — add a corresponding JSON-LD entry in the `<script type="application/ld+json">` block in `<head>`:
   - Use `@type: "Event"` for events (include `startDate`, `endDate`, `location`, `eventStatus`, `eventAttendanceMode`, `organizer`)
   - Use `@type: "NewsArticle"` for news items (include `headline`, `datePublished`, `url`, `image`, `description`, `publisher`, `author`)

Never add to `news.js` without updating the structured data in `news.html`.

## Analytics & Tracking
**Always add both snippets immediately after `<head>` on any new HTML page:**

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-W1SW2S30PY"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-W1SW2S30PY');
</script>
<!-- Microsoft Clarity -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "w12ykvsrtj");
</script>
```

## Reddit Wiki Build Pipeline
The wiki is generated by `build_wiki.py` and pasted into the Reddit wiki editor manually.
- `wiki_single_page.html` — source template with all static content, changelog, and rendering JS
- `wiki_data.js` — **required, do not delete** — maps every `loc_XXX` to its wiki section; the directory rendering JS depends on it
- `build_wiki.py` — inlines both `locations.js` and `wiki_data.js` into the template → outputs `wiki_output.html`
- Roaster Stories list is hardcoded in `wiki_single_page.html` line ~35 — update when adding new highlights
- Location count and date are hardcoded in `wiki_single_page.html` — update manually when counts change
- `generate-wiki.js` has been deleted (was an unused alternative approach)

## Roaster Stories
`highlights.js` is hand-maintained. When adding a new roaster highlight:
1. Add entry to `highlights.js` (`window.highlights` array)
2. Add entry to the hardcoded `HIGHLIGHTS` list in `wiki_single_page.html` (~line 35)
3. Drop hero image at `/images/highlights/{id}.jpg`; body images use `-b.jpg`, `-c.jpg` suffix
- Image body suffix convention: `highlight_roaster-name-b.jpg` (hyphen before letter)

## Notes for Claude Code
- When modifying location data fields, always follow the 4-file update pattern above
- Prefer iterative, testable changes over large rewrites
- Check `netlify dev` compatibility before suggesting any build tool changes
- The Google Sheets sync is the source of truth for location data — don't hardcode location info into HTML
- Serverless functions live in the `netlify/functions/` directory
- `locations.js` contains `localImage` (and optionally `localImage2`, `localImage3`) fields per location pointing to `/images/locations/{id}.jpg` — do not replace these with live Places API photo URLs
- `sync-locations.js` both updates existing locations AND inserts new ones — new insertion requires `GOOGLE_PLACES_API_KEY` in `.env` and a `placeId` column in the Roasters/Cafes sheets
- Admin search fires on Enter key only (not on keystroke) to avoid excessive Places API calls

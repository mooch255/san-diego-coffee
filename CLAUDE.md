# sandiegocoffee.co — Claude Code Context

## Project Overview
A specialty coffee directory and interactive map for the [r/SanDiegoCoffeeBeans](https://reddit.com/r/SanDiegoCoffeeBeans) Reddit community. Hosted at **sandiegocoffee.co** on Netlify with GitHub-based auto-deploy. Features 148+ coffee locations across San Diego neighborhoods, targeting "coffee data nerds" who want detailed roast profiles, brew methods, and visitor info — not just basic listings.

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
**Admin workflow:** Admin panel → Google Sheets → `sync-locations.js` → git push → Netlify deploy

**Submission flow:** Community form → Google Sheets → manual review → publish

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
- Reddit post integration from subreddit

## Environment Variables
(Check `.env` or Netlify dashboard for actual values — never commit secrets)
- Google Maps API key
- Google Places API key
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

## Notes for Claude Code
- When modifying location data fields, always follow the 4-file update pattern above
- Prefer iterative, testable changes over large rewrites
- Check `netlify dev` compatibility before suggesting any build tool changes
- The Google Sheets sync is the source of truth for location data — don't hardcode location info into HTML
- Serverless functions live in the `netlify/functions/` directory

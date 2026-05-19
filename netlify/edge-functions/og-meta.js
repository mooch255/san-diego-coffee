// og-meta.js — Netlify Edge Function
//
// Two jobs:
//
// 1. 301 redirect legacy loc_XXX URLs (?id=loc_XXX or /locations/loc_XXX) to
//    their canonical /locations/{slug} URL — fixes Google Search Console
//    "soft 404" reports caused by duplicate URLs serving identical content.
//
// 2. Inject correct og:image / og:title / og:description into highlight,
//    blog-post, and location pages before the response reaches the browser
//    or crawler.
//
// Self-maintaining: reads highlights.js / blog.js / locations.js directly
// from the site at runtime — no manual data duplication needed when adding
// new entries. Data is cached at module level so each edge instance only
// fetches once.

// ── Module-level cache (persists across requests per edge instance) ────────────
let HIGHLIGHTS = null;
let BLOG_POSTS = null;
let LOCATIONS_BY_ID = null;
let LOCATIONS_BY_SLUG = null;

async function getHighlights(origin) {
  if (HIGHLIGHTS) return HIGHLIGHTS;
  try {
    const res = await fetch(`${origin}/highlights.js`);
    const text = await res.text();
    const m = text.match(/window\.highlights\s*=\s*(\[[\s\S]*?\])\s*;?\s*$/m);
    if (m) {
      const arr = (new Function('return ' + m[1]))();
      HIGHLIGHTS = Object.fromEntries(arr.map(h => [h.id, {
        title: h.title,
        image: h.image,
        description: h.excerpt,
      }]));
    }
  } catch (_) {
    // fail open — just skip OG injection for this request
  }
  return HIGHLIGHTS || {};
}

async function getBlogPosts(origin) {
  if (BLOG_POSTS) return BLOG_POSTS;
  try {
    const res = await fetch(`${origin}/blog.js`);
    const text = await res.text();
    const m = text.match(/window\.BLOG_POSTS\s*=\s*(\[[\s\S]*?\])\s*;?\s*$/m);
    if (m) {
      const arr = (new Function('return ' + m[1]))();
      BLOG_POSTS = Object.fromEntries(arr.map(p => [p.id, {
        title: p.title,
        image: p.image,
        description: p.metaDescription || p.excerpt,
      }]));
    }
  } catch (_) {
    // fail open
  }
  return BLOG_POSTS || {};
}

// Mirror of the slug computation in location.html (locationSlug + slugify).
// Must stay in sync — if the slug logic changes there, update here too.
function slugify(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function getLocations(origin) {
  if (LOCATIONS_BY_ID) return { byId: LOCATIONS_BY_ID, bySlug: LOCATIONS_BY_SLUG };
  try {
    const res = await fetch(`${origin}/locations.js`);
    const text = await res.text();
    const m = text.match(/window\.COFFEE_LOCATIONS\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
    if (m) {
      const arr = JSON.parse(m[1]);
      // Pre-count name and name+hood collisions so slug logic mirrors the
      // browser's locationSlug() exactly.
      const nameCounts = new Map();
      arr.forEach(loc => {
        const b = slugify(loc.basicInfo && loc.basicInfo.name);
        nameCounts.set(b, (nameCounts.get(b) || 0) + 1);
      });
      const hoodCounts = new Map();
      arr.forEach(loc => {
        const b = slugify(loc.basicInfo && loc.basicInfo.name);
        if ((nameCounts.get(b) || 0) > 1) {
          const h = slugify((loc.coffeeDetails && loc.coffeeDetails.neighborhood) || '');
          hoodCounts.set(`${b}-${h}`, (hoodCounts.get(`${b}-${h}`) || 0) + 1);
        }
      });
      function computeSlug(loc) {
        const base = slugify(loc.basicInfo && loc.basicInfo.name);
        if ((nameCounts.get(base) || 0) <= 1) return base;
        const hood = (loc.coffeeDetails && loc.coffeeDetails.neighborhood) || '';
        if (!hood) return `${base}-${loc.id}`;
        const hoodSlug = slugify(hood);
        const withHood = `${base}-${hoodSlug}`;
        if ((hoodCounts.get(withHood) || 0) <= 1) return withHood;
        const fullAddr = (loc.basicInfo && loc.basicInfo.address && loc.basicInfo.address.fullAddress) || '';
        if (fullAddr) {
          const streetName = fullAddr.split(',')[0].replace(/^\d+\s+/, '').trim();
          const streetS = slugify(streetName);
          if (streetS) return `${withHood}-${streetS}`;
        }
        return `${withHood}-${loc.id}`;
      }
      const byId = {};
      const bySlug = {};
      arr.forEach(loc => {
        const slug = computeSlug(loc);
        const entry = { id: loc.id, slug };
        byId[loc.id] = entry;
        if (slug) bySlug[slug] = entry;
      });
      LOCATIONS_BY_ID = byId;
      LOCATIONS_BY_SLUG = bySlug;
    }
  } catch (_) {
    // fail open — no redirect, no injection
  }
  return { byId: LOCATIONS_BY_ID || {}, bySlug: LOCATIONS_BY_SLUG || {} };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function replaceMeta(html, attrName, attrValue, content) {
  const escaped = content.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const re = new RegExp(`(<meta\\s+${attrName}="${attrValue}"\\s+content=")[^"]*(")`);
  return html.replace(re, `$1${escaped}$2`);
}

// ── Edge function ─────────────────────────────────────────────────────────────

export default async (request, context) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const origin = url.origin;
  const queryId = url.searchParams.get('id');

  // Extract id from the /locations/{id} path if present
  let pathId = null;
  const pm = pathname.match(/^\/locations\/([^\/]+)\/?$/);
  if (pm) pathId = decodeURIComponent(pm[1]);

  const id = queryId || pathId;

  // ── 301 redirect legacy loc_XXX URLs to canonical /locations/{slug} ─────────
  // Covers both:
  //   /location.html?id=loc_XXX
  //   /locations/loc_XXX
  if (id && /^loc_\d+$/.test(id) && (pathname === '/location.html' || pathId)) {
    const { byId } = await getLocations(origin);
    const entry = byId[id];
    if (entry && entry.slug && entry.slug !== id) {
      return new Response(null, {
        status: 301,
        headers: { Location: `${origin}/locations/${entry.slug}` },
      });
    }
  }

  // ── OG injection ────────────────────────────────────────────────────────────
  let data = null;

  if (pathname === '/highlight.html' && queryId) {
    const highlights = await getHighlights(origin);
    data = highlights[queryId] || null;
  } else if (pathname === '/blog-post.html' && queryId) {
    const posts = await getBlogPosts(origin);
    data = posts[queryId] || null;
  } else if (pathname === '/location.html' && id && id.startsWith('loc_')) {
    // Predictable image pattern — no lookup needed
    data = { image: `/images/locations/${id}.jpg` };
  } else if (pathId && !/^loc_\d+$/.test(pathId)) {
    // /locations/{slug} — look up canonical id for the image
    const { bySlug } = await getLocations(origin);
    const entry = bySlug[pathId];
    if (entry) data = { image: `/images/locations/${entry.id}.jpg` };
  }

  if (!data) return context.next();

  const response = await context.next();
  let html = await response.text();

  const fullImage = origin + data.image;

  // Always swap image tags
  html = replaceMeta(html, 'property', 'og:image', fullImage);
  html = replaceMeta(html, 'name', 'twitter:image', fullImage);

  // Swap title tags if we have one
  if (data.title) {
    html = replaceMeta(html, 'property', 'og:title', data.title);
    html = replaceMeta(html, 'name', 'twitter:title', data.title);
    html = html.replace(
      /<title>[^<]*<\/title>/,
      `<title>${data.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>`
    );
  }

  // Swap description tags if we have one
  if (data.description) {
    html = replaceMeta(html, 'property', 'og:description', data.description);
    html = replaceMeta(html, 'name', 'twitter:description', data.description);
    html = replaceMeta(html, 'name', 'description', data.description);
  }

  return new Response(html, {
    headers: response.headers,
    status: response.status,
  });
};

// Intercept location/highlight/blog-post pages plus the clean /locations/* URLs
export const config = {
  path: ['/highlight.html', '/blog-post.html', '/location.html', '/locations/*'],
};

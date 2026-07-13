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

let NEIGHBORHOODS_BY_NAME = null;
async function getNeighborhoods(origin) {
  if (NEIGHBORHOODS_BY_NAME) return NEIGHBORHOODS_BY_NAME;
  try {
    const res = await fetch(`${origin}/neighborhoods.js`);
    const text = await res.text();
    const m = text.match(/window\.NEIGHBORHOODS\s*=\s*(\[[\s\S]*?\]);\s*\n/m);
    if (m) {
      const arr = (new Function('return ' + m[1]))();
      NEIGHBORHOODS_BY_NAME = Object.fromEntries(arr.map(n => [n.name, n.id]));
    }
  } catch (_) {
    // fail open — no neighborhood link
  }
  return NEIGHBORHOODS_BY_NAME || {};
}

// Mirror of the slug computation in location.html (locationSlug + slugify).
// Must stay in sync — if the slug logic changes there, update here too.
function slugify(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Blog clean-slug rule: blog ids are already slug-form, so the public slug is
// just the id with the `blog_` prefix stripped. blog_woc-guide-2026 -> woc-guide-2026
function blogSlug(id) {
  return (id || '').replace(/^blog_/, '');
}

// Differentiated location title/description. MUST stay in sync with the
// equivalent logic in location.html (pageTitle + buildMetaDesc fallback) so the
// server-rendered Stage-1 meta matches the client-rendered Stage-2 meta.
// No em dash in the live strings (site writing-style rule) — use a pipe.
function locationTitle(name, hood, type) {
  const typeLabel = type === 'roaster' ? 'Coffee Roaster' : 'Coffee Shop';
  const hoodSuffix = (hood && hood !== 'San Diego') ? ` in ${hood}, San Diego` : ' in San Diego';
  return `${name} | ${typeLabel}${hoodSuffix}`;
}
function locationDesc(name, hood, type) {
  const kind = type === 'roaster' ? 'roaster' : 'shop';
  const where = (hood && hood !== 'San Diego') ? `${hood}, San Diego` : 'San Diego';
  return `${name} is a specialty coffee ${kind} in ${where}. Hours, roast profile, brew methods, and visitor details on San Diego's specialty coffee directory.`.slice(0, 160);
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Server-rendered per-location content for the Stage-1 crawl. The raw template
// only ships "<h2>Loading...</h2>" inside #pageContent, which reads as thin
// content (the likely cause of soft-404 / crawled-not-indexed). This injects
// real, unique text; the client JS overwrites #pageContent on render, so real
// users still get the full interactive page (progressive enhancement).
function locationContentHtml(e, nbSlug) {
  const typeLabel = e.type === 'roaster' ? 'Coffee Roaster' : 'Coffee Shop';
  const where = (e.neighborhood && e.neighborhood !== 'San Diego') ? `${escapeHtml(e.neighborhood)}, San Diego` : 'San Diego';
  const parts = [];
  parts.push(`<h1>${escapeHtml(e.name)}</h1>`);
  parts.push(`<p>${typeLabel} in ${where}</p>`);
  parts.push(`<p>${escapeHtml(e.description || locationDesc(e.name, e.neighborhood, e.type))}</p>`);
  if (e.type === 'roaster' && (e.roastScale || e.roastStyle)) {
    const roast = [e.roastScale, e.roastStyle].filter(Boolean).map(escapeHtml).join('. ');
    parts.push(`<p><strong>Roast profile:</strong> ${roast}</p>`);
  }
  if (e.hours && e.hours.length) {
    parts.push('<h2>Hours</h2><ul>' + e.hours.map(h => `<li>${escapeHtml(h)}</li>`).join('') + '</ul>');
  }
  if (e.fullAddress) parts.push(`<p><strong>Address:</strong> ${escapeHtml(e.fullAddress)}</p>`);
  if (e.website) parts.push(`<p><a href="${escapeHtml(e.website)}" rel="nofollow">Visit website</a></p>`);
  // Tier 4: internal links to discovery/hub pages (link equity toward pages we want to rank).
  const related = [];
  if (nbSlug) related.push(`<a href="/neighborhoods/${escapeHtml(nbSlug)}">Best coffee in ${escapeHtml(e.neighborhood)}</a>`);
  related.push('<a href="/guides/best-coffee-san-diego">Best Coffee in San Diego guide</a>');
  related.push('<a href="/map.html">Explore the San Diego coffee map</a>');
  parts.push('<h2>Explore more San Diego coffee</h2><ul>' + related.map(l => `<li>${l}</li>`).join('') + '</ul>');
  return `<div class="ssr-content">${parts.join('')}</div>`;
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
        const cd = loc.coffeeDetails || {};
        const addr = (loc.basicInfo && loc.basicInfo.address) || {};
        const contact = (loc.basicInfo && loc.basicInfo.contact) || {};
        const entry = {
          id: loc.id,
          slug,
          name: (loc.basicInfo && loc.basicInfo.name) || '',
          neighborhood: cd.neighborhood || '',
          type: (loc.basicInfo && loc.basicInfo.type) || '',
          // Fields for the server-rendered Stage-1 content block:
          description: cd.description || '',
          roastScale: cd.roastScale || '',
          roastStyle: cd.roastStyle || '',
          fullAddress: addr.fullAddress || '',
          website: contact.website || '',
          hours: (loc.hours && loc.hours.weekdayDescriptions) || [],
        };
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

  // Extract slug from the /blog/{slug} path if present
  let blogPathSlug = null;
  const bm = pathname.match(/^\/blog\/([^\/]+)\/?$/);
  if (bm) blogPathSlug = decodeURIComponent(bm[1]);

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

  // ── 301 redirect legacy ?id=blog_XXX blog URLs to canonical /blog/{slug} ─────
  // Mirrors the location redirect above — kills the query-param duplicate.
  if (pathname === '/blog-post.html' && queryId && /^blog_/.test(queryId)) {
    return new Response(null, {
      status: 301,
      headers: { Location: `${origin}/blog/${blogSlug(queryId)}` },
    });
  }

  // ── OG injection ────────────────────────────────────────────────────────────
  let data = null;

  if (pathname === '/highlight.html' && queryId) {
    const highlights = await getHighlights(origin);
    data = highlights[queryId] || null;
  } else if (blogPathSlug) {
    // /blog/{slug} — reconstruct the id (slug + blog_ prefix) and look up.
    const posts = await getBlogPosts(origin);
    data = posts[`blog_${blogPathSlug}`] || posts[blogPathSlug] || null;
  } else if (pathname === '/blog-post.html' && queryId) {
    const posts = await getBlogPosts(origin);
    data = posts[queryId] || null;
  } else if (pathname === '/location.html' && id && id.startsWith('loc_')) {
    // loc_XXX query form (rare — normally 301'd to /locations/{slug} above).
    const { byId } = await getLocations(origin);
    const entry = byId[id];
    if (entry) {
      const nbSlug = (await getNeighborhoods(origin))[entry.neighborhood] || '';
      data = { image: `/images/locations/${id}.jpg`, title: locationTitle(entry.name, entry.neighborhood, entry.type), description: locationDesc(entry.name, entry.neighborhood, entry.type), contentHtml: locationContentHtml(entry, nbSlug) };
    } else {
      data = { image: `/images/locations/${id}.jpg` };
    }
  } else if (pathId && !/^loc_\d+$/.test(pathId)) {
    // /locations/{slug} — look up canonical entry for image + differentiated meta + SSR body.
    const { bySlug } = await getLocations(origin);
    const entry = bySlug[pathId];
    if (entry) {
      const nbSlug = (await getNeighborhoods(origin))[entry.neighborhood] || '';
      data = {
        image: `/images/locations/${entry.id}.jpg`,
        title: locationTitle(entry.name, entry.neighborhood, entry.type),
        description: locationDesc(entry.name, entry.neighborhood, entry.type),
        contentHtml: locationContentHtml(entry, nbSlug),
      };
    }
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

  // Server-render the location body (Tier 2): replace the "Loading..." placeholder
  // inside #pageContent with real, unique content for the Stage-1 crawl. The
  // client JS overwrites #pageContent on render, so real users are unaffected.
  if (data.contentHtml) {
    html = html.replace(
      /(<div id="pageContent">)[\s\S]*?<\/div>\s*<\/div>/,
      `$1${data.contentHtml}</div>`
    );
  }

  return new Response(html, {
    headers: response.headers,
    status: response.status,
  });
};

// Intercept location/highlight/blog-post pages plus the clean /locations/* and
// /blog/* URLs
export const config = {
  path: ['/highlight.html', '/blog-post.html', '/location.html', '/locations/*', '/blog/*'],
};

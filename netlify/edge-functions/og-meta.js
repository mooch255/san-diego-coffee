// og-meta.js — Netlify Edge Function
// Injects correct og:image, og:title, og:description into highlight, blog-post,
// and location pages before the response reaches the browser/crawler.
//
// Self-maintaining: reads highlights.js and blog.js directly from the site at
// runtime — no manual data duplication needed when adding new posts or highlights.
// Data is cached at module level so each edge instance only fetches once.

// ── Module-level cache (persists across requests per edge instance) ────────────
let HIGHLIGHTS = null;
let BLOG_POSTS = null;

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function replaceMeta(html, attrName, attrValue, content) {
  const escaped = content.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const re = new RegExp(`(<meta\\s+${attrName}="${attrValue}"\\s+content=")[^"]*(")`);
  return html.replace(re, `$1${escaped}$2`);
}

// ── Edge function ─────────────────────────────────────────────────────────────

export default async (request, context) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return context.next();

  const pathname = url.pathname;
  const origin = url.origin;
  let data = null;

  if (pathname === '/highlight.html') {
    const highlights = await getHighlights(origin);
    data = highlights[id] || null;
  } else if (pathname === '/blog-post.html') {
    const posts = await getBlogPosts(origin);
    data = posts[id] || null;
  } else if (pathname === '/location.html' && id.startsWith('loc_')) {
    // Location hero images follow a predictable pattern — no lookup needed
    data = { image: `/images/locations/${id}.jpg` };
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

// Intercept these three page types
export const config = {
  path: ['/highlight.html', '/blog-post.html', '/location.html'],
};

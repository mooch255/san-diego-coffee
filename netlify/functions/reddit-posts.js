exports.handler = async function(event, context) {
  const subreddit = 'SanDiegoCoffeeBeans';
  const sort = event.queryStringParameters?.sort || 'hot';
  const limit = parseInt(event.queryStringParameters?.limit || '8', 10);
  const fetchCount = limit + 5;

  // Try multiple endpoints in order until one works
  const endpoints = [
    `https://old.reddit.com/r/${subreddit}/${sort}.json?limit=${fetchCount}&raw_json=1`,
    `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${fetchCount}&raw_json=1`,
  ];

  const userAgents = [
    'Mozilla/5.0 (compatible; SanDiegoCoffeeGuide/1.0)',
    'web:SanDiegoCoffeeGuide:1.0 (by /u/sdcoffeeguide)',
  ];

  let lastError = null;

  for (let i = 0; i < endpoints.length; i++) {
    try {
      const response = await fetch(endpoints[i], {
        headers: {
          'User-Agent': userAgents[i] || userAgents[0],
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        lastError = `${endpoints[i]} responded with ${response.status}`;
        continue;
      }

      const data = await response.json();

      const posts = data.data.children
        .filter(child => !child.data.stickied)
        .slice(0, limit)
        .map(child => {
          const p = child.data;

          // Best image: full preview > gallery > thumbnail
          let image = null;
          if (p.preview?.images?.[0]?.source?.url) {
            image = p.preview.images[0].source.url.replace(/&amp;/g, '&');
          } else if (p.media_metadata) {
            // Gallery posts
            const firstKey = Object.keys(p.media_metadata)[0];
            const meta = p.media_metadata[firstKey];
            if (meta?.s?.u) image = meta.s.u.replace(/&amp;/g, '&');
          } else if (p.thumbnail && !['self', 'default', 'nsfw', 'spoiler', '', 'image'].includes(p.thumbnail)) {
            image = p.thumbnail;
          }

          return {
            id: p.id,
            title: p.title,
            author: p.author,
            score: p.score,
            numComments: p.num_comments,
            url: `https://reddit.com${p.permalink}`,
            domain: p.domain,
            isSelf: p.is_self,
            selftext: p.selftext ? p.selftext.slice(0, 120) : null,
            flair: p.link_flair_text || null,
            image,
            created: p.created_utc,
          };
        });

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ posts }),
      };

    } catch (err) {
      lastError = err.message;
      continue;
    }
  }

  // All endpoints failed — fall back to RSS for at least basic data
  try {
    const rssUrl = `https://www.reddit.com/r/${subreddit}/${sort}.rss?limit=${fetchCount}`;
    const rssResponse = await fetch(rssUrl, {
      headers: { 'User-Agent': 'web:SanDiegoCoffeeGuide:1.0' }
    });

    if (rssResponse.ok) {
      const xml = await rssResponse.text();
      const items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

      const posts = items
        .map(match => {
          const entry = match[1];
          const title = decodeXml(extractTag(entry, 'title'));
          const link = extractAttr(entry, 'link', 'href') || '';
          const author = decodeXml(extractTag(entry, 'name'));
          const updated = extractTag(entry, 'updated');
          const content = extractTag(entry, 'content') || '';
          const scoreMatch = content.match(/(\d+) point/);
          const commentMatch = content.match(/(\d+) comment/);
          const isStickied = content.toLowerCase().includes('stickied post');
          return {
            title, link, author,
            score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
            numComments: commentMatch ? parseInt(commentMatch[1]) : 0,
            updated, isStickied
          };
        })
        .filter(p => p.title && p.link && !p.isStickied)
        .slice(0, limit)
        .map((p, i) => ({
          id: String(i),
          title: p.title,
          author: p.author,
          score: p.score,
          numComments: p.numComments,
          url: p.link,
          image: null,
          created: p.updated ? new Date(p.updated).getTime() / 1000 : null,
          isSelf: true,
          flair: null,
        }));

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=120',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ posts, fallback: true }),
      };
    }
  } catch (rssErr) {
    lastError = rssErr.message;
  }

  return {
    statusCode: 500,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: lastError || 'All Reddit endpoints failed', posts: [] }),
  };
};

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`));
  return match ? match[1].trim() : null;
}
function extractAttr(xml, tag, attr) {
  const match = xml.match(new RegExp(`<${tag}[^>]+${attr}="([^"]+)"`));
  return match ? match[1] : null;
}
function decodeXml(str) {
  if (!str) return str;
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

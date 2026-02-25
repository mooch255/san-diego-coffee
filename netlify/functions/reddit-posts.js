exports.handler = async function(event, context) {
  const subreddit = 'SanDiegoCoffeeBeans';
  const sort = event.queryStringParameters?.sort || 'hot';
  const limit = event.queryStringParameters?.limit || 6;

  try {
    const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'web:SanDiegoCoffeeGuide:1.0 (by /u/sdcoffeeguide)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API responded with ${response.status}`);
    }

    const data = await response.json();

    // Extract only what we need
    const posts = data.data.children
      .filter(child => !child.data.stickied) // skip pinned mod posts
      .map(child => {
        const p = child.data;

        // Best thumbnail: prefer image previews over reddit's low-res thumbnails
        let image = null;
        if (p.preview?.images?.[0]?.source?.url) {
          image = p.preview.images[0].source.url.replace(/&amp;/g, '&');
        } else if (p.thumbnail && !['self','default','nsfw','spoiler',''].includes(p.thumbnail)) {
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
          created: p.created_utc
        };
      });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // cache 5 minutes
      },
      body: JSON.stringify({ posts })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

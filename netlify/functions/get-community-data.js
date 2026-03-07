const { google } = require('googleapis');

const SHEET_ID = '1ur57tq0ztZhlgIy82-SaoBYcHaPgdBteqLXa4zOH4yY';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let _cache = null;
let _cacheExpiry = 0;

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return auth.getClient();
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  // Serve from cache if fresh
  const now = Date.now();
  if (_cache && now < _cacheExpiry) {
    return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(_cache) };
  }

  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Read Likes tab (skip header row A1)
    const likesRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Likes!A2:C',
    });
    const likeRows = likesRes.data.values || [];

    // Count active likes per locationId (skip cleared rows)
    const likes = {};
    for (const row of likeRows) {
      const locationId = row[0];
      if (!locationId) continue;
      likes[locationId] = (likes[locationId] || 0) + 1;
    }

    // Read Reviews tab (skip header row)
    const reviewsRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Reviews!A2:F',
    });
    const reviewRows = reviewsRes.data.values || [];

    // Collect approved reviews per locationId
    // Columns: id | locationId | ipHash | reviewText | timestamp | status
    const reviews = {};
    for (const row of reviewRows) {
      const [id, locationId, , reviewText, timestamp, status] = row;
      if (!locationId || status !== 'approved') continue;
      if (!reviews[locationId]) reviews[locationId] = [];
      reviews[locationId].push({ id, reviewText, timestamp });
    }

    const data = { likes, reviews };
    _cache = data;
    _cacheExpiry = now + CACHE_TTL;

    return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(data) };
  } catch (err) {
    console.error('get-community-data error:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to fetch community data' }),
    };
  }
};

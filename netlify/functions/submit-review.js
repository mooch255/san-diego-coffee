const { google } = require('googleapis');
const crypto = require('crypto');

const SHEET_ID = '1ur57tq0ztZhlgIy82-SaoBYcHaPgdBteqLXa4zOH4yY';

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  let locationId, reviewText;
  try {
    ({ locationId, reviewText } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!locationId) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Missing locationId.' }),
    };
  }

  const trimmed = (reviewText || '').trim().slice(0, 500);
  if (trimmed.length < 10) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Review must be at least 10 characters.' }),
    };
  }

  // Hash client IP for privacy and deduplication
  const clientIp =
    event.headers['x-nf-client-connection-ip'] ||
    (event.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unknown';
  const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex');

  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Check for existing review from this IP for this location
    // Columns: id | locationId | ipHash | reviewText | timestamp | status
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Reviews!A2:F',
    });
    const rows = res.data.values || [];

    const duplicate = rows.some(row => {
      const [, rLocId, rIpHash] = row;
      return rLocId === locationId && rIpHash === ipHash;
    });

    if (duplicate) {
      return {
        statusCode: 409,
        headers: jsonHeaders,
        body: JSON.stringify({ error: "You've already submitted a review for this location." }),
      };
    }

    const id = `rev_${Date.now()}`;
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Reviews!A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[id, locationId, ipHash, trimmed, timestamp, 'pending']] },
    });

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('submit-review error:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to submit review. Please try again.' }),
    };
  }
};

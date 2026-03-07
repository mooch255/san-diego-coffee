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

  let locationId;
  try {
    ({ locationId } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!locationId) {
    return { statusCode: 400, body: 'Missing locationId' };
  }

  // Hash client IP for privacy
  const clientIp =
    event.headers['x-nf-client-connection-ip'] ||
    (event.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unknown';
  const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex');

  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Read all like rows (skip header)
    // Columns: locationId | ipHash | timestamp
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Likes!A2:C',
    });
    const rows = res.data.values || [];

    let existingRowIndex = -1;
    let likeCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const [rLocId, rIpHash] = rows[i];
      if (!rLocId) continue; // skip cleared rows
      if (rLocId === locationId && rIpHash === ipHash) {
        existingRowIndex = i;
      }
      if (rLocId === locationId) {
        likeCount++;
      }
    }

    if (existingRowIndex >= 0) {
      // Unlike: clear this row (sheet row = data index + 2, accounting for header + 1-based)
      const sheetRow = existingRowIndex + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Likes!A${sheetRow}:C${sheetRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['', '', '']] },
      });
      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ liked: false, newCount: likeCount - 1 }),
      };
    } else {
      // Like: append new row
      const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Likes!A1',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [[locationId, ipHash, timestamp]] },
      });
      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ liked: true, newCount: likeCount + 1 }),
      };
    }
  } catch (err) {
    console.error('toggle-like error:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to toggle like' }),
    };
  }
};

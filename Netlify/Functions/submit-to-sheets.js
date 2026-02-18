const { google } = require('googleapis');

// Your Google Sheet ID (set as Netlify env var)
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Submissions';

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
  // Netlify sends form submissions as POST with JSON body
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Netlify wraps form data inside payload.data
  const data = payload.data || payload;

  const submissionType = data.submissionType || '';
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

  // Build the row matching your sheet columns exactly:
  // Timestamp | Submission Type |
  // Roaster Business Name | Roaster Neighborhood | Roaster Google Maps Link | Roaster Website | Roaster Why Specialty | Roaster Additional Info |
  // Cafe Business Name | Cafe Neighborhood | Cafe Google Maps Link | Cafe Website | Cafe Roasters Served | Cafe Why Specialty | Cafe Additional Info |
  // Correction Business Name | Correction Type | Correction Details | Correction Source Proof

  let row;

  if (submissionType === 'roaster') {
    row = [
      timestamp,
      'Roaster',
      data.businessName || '',
      data.neighborhood || '',
      data.googleMapsLink || '',
      data.website || '',
      data.whySpecialty || '',
      data.additionalInfo || '',
      '', '', '', '', '', '', '', // Cafe columns (blank)
      '', '', '', '',             // Correction columns (blank)
    ];
  } else if (submissionType === 'multi-roaster-cafe') {
    row = [
      timestamp,
      'Multi-Roaster Cafe',
      '', '', '', '', '', '',     // Roaster columns (blank)
      data.businessName || '',
      data.neighborhood || '',
      data.googleMapsLink || '',
      data.website || '',
      data.roastersServed || '',
      data.whySpecialty || '',
      data.additionalInfo || '',
      '', '', '', '',             // Correction columns (blank)
    ];
  } else if (submissionType === 'correction') {
    row = [
      timestamp,
      'Correction',
      '', '', '', '', '', '',     // Roaster columns (blank)
      '', '', '', '', '', '', '', // Cafe columns (blank)
      data.businessName || '',
      data.correctionType || '',
      data.correctionDetails || '',
      data.sourceProof || '',
    ];
  } else {
    return { statusCode: 400, body: 'Unknown submission type' };
  }

  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    return { statusCode: 200, body: 'Row added successfully' };
  } catch (err) {
    console.error('Sheets API error:', err);
    return { statusCode: 500, body: 'Failed to write to Google Sheets' };
  }
};

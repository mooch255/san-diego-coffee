const { google } = require('googleapis');

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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const data = payload.data || payload;
  const submissionType = data.submissionType || '';
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

  let sheetName;
  let row;

  if (submissionType === 'roaster') {
    sheetName = 'Roasters';
    row = [
      timestamp,
      'Roaster',
      data.roaster_businessName || '',
      data.roaster_neighborhood || '',
      data.roaster_website || '',
      data.roaster_category || '',
      data.roaster_multipleLocations || '',
      data.roaster_roastStyle || '',
      data.roaster_originFocus || '',
      Array.isArray(data.roaster_brewMethods) ? data.roaster_brewMethods.join(', ') : (data.roaster_brewMethods || ''),
      Array.isArray(data.roaster_amenities) ? data.roaster_amenities.join(', ') : (data.roaster_amenities || ''),
      data.roaster_yearFounded || '',
      data.roaster_founderHistory || '',
      data.roaster_sourcing || '',
      data.roaster_whySpecialty || '',
      data.roaster_additionalInfo || '',
    ];

  } else if (submissionType === 'multi-roaster-cafe') {
    sheetName = 'Cafes';
    row = [
      timestamp,
      'Multi-Roaster Cafe',
      data.cafe_businessName || '',
      data.cafe_neighborhood || '',
      data.cafe_website || '',
      data.cafe_multipleLocations || '',
      data.cafe_roastersServed || '',
      data.cafe_roasterRotation || '',
      Array.isArray(data.cafe_brewingOptions) ? data.cafe_brewingOptions.join(', ') : (data.cafe_brewingOptions || ''),
      Array.isArray(data.cafe_amenities) ? data.cafe_amenities.join(', ') : (data.cafe_amenities || ''),
      data.cafe_roasterConnections || '',
      data.cafe_whySpecialty || '',
      data.cafe_additionalInfo || '',
    ];

  } else if (submissionType === 'correction') {
    sheetName = 'Corrections';
    row = [
      timestamp,
      'Correction',
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
      range: `${sheetName}!A1`,
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

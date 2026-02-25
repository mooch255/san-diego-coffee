const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_r5rgwohLWHtizzAEhad9NNGG0pbnEiF23fg1-jxs7VgYbb2DfTyQQ--S7in8wZgD/exec';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { locationType } = data;

  let payload;

  if (data.sheet === 'Edits') {
    payload = {
      sheet:             'Edits',
      timestamp:         data.timestamp         || new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
      id:                data.id                || '',
      locationName:      data.locationName      || '',
      locationType:      data.locationType      || '',
      neighborhood:      data.neighborhood      || '',
      roastScale:        data.roastScale        || '',
      roastStyle:        data.roastStyle        || '',
      visitorExperience: data.visitorExperience || '',
      multipleLocations: data.multipleLocations || '',
      specialtyBarista:  data.specialtyBarista  || '',
      roastersServed:    data.roastersServed    || '',
      amenities:         data.amenities         || '',
      description:       data.description       || '',
      userNotes:         data.userNotes         || '',
    };

  } else if (locationType === 'roaster') {
    payload = {
      sheet:             'Roasters',
      id:                data.id                || '',
      timestamp:         data.timestamp         || new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
      locationName:      data.locationName      || '',
      neighborhood:      data.neighborhood      || '',
      yearEstablished:   data.yearEstablished   || '',
      roastScale:        data.roastScale        || '',
      roastStyle:        data.roastStyle        || '',
      visitorExperience: data.visitorExperience || '',
      multipleLocations: data.multipleLocations || '',
      amenities:         data.amenities         || '',
      notes:             data.notes             || '',
      description:       data.description       || '',
    };

  } else if (locationType === 'cafe') {
    payload = {
      sheet:             'Cafes',
      id:                data.id                || '',
      timestamp:         data.timestamp         || new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
      locationName:      data.locationName      || '',
      neighborhood:      data.neighborhood      || '',
      yearEstablished:   data.yearEstablished   || '',
      multipleLocations: data.multipleLocations || '',
      specialtyBarista:  data.specialtyBarista  || '',
      roastersServed:    data.roastersServed    || '',
      brewingOptions:    data.brewingOptions    || '',
      amenities:         data.amenities         || '',
      notes:             data.notes             || '',
      description:       data.description       || '',
    };

  } else {
    return { statusCode: 400, body: `Unknown sheet/locationType: "${data.sheet || data.locationType}"` };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          action: result.action,
          sheet: payload.sheet,
          location: payload.locationName,
        }),
      };
    } else {
      throw new Error(result.error || 'Apps Script returned failure');
    }

  } catch (err) {
    console.error('Apps Script error:', err);
    return {
      statusCode: 500,
      body: `Failed to write to Google Sheets: ${err.message}`,
    };
  }
};

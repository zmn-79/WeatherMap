// Nominatim geocoding (Phase 2). One request per user submit only - no autocomplete.
class AppError extends Error {
  constructor(message) { super(message); this.name = 'AppError'; }
}

async function geocode(query) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(query);
  let response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (err) {
    throw new AppError('Network problem while finding the location. Check your connection and try again.');
  }
  if (response.status === 429) throw new AppError('The location service is busy. Wait a moment and try again.');
  if (!response.ok) throw new AppError('The location service failed (HTTP ' + response.status + '). Try again later.');

  let data;
  try { data = await response.json(); } catch (err) { throw new AppError('The location service returned unreadable data.'); }
  if (!Array.isArray(data) || data.length === 0) throw new AppError('No place found for "' + query + '". Check the spelling or add a country.');

  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new AppError('The location service returned invalid coordinates.');
  return { lat, lon, name: String(data[0].display_name || query) };
}

// Reverse geocoding: coordinates -> nearest named place. Returns the clicked point itself as lat/lon.
async function reverseGeocode(lat, lon) {
  const url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=' + lat + '&lon=' + lon;
  let response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (err) {
    throw new AppError('Network problem while identifying the clicked place. Check your connection and try again.');
  }
  if (response.status === 429) throw new AppError('The location service is busy. Wait a moment and click again.');
  if (!response.ok) throw new AppError('The location service failed (HTTP ' + response.status + '). Try again later.');

  let data;
  try { data = await response.json(); } catch (err) { throw new AppError('The location service returned unreadable data.'); }
  if (!data || data.error) throw new AppError('No named place was found at that spot (open sea or remote area). Click closer to a town.');

  const a = data.address || {};
  const name = data.name || a.city || a.town || a.village || a.county || a.state || String(data.display_name || '').split(',')[0].trim();
  if (!name) throw new AppError('No named place was found at that spot. Click closer to a town.');
  return { lat, lon, name: String(data.display_name || name) };
}

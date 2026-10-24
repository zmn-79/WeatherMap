
function getApiKey() {
  let key = (window.WEATHERMAP_CONFIG && window.WEATHERMAP_CONFIG.apiKey) || '';
  if (!key || key.startsWith('YOUR_')) {
    try { key = localStorage.getItem('weathermap_api_key') || ''; } catch (e) { key = ''; }
  }
  return key.trim();
}

async function fetchWeather(lat, lon) {
  const key = getApiKey();
  if (!key) throw new AppError('No OpenWeatherMap API key is configured. See the README for setup steps.');
  const url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon +
    '&units=metric&appid=' + encodeURIComponent(key);

  let response;
  try { response = await fetch(url); } catch (err) {
    throw new AppError('Network problem while loading weather. Check your connection and try again.');
  }
  if (response.status === 401) throw new AppError('The OpenWeatherMap API key is invalid or not yet active (HTTP 401).');
  if (response.status === 404) throw new AppError('No weather data exists for this location (HTTP 404).');
  if (response.status === 429) throw new AppError('Too many weather requests. Wait a minute and try again (HTTP 429).');
  if (!response.ok) throw new AppError('The weather service failed (HTTP ' + response.status + '). Try again later.');

  let d;
  try { d = await response.json(); } catch (err) { throw new AppError('The weather service returned unreadable data.'); }
  const w = d && Array.isArray(d.weather) ? d.weather[0] : null;
  if (!w || !d.main || typeof d.main.temp !== 'number') throw new AppError('The weather service returned incomplete data.');

  const icon = /^[0-9]{2}[dn]$/.test(String(w.icon)) ? w.icon : null; // validate before building the URL
  return {
    city: d.name || '',
    temp: d.main.temp,
    condition: String(w.main || ''),
    description: String(w.description || ''),
    humidity: d.main.humidity,
    wind: d.wind ? d.wind.speed : null,
    clouds: d.clouds ? d.clouds.all : null,
    iconUrl: icon ? 'https://openweathermap.org/img/wn/' + icon + '@2x.png' : null
  };
}

// Application flow: resolve location -> weather -> map (phases 1-5).
// Used by both the text search and map clicks.
let searchId = 0; // guards against out-of-order results
let busy = false; // map clicks are ignored while a lookup runs (Nominatim: max 1 request/second)

async function lookup(resolveLocation, keepZoom) {
  const id = ++searchId;
  busy = true;
  UI.clearError();
  WeatherMapView.clearMarker(); // never leave old weather beside a new lookup
  UI.setLoading(true);
  try {
    const loc = await resolveLocation();             // Phase 2 (forward or reverse geocoding)
    const wx = await fetchWeather(loc.lat, loc.lon); // Phase 3 (only runs with valid coordinates)
    if (id !== searchId) return;
    loc.shortName = wx.city || loc.name.split(',')[0].trim();
    const popup = UI.buildPopup(loc, wx, () => UI.addFavorite(loc.shortName));
    WeatherMapView.showLocation(loc.lat, loc.lon, popup, keepZoom); // Phases 4-5
  } catch (err) {
    if (id !== searchId) return;
    UI.showError(err instanceof AppError ? err.message : 'Something unexpected went wrong. Please try again.');
    if (!(err instanceof AppError)) console.error(err);
  } finally {
    if (id === searchId) { UI.setLoading(false); busy = false; }
  }
}

const search = (query) => lookup(() => geocode(query), false);

document.addEventListener('DOMContentLoaded', () => {
  WeatherMapView.init(); // Phase 1
  UI.renderFavorites();
  const input = UI.$('location-input');

  UI.$('search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) { UI.showError('Enter a city, address or place name first.'); input.focus(); return; }
    search(query);
  });

  WeatherMapView.onMapClick((lat, lon) => {
    if (busy) return;
    lookup(() => reverseGeocode(lat, lon), true);
  });

  UI.$('favorites-list').addEventListener('click', (event) => {
    const t = event.target;
    if (t.dataset.remove) UI.removeFavorite(t.dataset.remove);
    else if (t.dataset.city) { input.value = t.dataset.city; search(t.dataset.city); }
  });
});

// Application flow: validate -> geocode -> weather -> map (phases 1-5).
let searchId = 0; // guards against out-of-order results

async function search(query) {
  const id = ++searchId;
  UI.clearError();
  WeatherMapView.clearMarker(); // never leave old weather beside a new search
  UI.setLoading(true);
  try {
    const loc = await geocode(query);                // Phase 2
    const wx = await fetchWeather(loc.lat, loc.lon); // Phase 3 (only runs with valid coordinates)
    if (id !== searchId) return;
    loc.shortName = wx.city || loc.name.split(',')[0].trim();
    const popup = UI.buildPopup(loc, wx, () => UI.addFavorite(loc.shortName));
    WeatherMapView.showLocation(loc.lat, loc.lon, popup); // Phases 4-5
  } catch (err) {
    if (id !== searchId) return;
    UI.showError(err instanceof AppError ? err.message : 'Something unexpected went wrong. Please try again.');
    if (!(err instanceof AppError)) console.error(err);
  } finally {
    if (id === searchId) UI.setLoading(false);
  }
}

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

  UI.$('favorites-list').addEventListener('click', (event) => {
    const t = event.target;
    if (t.dataset.remove) UI.removeFavorite(t.dataset.remove);
    else if (t.dataset.city) { input.value = t.dataset.city; search(t.dataset.city); }
  });
});

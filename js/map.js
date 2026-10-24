
const WeatherMapView = (() => {
  const START = { lat: 15.5007, lon: 32.5599, zoom: 6 };
  let map = null;
  let marker = null;

  function init() {
    map = L.map('map').setView([START.lat, START.lon], START.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://leafletjs.com">Leaflet</a>'
    }).addTo(map);
  }

  // Replaces any previous marker, flies to the spot and opens the popup.
  function showLocation(lat, lon, popupNode, keepZoom) {
    clearMarker();
    marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(popupNode, { maxWidth: 300 });
    map.flyTo([lat, lon], keepZoom ? map.getZoom() : 11, { duration: 1.2 });
    map.once('moveend', () => { if (marker) marker.openPopup(); });
  }

  // Calls handler(lat, lon) for map clicks; longitude is wrapped into -180..180.
  function onMapClick(handler) {
    map.on('click', (e) => { const p = e.latlng.wrap(); handler(p.lat, p.lng); });
  }

  function clearMarker() {
    if (marker) { marker.remove(); marker = null; }
  }

  return { init, showLocation, clearMarker, onMapClick };
})();

# WeatherMap

Asynchronous client-side weather map SPA for *Advanced Web Technologies - Course Project 2*.
Enter a place, and the app geocodes it, fetches current weather, flies the map there and shows the result in a popup - with no page reload.

**Live demo:** _not deployed yet - add the GitHub Pages URL here after you publish._

## Features
- Leaflet + OpenStreetMap map, starting at Khartoum (15.5007, 32.5599), zoom 6
- Nominatim geocoding, then OpenWeatherMap Current Weather (chained `async/await` fetches)
- Single replaceable marker, smooth `flyTo`, popup with name, temperature, condition, description, humidity, wind, clouds and official icon
- Loading spinner and alert cards for empty input, unknown place, 401, 404, 429, network and malformed responses
- **Extras:** Share Weather (Web Share API, clipboard fallback); favorite cities in `localStorage` (no duplicates, removable, re-run the full search when clicked)

## Technologies and APIs
HTML5, CSS3, vanilla ES6+ JavaScript, Fetch API, Leaflet 1.9.4 (CDN), Google Fonts (Roboto).
APIs: OpenStreetMap tiles (map), Nominatim (geocoding), OpenWeatherMap `data/2.5/weather` (weather, `units=metric`).

## Structure
```
index.html          css/style.css
js/config.js        API key placeholder
js/map.js           map + marker (phases 1, 4)
js/geocoding.js     Nominatim (phase 2)
js/weather.js       OpenWeatherMap (phase 3)
js/ui.js            loading, errors, popup, share, favorites (phase 5)
js/app.js           search flow
```

## Setup
1. Create a free account at openweathermap.org and copy your key (new keys can take up to a couple of hours to activate).
2. Put it in `js/config.js` in place of `YOUR_OPENWEATHERMAP_API_KEY`, **or** open the site, press F12 and run `localStorage.setItem('weathermap_api_key','YOUR_KEY')` (stays in your browser only).
3. Serve the folder: `python -m http.server 8000`, then open http://localhost:8000.

## API key security
A browser-only app cannot hide a key. Anything in `js/config.js` is downloadable by every visitor once deployed, and stays in Git history if committed. Mitigations: use a free-tier key, never reuse it elsewhere, and if it is exposed, delete it in your OpenWeatherMap dashboard and create a new one. Real protection needs a server-side proxy, which this assignment excludes. The committed `config.js` contains only a placeholder.

## Error handling
Every request checks `response.ok`, handles `fetch` rejection with `try/catch`, and shows a message in the alert card. Weather is requested only after valid coordinates exist. The marker is cleared at the start of each search so old weather never appears for a new place, and a request counter ignores out-of-order responses. The loading state resets in a `finally` block.

## Testing checklist (manual, in a browser with a real key)
- [ ] Load: no console errors, map at Khartoum, zoom 6
- [ ] "Port Sudan", then "Riyadh": one marker, popup matches city
- [ ] Empty input: message, no network request
- [ ] "qwertyzxcv": not-found message
- [ ] Wrong key (401), offline (network message), repeat searches (no duplicates)
- [ ] Share Weather, favorites persist after refresh
- [ ] Resize to tablet and phone widths

## Deployment (GitHub Pages)
Repository -> Settings -> Pages -> Deploy from branch `main`, folder `/ (root)`. All paths are relative, so the project URL works.

## Attribution
Map data (c) OpenStreetMap contributors. Geocoding by Nominatim (usage policy: max 1 request/second, no autocomplete - this app sends one request per submit). Weather by OpenWeatherMap. Map library: Leaflet.

## Known limitations
The browser-only API key exposure above; Nominatim returns only the top match.

## Optional features
Share Weather (popup button) and Favorite cities (Save city in popup; chips above the map).

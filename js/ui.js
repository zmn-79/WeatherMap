// DOM helpers: loading, errors, popup card, share, favorites.
const UI = (() => {
  const $ = (id) => document.getElementById(id);
  const FAV_KEY = 'weathermap_favorites';

  function setLoading(on) {
    $('loader').hidden = !on;
    $('search-btn').disabled = on;
    if (on) $('empty-state').hidden = true;
  }
  function showError(msg) { const c = $('error-card'); c.textContent = msg; c.hidden = false; $('empty-state').hidden = true; }
  function clearError() { $('error-card').hidden = true; $('error-card').textContent = ''; }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  const fmt = (v, unit) => (v === null || v === undefined ? 'n/a' : v + unit);

  async function share(text, note) {
    try {
      if (navigator.share) { await navigator.share({ title: 'WeatherMap', text }); note.textContent = 'Shared.'; return; }
      await navigator.clipboard.writeText(text);
      note.textContent = 'Copied to clipboard.';
    } catch (err) {
      note.textContent = err && err.name === 'AbortError' ? 'Share cancelled.' : 'Sharing is not available in this browser.';
    }
  }

  // Built with textContent only - API text is never parsed as HTML.
  function buildPopup(loc, wx, onSave) {
    const card = el('div', 'wx-card');
    const head = el('div', 'wx-head');
    if (wx.iconUrl) { const img = el('img'); img.src = wx.iconUrl; img.alt = wx.condition; head.appendChild(img); }
    const title = el('div');
    title.appendChild(el('h3', 'wx-name', loc.shortName));
    title.appendChild(el('div', 'wx-temp', Math.round(wx.temp) + ' °C'));
    head.appendChild(title);
    card.appendChild(head);
    card.appendChild(el('p', 'wx-desc', wx.condition + ' - ' + wx.description));
    const list = el('ul', 'wx-list');
    list.appendChild(el('li', '', 'Humidity: ' + fmt(wx.humidity, '%')));
    list.appendChild(el('li', '', 'Wind: ' + fmt(wx.wind, ' m/s')));
    list.appendChild(el('li', '', 'Clouds: ' + fmt(wx.clouds, '%')));
    card.appendChild(list);

    const note = el('p', 'wx-note');
    note.setAttribute('role', 'status');
    const actions = el('div', 'wx-actions');
    const shareBtn = el('button', 'share-btn', 'Share Weather');
    shareBtn.type = 'button';
    shareBtn.addEventListener('click', () =>
      share('Weather in ' + loc.shortName + ': ' + Math.round(wx.temp) + '°C, ' + wx.description + '.', note));
    const saveBtn = el('button', 'save-btn', 'Save city');
    saveBtn.type = 'button';
    saveBtn.addEventListener('click', () => { note.textContent = onSave() ? 'Saved to favorites.' : 'Already in favorites.'; });
    actions.append(shareBtn, saveBtn);
    card.append(actions, note);
    return card;
  }

  function loadFavorites() {
    try {
      const data = JSON.parse(localStorage.getItem(FAV_KEY));
      return Array.isArray(data) ? data.filter((x) => typeof x === 'string' && x.trim()) : [];
    } catch (e) { return []; }
  }
  function saveFavorites(list) { try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ } }

  function addFavorite(name) {
    const list = loadFavorites();
    if (list.some((n) => n.toLowerCase() === name.toLowerCase())) return false;
    list.push(name); saveFavorites(list); renderFavorites(); return true;
  }
  function removeFavorite(name) { saveFavorites(loadFavorites().filter((n) => n !== name)); renderFavorites(); }

  function renderFavorites() {
    const ul = $('favorites-list');
    ul.replaceChildren();
    const list = loadFavorites();
    if (!list.length) { ul.appendChild(el('li', 'favorites-empty', 'No favorites yet. Save a city from its weather card.')); return; }
    list.forEach((name) => {
      const li = el('li', 'fav-item');
      const go = el('button', 'fav-btn', name); go.type = 'button'; go.dataset.city = name;
      const rm = el('button', 'fav-btn fav-remove', '✕'); rm.type = 'button'; rm.dataset.remove = name;
      rm.setAttribute('aria-label', 'Remove ' + name + ' from favorites');
      li.append(go, rm); ul.appendChild(li);
    });
  }

  return { $, setLoading, showError, clearError, buildPopup, addFavorite, removeFavorite, renderFavorites };
})();

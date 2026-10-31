// Reusable display components. Each factory takes its options from config/pages.js and returns:
//   node   - DOM element placed inside a card
//   refresh - optional fn, called now and then every `every` ms
//   every  - optional refresh interval in ms
// Add a component: write a factory here, register it in `components`.

import { icons } from './icons.js';

const MINUTE = 60 * 1000;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function getJSON(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---- Icons: SF Symbols as inline SVG (js/icons.js), coloured by CSS via currentColor ----

const WEATHER = {
  sun: { label: 'Clear', icon: 'sun.max.fill' },
  moon: { label: 'Clear', icon: 'moon.stars.fill' },
  partly: { label: 'Partly cloudy', icon: 'cloud.sun.fill', nightIcon: 'cloud.moon.fill' },
  cloud: { label: 'Overcast', icon: 'cloud.fill' },
  fog: { label: 'Fog', icon: 'cloud.fog.fill' },
  rain: { label: 'Rain', icon: 'cloud.rain.fill' },
  snow: { label: 'Snow', icon: 'cloud.snow.fill' },
  storm: { label: 'Thunderstorm', icon: 'cloud.bolt.rain.fill' },
};

function weatherKind(code, night) {
  if (code <= 1) return night ? 'moon' : 'sun';
  if (code === 2) return 'partly';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloud';
}

// Colour comes from `.wx-icon[data-kind]` in css/app.css.
function setWeatherIcon(node, kind, night) {
  const w = WEATHER[kind];
  node.dataset.kind = kind;
  node.innerHTML = icons[night && w.nightIcon ? w.nightIcon : w.icon];
}

// Smooth hourly temperature curve for today with min/max labels and a "now" marker.
function tempGraph(temps) {
  const W = 280, H = 112, padX = 14, top = 22, low = 68, base = 90; // curve spans top..low; axis at base leaves room for the min label
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const x = (i) => padX + (i * (W - 2 * padX)) / (temps.length - 1);
  const y = (t) => top + (1 - (t - min) / Math.max(max - min, 1)) * (low - top);
  const pts = temps.map((t, i) => [x(i), y(t)]);

  // Quadratic smoothing: each point is a control point, curve passes through midpoints.
  let line = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    line += `Q${pts[i][0]} ${pts[i][1]} ${(pts[i][0] + pts[i + 1][0]) / 2} ${(pts[i][1] + pts[i + 1][1]) / 2}`;
  }
  const last = pts[pts.length - 1];
  line += `L${last[0]} ${last[1]}`;
  const area = `${line}L${last[0]} ${base}L${pts[0][0]} ${base}Z`;

  const d = new Date();
  const hour = Math.min(d.getHours() + d.getMinutes() / 60, temps.length - 1);
  const i = Math.min(Math.floor(hour), temps.length - 2);
  const nowT = temps[i] + (temps[i + 1] - temps[i]) * (hour - i);
  const nx = x(hour);
  const ny = y(nowT);

  const label = (i) => {
    const [px, py] = pts[i];
    const above = temps[i] === max;
    const tx = Math.min(Math.max(px, 16), W - 16);
    return `<text class="val" x="${tx}" y="${above ? py - 8 : py + 17}" text-anchor="middle">${Math.round(temps[i])}°</text>`;
  };
  const ticks = [0, 6, 12, 18].map((h) => `<text x="${x(h)}" y="${H - 4}" text-anchor="middle">${String(h).padStart(2, '0')}</text>`).join('');

  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs><linearGradient id="wx-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:var(--md-sys-color-primary);stop-opacity:.4"/>
      <stop offset="1" style="stop-color:var(--md-sys-color-primary);stop-opacity:0"/>
    </linearGradient>
    <linearGradient id="wx-edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000"/><stop offset=".25" stop-color="#fff"/>
      <stop offset=".75" stop-color="#fff"/><stop offset="1" stop-color="#000"/>
    </linearGradient>
    <mask id="wx-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="url(#wx-edge)"/>
    </mask></defs>
    <path class="area" d="${area}" mask="url(#wx-mask)"/>
    <path class="axis" d="M${padX} ${base}H${W - padX}"/>
    <path class="curve" d="${line}"/>
    <path class="now-line" d="M${nx} ${top - 4}V${base}"/>
    <circle class="now-dot" cx="${nx}" cy="${ny}" r="4.5"/>
    ${label(temps.indexOf(max))}${label(temps.indexOf(min))}${ticks}
  </svg>`;
}

// ---- Line colours: data/lines.json maps line number -> hex (built from the TPG dataset with jq) ----

const lineColours = getJSON('data/lines.json').catch(() => ({}));

function readableOn(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1a1a1a' : '#ffffff';
}

// ---- Components ----

export const components = {
  clock({ hour12 = false, seconds = false, date = false, locale = undefined } = {}) {
    const time = el('div', 'display-clock');
    const day = el('div', 'title muted');
    const node = el('div', 'stack centered');
    node.append(time);
    if (date) node.append(day);
    const refresh = () => {
      const now = new Date();
      time.textContent = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: seconds ? '2-digit' : undefined,
        hour12,
      });
      day.textContent = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
    };
    return { node, refresh, every: 1000 };
  },

  date({ locale = undefined } = {}) {
    const day = el('div', 'headline');
    const weekday = el('div', 'title muted');
    const node = el('div', 'stack centered');
    node.append(weekday, day);
    const refresh = () => {
      const now = new Date();
      weekday.textContent = now.toLocaleDateString(locale, { weekday: 'long' });
      day.textContent = now.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
    };
    return { node, refresh, every: MINUTE };
  },

  // Open-Meteo: free, no API key.
  // Today's weather: current conditions plus an hourly temperature graph for the whole day.
  // lat/lon are optional: without them the location comes from Home Assistant (server.py /api/location).
  weather({ lat, lon, label }) {
    const hero = el('span', 'wx-hero wx-icon');
    const temp = el('div', 'wx-temp', '—');
    const condition = el('div', 'title', 'Loading…');
    const range = el('div', 'body muted');
    const graph = el('div', 'wx-graph');
    const now = el('div', 'wx-now');
    const head = el('div', 'wx-head');
    head.append(hero, temp);
    now.append(head, condition, range);
    const body = el('div', 'wx-body');
    body.append(now, graph);
    const node = el('div', 'stack');
    const where = el('div', 'label', label ?? '');
    node.append(where, body);
    let place = lat !== undefined ? Promise.resolve({ lat, lon }) : null;

    const refresh = async () => {
      try {
        place ??= getJSON('api/location').catch((e) => { place = null; throw e; });
        const here = await place;
        if (label === undefined) where.textContent = here.name ?? '';
        const url = 'https://api.open-meteo.com/v1/forecast'
          + `?latitude=${here.lat}&longitude=${here.lon}`
          + '&current=temperature_2m,weather_code,is_day'
          + '&hourly=temperature_2m'
          + '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max'
          + '&timezone=auto&forecast_days=1';
        const data = await getJSON(url);
        const night = !data.current.is_day;
        const kind = weatherKind(data.current.weather_code, night);
        setWeatherIcon(hero, kind, night);
        temp.textContent = `${data.current.temperature_2m.toFixed(1)}°`;
        condition.textContent = WEATHER[kind].label;
        const chance = data.daily.precipitation_probability_max[0];
        range.textContent = `${Math.round(data.daily.temperature_2m_max[0])}° / ${Math.round(data.daily.temperature_2m_min[0])}°`
          + (chance >= 20 ? ` · rain ${chance}%` : '');
        graph.innerHTML = tempGraph(data.hourly.temperature_2m.slice(0, 24));
      } catch {
        // Keep last good values on screen; only mark the condition line.
        condition.textContent = 'Weather unavailable';
        setTimeout(refresh, 30_000); // don't wait the full interval after a failed (e.g. cold-start) fetch
      }
    };
    return { node, refresh, every: 10 * MINUTE };
  },

  // Static events from config. ISO local times, e.g. '2026-10-25T09:00'.
  calendar({ title = 'Coming up', events = [], max = 6 }) {
    const list = el('div', 'rows');
    const node = el('div', 'stack');
    node.append(el('div', 'label', title), list);
    const refresh = () => {
      const now = Date.now();
      const upcoming = events
        .map((e) => ({ ...e, at: new Date(e.at) }))
        .filter((e) => e.at.getTime() >= now - MINUTE * 30)
        .sort((a, b) => a.at - b.at)
        .slice(0, max);
      list.replaceChildren(...upcoming.map((e) => {
        const row = el('div', 'row');
        const time = el('span', 'time', e.at.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }));
        row.append(el('span', 'text', e.title), time);
        return row;
      }));
      if (!upcoming.length) list.append(el('div', 'body muted', 'Nothing scheduled'));
    };
    return { node, refresh, every: MINUTE };
  },

  // Live departures from Transitous (https://transitous.org, MOTIS API; free, no key).
  // Find a stopId: https://api.transitous.org/api/v1/geocode?text=<exact stop name>
  // Line pill colours come from data/lines.json.
  transport({ title = 'Departures', stopId, max = 5 }) {
    const glyph = el('span', 'mode-icon');
    glyph.innerHTML = icons['bus.fill'];
    const head = el('div', 'head');
    head.append(glyph, el('div', 'label', title));
    const list = el('div', 'rows');
    const node = el('div', 'stack');
    node.append(head, list);
    const refresh = async () => {
      try {
        const [data, colours] = await Promise.all([
          getJSON(`https://api.transitous.org/api/v1/stoptimes?stopId=${encodeURIComponent(stopId)}&n=${max + 2}`),
          lineColours,
        ]);
        const rows = data.stopTimes
          .filter((s) => !s.place.cancelled)
          .slice(0, max)
          .map((s) => {
            const at = new Date(s.place.departure ?? s.place.arrival);
            const minutes = Math.max(0, Math.ceil((at - Date.now()) / MINUTE));
            const when = minutes >= 60
              ? at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              : `${minutes} min`;
            const pill = el('span', 'line', s.routeShortName);
            const colour = colours[s.routeShortName];
            if (colour) {
              pill.style.background = colour;
              pill.style.color = readableOn(colour);
            }
            const row = el('div', 'row');
            const time = el('span', 'time', minutes === 0 ? undefined : when);
            if (minutes === 0) { // arriving: flashing tram icon
              time.classList.add('due');
              time.innerHTML = icons['lightrail'];
            }
            row.append(pill, el('span', 'text', s.headsign), time);
            return row;
          });
        list.replaceChildren(...rows);
        if (!rows.length) list.append(el('div', 'body muted', 'No departures'));
      } catch {
        // Keep last good rows on screen if we have them.
        if (!list.children.length) list.append(el('div', 'body muted', 'Departures unavailable'));
      }
    };
    return { node, refresh, every: MINUTE };
  },

  // Appliances from Home Assistant, via server.py's /api/ha (needs HA_URL / `--ha <url>`).
  // One card split into stacked halves, one line per machine:
  //   machines: [{ title, icon, state, remaining?, idle? }]
  //     icon      name of an SF Symbol rendered to img/<icon>.png (a tinted mask, so the real glyph is kept)
  //     state     entity whose value is the status ('on'/'off' read as Running/Idle; other values shown as-is)
  //     remaining optional entity holding minutes left (always shown when set, "—" if unknown)
  //     idle      status values that mean "not running"
  laundry({ machines }) {
    const ids = machines.flatMap((m) => [m.state, m.remaining].filter(Boolean));
    const cells = machines.map((m) => {
      const glyph = el('span', 'sym');
      glyph.style.setProperty('--sym', `url(img/${m.icon}.png)`);
      const status = el('div', 'title', '—');
      const left = el('div', 'title time');
      const half = el('div', 'half');
      half.append(glyph, el('div', 'title half-name', m.title), status, left);
      return { m, half, status, left };
    });
    const node = el('div', 'split');
    node.append(...cells.map((c) => c.half));
    const refresh = async () => {
      let data = null;
      try { data = await getJSON(`api/ha?ids=${ids.join(',')}`); } catch { /* shown as Unavailable below */ }
      for (const { m, status, left } of cells) {
        const raw = data?.[m.state]?.toLowerCase();
        const running = raw !== undefined && !(m.idle ?? ['off', 'idle', 'ready to start', 'unknown', 'unavailable']).includes(raw);
        status.textContent = raw === undefined ? 'Unavailable' : raw === 'on' ? 'Running' : raw === 'off' ? 'Idle' : data[m.state];
        status.classList.toggle('accent', running);
        status.classList.toggle('muted', !running);
        if (m.remaining) {
          const mins = Math.round(Number(data?.[m.remaining]));
          left.textContent = Number.isFinite(mins) && data[m.remaining] !== 'unknown' ? `${mins} min left` : '— min left';
        }
      }
    };
    return { node, refresh, every: MINUTE, bare: true };
  },

  note({ title = '', text = '' }) {
    const node = el('div', 'stack centered');
    node.append(el('div', 'title', title), el('div', 'body muted', text));
    return { node };
  },
};

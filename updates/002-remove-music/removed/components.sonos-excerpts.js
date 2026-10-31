// Removed from js/components.js

// ---- Art backdrop: while a track plays, a blurred copy of the artwork fills the page background
// (CSS `:root[data-art]`). ----

function applyArtTheme(url) {
  document.getElementById('backdrop').style.backgroundImage = `url("${url}")`;
  document.documentElement.dataset.art = '';
}

function clearArtTheme() {
  delete document.documentElement.dataset.art;
}


// ...and the nowplaying component:

  // Now playing on a Sonos speaker, via server.py's /api/sonos proxy, with transport controls
  // (previous / play-pause / next, click or drag the bar to seek). The card hides itself when
  // nothing is playing or paused.
  nowplaying({ host }) {
    const art = el('img', 'np-art');
    art.alt = '';
    const title = el('div', 'title np-title');
    const artist = el('div', 'body muted np-artist');
    const fill = el('div');
    const bar = el('div', 'np-bar');
    bar.append(fill);
    const scrub = el('div', 'np-scrub');
    scrub.append(bar);
    const text = el('div', 'np-text');
    text.append(title, artist, scrub);

    const button = (label, icon, className, onClick) => {
      const b = el('button', `np-btn ${className}`);
      b.type = 'button';
      b.setAttribute('aria-label', label);
      b.innerHTML = icons[icon];
      b.addEventListener('click', onClick);
      return b;
    };
    const toggle = button('Play or pause', 'pause.fill', 'main', () => send(playing ? 'pause' : 'play'));
    const controls = el('div', 'np-controls');
    controls.append(button('Previous', 'backward.fill', '', () => send('previous')), toggle, button('Next', 'forward.fill', '', () => send('next')));
    const node = el('div', 'np');
    node.append(art, text, controls);

    let started = false;
    let themedArt = '';
    let playing = false;
    let position = 0;
    let duration = 0;
    let synced = 0;
    let dragging = false;

    const draw = () => { fill.style.width = `${Math.min(100, (position / Math.max(duration, 1)) * 100)}%`; };

    const send = async (action, extra = {}) => {
      try {
        await fetch('/api/sonos/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ host, action, ...extra }),
          signal: AbortSignal.timeout(10_000),
        });
      } catch { /* the next sync shows the real state */ }
      setTimeout(sync, 400);
    };

    // Scrubbing: seek to where the bar is pressed or released.
    const at = (e) => {
      const r = bar.getBoundingClientRect();
      position = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * duration);
      draw();
    };
    scrub.addEventListener('pointerdown', (e) => {
      if (!duration) return;
      dragging = true;
      scrub.classList.add('dragging');
      scrub.setPointerCapture(e.pointerId);
      at(e);
    });
    scrub.addEventListener('pointermove', (e) => { if (dragging) at(e); });
    scrub.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      scrub.classList.remove('dragging');
      at(e);
      send('seek', { position });
    });
    scrub.addEventListener('pointercancel', () => { dragging = false; scrub.classList.remove('dragging'); });

    const sync = async () => {
      if (dragging) return;
      const card = node.parentElement;
      if (!started) { started = true; card.hidden = true; card.classList.add('compact'); }
      try {
        const d = await getJSON(`/api/sonos?host=${encodeURIComponent(host)}`);
        const active = (d.state === 'PLAYING' || d.state === 'PAUSED_PLAYBACK') && d.title;
        card.hidden = !active;
        if (!active) { themedArt = ''; clearArtTheme(); return; }
        title.textContent = d.title;
        artist.textContent = [d.artist, d.album].filter(Boolean).join(' · ');
        art.hidden = !d.art;
        if (d.art && art.getAttribute('src') !== d.art) art.src = d.art;
        if (d.art !== themedArt) { // new track: update the backdrop (or clear it when there is no artwork)
          themedArt = d.art;
          if (d.art) applyArtTheme(d.art); else clearArtTheme();
        }
        playing = d.state === 'PLAYING';
        position = d.position;
        duration = d.duration;
        synced = Date.now();
        scrub.hidden = !duration;
        toggle.innerHTML = icons[playing ? 'pause.fill' : 'play.fill'];
        draw();
      } catch {
        card.hidden = true; // speaker unreachable
        themedArt = '';
        clearArtTheme();
      }
    };

    // Runs every second: advance the bar locally, ask the speaker every 5 s.
    const refresh = () => {
      if (started && playing && !dragging && position < duration) { position += 1; draw(); }
      if (!started || Date.now() - synced >= 5000) return sync();
    };
    return { node, refresh, every: 1000 };
  },


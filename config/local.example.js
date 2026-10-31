// Copy to config/local.js (git-ignored) and fill in. Anything personal lives there, not in git.
export default {
  // Weather location comes from Home Assistant (rounded to ~1 km). Override only if needed:
  // weather: { lat: 46.2, lon: 6.15, label: 'Geneva' },

  // Transitous stops for the (optional) transport cards. Find an id:
  // https://api.transitous.org/api/v1/geocode?text=<exact stop name>
  stops: [
    // { title: 'Stop name', stopId: 'ch-opentransportdataswiss26_Parentch:1:sloid:00000' },
  ],

  // Home Assistant entities for the laundry card (see js/components.js). HA itself is set in local.env.
  laundry: [
    { title: 'Washer', icon: 'washer.fill', state: 'input_boolean.washer_running' },
    { title: 'Dryer', icon: 'dryer.fill', state: 'sensor.dryer_operating_state', remaining: 'sensor.dryer_time_remaining' },
  ],
};

// Edit this file to change what the display shows. No build step: reload the page.
// Personal values (location, stops, entities) come from config/local.js (git-ignored; see local.example.js).
//
// Each page:
//   id          unique, used by ?page=<id> preview
//   seconds     how long the page stays on screen before rotating (ignored with one page)
//   columns     grid columns on the page
//   rows        optional CSS grid-template-rows, e.g. '3fr 2fr'
//   components  list of { type, span, ...options }; span = columns the card uses
//
// Component types and options are defined in js/components.js.

const { default: local } = await import('./local.js').catch(() => import('./local.example.js'));

export const pages = [
  {
    id: 'home',
    columns: 10,
    rows: '7fr 2fr',
    components: [
      { type: 'clock', span: 4, date: true },
      { type: 'weather', span: 6, ...local.weather }, // location comes from Home Assistant unless local.js sets weather
      { type: 'laundry', span: 10, machines: local.laundry },
      // Transport cards (off): add to this list to re-enable, using the stops in local.js.
      // ...local.stops.map((s) => ({ type: 'transport', span: 5, ...s })),
    ],
  },
];

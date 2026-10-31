// Page engine: builds one page at a time, runs its components, rotates on a timer.
import { pages } from '../config/pages.js';
import { components } from './components.js';

const stage = document.getElementById('stage');

// ?page=<id> shows a single page (handy for previewing while editing config).
const only = new URLSearchParams(location.search).get('page');
const sequence = only ? pages.filter((p) => p.id === only) : pages;

let intervals = [];
let rotateTimer = null;

function build(page) {
  const grid = document.createElement('main');
  grid.className = 'page';
  grid.style.setProperty('--columns', page.columns ?? 2);
  if (page.rows) grid.style.setProperty('--rows', page.rows);

  for (const { type, span = 1, ...options } of page.components) {
    const make = components[type];
    if (!make) throw new Error(`Unknown component "${type}" on page "${page.id}"`);

    const { node, refresh, every, bare } = make(options);
    const card = document.createElement('section');
    card.className = bare ? 'card bare' : 'card'; // bare: the component draws its own surfaces
    card.style.gridColumn = `span ${span}`;
    card.append(node);
    grid.append(card);

    if (refresh) {
      refresh();
      if (every) intervals.push(setInterval(refresh, every));
    }
  }
  return grid;
}

function show(index) {
  intervals.forEach(clearInterval);
  intervals = [];
  stage.replaceChildren(build(sequence[index]));

  clearTimeout(rotateTimer);
  if (sequence.length > 1) { // a single page stays put, no re-render flash
    const seconds = sequence[index].seconds ?? 20;
    rotateTimer = setTimeout(() => show((index + 1) % sequence.length), seconds * 1000);
  }
}

show(0);

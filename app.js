"use strict";
// Course-style classic script: data, helpers, then DOM behavior.

// 1. Venue objects and array generation
const zones = [
  { id: 'classic', name: 'Classic', price: 12, rows: ['A', 'B', 'C'], color: '#a7b8ac' },
  { id: 'prime', name: 'Prime', price: 18, rows: ['D', 'E', 'F', 'G'], color: '#a8c7d0' },
  { id: 'lounge', name: 'Lounge', price: 26, rows: ['H', 'J', 'K', 'L'], color: '#c9b4db' },
];
const reserved = ['A-3', 'A-4', 'B-8', 'C-10', 'D-5', 'D-6', 'E-2', 'F-9', 'F-10', 'G-7', 'H-3', 'J-11', 'K-5', 'K-6', 'L-12'];
// Nested loops make each repeated seat visible in the data-generation logic.
const seats = [];
for (const zone of zones) {
  for (const row of zone.rows) {
    for (let number = 1; number <= 12; number++) {
      const id = `${row}-${number}`;
      seats.push({ id, row, number, zone: zone.id, zoneName: zone.name,
        price: zone.price, available: !reserved.includes(id) });
    }
  }
}
function findSeat(id) {
  return seats.find(seat => seat.id === id);
}
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AZN', currencyDisplay: 'narrowSymbol' }).format(value);


// 2. JSON browser storage
const STORAGE_KEY = 'lumen:hall01:2026-11-08:1930:v1';
function validateCart(value) {
  if (!value || !Array.isArray(value.seatIds)) return [];
  return value.seatIds.filter((id, index, ids) =>
    typeof id === 'string' && findSeat(id)?.available && ids.indexOf(id) === index);
}
function loadCart(storage) {
  try { return validateCart(JSON.parse(storage.getItem(STORAGE_KEY) || '{"seatIds":[]}')); }
  catch { return []; }
}
function saveCart(storage, cart) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify({ seatIds: cart, updatedAt: new Date().toISOString() })); return true; }
  catch { return false; }
}

// 3. Map navigation
function setupNavigation() {
  const viewport = document.querySelector('#venue-container');
  const venue = document.querySelector('#venue');
  let scale = 1, x = 0, y = 0;
  const baseScale = () => Math.min(1, (viewport.clientWidth - 20) / 550, (viewport.clientHeight - 20) / 510);
  function paint() {
    const limitX = Math.max(0, (550 * baseScale() * scale - viewport.clientWidth) / 2) + 100;
    const limitY = Math.max(0, (510 * baseScale() * scale - viewport.clientHeight) / 2) + 100;
    x = Math.max(-limitX, Math.min(limitX, x));
    y = Math.max(-limitY, Math.min(limitY, y));
    venue.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${baseScale() * scale})`;
    document.querySelector('#zoom-level').textContent = `${Math.round(scale * 100)}%`;
  }
  function zoom(delta) { scale = Math.max(0.75, Math.min(2.5, scale + delta)); paint(); }
  const nav = document.querySelector('#navigation');
  const actions = [ ['−', 'Zoom out', () => zoom(-.25)], ['+', 'Zoom in', () => zoom(.25)], ['↑', 'Move up', () => { y -= 40; paint(); }], ['↓', 'Move down', () => { y += 40; paint(); }], ['←', 'Move left', () => { x -= 40; paint(); }], ['→', 'Move right', () => { x += 40; paint(); }], ['↺', 'Reset / center view', () => { scale = 1; x = y = 0; paint(); }] ];
  for (const [symbol, label, action] of actions) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = symbol;
    button.setAttribute('aria-label', label); button.title = label;
    button.addEventListener('click', action); nav.append(button);
  }
  const level = document.createElement('output'); level.id = 'zoom-level'; level.setAttribute('aria-label', 'Zoom level'); nav.append(level);
  new ResizeObserver(paint).observe(viewport);
  paint();
}


// 4. Application state, DOM rendering and event callbacks

const seatRoot = document.querySelector('#seats');
const details = document.querySelector('#seat-details');
const status = document.querySelector('#status');
const booking = { inspectedId: null, seatIds: [] };
// Access can itself throw when storage is blocked by browser policy.
let storage;
try { storage = window.localStorage; } catch { /* Selection remains usable in memory. */ }
booking.seatIds = loadCart(storage);


function renderVenue() {
  for (const zone of zones) {
    const section = document.createElement('section');
    section.className = 'zone';
    section.style.setProperty('--zone-color', zone.color);
    section.setAttribute('aria-label', `${zone.name}, ${money(zone.price)} per ticket`);
    const heading = document.createElement('div');
    heading.className = 'zone-label';
    heading.textContent = `${zone.name} · ${money(zone.price)}`;
    section.append(heading);
    for (const row of zone.rows) {
      const line = document.createElement('div');
      line.className = 'seat-row';
      const label = document.createElement('span');
      label.className = 'row-label';
      label.textContent = row;
      line.append(label);
      for (const seat of seats.filter(item => item.row === row)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'seat';
        button.textContent = seat.number;
        button.dataset.seat = seat.id;
        button.setAttribute('aria-label', `Row ${row}, seat ${seat.number}, ${seat.zoneName}, ${money(seat.price)}`);

        line.append(button);
      }
      const end = label.cloneNode(true);
      line.append(end);
      section.append(line);
    }
    seatRoot.append(section);
  }
}
renderVenue();
setupNavigation();

function renderDetails() {
  const seat = findSeat(booking.inspectedId);
  if (!seat) return;
  details.replaceChildren();
  const name = document.createElement('p');
  name.className = 'selected-seat';
  name.textContent = `Row ${seat.row} · Seat ${seat.number}`;
  const info = document.createElement('p');
  info.className = 'muted';
  info.textContent = `${seat.zoneName} · Hall 01 · ${money(seat.price)}`;
  const add = document.createElement('button');
  add.type = 'button';
  add.id = 'add-ticket';
  add.className = 'add-ticket';
  add.textContent = 'ADD TO CART';
  add.disabled = !seat.available || booking.seatIds.includes(seat.id);
  if (!seat.available) add.textContent = 'UNAVAILABLE';
  else if (booking.seatIds.includes(seat.id)) add.textContent = 'ALREADY IN YOUR CART';
  add.addEventListener('click', () => {
    if (!seat.available || booking.seatIds.includes(seat.id)) return;
    booking.seatIds.push(seat.id);
    updateBooking();
    status.textContent = `${seat.id} added to your evening.`;
  });
  details.append(name, info, add);
}
seatRoot.addEventListener('click', event => {
  const button = event.target.closest('[data-seat]');
  if (!button) return;
  booking.inspectedId = button.dataset.seat;
  renderDetails();
  renderSeatStates();
  status.textContent = `Inspecting ${booking.inspectedId}. Use Add to Cart to select this ticket.`;
});

function renderSeatStates() {
  for (const seat of seats) {
    const button = document.querySelector(`[data-seat="${seat.id}"]`);
    button.classList.toggle('unavailable', !seat.available);
    button.classList.toggle('in-cart', booking.seatIds.includes(seat.id));
    button.classList.toggle('inspected', seat.id === booking.inspectedId);
    button.setAttribute('aria-pressed', String(booking.seatIds.includes(seat.id)));
    button.setAttribute('aria-label', `Row ${seat.row}, seat ${seat.number}, ${seat.zoneName}, ${money(seat.price)}, ${!seat.available ? 'unavailable' : booking.seatIds.includes(seat.id) ? 'in cart' : seat.id === booking.inspectedId ? 'inspecting' : 'available'}`);
  }
}
renderSeatStates();

function renderCart() {
  const list = document.querySelector('#cart-items');
  list.replaceChildren();
  let total = 0;
  for (const id of booking.seatIds) {
    const seat = findSeat(id);
    total += seat.price;
    const item = document.createElement('li'); item.className = 'cart-item';
    const description = document.createElement('div');
    const name = document.createElement('strong'); name.textContent = `Row ${seat.row} · Seat ${seat.number}`;
    const meta = document.createElement('span'); meta.textContent = `${seat.zoneName} · ${money(seat.price)}`;
    description.append(name, meta);
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Remove ${seat.id}`);
    remove.addEventListener('click', () => {
      booking.seatIds = booking.seatIds.filter(savedId => savedId !== id); updateBooking(); status.textContent = `${id} removed from your cart.`;
      (document.querySelector(`#cart-items button`) || document.querySelector(`[data-seat="${id}"]`)).focus();
    });
    item.append(description, remove); list.append(item);
  }
  if (!booking.seatIds.length) {
    const empty = document.createElement('li'); empty.className = 'empty-cart'; empty.textContent = 'Your next great story starts with a seat.'; list.append(empty);
  }
  document.querySelector('#cart-count').textContent = `${booking.seatIds.length} ticket${booking.seatIds.length === 1 ? '' : 's'}`;
  document.querySelector('#cart-total').textContent = money(total);
}
function updateBooking() {
  renderSeatStates(); renderCart(); renderDetails();
  document.querySelector('#storage-warning').hidden = saveCart(storage, booking.seatIds);
}
renderCart();

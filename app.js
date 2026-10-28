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


// 4. Application state, DOM rendering and event callbacks

const seatRoot = document.querySelector('#seats');
const details = document.querySelector('#seat-details');
const status = document.querySelector('#status');
const booking = { inspectedId: null, seatIds: [] };



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
  details.append(name, info, add);
}
seatRoot.addEventListener('click', event => {
  const button = event.target.closest('[data-seat]');
  if (!button) return;
  booking.inspectedId = button.dataset.seat;
  renderDetails();
  status.textContent = `Inspecting ${booking.inspectedId}. Use Add to Cart to select this ticket.`;
});

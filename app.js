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
// Application features are introduced incrementally in the simulated history.

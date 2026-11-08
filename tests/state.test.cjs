const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(new URL('../app.js', `file://${__filename.replaceAll('\\', '/')}`), 'utf8').split('// 3. Map navigation')[0];
function run(expression) { return vm.runInNewContext(source + '\n' + expression); }
test('venue identifiers and prices are consistent', () => {
  assert.equal(run('seats.length'), 132);
  assert.equal(run('new Set(seats.map(seat => seat.id)).size'), 132);
  assert.equal(run('findSeat("A-3").available'), false);
  assert.equal(run('findSeat("L-1").price'), 26);
});
test('cart objects filter invalid, reserved and duplicate identifiers', () => {
  assert.equal(run('JSON.stringify(validateCart({seatIds:["A-1","A-1","A-3",null,"bad","L-1"]}))'), '["A-1","L-1"]');
  assert.equal(run('JSON.stringify(validateCart(null))'), '[]');
  assert.equal(run('JSON.stringify(loadCart(undefined))'), '[]');
  assert.equal(run('saveCart(undefined, [])'), false);
});
test('saved object round-trips and corrupt JSON is discarded', () => {
  assert.equal(run(`(() => { let saved; const storage = {setItem:(key,value)=>saved=value,getItem:()=>saved}; saveCart(storage,["D-1"]); return JSON.stringify(loadCart(storage)); })()`), '["D-1"]');
  assert.equal(run('JSON.stringify(loadCart({getItem:()=>"{broken"}))'), '[]');
});

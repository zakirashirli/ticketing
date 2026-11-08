// Optional integration test: install Playwright separately, or set PLAYWRIGHT_MODULE.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4174');
    assert.equal(await page.locator('.seat').count(), 132);
    await page.locator('[data-seat="A-1"]').click();
    assert.equal(await page.locator('.cart-item').count(), 0);
    await page.locator('#add-ticket').click();
    assert.equal(await page.locator('.cart-item').count(), 1);
    assert.equal(await page.locator('#add-ticket').isDisabled(), true);
    await page.locator('[data-seat="D-1"]').click(); await page.locator('#add-ticket').click();
    assert.match(await page.locator('#cart-total').textContent(), /30\.00/);
    await page.getByRole('button', { name: 'Remove A-1', exact: true }).click();
    assert.equal(await page.locator('[data-seat="A-1"]').getAttribute('aria-pressed'), 'false');
    await page.reload(); assert.equal(await page.locator('.cart-item').count(), 1);
    assert.equal(await page.locator('[data-seat="D-1"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-seat="A-3"]').click(); assert.equal(await page.locator('#add-ticket').isDisabled(), true);
    for (const name of ['Zoom in', 'Zoom out', 'Move up', 'Move down', 'Move left', 'Move right', 'Reset / center view']) await page.getByRole('button', { name, exact: true }).click();
    assert.equal(await page.locator('#zoom-level').textContent(), '100%');
    await page.locator('#venue-container').hover(); await page.mouse.wheel(0, -150);
    await page.waitForTimeout(100); assert.equal(await page.locator('#zoom-level').textContent(), '110%');
    const before = await page.locator('#seat-details').textContent();
    const box = await page.locator('[data-seat="E-4"]').boundingBox();
    await page.mouse.move(box.x + 10, box.y + 10); await page.mouse.down(); await page.mouse.move(box.x + 65, box.y + 40, { steps: 8 }); await page.mouse.up();
    assert.equal(await page.locator('#seat-details').textContent(), before);
    await page.getByRole('button', { name: 'Reset / center view', exact: true }).click();
    if (process.env.SCREENSHOT_PATH) await page.screenshot({ path: process.env.SCREENSHOT_PATH, fullPage: true });
    for (const width of [768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 }); await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `horizontal overflow at ${width}`);
      await page.locator('[data-seat="L-1"]').click();
      assert.match(await page.locator('#seat-details').textContent(), /Row L/);
    }
    await page.evaluate(() => localStorage.setItem('lumen:hall01:2026-11-08:1930:v1', '{broken'));
    await page.reload(); assert.equal(await page.locator('.cart-item').count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: inspection, duplicate guards, totals, removal, persistence, unavailable seats, all controls, wheel, drag, responsive widths and corrupt storage.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

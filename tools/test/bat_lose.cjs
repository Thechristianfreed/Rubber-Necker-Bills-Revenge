// usage: node tools/test/bat_lose.cjs <base url> <out.png> [width]
// Payback's losing ending, which neither bot reaches by itself: the chase is cut short
// before anything lands, and the back door is photographed.
const { open, miniOn, tally } = require('./lib.cjs');
(async () => {
  const [base, out, width = '960'] = process.argv.slice(2);
  const { browser, page, errs } = await open(`${base}?auto=clumsy&level=minis&mini=bat`, { width: +width, scale: 2 });
  await miniOn(page, true);
  await page.waitForFunction(() => { const m = window.__rn.mini; if (m.phase === 'chase' && m.t > 0.3) { m.busy = 99; m.left = 1.2; return true; } return false; }, null, { timeout: 60000, polling: 'raf' });
  await page.waitForFunction(() => { const m = window.__rn.mini; if (m && m.phase === 'home' && m.t > 2.5) { window.__game.loop.sleep(); return true; } return false; }, null, { timeout: 60000, polling: 'raf' });
  await page.waitForTimeout(150);
  await page.screenshot({ path: out });
  await page.evaluate(() => { window.__game.loop.wake(); });
  await page.waitForFunction(() => window.__rn.state === 'over', null, { timeout: 60000 });
  console.log(JSON.stringify(await tally(page)), errs.join('\n') || 'no errors');
  await browser.close();
})();

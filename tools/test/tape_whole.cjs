// usage: node tools/test/tape_whole.cjs <base url> <out.png> [bot] [width]
// The whole of Home Movies playing itself, at the narrowest the game goes (880) unless
// told otherwise: which games came up, in what order, how it ended, and every error,
// counting any file that did not load. Run it on the built page (dist-single), where
// the sound files are. The picture is of the end of the tape.
const { open, auto, tally } = require('./lib.cjs');
(async () => {
  const [base, out, bot = '', width = '880'] = process.argv.slice(2);
  const { browser, page, errs } = await open(`${base}${auto(bot)}&level=minis`, { width: +width, sound: true, strict: true });
  await page.waitForFunction(() => window.__rn && window.__rn.scene.key === 'minis', null, { timeout: 40000 });
  const seen = [], t0 = Date.now();
  for (;;) {
    const now = await page.evaluate(() => ({ state: window.__rn.state, mini: window.__rn.playing }));
    if (now.mini && seen[seen.length - 1] !== now.mini) seen.push(now.mini);
    if (now.state === 'over' || Date.now() - t0 > 300000) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: out });
  console.log(seen.join(' > '), JSON.stringify(await tally(page)), 'took', Math.round((Date.now() - t0) / 1000) + 's');
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

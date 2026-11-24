// usage: node tools/test/mini_strip.cjs <base url> <outDir> <mini> [bot] [width] [step] [from] [to]
// The whole of one quick game playing itself: a frame every `step` seconds (0.4) of the
// game's own time, between `from` and `to` if given, each named by its number, the time,
// and the game's phase if it has one. The folder is emptied first. Make a sheet of them
// with sheet.py.
const fs = require('fs');
const { open, auto, miniOn } = require('./lib.cjs');
(async () => {
  const [base, out, mini, bot = '', width = '880', step = '0.4', from = '0', to = '999'] = process.argv.slice(2);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const { browser, page, errs } = await open(`${base}${auto(bot)}&level=minis&mini=${mini}`, { width: +width });
  await miniOn(page, true);
  // (the game's own time: what its update() has been given, which stops while a picture is taken)
  await page.evaluate(() => {
    const m = window.__rn.mini, was = m.update.bind(m);
    window.__total = 0;
    m.update = (dt) => { window.__total += dt; was(dt); };
  });
  let n = 0, last = '';
  for (let want = Math.max(+step, +from); n < 400 && want <= +to; want += +step) {
    const got = await page.waitForFunction((want) => {
      const r = window.__rn, m = r.mini;
      if (!m || r.state !== 'play' || m.phase === 'done') return { over: true };
      if (window.__total >= want) { window.__game.loop.sleep(); return { phase: String(m.phase || ''), t: m.t || 0, total: window.__total }; }
      return false;
    }, want, { timeout: 120000, polling: 'raf' }).then((h) => h.jsonValue());
    if (got.over) break;
    await page.waitForTimeout(50);
    // (its number, the time, and, for a game that has them, its phase and how long it has been in it)
    const name = [String(n++).padStart(3, '0'), got.total.toFixed(1), ...(got.phase ? [got.phase, got.t.toFixed(2)] : [])].join('-');
    await page.screenshot({ path: `${out}/${name}.png` });
    last = name;
    await page.evaluate(() => { window.__game.loop.wake(); });
  }
  console.log('frames', n, 'last', last);
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

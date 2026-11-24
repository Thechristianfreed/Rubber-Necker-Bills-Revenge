// usage: node tools/test/level_play.cjs <url> <outPrefix> <width> <height> <t1,t2,...>
// A level playing itself (put ?auto&level=... on the url): a frame at each of the times
// given (milliseconds from the start), and beside each what the level says is going on:
// its clock, the score, hearts, combo, how many frames a second it is managing.
const { open } = require('./lib.cjs');
(async () => {
  const [url, out, width, height, times] = process.argv.slice(2);
  const { browser, page, errs } = await open(url, { width: +width, height: +height });
  const t0 = Date.now();
  for (const t of times.split(',').map(Number)) {
    await page.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
    await page.screenshot({ path: `${out}-${t}.png` });
    const st = await page.evaluate(() => {
      const s = window.__rn;
      if (!s || s.levelT === undefined) return null;
      return { T: +s.levelT.toFixed(1), whacked: s.whacked, missed: s.missed, total: s.total, hearts: s.hearts, cash: s.cash, combo: s.combo, best: s.bestCombo, perfects: s.perfects, rage: s.rage, over: s.over, fps: Math.round(window.__game.loop.actualFps) };
    });
    console.log(t, JSON.stringify(st));
  }
  console.log(errs.slice(0, 10).join('\n') || 'no errors');
  await browser.close();
})();

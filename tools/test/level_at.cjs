// usage: node tools/test/level_at.cjs <url> <outPrefix> <width> <height> <scale> <T1,T2,...>
// A level playing itself, photographed as its own clock passes each time (seconds of the
// level, not of the wall: the same moment of the level every run). Scale 2 for showing.
const { open } = require('./lib.cjs');
(async () => {
  const [url, out, width, height, scale, times] = process.argv.slice(2);
  const { browser, page, errs } = await open(url, { width: +width, height: +height, scale: +scale });
  for (const t of times.split(',').map(Number)) {
    await page.waitForFunction((tt) => window.__rn && window.__rn.levelT >= tt && window.__rn.hitStop <= 0, t, { timeout: 180000, polling: 25 });
    await page.screenshot({ path: `${out}-${t}.png` });
  }
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

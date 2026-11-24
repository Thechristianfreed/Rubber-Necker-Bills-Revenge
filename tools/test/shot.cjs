// usage: node tools/test/shot.cjs <url> <outPrefix> [width] [height] [t1,t2,...]
// Any page of the game, photographed at each of the times given (milliseconds after it
// has had a moment to load; just once, straight away, if none are given). The plainest
// of these: for the title, the level list, or a level seen at a few moments.
const { open } = require('./lib.cjs');
(async () => {
  const [url, out, width = '960', height = '540', times = '0'] = process.argv.slice(2);
  const { browser, page, errs } = await open(url, { width: +width, height: +height });
  await page.waitForTimeout(1500);
  let last = 0;
  for (const t of times.split(',').map(Number)) {
    await page.waitForTimeout(Math.max(0, t - last));
    last = t;
    await page.screenshot({ path: `${out}-${t}.png` });
  }
  console.log(errs.slice(0, 20).join('\n') || 'no errors');
  await browser.close();
})();

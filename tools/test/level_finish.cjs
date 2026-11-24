// usage: node tools/test/level_finish.cjs <url> <out.png> [width]
// A level played to its end by the bot (put ?auto&level=... on the url), and its results
// page photographed, with the numbers it ended on. A level with a story page before its
// results (the hallway, the sleepover) is tapped through it.
const { open } = require('./lib.cjs');
(async () => {
  const [url, out, width = '1100'] = process.argv.slice(2);
  const { browser, page, errs } = await open(url, { width: +width });
  await page.waitForFunction(() => window.__rn && window.__rn.over, null, { timeout: 240000, polling: 500 });
  const tapped = Date.now();
  while (!(await page.evaluate(() => window.__rn.canRestart)) && Date.now() - tapped < 30000) {
    await page.waitForTimeout(1500);
    if (!(await page.evaluate(() => window.__rn.canRestart))) await page.mouse.click(+width / 2, 270);
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: out });
  const s = await page.evaluate(() => { const s = window.__rn; return { T: +s.levelT.toFixed(1), whacked: s.whacked, missed: s.missed, total: s.total, hearts: s.hearts, cash: s.cash, best: s.bestCombo }; });
  console.log(JSON.stringify(s), errs.join('\n') || 'no errors');
  await browser.close();
})();

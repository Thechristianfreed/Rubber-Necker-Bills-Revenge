// usage: node tools/test/all_scenes.cjs <base url> <outPrefix>
// One frame of the title, the level list, each level a little way in, and a quick game:
// for looking over the whole game after a change to something they share (the art
// loader, the paper, the lettering), or comparing before with after.
const { open } = require('./lib.cjs');
(async () => {
  const [base, out] = process.argv.slice(2);
  const all = [];
  let { browser, page, errs } = await open(base, { width: 1100, touch: true });
  all.push(...errs);
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('title'), null, { timeout: 40000 });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}-0-title.png` });
  await page.mouse.click(660, 300);
  await page.waitForFunction(() => window.__game.scene.isActive('levels'), null, { timeout: 10000 });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}-1-select.png` });
  console.log('textures', await page.evaluate(() => Object.keys(window.__game.textures.list).length));
  await browser.close();
  for (const [i, level, wait] of [[2, 'street', 9000], [3, 'highway', 9000], [4, 'locker', 14000], [5, 'sleepover', 14000], [6, 'minis&mini=phone', 3500]]) {
    ({ browser, page, errs } = await open(`${base}?auto&level=${level}`, { width: 1100, touch: true }));
    await page.waitForFunction(() => window.__rn, null, { timeout: 40000 });
    await page.waitForTimeout(wait);
    await page.screenshot({ path: `${out}-${i}-${level.split('&')[0]}.png` });
    all.push(...errs);
    await browser.close();
  }
  console.log(all.join('\n') || 'no errors');
})();

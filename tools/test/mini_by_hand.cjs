// usage: node tools/test/mini_by_hand.cjs <base url> <outPrefix> <mini> <width> "<condition>" ["<condition>" ...]
// One quick game with nobody at the controls (no bot): a frame each time a condition
// comes true, in the order given. For seeing what a game does when left alone, or what
// it looks like before anything is pressed. Conditions are as for snapper() in lib.cjs.
const { open, miniOn, snapper } = require('./lib.cjs');
(async () => {
  const [base, out, mini, width, ...conds] = process.argv.slice(2);
  const { browser, page, errs } = await open(`${base}?mini=${mini}`, { width: +width });
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('title'), null, { timeout: 40000 });
  await page.waitForTimeout(600);
  await page.evaluate(() => { window.__game.scene.getScene('title').scene.start('minis'); });
  await miniOn(page);
  const snap = snapper(page, out);
  let i = 0;
  for (const cond of conds) await snap(String(i++), cond);
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

// usage: node tools/test/mini_show.cjs <base url> <outPrefix> <mini> [bot] [width]
//   mini: workout | bat | sand | fight (the ones with a list in moments.cjs)
//   bot:  '' for the careful one, or clumsy
// One quick game playing itself, photographed at each of its moments at twice the
// size (for showing), then how the tape ended and any errors.
const { open, auto, miniOn, snapper, tally } = require('./lib.cjs');
const moments = require('./moments.cjs');
(async () => {
  const [base, out, mini, bot = '', width = '960'] = process.argv.slice(2);
  if (!moments[mini]) return console.log(`no moments for "${mini}" in moments.cjs: there are`, Object.keys(moments).join(', '));
  const { browser, page, errs } = await open(`${base}${auto(bot)}&level=minis&mini=${mini}`, { width: +width, scale: 2 });
  await miniOn(page);
  const t0 = Date.now(), snap = snapper(page, out);
  for (const [name, cond] of moments[mini](bot)) await snap(name, cond);
  await page.waitForFunction(() => window.__rn.state === 'over', null, { timeout: 90000 });
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${out}-z-end.png` });
  console.log(JSON.stringify(await tally(page)), 'took', Math.round((Date.now() - t0) / 1000) + 's');
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

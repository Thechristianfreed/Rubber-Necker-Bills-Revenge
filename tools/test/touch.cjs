// usage: node tools/test/touch.cjs <base url> <out.png>
// The first level on a phone held sideways, with real touches: a tap on the title, a tap
// to swing, a finger held on DUCK, and a second finger put down while it is held. Says
// what the game made of each. For anything that changes how touches are read.
const { open } = require('./lib.cjs');
(async () => {
  const [base, out] = process.argv.slice(2);
  const { browser, context, page, errs } = await open(base, { width: 915, height: 412, scale: 2.6, touch: true, mobile: true, strict: true });
  await page.waitForTimeout(1500);
  const cdp = await context.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([id, x, y]) => ({ id, x, y })) });
  const state = () => page.evaluate(() => {
    const g = window.__game, s = window.__rn;
    const active = g.scene.getScenes(true).map((x) => x.scene.key);
    if (!s || !s.bill) return { active };
    return { active, W: g.scale.width, H: g.scale.height, canvas: [g.canvas.clientWidth, g.canvas.clientHeight], duck: s.bill.wantDuck, swingT: +s.bill.swingT.toFixed(3), T: +s.levelT.toFixed(2), whacked: s.whacked };
  });
  const tap = async (x, y) => { await touch('touchStart', [[0, x, y]]); await touch('touchEnd', []); };
  console.log('title', JSON.stringify(await state()));
  await tap(600, 200);
  await page.waitForTimeout(1200);
  console.log('after a tap (the level list)', JSON.stringify(await state()));
  // the first card (the game is 540 tall whatever the screen is: that is the size of one of its pixels here)
  const px = await page.evaluate(() => window.__game.canvas.clientHeight / 540);
  const card = await page.evaluate(() => Math.round(window.__game.scene.getScene('levels').cards[0].x));
  await tap(card * px, 290 * px);
  await page.waitForFunction(() => window.__rn && window.__rn.bill && window.__rn.levelT > 0, null, { timeout: 40000 });
  console.log('after a tap on the first card', JSON.stringify(await state()));
  // a tap on the right-hand side: a swing
  await touch('touchStart', [[0, 620, 180]]);
  await page.waitForTimeout(40);
  console.log('swing', JSON.stringify(await state()));
  await touch('touchEnd', []);
  await page.waitForTimeout(600);
  // a finger held on DUCK (bottom left), and then a second finger down somewhere else while it is
  await touch('touchStart', [[0, 64, 348]]);
  await page.waitForTimeout(200);
  console.log('duck held', JSON.stringify(await state()));
  await touch('touchStart', [[0, 64, 348], [1, 640, 150]]);
  await page.waitForTimeout(60);
  console.log('a second finger down as well', JSON.stringify(await state()));
  await touch('touchEnd', []);
  await page.waitForTimeout(250);
  console.log('both let go', JSON.stringify(await state()));
  await page.screenshot({ path: out });
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

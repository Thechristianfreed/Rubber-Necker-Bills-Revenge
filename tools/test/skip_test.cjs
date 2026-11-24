// usage: node tools/test/skip_test.cjs <base url> <outPrefix>
// The SKIP tag in Home Movies, with nobody playing: it is tapped (real taps, where it is
// on the page) on a card, in the middle of a game, and on through to the end of the tape.
// Says where each tap landed, and whether a best score was kept (it should not be).
const { open, miniOn } = require('./lib.cjs');
(async () => {
  const [base, out] = process.argv.slice(2);
  const { browser, page, errs } = await open(base, { scale: 2 });
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('title'), null, { timeout: 40000 });
  await page.waitForTimeout(600);
  await page.evaluate(() => { localStorage.removeItem('rubber-necker-best-home-movies'); window.__game.scene.getScene('title').scene.start('minis'); });
  await miniOn(page);
  const where = () => page.evaluate(() => { const r = window.__rn; return { playing: r.playing, state: r.state, played: r.played, skipped: r.skipped, counted: r.counted, score: r.score, marks: r.marks.map((m) => m.texture.key.replace('mini_mark', '') || '_'), tag: { x: r.skipAt.x, y: r.skipAt.y, shown: r.skipTag[0].visible } }; });
  const canvas = await page.locator('canvas').boundingBox();
  const tap = async () => { const w = await where(); await page.mouse.click(canvas.x + w.tag.x * canvas.width / 960, canvas.y + w.tag.y * canvas.height / 540); await page.waitForTimeout(120); };
  const games = (await where()).marks.length;
  console.log('start', JSON.stringify(await where()));
  // on the instructions card of the first
  await tap(); console.log('tap 1 (on a card)', JSON.stringify(await where()));
  // in the middle of the second, once it is being played
  await page.waitForFunction(() => window.__rn.state === 'play', null, { timeout: 20000 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}-tag.png` });
  for (let i = 2; i <= games; i++) { await tap(); console.log(`tap ${i}`, JSON.stringify(await where())); }
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${out}-end.png` });
  console.log('best kept:', JSON.stringify(await page.evaluate(() => Object.keys(localStorage).filter((k) => /home-movies/.test(k)).map((k) => k + '=' + localStorage.getItem(k)))));
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

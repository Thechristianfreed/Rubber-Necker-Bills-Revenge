// usage: node tools/test/music_test.cjs <base url> <outPrefix>
// Into each level in turn by tapping its card: how loud the music is coming out a few
// seconds in, which track it is, and whether it stops when the level ends.
const { chromium } = require('playwright');
(async () => {
  const [base, out] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 540 }, deviceScaleFactor: 1, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('requestfailed', (r) => errs.push('request failed: ' + r.url().slice(-60)));
  await page.goto(base);
  await page.waitForTimeout(2600);
  await page.screenshot({ path: out + '-title.png' });
  await page.mouse.click(660, 300);                 // title -> levels
  await page.waitForTimeout(1200);
  const cards = await page.evaluate(() => window.__game.scene.getScene('levels').cards.map((c) => [Math.round(c.x), c.level.id]));
  const loud = () => page.evaluate(async () => {
    const s = window.__sound, c = s.ctx;
    if (!c) return { ctx: 'none' };
    const an = c.createAnalyser(); an.fftSize = 2048; s.music.connect(an);
    await new Promise((r) => setTimeout(r, 700));
    const d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d);
    s.music.disconnect(an);
    return { ctx: c.state, rms: +Math.sqrt(d.reduce((a, v) => a + v * v, 0) / d.length).toFixed(4), ...s.musicState };
  });
  for (const [x, id] of cards) {
    await page.mouse.click(x, 290);
    await page.waitForTimeout(3500);
    console.log(id, JSON.stringify(await loud()));
    // end the level, check the music stops, then go back to the level list
    await page.evaluate(() => { const s = window.__rn; s.pending = []; s.whacked = 1; s.finish('bonked'); });
    await page.waitForTimeout(2600);
    console.log('  after the level:', JSON.stringify(await loud()));
    await page.mouse.click(900, 300);               // results: LEVELS (right half)
    await page.waitForTimeout(1200);
  }
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

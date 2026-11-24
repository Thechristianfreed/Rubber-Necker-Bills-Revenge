// usage: node tools/test/voice_test.cjs <base url>
// Into each level in turn by tapping its card, played through by the bot: which of the
// recorded lines were said and which effects were made, and how often; and, on the
// first level, one line by itself: how loud it is, and whether the music dips under it.
const { chromium } = require('playwright');
(async () => {
  const [base] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 540 }, deviceScaleFactor: 1, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('requestfailed', (r) => errs.push('request failed: ' + r.url().slice(-60)));
  await page.goto(base);
  const active = (key) => page.waitForFunction((k) => window.__game && window.__game.scene.isActive(k), key, { timeout: 30000 });
  await active('title');
  await page.waitForTimeout(400);
  await page.mouse.click(660, 300);                 // title -> levels
  await active('levels');
  await page.waitForTimeout(600);
  // listen in: count what is said and which mouth sounds are made, and meter the two outputs
  const rec = await page.evaluate(async () => {
    const s = window.__sound;
    for (let i = 0; i < 40 && !(s.voice.sound && s.effects.sound); i++) await new Promise((r) => setTimeout(r, 100));
    window.__said = {}; window.__mouth = {};
    const say = s.say.bind(s); s.say = (id, after) => { const n = say(id, after); if (id) window.__said[id] = (window.__said[id] || 0) + (n ? 1 : 0); return n; };
    const mouth = s.mouth.bind(s); s.mouth = (id, ...a) => { const ok = mouth(id, ...a); if (ok) window.__mouth[id] = (window.__mouth[id] || 0) + 1; return ok; };
    const effect = s.effect.bind(s); s.effect = (g, ...a) => { const ok = effect(g, ...a); if (ok) window.__mouth[g + ':' + s.picked[g]] = (window.__mouth[g + ':' + s.picked[g]] || 0) + 1; return ok; };
    return { recording: s.voice.sound ? +s.voice.sound.duration.toFixed(1) : 0, effects: s.effects.sound ? +s.effects.sound.duration.toFixed(1) : 0 };
  });
  console.log('recording loaded:', JSON.stringify(rec));
  // one line on its own: is it heard, and does the music dip under it?
  const cards = await page.evaluate(() => window.__game.scene.getScene('levels').cards.map((c) => [Math.round(c.x), c.level.id]));
  for (const [x, id] of cards) {
    await page.mouse.click(x, 290);
    await page.waitForTimeout(3200);
    if (id === 'street') {
      const one = await page.evaluate(async () => {
        const s = window.__sound, c = s.ctx;
        const an = c.createAnalyser(); an.fftSize = 2048; s.voiceOut.connect(an);
        const before = s.music.gain.value;
        s.say('piss_rope', 0);
        await new Promise((r) => setTimeout(r, 900));
        const d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d);
        const during = s.music.gain.value;
        await new Promise((r) => setTimeout(r, 3200));
        s.voiceOut.disconnect(an);
        return { voiceRms: +Math.sqrt(d.reduce((a, v) => a + v * v, 0) / d.length).toFixed(3), musicBefore: +before.toFixed(2), musicDuring: +during.toFixed(2), musicAfter: +s.music.gain.value.toFixed(2) };
      });
      console.log('a line by itself:', JSON.stringify(one));
    }
    await page.evaluate(() => { window.__rn.auto = 'good'; });
    await page.waitForFunction(() => window.__rn.over, null, { timeout: 120000 });
    await page.waitForTimeout(id === 'locker' ? 9000 : 3500);
    const st = await page.evaluate(() => ({ whacked: window.__rn.whacked, total: window.__rn.total, said: window.__said, mouth: window.__mouth }));
    console.log(id, JSON.stringify(st));
    await page.evaluate(() => { window.__said = {}; window.__mouth = {}; });
    await page.mouse.click(900, 300);               // story page (if any) / results: LEVELS
    await page.waitForTimeout(1500);
    const where = await page.evaluate(() => window.__game.scene.getScenes(true).map((s) => s.scene.key));
    if (!where.includes('levels')) { await page.mouse.click(900, 300); await page.waitForTimeout(3200); await page.mouse.click(900, 300); await page.waitForTimeout(1500); }
  }
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

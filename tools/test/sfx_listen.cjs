// usage: node tools/test/sfx_listen.cjs <base url>
// The recorded effects, one at a time: every take in each bank (the hits, the clunks,
// the stretches, the springs) and the three mouth sounds, each by its loudest 46 ms on
// the effects channel. For leveling the banks against each other after make_sfx.py has
// been changed; a take much quieter or louder than the rest of its bank shows up here.
const { open, tapIn } = require('./lib.cjs');
(async () => {
  const [base] = process.argv.slice(2);
  const { browser, page, errs } = await open(base, { width: 1100, touch: true, sound: true });
  await tapIn(page);
  const out = await page.evaluate(async () => {
    const s = window.__sound, c = s.ctx;
    const an = c.createAnalyser(); an.fftSize = 2048; s.sfx.connect(an);
    const buf = new Float32Array(an.fftSize);
    const hear = async (play) => {
      s.last = {}; play();
      let top = 0;
      for (let i = 0; i < 80; i++) {
        await new Promise((r) => setTimeout(r, 10));
        an.getFloatTimeDomainData(buf);
        top = Math.max(top, Math.sqrt(buf.reduce((a, v) => a + v * v, 0) / buf.length));
      }
      await new Promise((r) => setTimeout(r, 900));
      return +top.toFixed(3);
    };
    const res = {};
    for (const g of ['hit', 'clunk', 'stretch', 'spring']) {
      res[g] = [];
      const n = { hit: 9, clunk: 3, stretch: 9, spring: 9 }[g];
      // (each take in turn: the game picks one at random, so the dice are loaded for it)
      for (let i = 0; i < n; i++) res[g].push(await hear(() => { s.picked[g] = (i + n - 1) % n; const r = Math.random; Math.random = () => (i + 0.5) / n; s.effect(g, 1, g === 'hit' ? 0.9 : g === 'clunk' ? 0.85 : g === 'spring' ? 0.7 : 0.9); Math.random = r; }));
    }
    res.mouth_bonk = await hear(() => s.mouth('fx_bonk', 1, 0.95));
    res.mouth_boing = await hear(() => s.mouth('fx_boing', 1, 0.75));
    res.mouth_whoosh = await hear(() => s.mouth('fx_whoosh', 1, 0.7));
    res.loaded = { effects: !!s.effects.sound, voice: !!s.voice.sound };
    return res;
  });
  console.log(JSON.stringify(out, null, 1));
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

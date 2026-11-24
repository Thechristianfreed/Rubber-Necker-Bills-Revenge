// usage: node tools/test/listen.cjs <base url> [where] "<call>" [ms] ["<call>" [ms] ...]
//   where: master (everything, the default) | sfx | music | voiceOut
//   call:  JavaScript that makes the sound, with `s` the game's sound: "s.aww()"
//   ms:    how long to listen to it for (1000 if not given)
// e.g.  node tools/test/listen.cjs http://localhost:5180/ "s.aww()" 2200 "s.sand()" 500
//
// How loud sounds actually come out, each played by itself. Every sound is measured by
// its loudest 46 ms (2048 samples), which is what a short sound is leveled by: not by its
// peak. The first row is always the mouth "bonk", for something known to put it beside
// (about 0.17 at the master). Also says when the loudest part came, the strongest pitch
// then, and the level through time. Run it on the built page, where the recordings are.
const { open, tapIn } = require('./lib.cjs');
(async () => {
  const args = process.argv.slice(2), base = args.shift();
  const where = ['master', 'sfx', 'music', 'voiceOut'].includes(args[0]) ? args.shift() : 'master';
  const calls = [["s.mouth('fx_bonk', 1, 0.95)", 500]];
  while (args.length) {
    const call = args.shift();
    calls.push([call, /^\d+$/.test(args[0] || '') ? +args.shift() : 1000]);
  }
  const { browser, page, errs } = await open(base, { width: 1100, touch: true, sound: true });
  await tapIn(page, 3000);
  const heard = await page.evaluate(async ({ where, calls }) => {
    const s = window.__sound, c = s.ctx;
    const an = c.createAnalyser(); an.fftSize = 2048; s[where].connect(an);
    const buf = new Float32Array(an.fftSize), spec = new Float32Array(an.frequencyBinCount);
    const out = { measured_at: where, loaded: { effects: !!(s.effects && s.effects.sound), voice: !!(s.voice && s.voice.sound) } };
    for (const [call, ms] of calls) {
      try { new Function('s', call)(s); } catch (e) { out[call] = 'failed: ' + e.message; continue; }
      let top = 0, at = 0, hz = 0; const seen = [];
      for (let i = 0; i < ms / 20; i++) {
        await new Promise((r) => setTimeout(r, 20));
        an.getFloatTimeDomainData(buf);
        const v = Math.sqrt(buf.reduce((a, x) => a + x * x, 0) / buf.length);
        if (v > top) {
          top = v; at = i * 20;
          an.getFloatFrequencyData(spec);
          let best = 0; for (let k = 1; k < spec.length; k++) if (spec[k] > spec[best]) best = k;
          hz = Math.round(best * c.sampleRate / an.fftSize);
        }
        seen.push(+v.toFixed(2));
      }
      await new Promise((r) => setTimeout(r, 600));
      out[call] = { loudest: +top.toFixed(3), at_ms: at, strongest_hz: hz, over_time: seen.filter((_, i) => i % 5 === 0).join(' ') };
    }
    return out;
  }, { where, calls });
  console.log(JSON.stringify(heard, null, 1));
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

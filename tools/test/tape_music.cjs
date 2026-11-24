// usage: node tools/test/tape_music.cjs <base url>
// Which music plays under which quick game, as Home Movies plays itself: for each game,
// the track that was asked for, the one actually playing and how long it is, and which
// tracks are being kept decoded. For a game that is given music of its own.
//
// It goes in the way a person does, by a tap on the title: opened straight into Home
// Movies, the first game asks for its music before any tap has allowed sound, and has none.
const { open, tapIn, miniOn } = require('./lib.cjs');
(async () => {
  const [base] = process.argv.slice(2);
  const { browser, page, errs } = await open(base, { width: 1100, touch: true, sound: true });
  await tapIn(page, 1500);
  await page.evaluate(() => { window.__game.scene.getScene('levels').scene.start('minis'); });
  await miniOn(page);
  // (and then the bot is put at the controls)
  await page.evaluate(() => { const r = window.__rn; r.auto = 'good'; r.host.auto = 'good'; });
  const seen = {}, order = [];
  for (let i = 0; i < 700; i++) {
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => ({ game: window.__rn.playing, state: window.__rn.state, music: window.__sound.musicState, kept: window.__sound.decoded.map((d) => `${d.track}:${Math.round(d.seconds)}`) }));
    if (st.state === 'over') break;
    if (st.state !== 'play') continue;
    const key = `${st.game}: wanted ${st.music.wanted}, playing ${st.music.playing || '-'} (${Math.round(st.music.seconds)}s), kept ${st.kept.join('+')}`;
    if (!seen[key]) order.push(key);
    seen[key] = (seen[key] || 0) + 1;
  }
  for (const k of order) console.log(seen[k], k);
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

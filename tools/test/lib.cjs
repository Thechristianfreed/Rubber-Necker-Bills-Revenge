// What the self-play scripts share: opening the game in a browser with nobody
// watching, and taking a picture of one moment of a quick game.
//
// They need Playwright and a Chromium for it, found with require('playwright').
// A Claude cloud session comes with both. Do not add Playwright to package.json:
// a second copy would not find that browser.
const { chromium } = require('playwright');

// drawn in software, so that WebGL works on a machine with no graphics card
const FLAGS = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
// ...and sound allowed without anybody having tapped the page
const SOUND = '--autoplay-policy=no-user-gesture-required';

/** Open a page of the game. Returns the browser, the page, and the list its errors are put on.
 *  `scale` 2 is for pictures a person will look at; `strict` also counts files that failed to
 *  load (use it on the built page, where every sound file should be there). */
async function open(url, { width = 960, height = 540, scale = 1, touch = false, sound = false, strict = false, mobile = false } = {}) {
  const browser = await chromium.launch({ args: sound ? [...FLAGS, SOUND] : FLAGS });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, hasTouch: touch, isMobile: mobile });
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && (strict || !/Failed to load resource/.test(m.text()))) errs.push(m.text()); });
  if (strict) page.on('requestfailed', (r) => errs.push('failed ' + r.url()));
  if (url) await page.goto(url);
  return { browser, context, page, errs };
}

/** What to put on the address for the game to play itself: the careful bot, or 'clumsy'. */
const auto = (bot) => `?auto${bot ? '=' + bot : ''}`;

/** Wait for the title screen, and tap it: into the list of levels, with sound allowed from then on. */
async function tapIn(page, settle = 2500) {
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('title'), null, { timeout: 40000 });
  await page.waitForTimeout(400);
  const box = await page.locator('canvas').boundingBox();
  await page.mouse.click(box.x + box.width * 0.6, box.y + box.height * 0.55);
  await page.waitForTimeout(settle);
}

/** Wait until Home Movies has a quick game up (and, if `playing`, until it is being played). */
const miniOn = (page, playing = false) => page.waitForFunction((playing) => {
  const r = window.__rn;
  return r && r.scene.key === 'minis' && r.mini && (!playing || r.state === 'play');
}, playing, { timeout: 40000 });

// For the conditions below: what somebody is saying, and what is in a close-up.
const HELPERS = `
  const keyOf = (o) => o.texture && o.texture.key;
  const said = (text) => (m.said || []).some((b) => b.box.list[1].text.replace(/\\n/g, ' ').includes(text));
  const piece = (k) => { for (const o of m.shot || []) { if (keyOf(o) === k) return o; if (o.list) { const c = o.list.find((c) => keyOf(c) === k); if (c) return c; } } };
  const inShot = (k) => (m.shot || []).find((o) => keyOf(o) === k || (o.list && o.list.some((c) => keyOf(c) === k)));
  const word = (w) => r.children.list.some((o) => keyOf(o) === 'word_' + w && o.alpha >= 1 && Math.abs(o.scale - 0.5) < 0.02);
`;

/** A camera for one quick game. `snap(name, condition)` waits for the condition, stops the
 *  game's clock, saves `<out>-<name>.png`, and lets the game go on. The condition is
 *  JavaScript, with `m` the game being played and `r` the scene (and said(), piece(),
 *  inShot() and word() from above). If the game ends first it says so and carries on.
 *
 *  Write conditions about what is on the page (a pose, a flag, something being said), not
 *  about the game's clock alone: stopping the clock for a picture makes times drift. */
function snapper(page, out) {
  return async (name, cond, timeout = 90000) => {
    const got = await page.waitForFunction(`(() => {
      const r = window.__rn, m = r && r.mini;
      if (!m || r.state === 'over' || r.state === 'stamp') return 'gone';
      ${HELPERS}
      if (r.state === 'play' && (${cond})) { window.__game.loop.sleep(); return 'yes'; }
      return false;
    })()`, null, { timeout, polling: 'raf' }).then((h) => h.jsonValue()).catch((e) => 'failed: ' + e.message.split('\n')[0]);
    if (got !== 'yes') {
      console.log('missed', name, `(${got})`);
      return false;
    }
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${out}-${name}.png` });
    await page.evaluate(() => { window.__game.loop.wake(); });
    return true;
  };
}

/** How the tape stands: what is cleared, what counted, and the mark for each game. */
const tally = (page) => page.evaluate(() => {
  const r = window.__rn;
  return { state: r.state, score: r.score, counted: r.counted, marks: r.marks.map((m) => m.texture.key.replace('mini_mark', '') || '_') };
});

module.exports = { chromium, FLAGS, SOUND, open, auto, tapIn, miniOn, snapper, tally };

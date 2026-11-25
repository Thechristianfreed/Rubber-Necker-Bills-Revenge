// usage: node tools/test/faces.cjs <base url> <outPrefix> [who ...]
// Everybody's faces, in the game: every look each person has, put on the page by the same
// two calls a quick game uses (head() and setLook() in src/minis/shared/people.ts), a page
// for each person: the fifteen, and then the faces that are only theirs (on a darker label).
// Under each head is its name; a head with a second name in brackets is one that person has
// not got, standing in with the nearest they have.
// It also changes one head through every look and says how far its chin moved: nothing.
const { open } = require('./lib.cjs');

(async () => {
  const [base, out, ...only] = process.argv.slice(2);
  const { browser, page, errs } = await open(base, { width: 1240, scale: 2 });
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('title') && window.__people, null, { timeout: 60000 });
  await page.waitForTimeout(600);
  const people = await page.evaluate(() => window.__people.PEOPLE);
  for (const who of only.length ? only : people) {
    const report = await page.evaluate((who) => {
      const P = window.__people, game = window.__game;
      const scene = game.scene.getScene('title');
      scene.children.list.slice().forEach((o) => o.setVisible(false));
      scene.tweens.pauseAll();
      const made = [];
      const seen = scene.cameras.main.worldView, W = seen.width, cols = 7, tall = 84;
      const own = P.ownLooks(who), all = [...P.LOOKS, ...own];
      made.push(scene.add.rectangle(seen.centerX, 270, W + 40, 560, 0x5c7868).setDepth(900));
      made.push(scene.add.text(seen.x + 16, 10, `${who}: ${P.LOOKS.filter((l) => P.hasLook(who, l)).length} of the ${P.LOOKS.length} looks, and ${own.length} of ${who === 'stephanie' ? 'her' : 'his'} own`, { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' }).setDepth(902));
      all.forEach((look, i) => {
        const x = seen.x + (W / cols) * (i % cols + 0.5), y = 132 + Math.floor(i / cols) * 166;
        made.push(P.head(scene, who, look, x, y, tall).setDepth(901));
        const got = P.face(who, look).split('_').pop();
        made.push(scene.add.text(x, y + 54, got === look ? look : `${look} (${got})`, { fontFamily: 'sans-serif', fontSize: '13px', color: got === look ? '#ffffff' : '#ffe680', backgroundColor: own.includes(look) ? '#2b3a55' : '#3f5548', padding: { x: 4, y: 1 } }).setOrigin(0.5, 0).setDepth(902));
      });
      // one head through every look: its chin stays put, and so do its size and its tilt
      const one = P.head(scene, who, 'calm', -500, -500, 70).setAngle(12).setFlipX(true);
      const moved = all.map((look) => { P.setLook(one, who, look); return Math.hypot(one.x + 500, one.y + 500) + Math.abs(one.scaleY * 2 * window.__art[one.texture.key].h / P.headsTall(who, look) - 70) + Math.abs(one.angle - 12) + (one.flipX ? 0 : 1); });
      one.destroy();
      window.__made = made;
      return { moved: Math.max(...moved), missing: P.LOOKS.filter((l) => !P.hasLook(who, l)) };
    }, who);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${out}-${who}.png` });
    console.log(`${who}: missing ${report.missing.join(', ') || 'none'}; changing looks moved the head ${report.moved.toFixed(3)}`);
    await page.evaluate(() => { window.__made.forEach((o) => o.destroy()); });
  }
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

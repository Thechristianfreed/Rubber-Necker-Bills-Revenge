// usage: node tools/test/textures.cjs <base url> <out.json>
//        node tools/test/textures.cjs --diff <before.json> <after.json>
// Every picture the game has made by the time the title is up (each paper drawing, each
// photo cutout, each strip): its name, its size, and a fingerprint of what is in it.
// Taken before a change and again after, the two are compared with --diff: anything
// that is gone, new, a different size or a different picture is listed. Nothing
// listed means no picture anybody already had has been touched.
const fs = require('fs');
(async () => {
  const args = process.argv.slice(2);
  if (args[0] === '--diff') {
    const [a, b] = [args[1], args[2]].map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
    const gone = Object.keys(a).filter((k) => !(k in b)), added = Object.keys(b).filter((k) => !(k in a));
    const resized = Object.keys(a).filter((k) => k in b && (a[k].w !== b[k].w || a[k].h !== b[k].h));
    const changed = Object.keys(a).filter((k) => k in b && !resized.includes(k) && a[k].print !== b[k].print && a[k].print !== 'by chance' && b[k].print !== 'by chance');
    console.log(`${Object.keys(a).length} before, ${Object.keys(b).length} after`);
    for (const [what, list] of [['gone', gone], ['new', added], ['a different size', resized], ['a different picture', changed]]) {
      console.log(`${what}: ${list.length}${list.length ? '  ' + list.join(', ') : ''}`);
    }
    process.exit(gone.length || resized.length || changed.length ? 1 : 0);
  }
  const { open } = require('./lib.cjs');
  const [base, out] = args;
  const { browser, page, errs } = await open(null, { width: 960 });
  const read = async () => {
    await page.goto(base);
    await page.waitForFunction(() => window.__game && window.__game.scene.isActive('title'), null, { timeout: 60000 });
    await page.waitForTimeout(500);
    return page.evaluate(() => {
      const found = {}, small = document.createElement('canvas');
      small.width = small.height = 48;
      const c = small.getContext('2d', { willReadFrequently: true });
      for (const [key, texture] of Object.entries(window.__game.textures.list)) {
        const image = texture.source[0] && texture.source[0].image;
        // (not Phaser's own, and not the nameless ones it makes for lettering)
        if (!image || key.startsWith('__') || /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(key)) continue;
        let print = '';
        try {
          // shrunk to 48 by 48 and every value in it folded together: enough to tell two pictures apart
          c.clearRect(0, 0, 48, 48);
          c.drawImage(image, 0, 0, 48, 48);
          const d = c.getImageData(0, 0, 48, 48).data;
          let h = 2166136261;
          for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619) >>> 0;
          print = h.toString(16);
        } catch (e) { print = 'unreadable'; }
        found[key] = { w: texture.source[0].width, h: texture.source[0].height, print };
      }
      return found;
    });
  };
  // read twice: a picture that is drawn by chance (the snow on the television) comes out
  // different each time, and is marked so, to be left out of the comparing
  const list = await read(), again = await read();
  const chance = Object.keys(list).filter((k) => again[k] && again[k].print !== list[k].print);
  for (const k of chance) list[k].print = 'by chance';
  fs.writeFileSync(out, JSON.stringify(list, null, 1));
  console.log(out, Object.keys(list).length, 'pictures', chance.length ? `(drawn by chance, not compared: ${chance.join(', ')})` : '');
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

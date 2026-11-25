// usage: node tools/test/catalogue.cjs <base url> [out folder: docs/catalogue]
// The catalogue: every picture the game has, by the name a game calls it by, sorted into
// what it is (places, things, cars, people, effects, words, the interface), as sheets of
// small labelled pictures and a list. It is made from the game as it runs, so nothing in
// it is out of date or left out: run it again whenever pictures are added, and commit
// what it writes. docs/pictures.md says how to use what is in it.
const fs = require('fs');
const path = require('path');
const { open } = require('./lib.cjs');

// What goes where: the first of these a name fits. Anything a quick game with a folder of
// its own has made (its pictures are all called "<id>_...") gets a section of its own
// after these; whatever is left over comes last.
const GROUPS = [
  ['places', 'Places', 'Backdrops, and the strips some of them are made of. Each place is laid with one call: `src/minis/shared/places.ts`.',
    /^(gym|gym_floor|gym_wall|gym_banner|den|den_wall|den_carpet|tape_room|tv_set|tv_lines|tv_snow|hallway|hall_wall|hall_floor|lockers|locker_open|postcard|asphalt|rail|hills|houses|fence|sidewalk|kerb|lawn|grass|line_white|line_yellow|skydots|cloud|sun|rec_.*|yard_sky|yard_sky_photo|yard_ground|yard_fence|yard_grass|yard_house|yard_cloud|yard_sun|sand_close|sandbox|sandbox_front|sandbox_near|sandbox_photo)$/],
  ['things', 'Things', 'What can be put in a place, picked up, thrown or broken.',
    /^(yard_swing|yard_pool|yard_line|yard_bush|yard_tree|bleachers|bake_table|hoop|cupcake|plank|sand_bucket|sand_shovel|sandcastle|sand_heap|sand_pile|sand_blob|sand_clump|sand_speck|hand_grab|hand_throw|jar|shake|book|splat\d|blob|paper_roll|mailbox.*|birdhouse|tree|palm|cone|billboard\d|sign\d|phone|phone_glow|armphone|bat|rock|cal_page|switch_on|switch_off|cassette|crack)$/],
  ['cars', 'Cars', 'From the highway. A photo one and a paper one of most.',
    /^(bug|bus|bus_photo|sedan.*|pickup.*|van.*|wagon.*|wreck)$/],
  ['bodies', 'People: bodies', 'Each is one pose. The family\'s have no heads: a face is hung on by the chin (`docs/characters.md`).',
    /^(bill_rest|bill_swing|bill_windup|kid_rest|kid_swing|kid_windup|kid_duck|teen_.*|pose_(bill|mom)_.*|cheer_.*|rival_.*|chad_.*|shane_.*|pair_.*|batmom_akimbo|mom_below|mom_forearm|mailman.*|alex_dad|dj_.*|kid_christian|kid_forrest|kid_neil|neil_arm)$/],
  ['faces', 'People: faces', 'The family\'s heads. Who has which look, and which are missing, is in `docs/characters.md`.',
    /^(bill-.*|bill_in|bill_hold|bill_pah|mom_(smile|in|pah|hold|scold|big_.*)|chadhead_.*|chadbighead_.*|shanehead_.*|shanebighead_.*)$/],
  ['cast', 'People: everybody\'s faces', 'One set for each of the family, every look the same size and hung from the same chin: `head(scene, \'chad\', \'guilty\', x, y, 62)` in `src/minis/shared/people.ts`. Who has which is in `docs/characters.md`.',
    /^face_.*$/],
  ['gawkers', 'The rubberneckers, and the animals', 'Twelve heads, each gawking and dazed, with a neck the colour of each; the dog; the bluebirds; and the family\'s own animals, from their photos: Roger the dog and The Grump the opossum.',
    /^(head\d+(_dazed)?|neck.*|dog|dog_mad|bird_.*|roger_.*|grump_.*)$/],
  ['effects', 'Effects', 'Small things that fly, flash or float.',
    /^(star|star_big|star_big_off|puff|burst|spark|sparkle|heart|heart_off|tear|steam|zzz|halo|aura|alert|dash|shadow|speed_lines|shred_.*|eyes|breath|zone|edge)$/],
  ['words', 'Words on bursts', 'Shown with `this.host.word(\'bonk\', x, y)`: the name without "word_".',
    /^(word_.*|stamp_.*)$/],
  ['interface', 'The interface', 'Buttons, tape, meters and marks.',
    /^(btn_.*|fight_btn.*|choice_x|meter.*|mini_mark.*|pose_card.*|snd_.*|tag|tape_[sml]|title_.*|you_are|lungs)$/],
];
const COLS = 6, TILE_W = 210, PIC_H = 150, LABEL_H = 40, ROWS = 7;

(async () => {
  const [base, outArg] = process.argv.slice(2);
  const out = path.resolve(outArg || path.join(__dirname, '../../docs/catalogue'));
  const games = fs.readdirSync(path.join(__dirname, '../../src/minis'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(__dirname, '../../src/minis', d.name, 'index.ts'))).map((d) => d.name);
  const { browser, page, errs } = await open(base, { width: 960 });
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('title') && window.__art, null, { timeout: 60000 });
  await page.waitForTimeout(500);

  // every picture: its name, how big it is drawn (in the game's own pixels), and whether it is a strip
  const pictures = await page.evaluate(() => {
    const list = [];
    for (const [key, texture] of Object.entries(window.__game.textures.list)) {
      const src = texture.source[0];
      if (!src || !src.image || key.startsWith('__') || /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(key)) continue;
      const a = window.__art[key];
      list.push({ key, w: Math.round(a ? a.w : src.width / 2), h: Math.round(a ? a.h : src.height / 2), strip: !!(a && a.tex !== undefined), file: (window.__from || {})[key] || '' });
    }
    return list.sort((x, y) => x.key.localeCompare(y.key, 'en', { numeric: true }));
  });

  // the file as it really is: the code calls every cutout "name.png", and what is kept is "name.webp"
  const root = path.join(__dirname, '../..');
  for (const p of pictures) {
    if (!p.file) continue;
    const webp = p.file.replace(/\.png$/, '.webp');
    p.file = fs.existsSync(path.join(root, webp)) ? webp : p.file;
  }
  const sections = GROUPS.map(([slug, title, note]) => ({ slug, title, note, items: [] }));
  const own = new Map(), rest = { slug: 'other', title: 'Everything else', note: 'Not sorted yet: add a rule for these in `tools/test/catalogue.cjs`.', items: [] };
  for (const p of pictures) {
    const at = GROUPS.findIndex(([, , , fits]) => fits.test(p.key));
    if (at >= 0) { sections[at].items.push(p); continue; }
    const game = games.find((g) => p.key.startsWith(`${g}_`) || p.key.startsWith(`word_${g}_`));
    if (!game) { rest.items.push(p); continue; }
    if (!own.has(game)) own.set(game, { slug: `game-${game}`, title: `The quick game "${game}"`, note: `Made by \`src/minis/${game}\`, and kept in its folder.`, items: [] });
    own.get(game).items.push(p);
  }
  const all = [...sections, ...own.values(), rest].filter((s) => s.items.length);

  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  let md = '# The catalogue\n\nEvery picture the game has, by the name a game calls it by. **Made by `tools/test/catalogue.cjs`: do not edit by hand.** Run it again when pictures are added. How to use what is here: `docs/pictures.md`.\n\n'
    + 'The size is how big the picture is drawn, in the game\'s own pixels (the page is 540 of them tall). A strip repeats to fill a width. '
    + 'The file is the finished cutout the picture is made from; one with no file is cut from paper, in code.\n\n'
    + all.map((s) => `- [${s.title}](#${s.slug}) (${s.items.length})`).join('\n') + '\n';

  for (const section of all) {
    md += `\n<a id="${section.slug}"></a>\n\n## ${section.title}\n\n${section.note}\n\n`;
    const per = COLS * ROWS;
    for (let n = 0; n * per < section.items.length; n++) {
      const part = section.items.slice(n * per, (n + 1) * per);
      const file = `${section.slug}${section.items.length > per ? '-' + (n + 1) : ''}.jpg`;
      const data = await page.evaluate(({ part, COLS, TILE_W, PIC_H, LABEL_H }) => {
        const rows = Math.ceil(part.length / COLS);
        const sheet = document.createElement('canvas');
        sheet.width = COLS * TILE_W;
        sheet.height = rows * (PIC_H + LABEL_H) + 8;
        const c = sheet.getContext('2d');
        c.fillStyle = '#5c7868';
        c.fillRect(0, 0, sheet.width, sheet.height);
        c.imageSmoothingQuality = 'high';
        part.forEach((p, i) => {
          const x = (i % COLS) * TILE_W, y = Math.floor(i / COLS) * (PIC_H + LABEL_H) + 8;
          const image = window.__game.textures.get(p.key).source[0].image;
          // as big as fits, and small things up to three times their size so that they can be seen
          const k = Math.min((TILE_W - 22) / image.width, (PIC_H - 12) / image.height, (3 * p.w) / image.width || 1);
          const w = image.width * k, h = image.height * k;
          c.drawImage(image, x + (TILE_W - w) / 2, y + (PIC_H - h) / 2, w, h);
          c.fillStyle = '#ffffff';
          c.font = 'bold 14px ui-monospace, Menlo, Consolas, monospace';
          let name = p.key;
          while (c.measureText(name).width > TILE_W - 12 && name.length > 4) name = name.slice(0, -2) + '…';
          c.fillText(name, x + 8, y + PIC_H + 14);
          c.fillStyle = '#d8e6c8';
          c.font = '12px ui-monospace, Menlo, Consolas, monospace';
          c.fillText(`${p.w} x ${p.h}${p.strip ? '  strip' : ''}`, x + 8, y + PIC_H + 30);
        });
        return sheet.toDataURL('image/jpeg', 0.82);
      }, { part, COLS, TILE_W, PIC_H, LABEL_H });
      fs.writeFileSync(path.join(out, file), Buffer.from(data.split(',')[1], 'base64'));
      md += `![${section.title}${section.items.length > per ? `, sheet ${n + 1}` : ''}](${file})\n\n`;
    }
    md += '| Name | Size | | File |\n| --- | --- | --- | --- |\n' + section.items.map((p) => `| \`${p.key}\` | ${p.w} x ${p.h} | ${p.strip ? 'strip' : ''} | ${p.file ? `\`${p.file}\`` : 'paper'} |`).join('\n') + '\n';
  }
  fs.writeFileSync(path.join(out, 'README.md'), md);
  const files = fs.readdirSync(out);
  console.log(`${pictures.filter((p) => p.file).length} are photos, each with its file; ${pictures.filter((p) => !p.file).length} are cut from paper in code`);
  console.log(`${pictures.length} pictures in ${all.length} sections: ${all.map((s) => `${s.slug} ${s.items.length}`).join(', ')}`);
  console.log(`${files.length} files in ${path.relative(process.cwd(), out)}, ${(files.reduce((n, f) => n + fs.statSync(path.join(out, f)).size, 0) / 1e6).toFixed(1)} MB`);
  if (rest.items.length) console.log('not sorted:', rest.items.map((p) => p.key).join(', '));
  console.log(errs.join('\n') || 'no errors');
  await browser.close();
})();

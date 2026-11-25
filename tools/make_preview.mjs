// Build the page that gets published as a preview.
//
//   node tools/make_preview.mjs <out.html>                the whole game (the master preview)
//   node tools/make_preview.mjs <out.html> --only sand    one quick game by itself
//
// A page built with --only goes from the title straight into that game, and it
// is the only one on the tape: it is what a chat that is making one game shows
// the owner. It is published as an artifact OF ITS OWN, never to the master
// preview's address (see CLAUDE.md).
//
// The pictures are taken out of the page (tools/pack_pictures.mjs) and left in
// dist-single/pictures, as the recordings are in dist-single/music, voice and
// sfx: all of those are published beside the page. What has to go with it is
// listed at the end.
//
// Either way dist-single/ is left holding that build: build again without
// --only before testing the whole tape. dist-single/index.html is the same
// page, to test: serve dist-single and open it.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const at = args.indexOf('--only');
const only = at >= 0 ? args[at + 1] : '';
const out = args.find((a, i) => !a.startsWith('--') && (at < 0 || i !== at + 1));
if (!out || (at >= 0 && !only)) {
  console.error('usage: node tools/make_preview.mjs <out.html> [--only <game>]');
  process.exit(1);
}
const games = readdirSync('src/minis', { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(`src/minis/${d.name}/index.ts`)).map((d) => d.name);
if (only && !games.includes(only)) {
  console.error(`there is no quick game called "${only}": there are ${games.join(', ')}`);
  process.exit(1);
}

// (a page for one game is stamped with when it was built, for its title: the whole game has its version number)
const built = only ? new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) + ' UTC' : '';
execSync('npm run build:single', { stdio: 'inherit', env: { ...process.env, VITE_ONLY_MINI: only, VITE_BUILT: built } });
execSync('node tools/pack_pictures.mjs', { stdio: 'inherit' });
execSync(`node tools/make_artifact.mjs "${out}"`, { stdio: 'inherit' });
// The page may be 16 MB and no more, and every picture is inside it.
const mb = statSync(resolve(out)).size / 1e6;
console.log(`${mb.toFixed(1)} MB of the 16 MB a page may be${mb > 14 ? ': NEARLY FULL. Tell the owner before adding more pictures (docs/minigames.md, "How much room there is")' : ''}`);
// what is published beside it: the pictures always (a file that has not changed keeps its name,
// and the artifact keeps the file), the recordings when it is the first time or one has changed
const beside = (folder) => (existsSync(`dist-single/${folder}`) ? readdirSync(`dist-single/${folder}`).map((f) => `${folder}/${f}`) : []);
console.log('\nBeside the page (each from dist-single/<the same path>):');
console.log('  pictures (application/json):', beside('pictures').join(', '));
console.log('  recordings (audio/mpeg):', [...beside('music'), ...beside('voice'), ...beside('sfx')].join(', '));
console.log('  Files called pictures/... that the artifact has from before, and are not in this list, can be taken away (null).\n');
if (only) {
  // its own name, so that it is not taken for the whole game in a list of previews
  const file = resolve(out), name = only.charAt(0).toUpperCase() + only.slice(1);
  writeFileSync(file, readFileSync(file, 'utf8').replace(/<title>[\s\S]*?<\/title>/, `<title>${name} Game Preview</title>`));
  console.log(`only the quick game "${only}", built ${built}`);
  console.log('publish it as an artifact of its own: never to the address of the whole game');
} else {
  console.log('the whole game');
}

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
// Either way dist-single/ is left holding that build, with the recordings
// beside it: build again without --only before testing the whole tape.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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
execSync(`node tools/make_artifact.mjs "${out}"`, { stdio: 'inherit' });
if (only) {
  // its own name, so that it is not taken for the whole game in a list of previews
  const file = resolve(out), name = only.charAt(0).toUpperCase() + only.slice(1);
  writeFileSync(file, readFileSync(file, 'utf8').replace(/<title>[\s\S]*?<\/title>/, `<title>${name} Game Preview</title>`));
  console.log(`only the quick game "${only}", built ${built}`);
  console.log('publish it as an artifact of its own: never to the address of the whole game');
} else {
  console.log('the whole game');
}

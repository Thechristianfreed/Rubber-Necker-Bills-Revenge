// Before work goes back to the main line: what has this branch changed, and is
// any of it somebody else's?
//
//   node tools/check_branch.mjs [base]        (base: origin/main, unless given)
//
// Every quick game is a folder in src/minis, and a chat that is making one keeps
// to its own. This lists what the branch has changed since it left the base
// (and anything not yet committed), sorted into:
//
//   YOURS    inside the folders of games that are new on this branch, their
//            sources (art-src/games/<id>) and recordings (public/sfx/<id>-...),
//            and lines added to the master list (src/minis/roster.ts)
//   LOOK     docs, tools and other new files: fine, but say why in the pull request
//   STOP     a change to, or the loss of, anything that was already there and that
//            other games are made of: another game's folder, the common pictures,
//            the levels, the scenes, the sound. Only if the owner asked for it.
//
// It ends with an error if there is anything under STOP, so that it is not missed.
import { execSync } from 'node:child_process';

const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8', maxBuffer: 1 << 28 }).trim();
const base = process.argv[2] ?? 'origin/main';
if (base === 'origin/main') {
  try { git('fetch --quiet origin main'); } catch { console.log('(could not fetch origin/main: comparing with the copy of it that is here)'); }
}
const from = git(`merge-base ${base} HEAD`);
const lines = (text) => text.split('\n').filter(Boolean);

// what is different from the base, committed or not: status and path (a rename counts as losing the old name)
const changes = new Map();
for (const line of lines(git(`diff --name-status --no-renames ${from}`))) {
  const [status, path] = line.split('\t');
  changes.set(path, status);
}
for (const path of lines(git('ls-files --others --exclude-standard'))) changes.set(path, 'A');

const folders = (ref) => {
  try { return lines(git(`ls-tree -d --name-only ${ref} src/minis/`)).map((p) => p.split('/').pop()); } catch { return []; }
};
const there = new Set(folders(from));                                   // games (and `shared`) that were already there
const here = new Set(folders('HEAD'));
for (const path of changes.keys()) {                                    // ...and ones not committed yet
  const m = path.match(/^src\/minis\/([^/]+)\//);
  if (m) here.add(m[1]);
}
const mine = [...here].filter((g) => !there.has(g));

const yours = [], look = [], stop = [];
const SHARED = /^(src|public|art-src|audio-src)\//;
for (const [path, status] of [...changes].sort()) {
  const game = path.match(/^src\/minis\/([^/]+)\//)?.[1] ?? path.match(/^art-src\/games\/([^/]+)\//)?.[1] ?? path.match(/^public\/(?:sfx|music|voice)\/([a-z0-9]+)[-.]/)?.[1];
  const what = status === 'A' ? 'new' : status === 'D' ? 'GONE' : 'changed';
  if (game && mine.includes(game)) yours.push(`${what}  ${path}`);
  else if (path === 'src/minis/roster.ts') {
    const taken = lines(git(`diff -U0 ${from} -- ${path}`)).filter((l) => /^-[^-]/.test(l));
    if (taken.length) stop.push(`changed  ${path}: lines were taken out or altered, not only added (${taken.length})`);
    else yours.push(`added to  ${path}`);
  } else if (status === 'A') look.push(`new  ${path}`);
  else if (SHARED.test(path)) stop.push(`${what}  ${path}`);
  else look.push(`${what}  ${path}`);
}

const show = (title, list, none) => {
  console.log(`\n${title} (${list.length})`);
  if (!list.length) return console.log(`  ${none}`);
  const few = list.length > 40 ? [...list.slice(0, 40), `... and ${list.length - 40} more`] : list;
  for (const l of few) console.log(`  ${l}`);
};
console.log(`Compared with ${base} (${from.slice(0, 7)}). Games new on this branch: ${mine.length ? mine.join(', ') : 'none'}`);
show('YOURS', yours, 'nothing');
show('LOOK: fine, but say why', look, 'nothing');
show('STOP: already there, and other games are made of it', stop, 'nothing: no game that was already there has been touched');
if (stop.length) {
  console.log('\nEach thing under STOP needs the owner to have asked for it. If one was not meant, put it back:');
  console.log(`  git checkout ${from.slice(0, 7)} -- <path>`);
  process.exit(1);
}

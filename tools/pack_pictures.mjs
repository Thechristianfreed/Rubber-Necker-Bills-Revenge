// Take the pictures out of the built page, and put them in files beside it.
//
//   node tools/pack_pictures.mjs          (after `npm run build:single`; tools/make_preview.mjs does both)
//
// Vite writes every picture into dist-single/index.html. A published page may
// be 16 MB and no more, and the pictures were most of it. This goes through the
// page's code, and wherever a picture is written out it leaves a ticket,
// "pic:<n>", in its place. The pictures go into dist-single/pictures/, in files
// of a few megabytes each, and the page is told which files to fetch
// (window.__PICTURES). src/art/pictures.ts is the other half: it fetches them
// and turns a ticket back into its picture.
//
// Each file is named for what is in it, so a file that has not changed keeps
// its name and need not be sent again, and a page can never be given an old
// file's pictures by mistake.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PAGE = resolve('dist-single/index.html'), FOLDER = resolve('dist-single/pictures');
const EACH = 6_000_000;                       // about how big one file of pictures is let get (a text file may be 16 MB)
// A picture as it is written in the code: the whole of one piece of text, between its quotes.
// (Phaser has a few tiny ones of its own built in, and the start of one kept apart to be stuck
// on the front of others: those are not ours, are a few hundred letters at most, and stay.)
const PICTURE = /(["'`])(data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/=]+)\1/g;
const SMALLEST = 600;

let page = readFileSync(PAGE, 'utf8');
if (page.includes('window.__PICTURES=')) {
  console.error('dist-single/index.html has had its pictures taken out already: build it again first (npm run build:single)');
  process.exit(1);
}

// only inside the code: a picture written into the page's own styles has to stay where it is
const tickets = new Map();
page = page.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (_, open, code, close) => open + code.replace(PICTURE, (whole, quote, data) => {
  if (data.length < SMALLEST) return whole;
  if (!tickets.has(data)) tickets.set(data, `pic:${tickets.size}`);
  return quote + tickets.get(data) + quote;
}) + close);
if (!tickets.size) {
  console.error('no pictures were found in dist-single/index.html: is it the single-file build?');
  process.exit(1);
}

rmSync(FOLDER, { recursive: true, force: true });
mkdirSync(FOLDER, { recursive: true });
const files = [];
let part = {}, size = 0;
const write = () => {
  const text = JSON.stringify(part);
  const name = `pictures/${createHash('sha1').update(text).digest('hex').slice(0, 12)}.json`;
  writeFileSync(resolve('dist-single', name), text);
  files.push(name);
  part = {};
  size = 0;
};
for (const [data, ticket] of tickets) {
  if (size && size + data.length > EACH) write();
  part[ticket] = data;
  size += data.length;
}
write();

// the page is told where they are, before any of its own code runs
const at = page.indexOf('<script');
page = page.slice(0, at) + `<script>window.__PICTURES=${JSON.stringify(files)}</script>\n    ` + page.slice(at);
writeFileSync(PAGE, page);

const total = readdirSync(FOLDER).reduce((n, f) => n + readFileSync(resolve(FOLDER, f)).length, 0);
console.log(`${tickets.size} pictures taken out of the page, into ${files.length} file${files.length > 1 ? 's' : ''} (${(total / 1e6).toFixed(1)} MB): ${files.join(', ')}`);
console.log(`the page is now ${(page.length / 1e6).toFixed(1)} MB`);

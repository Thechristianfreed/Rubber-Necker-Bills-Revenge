// Turn the single-file build into a page fragment for hosts that supply their
// own <html>/<head>/<body> wrapper (such as a Claude artifact).
//
//   npm run build:single && node tools/make_artifact.mjs [outFile]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const src = readFileSync(resolve('dist-single/index.html'), 'utf8');
const out = resolve(process.argv[2] ?? 'dist-single/rubber-necker.html');

const head = src.slice(src.indexOf('<head>') + 6, src.indexOf('</head>'));
const body = src.slice(src.indexOf('<body>') + 6, src.lastIndexOf('</body>'));

// keep the title and styles first, then the markup, then the scripts
const title = head.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? '<title>Rubber Necker</title>';
const styles = head.match(/<style[\s\S]*?<\/style>/g) ?? [];
const scripts = head.match(/<script[\s\S]*?<\/script>/g) ?? [];

const page = [title, ...styles, body.trim(), ...scripts].join('\n') + '\n';
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page);
console.log(`${out}  ${(page.length / 1024).toFixed(0)} KB`);

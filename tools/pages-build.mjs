// Builds the site for GitHub Pages, where it is served from a sub-folder.
// The normal build writes root-absolute paths (/en, /img/...), which break
// under https://user.github.io/<repo>/. This runs that build, then rewrites
// those paths with the base prefix and writes the result to docs/.
//
//   node tools/pages-build.mjs /my-repo-name
import { execFileSync } from 'node:child_process';
import { cpSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.argv[2] || '').replace(/\/+$/, '');
if (!base.startsWith('/')) {
  console.error('Give the base path, e.g. node tools/pages-build.mjs /zion-resort-site');
  process.exit(1);
}

execFileSync('node', ['build.mjs'], { stdio: 'inherit' });

rmSync('docs', { recursive: true, force: true });
cpSync('dist', 'docs', { recursive: true });

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

let touched = 0;
for (const file of walk('docs')) {
  if (!/\.(html|css)$/.test(file)) continue;
  const before = readFileSync(file, 'utf8');
  const after = before
    .replace(/(href|src)="\/(?!\/)/g, `$1="${base}/`)
    .replace(/url\(\/(?!\/)/g, `url(${base}/`);
  if (after !== before) { writeFileSync(file, after); touched++; }
}
writeFileSync('docs/.nojekyll', '');
console.log(`Built docs/ for ${base} (${touched} files rewritten)`);

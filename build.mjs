// Builds the static site into dist/: one folder per page, in English and Ukrainian.
import { mkdirSync, writeFileSync, rmSync, cpSync, readFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { en, ua, SLUGS } from './src/content.mjs';
import { shell, homePage, articlePage, newsIndex, progressIndex } from './src/templates.mjs';

const out = 'dist';
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync('public', out, { recursive: true });

// fonts: only the open files the site uses
mkdirSync(`${out}/fonts`, { recursive: true });
const F = 'node_modules/@fontsource';
copyFileSync(`${F}/marcellus/files/marcellus-latin-400-normal.woff2`, `${out}/fonts/marcellus-latin.woff2`);
copyFileSync(`${F}/michroma/files/michroma-latin-400-normal.woff2`, `${out}/fonts/michroma-latin.woff2`);
copyFileSync(`${F}/forum/files/forum-cyrillic-400-normal.woff2`, `${out}/fonts/forum-cyrillic.woff2`);
copyFileSync(`${F}-variable/unbounded/files/unbounded-cyrillic-wght-normal.woff2`, `${out}/fonts/unbounded-cyrillic.woff2`);

copyFileSync('src/site.css', `${out}/site.css`);
const vendor = ['gsap/dist/gsap.min.js', 'gsap/dist/ScrollTrigger.min.js', 'gsap/dist/CustomEase.min.js', 'gsap/dist/SplitText.min.js', 'lenis/dist/lenis.min.js', 'swiper/swiper-bundle.min.js']
  .map(f => readFileSync(`node_modules/${f}`, 'utf8').replace(/\/\/# sourceMappingURL=.*$/gm, '')).join('\n;');
writeFileSync(`${out}/site.js`, `${vendor}\n;(function(){\n${readFileSync('src/scene.js', 'utf8')}\n${readFileSync('src/main.js', 'utf8')}\n})();`);

const logo = JSON.parse(readFileSync('src/logo.json'));
writeFileSync(`${out}/favicon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logo.w} ${logo.w}"><rect width="${logo.w}" height="${logo.w}" fill="#a89474"/><g transform="translate(0 ${(logo.w - logo.h) / 2})"><path fill="#2c2824" fill-rule="evenodd" d="${logo.d}"/></g></svg>`);
writeFileSync(`${out}/noise.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/></filter><rect width="200" height="200" filter="url(#n)"/></svg>`);

function write(path, html) {
  const file = join(out, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
const other = (t, p) => `/${t.other}${p}`;
for (const t of [en, ua]) {
  const home = shell(t, { title: t.title, desc: t.desc, body: homePage(t), altPath: other(t, ''), page: 'home' });
  write(t.lang, home);
  if (t.lang === 'en') write('', home);
  write(`${t.lang}/news`, shell(t, { title: `${t.newsTitle} — Zion`, desc: t.desc, body: newsIndex(t), altPath: other(t, '/news'), page: 'list' }));
  write(`${t.lang}/construction-progress`, shell(t, { title: `${t.progressTitle} — Zion`, desc: t.desc, body: progressIndex(t), altPath: other(t, '/construction-progress'), page: 'list' }));
  for (const k of Object.keys(SLUGS)) {
    write(`${t.lang}/news/${SLUGS[k]}`, shell(t, { title: `${t.articles[k][0]} — Zion`, desc: t.articles[k][1], body: articlePage(t, k), altPath: other(t, `/news/${SLUGS[k]}`), page: 'article' }));
  }
}
console.log('Built', out);

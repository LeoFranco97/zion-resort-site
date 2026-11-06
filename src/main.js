gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
CustomEase.create('InOut', '0.76,0,0.24,1'); CustomEase.create('Out', '0.25,1,0.5,1'); CustomEase.create('In', '0.5,0,0.75,0');
const durS = .4, durM = .8, durL = 1.2, stg = .1, dly = .2;
const wait = s => new Promise(r => gsap.delayedCall(s, r));
const root = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const desk = () => innerWidth >= 992;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get(k) { try { return sessionStorage.getItem(k); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch {} } };
const local = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };

const mm = gsap.matchMedia();

/* smooth scrolling */
let lenis = null;
if (!calm) {
  lenis = new Lenis({ lerp: .1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollTo = (t, o = {}) => { lenis ? lenis.scrollTo(t, o) : (typeof t === 'number' ? scrollTo(t) : t.scrollIntoView()); };

/* text and blocks appear the first time they come into view */
function reveals() {
  if (calm) return;
  $$('[data-r="h"]').forEach(e => { textH([e], 'initial'); ScrollTrigger.create({ trigger: e, start: 'top bottom', once: true, onEnter: () => textH([e], 'reveal', 0) }); });
  $$('[data-r="p"]').forEach(e => { textP([e], 'initial'); ScrollTrigger.create({ trigger: e, start: 'top bottom', once: true, onEnter: () => textP([e], 'reveal', 0) }); });
  $$('[data-r="ctn"]').forEach(e => { ctnAnim([e], 'initial'); ScrollTrigger.create({ trigger: e, start: 'top bottom', once: true, onEnter: () => ctnAnim([e], 'reveal', 0) }); });
  $$('[data-r="line"]').forEach(e => { gsap.set(e, { clipPath: 'inset(0% 0% -1px 100%)' }); ScrollTrigger.create({ trigger: e, start: 'top bottom', once: true, onEnter: () => gsap.fromTo(e, { clipPath: 'inset(0% 100% -1px 0%)' }, { clipPath: 'inset(0% 0% -1px 0%)', duration: durL, ease: 'Out' }) }); });
  $$('[data-card]').forEach(e => { gsap.set(e, { transformPerspective: 1000 }); gsap.timeline({ scrollTrigger: { trigger: e, start: 'top bottom', toggleActions: 'play none none reset' } }).from(e, { scale: 0, rotateY: -90, rotate: -25, duration: durL, delay: dly, ease: 'Out' }); });
  $$('[data-slide-reveal]').forEach(e => gsap.timeline({ scrollTrigger: { trigger: e, start: 'top bottom', end: 'top 80%', toggleActions: 'play none none none' } }).from(Array.from(e.children), { opacity: 0, xPercent: 50, duration: durL, delay: dly, stagger: stg, ease: 'Out' }));
  // long quotes light up letter by letter
  $$('[data-highlight]').forEach(e => {
    const chars = new SplitText(e, { type: 'chars,words' }).chars;
    gsap.timeline({ scrollTrigger: { trigger: e, start: 'top 75%', end: 'bottom 50%', scrub: true } }).from(chars, { opacity: .1, duration: durS, ease: 'Out', stagger: stg });
  });
  // pictures and blocks drifting at their own speed
  $$('[data-par="img"]').forEach(e => { const w = e.closest('[data-par-w]') || e.parentElement; gsap.fromTo(e, { yPercent: -20 }, { yPercent: 20, ease: 'none', scrollTrigger: { trigger: w, start: 'top bottom', scrub: true } }); });
  const drift = list => list.forEach(e => { const up = e.dataset.par === 'up' || e.dataset.par === 'up-d'; gsap.fromTo(e, { yPercent: up ? 10 : -10 }, { yPercent: up ? -10 : 10, ease: 'none', scrollTrigger: { trigger: e, start: 'top bottom', end: 'bottom top', scrub: true } }); });
  drift($$('[data-par="up"],[data-par="down"]'));
  mm.add('(min-width:992px)', () => { drift($$('[data-par="up-d"],[data-par="down-d"]')); });
  $$('[data-par="h1"]').forEach(e => { const k = Array.from(e.children); gsap.fromTo(k, { xPercent: gsap.utils.wrap([5, -1, -5]) }, { xPercent: gsap.utils.wrap([-5, 1, 5]), ease: 'none', scrollTrigger: { trigger: e, start: 'top bottom', end: 'bottom top', scrub: 1 } }); });
}

/* the woven scenes */
const flat = [];
function flatScenes() {
  $$('canvas[data-scene="menu"],canvas[data-scene="preload"]').forEach(c => { const n = c.dataset.scene, sc = new Scene(c, n, n === 'menu' ? { color: '#3d3730' } : { color: '#a89474', pitch: 4 }); c._scene = sc; flat.push(sc); if (n === 'preload') sc.st.spin = true; });
  gsap.ticker.add(() => { for (const f of flat) { if (f.st.spin) { f.st.t = (f.st.t || 0) + .08; f.dirty = true; } f.render(); } });
  const fit = () => flat.forEach(f => f.resize()); addEventListener('resize', fit);
}
function buildScenes(isDesk) {
  const made = [], tile = isDesk ? 33.33 : 100, heroTile = isDesk ? 33.33 : 66.66;
  const weave = (name, layers) => { const out = $$(`canvas[data-scene="${name}"]`).map(c => { const w = new Weave(c, layers); made.push(w); return w; }); return out[0]; };
  const cfg = (w, i) => w.layers[i].cfg, sq = (t, y, bp = 0, wp = 255) => ({ x: -t + '%', y, width: t + '%', height: t + 'vw', bp, wp });
  const fly = (w, i, delay = 0) => w.tls.push(gsap.timeline({ paused: true }).to(cfg(w, i), { x: '100%', duration: 5, ease: 'none', delay, repeat: -1, repeatDelay: 5 }, 0));

  let w = weave('heroOver', [
    ['mountainOver', { y: '40%', height: '60%', bp: 25, wp: 200 }], ['stones', { x: '56%', y: '66%', width: '14%', height: '12%', bp: 25, wp: 200 }],
    ...(isDesk ? [['pine', { x: '70%', y: '42%', width: '43.5%', height: '52%', bp: 55, wp: 175, xSquares: 150 }]] : []),
    ['flock', { y: '72%', width: '72%', height: '32%', bp: 15, wp: 255, xSquares: 200, ySquares: 150 }],
    ...(isDesk ? [['cloudB', { x: '5%', y: '25%', width: '65%', height: '45vw', bp: 25, wp: 255 }]] : []),
    ['birdsD', sq(heroTile, '30%', 255, 0)]]);
  if (w) {
    const n = w.layers.length;
    gsap.timeline({ scrollTrigger: { trigger: w.c, start: '50% bottom', end: 'bottom top', scrub: true } }).to(cfg(w, 0), { bp: 45, wp: 175, ease: 'none' }, 0).to(cfg(w, 1), { bp: 75, wp: 150, ease: 'none' }, 0);
    if (isDesk) gsap.timeline({ scrollTrigger: { trigger: w.c, start: 'top bottom', end: 'bottom 50%', scrub: true } }).to(cfg(w, 4), { x: '-30%', ease: 'none' }, 0);
    fly(w, n - 1, 5);
  }
  w = weave('heroBg', [['mountainBg', { y: '45%', height: '60%' }], ['cloudC', { x: '30%', width: '65%', height: '45vw', bp: 25 }], ['birdsA', sq(33.33, '0%', 255, 0)]]);
  if (w) { gsap.timeline({ scrollTrigger: { trigger: w.c, start: 'top bottom', end: 'bottom 50%', scrub: true } }).to(cfg(w, 1), { x: '60%', ease: 'none' }, 0); fly(w, 2); }

  weave('prolog', [['flowerL', { x: isDesk ? '-14%' : '-25.5%', y: '3%', width: isDesk ? '44%' : '88%', height: '96%', bp: 200, wp: 25, xSquares: 125, ySquares: 150 }], ['flowerR', { x: isDesk ? '70%' : '37.5%', y: '3%', width: isDesk ? '44%' : '88%', height: '96%', bp: 200, wp: 25, xSquares: 125, ySquares: 150 }]]);

  w = weave('about', [['birdsB', sq(tile, '10%', 255, 0)], ['stork', { x: '45%', y: '65%', width: '40%', height: '36vw', bp: 160, wp: 0 }]]);
  if (w) w.tls.push(gsap.timeline({ paused: true }).to(cfg(w, 0), { x: '100%', duration: 5, ease: 'none', repeat: -1, repeatDelay: 5 }).to(cfg(w, 1), { x: '-40%', y: '0%', duration: 6, ease: 'none', delay: 4, repeat: -1, repeatDelay: 6 }, '<'));

  w = weave('season', [['summer', { x: '16%', width: '84%', fO: 0 }], ['winter', { x: '4%', y: '-8%', width: '50%', bp: 254, wp: 255, fO: 0 }]]);
  if (w) { const sw = w; seasonScene = n => { gsap.to(cfg(sw, 0), n ? { bp: 254, wp: 255, duration: durL } : { bp: 0, wp: 255, duration: durL }); gsap.to(cfg(sw, 1), n ? { bp: 25, wp: 150, duration: durL } : { bp: 254, wp: 255, duration: durL }); }; }

  w = weave('benefitsIntro', [
    ['hole', { height: (isDesk ? 128 : 100) + '%', bp: 10, wp: 225, bgO: 0 }],
    ['hikers', { x: (isDesk ? 30 : 15) + '%', y: '10%', width: '81%', height: '116%', bp: 25, wp: 200, xSquares: 136, ySquares: 136 }],
    ['birdsC', { x: '-4%', y: '40%', width: '60%', height: '72%', bp: 255, wp: 75, xSquares: 136, ySquares: 136 }]]);
  if (w) gsap.timeline({ scrollTrigger: { trigger: w.c, start: 'bottom bottom', end: 'bottom -50%', scrub: true, invalidateOnRefresh: true } })
    .to(cfg(w, 0), { x: '-25%', y: '-30%', width: '148%', height: (isDesk ? 189.44 : 156) + '%', bp: 0, wp: 1, ease: 'InOut' }, 0)
    .to(cfg(w, 1), { x: (isDesk ? 230 : 215) + '%', y: '-50%', width: '324%', height: '464%', ease: 'In' }, 0)
    .to(cfg(w, 2), { x: '-204%', y: '-20%', width: '240%', height: '288%', ease: 'In' }, 0);

  w = weave('benefitsOutro', [
    ['flockFar', { x: '-8%', y: '55%', width: '68%', height: '50%', bp: 256, wp: 255, xSquares: 150, ySquares: 50, bgO: 0 }],
    ['birdsA', { ...sq(tile, '-5%'), bp: 256, wp: 255, bgO: 0 }],
    ['branches', { x: '35%', y: '-25%', width: '76%', height: '96%', bp: -1, wp: 0, xSquares: 150, bgO: 0 }]]);
  if (w) {
    gsap.timeline({ scrollTrigger: { trigger: w.c, start: 'top top', end: 'bottom top', scrub: true } }).to(cfg(w, 0), { bp: 150, wp: 0, ease: 'none' }, 0).to(cfg(w, 1), { bp: 200, wp: 55, ease: 'none' }, 0).to(cfg(w, 2), { bp: 55, wp: 200, ease: 'none' }, 0);
    gsap.timeline({ scrollTrigger: { trigger: '[data-benefits]', start: 'top top', end: 'bottom top', scrub: true } }).to(cfg(w, 0), { x: '-18%', y: '30%', ease: 'In' }, 0).to(cfg(w, 2), { x: '50%', y: '-100%', ease: 'In' }, 0);
    fly(w, 1);
  }

  weave('fin', [['fin', { width: '80%', bp: 200, wp: 75 }]]);
  w = weave('clouds', [['cloudA', { x: '30%', width: '65%', height: '45vw', bp: 25 }]]);
  if (w) gsap.timeline({ scrollTrigger: { trigger: w.c, start: 'top bottom', end: 'bottom top', scrub: true } }).to(cfg(w, 0), { x: '60%', ease: 'none' });
  w = weave('ridges', [['cloudB', { x: '5%', y: '35%', width: '65%', height: '45vw', bp: 25 }], ['birdsA', sq(tile, '5%')], ['birdsB', sq(tile, '50%')], ['birdsD', sq(tile, '80%')]]);
  if (w) { gsap.timeline({ scrollTrigger: { trigger: w.c, start: 'top bottom', end: 'bottom top', scrub: true } }).to(cfg(w, 0), { x: '-30%', ease: 'none' }); fly(w, 1); fly(w, 3); fly(w, 2, 5); }
  weave('lake', [['river', { bp: 75, wp: 175 }], ['flockFar', { x: '15%', y: '15%', width: '60%', height: '40%', bp: 25 }], ['person', { x: '32.5%', y: '32.5%', width: '35%', height: '50%', bp: 25, wp: 225 }]]);

  w = weave('faq', [['birdsA', sq(tile, '0%')], ['birdsB', sq(tile, '55%')]]);
  if (w) w.tls.push(gsap.timeline({ paused: true, repeat: -1 }).to(cfg(w, 0), { x: '100%', duration: isDesk ? 5 : 2.5, ease: 'none' }).to(cfg(w, 1), { x: '100%', duration: isDesk ? 5 : 2.5, ease: 'none' }).to({}, { duration: 5 }));
  weave('footer', [['ground', { y: '67.5%', height: '32.5%', bp: 240, wp: 50, fO: 0 }], ['stack', { x: '30%', y: '5%', width: '40%', height: '95%', bp: 0, wp: 215, xSquares: 150, ySquares: 125 }]]);
  w = weave('article', [['birdsA', sq(tile, '0%', 255, 0)], ['birdsB', sq(tile, '55%', 255, 0)]]);
  if (w) w.tls.push(gsap.timeline({ paused: true, repeat: -1 }).to(cfg(w, 0), { x: '100%', duration: isDesk ? 5 : 2.5, ease: 'none' }).to(cfg(w, 1), { x: '100%', duration: isDesk ? 5 : 2.5, ease: 'none' }).to({}, { duration: 10 }));
  return made;
}
let seasonScene = () => {};
function initScenes() {
  flatScenes();
  mm.add('(min-width:992px)', () => { const m = buildScenes(true); return () => m.forEach(w => w.destroy()); });
  mm.add('(max-width:991px)', () => { const m = buildScenes(false); return () => m.forEach(w => w.destroy()); });
}

/* hero: the view turns with scrolling, then the whole picture shrinks away */
function heroScroll() {
  const b = $('[data-hero-b]'), area = $('.hero-area');
  if (!b || calm) return;
  mm.add('(min-width:992px)', () => {
    gsap.fromTo('[data-hero-a]', { scale: 1, transformOrigin: '42% 62%' }, { scale: 1.42, ease: 'none', scrollTrigger: { trigger: area, start: 'top top', end: '75% bottom', scrub: .25 } });
    gsap.to($('.hero-s_t'), { yPercent: -100, scale: .5, opacity: 0, ease: 'none', scrollTrigger: { trigger: area, start: 'top top', end: '50% bottom', scrub: .25 } });
    gsap.timeline({ scrollTrigger: { trigger: area, start: '70% bottom', end: 'bottom bottom', scrub: 1 } }).to($('[data-hero]'), { scale: .3, ease: 'Out', duration: 1 }, 0).to($('.hero-s'), { opacity: 0, ease: 'Out', duration: .33 }, 0);
  });
}

/* section to section movements */
function sectionMoves() {
  if (calm) return;
  const pic = $('.about-s_img');
  if (pic) gsap.fromTo($('.about-img-w', pic), { scale: 1, transformOrigin: 'center bottom' }, { scale: 1.25, ease: 'none', scrollTrigger: { trigger: pic, start: 'top bottom', end: 'bottom top', scrub: 1 } });
  const bw = $('.benefits-w');
  if (bw) {
    gsap.fromTo($('.benefits-title', bw), { scale: 0 }, { scale: 1, ease: 'InOut', scrollTrigger: { trigger: $('.benefits-gap', bw), start: 'top bottom', end: 'bottom bottom', scrub: true } });
    gsap.fromTo([$('.benefits-title_c', bw), $('.benefits-intro', bw)], { opacity: 1 }, { opacity: 0, ease: 'Out', scrollTrigger: { trigger: $('.benefits-outro', bw), start: 'bottom top', end: '200% top', scrub: true } });
  }
  mm.add('(min-width:992px)', () => {
    const f = $('.footer');
    if (f) gsap.timeline({ scrollTrigger: { trigger: f, start: 'top top', end: 'bottom bottom', scrub: true } }).fromTo($('.foot-w', f), { scale: 2, transformOrigin: 'center 10%' }, { scale: 1, ease: 'none' }).fromTo($('.foot-bg', f), { scale: .75, transformOrigin: 'center 10%' }, { scale: 1, ease: 'none' }, '<');
  });
  // the header steps aside when scrolling down
  const hd = $('[data-header]'); let last = scrollY, off = false;
  ScrollTrigger.create({ start: 'top top', end: 'max', onUpdate: self => {
    const y = self.scroll(), d = Math.abs(y - last), left = document.documentElement.scrollHeight - (y + innerHeight);
    if (y < 200) { if (off) { off = false; gsap.to(hd, { yPercent: 0, duration: durM, ease: 'Out', overwrite: true }); } last = y; return; }
    if (d < 40) return;
    if (y > last && y > 1000 && !off) { off = true; gsap.to(hd, { yPercent: -100, duration: durM, ease: 'Out' }); }
    else if ((y < last || left <= 160) && off) { off = false; gsap.to(hd, { yPercent: 0, duration: durM, ease: 'Out' }); }
    last = y;
  } });
}

/* opening: same order and timings as the original */
const textH = (els, mode, d) => els.forEach((e, n) => {
  e._s = e._s || new SplitText(e, { type: 'words' });
  const from = { yPercent: gsap.utils.wrap([-150, 75, -75, 150]), scale: 0, opacity: 0 };
  if (mode === 'initial') gsap.set(e._s.words, from);
  else if (mode === 'hide') gsap.to(e._s.words, { yPercent: gsap.utils.wrap([75, -75, 75, -75]), scale: 0, opacity: 0, duration: durS, stagger: { each: stg * .25, from: 'random' }, ease: 'In', overwrite: true });
  else gsap.fromTo(e._s.words, from, { yPercent: 0, scale: 1, opacity: 1, duration: durL, delay: (d === undefined ? dly : d) + n * stg * .5, stagger: { each: stg * .25, from: 'random' }, ease: 'Out', overwrite: true });
});
const textP = (els, mode, d) => els.forEach((e, n) => {
  e._s = e._s || new SplitText(e, { type: 'lines' });
  if (mode === 'initial') gsap.set(e._s.lines, { yPercent: 0, opacity: 0 });
  else if (mode === 'hide') gsap.to(e._s.lines, { opacity: 0, duration: durS, stagger: stg * .5, ease: 'In', overwrite: true });
  else gsap.fromTo(e._s.lines, { yPercent: 250, opacity: 0 }, { yPercent: 0, opacity: 1, duration: durL, delay: (d === undefined ? dly : d) + n * stg * .25, stagger: stg * .5, ease: 'Out', overwrite: true });
});
const ctnAnim = (els, mode, d) => {
  if (!els.length) return;
  if (mode === 'initial') gsap.set(els, { opacity: 0, yPercent: 0 });
  else if (mode === 'hide') gsap.to(els, { opacity: 0, duration: durS, stagger: stg * .5, ease: 'In', overwrite: true });
  else gsap.fromTo(els, { opacity: 0, yPercent: 100 }, { opacity: 1, yPercent: 0, duration: durL, delay: d === undefined ? dly : d, stagger: stg * .5, ease: 'Out', overwrite: true });
};
function cellsOut() {
  const t = $('[data-transition]'), cells = $$('.transition_column i', t), over = $('.transition_over', t);
  t.classList.add('on');
  gsap.timeline({ onComplete() { t.classList.remove('on'); gsap.set(t, { clearProps: 'all' }); root.classList.remove('boot', 'boot-dark', 'boot-light'); gsap.set([...cells, over], { clearProps: 'all' }); } })
    .fromTo(cells, { scaleX: 1 }, { scaleX: 0, duration: durS, ease: 'InOut', stagger: { each: .03, from: 'end', grid: [20, 12] } })
    .fromTo(over, { opacity: 1 }, { opacity: 0, duration: durL, ease: 'InOut' }, 0);
}
function revealExtras() {
  const hd = $('[data-header]'), snd = $('[data-sound]'), ck = $('[data-cookies]');
  gsap.fromTo(hd, { yPercent: -100 }, { yPercent: 0, duration: durL, ease: 'InOut' });
  gsap.set(snd, { opacity: 1 }); gsap.fromTo(snd, { yPercent: 125 }, { yPercent: 0, duration: durL, ease: 'InOut' });
  if (ck && !local.get('zion-cookies')) { ck.hidden = false; gsap.fromTo(ck, { yPercent: 100 }, { yPercent: 0, duration: durL, ease: 'InOut' }); }
}
async function opening() {
  const first = root.classList.contains('first');
  store.set('zion-seen', '1'); store.set('zion-trans', '');
  const p = $('[data-preloader]');
  if (calm) { root.classList.remove('boot', 'boot-dark', 'boot-light', 'first'); return; }
  if (!first) { if (p) p.remove(); cellsOut(); return; }
  history.scrollRestoration = 'manual'; scrollTo(0);
  lenis && lenis.stop();
  const hs = $$('[data-intro="h"]'), ps = $$('[data-intro="p"]'), cs = $$('[data-intro="ctn"]');
  const logo = $('[data-pl-logo]', p), bg = $('.preloader_bg', p), pct = $('[data-pct]', p), hdr = $('[data-header]');
  const pp = $$('[data-pl="p"]', p), pc = $$('[data-pl="ctn"]', p), scene = $('canvas', p);
  textP(pp, 'reveal'); ctnAnim(pc, 'reveal');
  gsap.fromTo(scene, { opacity: 0 }, { opacity: 1, duration: durL, delay: dly, ease: 'Out' });
  gsap.fromTo(logo, { opacity: 0, yPercent: 25 }, { opacity: 1, yPercent: 0, duration: durL, delay: dly, ease: 'Out' });
  await wait(dly + durL + durL);
  // waits for the first picture and the fonts, as the original waits for its scenes
  const picture = $(desk() ? '.hero-bg img' : '.mob_hero img');
  if (picture) picture.loading = 'eager';
  const count = { v: 0 }, ready = Promise.all([document.fonts ? document.fonts.ready : 0, picture && picture.decode ? picture.decode().catch(() => {}) : 0]);
  await gsap.to(count, { v: 100, duration: durL * 2, ease: 'none', onUpdate() { if (pct) pct.textContent = Math.round(count.v) + '%'; } });
  await Promise.race([ready, wait(3)]);
  textP(pp, 'hide'); ctnAnim(pc, 'hide');
  await gsap.to(bg, { opacity: 0, duration: durM, ease: 'Out' });
  cellsOut();
  await wait(durS);
  const heroLogo = $('[data-hero-logo]');
  if (!heroLogo) {
    await gsap.to(logo, { yPercent: 120, duration: durL, ease: 'Out' });
    p.remove(); root.classList.remove('first'); revealExtras(); lenis && lenis.start(); return;
  }
  textH(hs, 'initial'); textP(ps, 'initial'); ctnAnim(cs, 'initial');
  gsap.set([...hs, ...ps], { opacity: 1 });
  const picBox = $('.hero-bg .img-w'), phonePic = $('.mob_hero .img-w');
  gsap.fromTo([picBox, phonePic].filter(Boolean), { scale: 1.5 }, { scale: 1, duration: durL * 2, ease: 'Out' });
  const a = logo.getBoundingClientRect(), goal = $('svg', heroLogo).getBoundingClientRect();
  gsap.to(logo, { x: goal.left - a.left, y: goal.top - a.top, scale: goal.width / a.width, duration: durL * 1.5, ease: 'InOut' });
  gsap.delayedCall(durL, () => { logo.classList.add('landed'); textH(hs, 'reveal'); textP(ps, 'reveal'); ctnAnim(cs, 'reveal'); });
  await wait(durL * 1.5);
  heroLogo.style.opacity = 1;
  await wait(durS);
  p.remove(); root.classList.remove('first');
  revealExtras();
  lenis && lenis.start();
  await wait(durL + durS);
  [...hs, ...ps].forEach(e => e._s && e._s.revert());
}

/* the header reads what is behind it and takes the opposite colours */
function headerTheme() {
  const h = $('[data-header]'), snd = $('[data-sound]');
  const marks = $$('[data-bg]');
  const check = () => {
    const y = h.getBoundingClientRect().height / 2;
    let tone = null;
    for (const m of marks) { const r = m.getBoundingClientRect(); if (r.height && r.top <= y && r.bottom >= y) tone = m.dataset.bg; }
    const menu = document.body.classList.contains('menu-open');
    const area = $('.hero-area');
    const onPhoneHero = !desk() && area && area.getBoundingClientRect().bottom > y;
    const dark = menu || tone === 'dark' || onPhoneHero;
    h.classList.toggle('on-dark', dark); h.classList.toggle('on-light', !dark);
    const b = innerHeight - 20; let t2 = null;
    for (const m of marks) { const r = m.getBoundingClientRect(); if (r.height && r.top <= b && r.bottom >= b) t2 = m.dataset.bg; }
    snd && snd.classList.toggle('on-dark-bg', t2 === 'dark');
  };
  ScrollTrigger.addEventListener('refresh', check);
  (lenis ? lenis.on('scroll', check) : addEventListener('scroll', check, { passive: true }));
  addEventListener('scroll', check, { passive: true });
  check();
}

/* windows that open over the page */
function modals() {
  const open = name => {
    const m = $(`[data-modal="${name}"]`); if (!m) return; m.hidden = false;
    if (name !== 'menu') { lenis && lenis.stop(); gsap.fromTo(m, { opacity: 0 }, { opacity: 1, duration: .4 }); }
    if (name === 'media') { const v = $('video', m); v.play().catch(() => {}); }
    if (name === 'menu') { document.body.classList.add('menu-open'); $$('.menu-btn [data-open-label]').forEach(e => e.classList.add('d-none')); $$('.menu-btn [data-close-label]').forEach(e => e.classList.remove('d-none')); const c = $('canvas', m); if (c && c._scene) { c._scene.resize(); c._scene.dirty = true; } gsap.fromTo(m, { '--mask-y': '200%', opacity: 1 }, { '--mask-y': '0%', duration: durL * 1.5, ease: 'Out', overwrite: true }); textH($$('.nav-item_label', m), 'reveal', durS); ctnAnim($$('.contact-item,.b-mob .btn', m), 'reveal', durS); lenis && lenis.stop(); }
  };
  const close = m => {
    if (!m || m.hidden) return;
    const menuClose = m.dataset.modal === 'menu';
    gsap.to(m, { opacity: 0, duration: menuClose ? durM : .3, delay: menuClose ? durS : 0, ease: 'Out', overwrite: true, onComplete() { m.hidden = true; gsap.set(m, { clearProps: 'opacity' }); } });
    if (menuClose) textH($$('.nav-item_label', m), 'hide');
    const v = $('video', m); if (v) v.pause();
    lenis && lenis.start();
    if (m.dataset.modal === 'menu') { document.body.classList.remove('menu-open'); $$('.menu-btn [data-open-label]').forEach(e => e.classList.remove('d-none')); $$('.menu-btn [data-close-label]').forEach(e => e.classList.add('d-none')); }
  };
  const closeAll = () => $$('[data-modal]').forEach(close);
  document.addEventListener('click', e => {
    const t = e.target.closest('a,button,[data-close]'); if (!t) return;
    if (t.matches('[data-noop]')) { e.preventDefault(); return; }
    if (t.matches('[data-cta]')) { e.preventDefault(); close($('[data-modal="menu"]')); resetForm(); open('cta'); return; }
    if (t.matches('[data-media]')) { e.preventDefault(); open('media'); return; }
    if (t.matches('[data-close]')) { e.preventDefault(); closeAll(); return; }
    if (t.matches('[data-menu]')) { e.preventDefault(); const m = $('[data-modal="menu"]'); m.hidden ? open('menu') : close(m); return; }
    if (t.matches('[data-menu-link]')) {
      const h = t.getAttribute('href');
      close($('[data-modal="menu"]'));
      if (h[0] === '#') { e.preventDefault(); const el = $(h); if (el) { lenis && lenis.start(); setTimeout(() => scrollTo(el, { duration: 1.4 }), 300); } else location.href = (document.documentElement.lang === 'uk' ? '/ua' : '/en') + h; }
    }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  const form = $('[data-form]'), ok = $('[data-ok]'), err = $('[data-err]');
  const resetForm = () => { if (!form) return; form.hidden = false; ok.hidden = true; err.hidden = true; };
  if (form) {
    $$('.input_field', form).forEach(i => i.addEventListener('input', () => i.parentElement.classList.toggle('filled', !!i.value)));
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!$$('.input_field', form).every(i => i.value.trim())) { err.hidden = false; return; }
      form.reset(); $$('.input', form).forEach(i => i.classList.remove('filled'));
      err.hidden = true; form.hidden = true; ok.hidden = false;
    });
  }
  const ck = $('[data-cookies]');
  if (ck && !local.get('zion-cookies')) { if (!root.classList.contains('first')) ck.hidden = false; $$('[data-cookie-ok]', ck).forEach(b => b.addEventListener('click', () => { local.set('zion-cookies', '1'); gsap.to(ck, { opacity: 0, duration: .3, onComplete() { ck.hidden = true; } }); })); }
}

/* sliders with arrows: the new picture wipes in while the old one grows */
function sliders() {
  const hide = 'inset(0% 100% 0% 0%)', hideR = 'inset(0% 0% 0% 100%)', full = 'inset(0% 0% 0% 0%)';
  $$('[data-slider]').forEach(w => {
    const slides = $$('[data-slide]', w); if (!slides.length) return;
    const imgs = slides.map(x => $('img', x)), cur = $('[data-current]', w); let i = 0, busy = false;
    slides.forEach((x, k) => { x.classList.remove('is-active'); gsap.set(x, { opacity: 1, clipPath: k ? hide : full }); });
    const go = d => {
      if (busy) return; busy = true;
      const p = i; i = (i + d + slides.length) % slides.length; if (cur) cur.textContent = i + 1;
      slides[p].style.zIndex = 1; slides[i].style.zIndex = 2;
      gsap.fromTo(imgs[p], { scale: 1 }, { scale: 1.5, duration: durL, ease: 'power1.inOut' });
      gsap.timeline({ onComplete() { slides[p].style.zIndex = 'auto'; slides[i].style.zIndex = 1; busy = false; } })
        .fromTo(slides[i], { clipPath: d > 0 ? hideR : hide }, { clipPath: full, duration: durL, ease: 'power1.inOut' })
        .fromTo(imgs[i], { scale: 1.5 }, { scale: 1, duration: durL, ease: 'power1.inOut' }, '<');
    };
    const n = $('[data-next]', w), pv = $('[data-prev]', w);
    n && n.addEventListener('click', () => go(1)); pv && pv.addEventListener('click', () => go(-1));
  });
  // the walking-time slider turns by itself every six seconds while it is on screen
  $$('[data-slider-text]').forEach(w => {
    const slides = $$('[data-slide]', w); if (!slides.length) return;
    const cur = $('[data-current]', w); let i = 0, busy = false, timer = null, inView = false;
    const heads = slides.map(x => $('.loc-min_n', x)), texts = slides.map(x => $('h4', x)), rings = slides.map(x => $('.loc-ring', x)), lines = slides.map(x => $('.loc-ring circle', x));
    slides.forEach((x, k) => x.classList.toggle('is-active', !k));
    const fill = () => { if (!desk()) return; gsap.fromTo(lines[i], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 6 - durM, ease: 'none', delay: durM }); };
    const go = d => {
      if (busy) return; busy = true; const p = i; i = (i + d + slides.length) % slides.length; if (cur) cur.textContent = i + 1;
      textH([heads[p]], 'hide'); textP([texts[p]], 'hide');
      gsap.to(rings[p], { opacity: 0, scale: 1.25, duration: durS, ease: 'In', onComplete() {
        slides[p].classList.remove('is-active'); slides[i].classList.add('is-active');
        textH([heads[i]], 'reveal', 0); textP([texts[i]], 'reveal', 0);
        gsap.fromTo(rings[i], { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: durL, ease: 'Out', onComplete() { busy = false; } });
      } });
    };
    const start = () => { if (!inView || timer) return; fill(); timer = setInterval(() => { go(1); fill(); }, 6000); };
    const stop = () => { clearInterval(timer); timer = null; gsap.killTweensOf(lines[i]); };
    new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; inView ? start() : stop(); }), { threshold: 0 }).observe(w);
    const n = $('[data-next]', w), pv = $('[data-prev]', w);
    n && n.addEventListener('click', () => { stop(); go(1); start(); }); pv && pv.addEventListener('click', () => { stop(); go(-1); start(); });
  });
  $$('[data-swiper]').forEach(el => new Swiper(el, { slidesPerView: 'auto', freeMode: true, grabCursor: true, observer: true, observeParents: true }));
  const tip = $('[data-tip]');
  $$('[data-tip-zone]').forEach(z => {
    z.addEventListener('mouseenter', () => tip.classList.add('on')); z.addEventListener('mouseleave', () => tip.classList.remove('on'));
    z.addEventListener('mousemove', e => gsap.set(tip, { x: e.clientX + 14, y: e.clientY + 14 }));
  });
  // map pins grow as the pointer comes near
  const map = $('.map-w'), pins = map ? $$('.map-pin,.map-logo', map) : [];
  if (map) mm.add('(min-width:992px)', () => {
    const near = e => pins.forEach(t => { const r = t.getBoundingClientRect(), d = Math.hypot(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2); gsap.to(t, { scale: d < 240 ? 1.5 - d / 240 * .5 : 1, duration: durL, ease: 'Out' }); });
    const far = () => pins.forEach(t => gsap.to(t, { scale: 1, duration: durL, ease: 'Out' }));
    map.addEventListener('mousemove', near); map.addEventListener('mouseleave', far);
    return () => { map.removeEventListener('mousemove', near); map.removeEventListener('mouseleave', far); };
  });
  // the heading between lines keeps moving, faster while scrolling
  $$('.marquee').forEach(m => {
    const tl = gsap.timeline({ repeat: -1 }).to($$('.marquee_list', m), { duration: 24, xPercent: -100, ease: 'none' });
    ScrollTrigger.create({ trigger: m, start: 'top bottom', end: 'bottom top', onEnter: () => tl.play(), onLeave: () => tl.pause(), onEnterBack: () => tl.play(), onLeaveBack: () => tl.pause(), onUpdate: e => tl.timeScale(1 + .01 * e.getVelocity()) });
  });
}

/* the sideways gallery of advantages */
function benefits() {
  const w = $('[data-benefits]'); if (!w) return;
  $$('[data-benefit]', w).forEach(c => {
    const info = $('.benefit-card_info', c), ico = $('.ico-plus', c), name = $('.benefit-card_name', c), hs = $$('.h6', info), ps = $$('.p6', info); let open = false;
    c.addEventListener('click', () => {
      open = !open;
      if (open) {
        gsap.set(c, { zIndex: 16 }); name.classList.add('is-open'); info.hidden = false;
        gsap.fromTo(info, { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.1 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: durL, ease: 'Out', overwrite: true });
        gsap.to($$('i', ico)[1], { rotate: 90, duration: durS, ease: 'InOut', overwrite: true });
        ico.classList.add('open'); textH(hs, 'reveal'); textP(ps, 'reveal');
      } else {
        gsap.set(c, { zIndex: '' }); name.classList.remove('is-open'); ico.classList.remove('open');
        gsap.to(info, { clipPath: 'inset(100% 0% 0% 0%)', scale: .75, duration: durM, delay: dly, ease: 'InOut', overwrite: true, onComplete() { info.hidden = true; } });
        textH(hs, 'hide'); textP(ps, 'hide');
      }
    });
  });
  if (calm) return;
  mm.add('(min-width:992px)', () => {
    const list = $('.benefits-list', w);
    const run = gsap.to(list, { xPercent: -100, ease: 'none', scrollTrigger: { trigger: w, scrub: true, start: 'top top', end: 'bottom bottom' } });
    $$('.benefit-item', w).forEach((it, i) => {
      const sign = () => Math.random() < .5 ? 1 : -1;
      const x = (Math.random() * 10 + 20) * sign(), y = 5 * sign(), r = (Math.random() * 5 + 5) * sign(), k = i % 2 ? -15 : 15;
      gsap.fromTo(it, { rotation: r, xPercent: x, yPercent: y + 75 + k }, { rotation: -r, xPercent: -x, yPercent: -y - 75 - k, ease: 'none', scrollTrigger: { trigger: it, containerAnimation: run, start: 'left 120%', end: 'right -20%', scrub: true } });
    });
  });
}

function apartments() {
  const tabs = $$('[data-tab]');
  tabs.forEach(t => t.addEventListener('click', e => {
    e.preventDefault(); tabs.forEach(o => o.classList.toggle('is-active', o === t));
    $$('[data-apt]').forEach(a => a.classList.toggle('is-active', a.dataset.apt === t.dataset.tab));
    ScrollTrigger.refresh();
  }));
}

function seasons() {
  const btns = $$('[data-season]'), slides = $$('[data-season-slide]'), dial = $('[data-season-dial]');
  if (!btns.length) return;
  let cur = 0;
  const set = n => {
    if (n === cur) return; cur = n;
    btns.forEach((b, i) => b.classList.toggle('is-active', i === n));
    slides.forEach((s, i) => { s.hidden = i !== n; s.classList.toggle('is-active', i === n); });
    if (slides[n]) textH($$('.h5,.h1', slides[n]), 'reveal', 0);
    seasonScene(n);
    ScrollTrigger.refresh();
  };
  btns.forEach((b, i) => b.addEventListener('click', () => set(i)));
  let down = false;
  const move = e => { if (!down) return; const r = dial.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left; set(x > r.width / 2 ? 1 : 0); };
  dial.addEventListener('pointerdown', () => { down = true; }); addEventListener('pointerup', () => { down = false; }); addEventListener('pointermove', move);
}

function blogTabs() {
  const w = $('[data-blog-tabs]'); if (!w) return;
  const hl = $('.tabs_hl', w), tabs = $$('[data-blog-tab]', w), cs = $$('[data-blog-c]');
  const place = t => { hl.style.width = t.offsetWidth + 'px'; hl.style.transform = `translateX(${t.offsetLeft - tabs[0].offsetLeft}px)`; };
  tabs.forEach((t, i) => t.addEventListener('click', () => { tabs.forEach(o => o.classList.toggle('is-active', o === t)); cs.forEach((c, j) => { c.hidden = j !== i; }); place(t); ScrollTrigger.refresh(); }));
  place(tabs[0]); addEventListener('resize', () => place($('.tab.is-active', w)));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place($('.tab.is-active', w)));
}

function faq() {
  let openOne = null;
  $$('[data-faq]').forEach(c => {
    const q = $('.faq-q', c), a = $('.faq-a', c), ic = $$('.ico-plus i', c)[1], text = $$('p', a);
    const show = () => { gsap.to(a, { height: 'auto', duration: durL, ease: 'Out', onComplete: () => ScrollTrigger.refresh() }); gsap.fromTo(ic, { rotate: 90 }, { rotate: 180, duration: durM, ease: 'InOut', overwrite: true }); textP(text, 'reveal'); q.setAttribute('aria-expanded', true); };
    const hide = () => { gsap.to(a, { height: 0, duration: durL, ease: 'Out', overwrite: true, onComplete: () => ScrollTrigger.refresh() }); gsap.to(ic, { rotate: 270, duration: durM, ease: 'InOut', overwrite: true }); textP(text, 'hide'); q.setAttribute('aria-expanded', false); };
    c._hide = hide;
    q.addEventListener('click', () => { if (openOne && openOne !== c) openOne._hide(); if (openOne !== c) { show(); openOne = c; } else { hide(); openOne = null; } });
  });
}

function counters() {
  if (calm) return;
  $$('[data-count]').forEach(el => {
    const m = el.textContent.match(/^(\d+)(.*)$/); if (!m || +m[1] === 0) return;
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter() { gsap.to(o, { v: +m[1], duration: 1.4, ease: 'power2.out', onUpdate() { el.textContent = Math.round(o.v) + m[2]; } }); } });
  });
}

function magnetic() {
  if (!matchMedia('(hover:hover)').matches) return;
  $$('[data-magnetic]').forEach(b => {
    const l = $('.btn-circle_label', b);
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(l, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .25, duration: .5 }); });
    b.addEventListener('mouseleave', () => gsap.to(l, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }));
  });
}

/* a soft wind, made here in the browser, for the sound button */
function sound() {
  const b = $('[data-sound]'); if (!b) return;
  let ctx, gain;
  b.addEventListener('click', () => {
    const on = !b.classList.contains('is-on'); b.classList.toggle('is-on', on);
    if (on && !ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), d = buf.getChannelData(0);
      let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3.2; }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
      gain = ctx.createGain(); gain.gain.value = 0; src.connect(f).connect(gain).connect(ctx.destination); src.start();
    }
    if (ctx) { ctx.resume(); gain.gain.linearRampToValueAtTime(on ? .22 : 0, ctx.currentTime + .6); }
  });
}

/* the grid of squares that covers the page between pages */
function pageTransition() {
  const t = $('[data-transition]'); if (!t) return;
  const cells = $$('.transition_column i', t), over = $('.transition_over', t);
  const cover = done => {
    t.classList.add('on');
    gsap.timeline({ onComplete: done })
      .fromTo(cells, { scaleX: 0 }, { scaleX: 1, duration: durS, ease: 'InOut', stagger: { each: .03, from: 'end', grid: [20, 12] } })
      .fromTo(over, { opacity: 0 }, { opacity: 1, duration: durL, ease: 'InOut' }, 0);
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const h = a.getAttribute('href'); if (!h || h[0] === '#' || a.target) return;
    if (a.origin !== location.origin) return;
    e.preventDefault();
    if (calm) { location.href = h; return; }
    store.set('zion-trans', '1'); cover(() => { location.href = h; });
  });
}

async function start() {
  window.__zion = 1;
  if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
  modals(); pageTransition();
  // a fault in one part must never leave the visitor on the opening screen
  for (const part of [heroScroll, reveals, sectionMoves, initScenes, benefits, apartments, seasons, blogTabs, faq, counters, magnetic, sliders, sound, headerTheme]) { try { part(); } catch (e) { console.warn(e); } }
  ScrollTrigger.refresh();
  addEventListener('load', () => ScrollTrigger.refresh());
  opening();
  if (location.hash) { const el = $(location.hash); if (el) setTimeout(() => scrollTo(el, { immediate: true }), 100); }
}
start();

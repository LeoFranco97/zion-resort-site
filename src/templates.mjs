import { SLUGS } from './content.mjs';
import { readFileSync } from 'node:fs';

const logoData = JSON.parse(readFileSync(new URL('./logo.json', import.meta.url)));
const shapes = JSON.parse(readFileSync(new URL('./article-shapes.json', import.meta.url)));
export const LOGO = `<svg viewBox="0 0 ${logoData.w} ${logoData.h}" aria-label="Zion" role="img" fill="currentColor"><path fill-rule="evenodd" d="${logoData.d}"/></svg>`;

const img = (n, alt = '', cls = 'img', extra = '') => `<img src="/img/${n}.webp" alt="${alt}" class="${cls}" loading="lazy" ${extra}>`;
const star = '<svg class="star" viewBox="0 0 8 12"><path fill="currentColor" d="M4 0c.4 3.6 1 5 4 6-3 1-3.600 2.400-4 6-.4-3.600-1-5-4-6 3-1 3.600-2.400 4-6Z"/></svg>';
const stars = `<span class="stars">${star}${star}${star}</span>`;
const title = (t, tag = 'h2') => `<div class="title" data-r="ctn">${stars}<${tag} class="p6">${t}</${tag}>${stars}</div>`;
const divider = (x = '') => `<div class="divider ${x}" data-r="line"><i></i><b></b></div>`;
const u = (n, x = '') => `<div class="u-${n} ${x}"></div>`;
const words = s => s;

const btn = (label, { cta = true, small = false, href = '#' } = {}) =>
  `<a href="${href}" class="btn${small ? ' btn--s' : ''}" ${cta ? 'data-cta' : ''}><span class="btn_label p6">${label}</span><i class="btn_bg"></i></a>`;
const circle = label => `<a href="#" class="btn-circle" data-cta data-magnetic><i class="btn-circle_bg"></i><span class="btn-circle_label p6">${label}</span></a>`;
const navItem = (label, href, cls = 'p6', attrs = '') =>
  `<a href="${href}" class="nav-item" ${attrs}><span class="nav-item_label"><span class="${cls}">${label}</span><span class="${cls} is-2" aria-hidden="true">${label}</span></span></a>`;

const arrow = d => `<svg viewBox="0 0 16 16" class="ico"><path fill="none" stroke="currentColor" d="${d === 'prev' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'}"/></svg>`;
const icoBtn = (kind, attr, label) => `<button type="button" class="btn-ico" ${attr} aria-label="${label}">${kind}<i class="btn-ico_bg"></i></button>`;
const plus = '<span class="ico-plus"><i></i><i></i></span>';
const play = '<svg viewBox="0 0 16 16" class="ico"><path fill="currentColor" d="M5 3v10l8-5z"/></svg>';
const pager = (total, cls = '') => `<div class="slider_pag ${cls}"><div class="slider_pag_count"><span class="p6" data-current>1</span><i class="nav-item-divider"></i><span class="p6" data-total>${total}</span></div><div class="btn-list">${icoBtn(arrow('prev'), 'data-prev', 'Previous')}${icoBtn(arrow('next'), 'data-next', 'Next')}</div></div>`;
const sound = '<button type="button" class="sound-w" aria-label="Sound" data-sound><span class="sound_list">' + Array.from({ length: 12 }, () => '<i></i>').join('') + '</span></button>';

function mapSvg() {
  const road = ['M120 1040C230 860 270 640 330 520S520 300 700 120', 'M60 760c120-40 220-30 300 40s220 120 380 160', 'M210 980c60-120 40-200 100-300s210-180 300-330', 'M360 1040c-30-120-60-210-20-330s170-250 240-290 120-110 180-130', 'M40 560c80-30 170-10 240 40s200 130 480 200', 'M640 20c-40 60-90 120-170 160S320 260 240 340'];
  return `<svg class="map" viewBox="0 0 808 1048" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-opacity=".16" stroke-width="2">${road.map(d => `<path d="${d}"/>`).join('')}</g><path fill="none" stroke="currentColor" stroke-opacity=".1" stroke-width="26" d="M420 1048C380 860 330 760 372 640s210-210 300-390 120-180 136-250"/></svg>`;
}
const pin = (l, cls, kind, label, sub = '') => {
  if (kind === 'logo') return `<div class="map-w_pin ${cls}"><span class="map-logo">${LOGO}</span></div>`;
  const dot = '<svg class="map-pin_ico" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5.500" fill="none" stroke="currentColor"/><circle cx="6" cy="6" r="3" fill="currentColor"/></svg>';
  const sublabel = sub ? `<div class="p6 pin text-gray">${sub}</div>` : '';
  return `<div class="map-w_pin ${cls}"><div class="map-pin map-pin--${kind}"><div class="map-pin_label"><h3 class="p6 pin">${label}</h3>${sublabel}</div>${dot}</div></div>`;
};

const header = (t, altHref) => `<nav class="header" data-header>
<div class="container"><div class="header_c">
<div class="header_left"><button type="button" class="menu-btn" data-menu aria-label="${t.menu}"><span class="menu-btn_ico"><i></i><i></i><i class="m"></i></span><span class="menu-btn_label f-desk"><span class="p6" data-open-label>${t.menu}</span><span class="p6 d-none" data-close-label>${t.close}</span></span></button>
<div class="b-desk">${navItem(t.tour, '#', 'p6', 'data-cta')}</div></div>
<div class="header_center"><a href="${t.home}" class="header_logo" aria-label="Zion" data-link>${LOGO}</a></div>
<div class="header_right"><div>${navItem(t.otherLabel, altHref, 'p6', 'data-link')}</div><div class="b-desk">${btn(t.cons, { small: true })}</div></div>
</div></div>
<div class="header_bg f-mob"><div class="divider"><i></i><b></b></div></div></nav>`;

const modals = t => `
<div class="cookies" data-cookies hidden><div class="grid-c"><div class="cookies_card"><div class="cookies_card_title"><div class="h6">${t.cookies}</div><button type="button" class="btn-close h6" data-cookie-ok aria-label="${t.close}">[<span>X</span>]</button></div>${u(8)}${divider()}${u(16)}<p class="p6">${t.cookieText} <a href="#" class="text-link" data-noop>${t.privacy}</a></p>${u(16)}<div>${navOk(t)}</div></div></div></div>
<div class="modal modal--cta" data-modal="cta" hidden><div class="modal_c"><div class="grid-c"><div class="modal_form-w">
<form class="modal_form" data-form novalidate><div class="modal_form_top"><div class="h6">${t.form.t}</div><button type="button" class="btn-close h6" data-close aria-label="${t.close}">[<span>X</span>]</button></div>
<div class="modal_form_fields"><label class="input"><input class="input_field p4" name="Name" type="text" required autocomplete="name"><span class="input_label p6">${t.form.name}</span></label>
<label class="input"><input class="input_field p4" name="Phone" type="tel" required autocomplete="tel"><span class="input_label p6">${t.form.phone}</span></label>
<p class="p6 form-note">${t.form.agree} <a href="#" class="text-link" data-noop>${t.privacy}</a>.</p><p class="p6 form-err" data-err hidden>${t.form.err}</p></div>
<div class="modal_form_btn"><button type="submit" class="btn"><span class="btn_label p6">${t.form.send}</span><i class="btn_bg"></i></button></div></form>
<div class="modal_form modal_ok" data-ok hidden><div class="modal_form_top"><div class="h6">${t.form.ok}</div><button type="button" class="btn-close h6" data-close aria-label="${t.close}">[<span>X</span>]</button></div><p class="p6">${t.form.okT}</p></div>
</div></div></div><div class="modal_over" data-close></div></div>
<div class="modal modal--media" data-modal="media" hidden><div class="modal_c"><video class="modal_video" src="/img/film.mp4" controls loop playsinline preload="none"></video><div class="modal_media_close"><button type="button" class="btn-close h6" data-close aria-label="${t.close}">[<span>X</span>]</button></div></div></div>
<div class="modal modal--menu" data-modal="menu" hidden><div class="modal_bg"><canvas class="scene b-desk" data-scene="menu"></canvas></div><div class="modal_c modal_menu">
<div class="modal_menu_top"></div>
<div class="modal_menu_nav">${t.nav.map(([l, h]) => navItem(l, h[0] === '#' ? h : `/${t.lang}/${h}`, 'h5', 'data-menu-link')).join('')}</div>
<div class="modal_menu_bot"><div class="contact-list"><div class="contact-item"><div class="p6 text-gray">${t.phoneL}</div>${navItem(t.phone, '#', 'p3', 'data-noop')}</div><div class="contact-item"><div class="p6 text-gray">${t.mailL}</div>${navItem(t.mail, '#', 'p3', 'data-noop')}</div></div>${u(32)}<div class="b-mob a-center">${btn(t.cons)}</div></div>
</div></div>
<div class="floating-tip" data-tip><span class="tag prim p6">${t.drag}</span></div>
<div class="transition" data-transition aria-hidden="true"><div class="transition_over"></div>${Array.from({ length: 20 }, () => `<div class="transition_column">${'<i></i>'.repeat(12)}</div>`).join('')}</div>`;

const navOk = t => `<button type="button" class="cookie-ok p3" data-cookie-ok>${t.ok}</button>`;

const preloader = t => `<div class="preloader on-dark" data-preloader><div class="preloader_bg"><div class="preloader_scene"><canvas class="scene" data-scene="preload"></canvas><div class="p6 a-center b-mob preloader_pct" data-pct>0%</div></div></div>
<div class="preloader_c"><div class="preloader_top">${u(136)}<div class="grid"><div class="preloader_d"><div class="preloader_mark" data-pl="ctn">${LOGO}</div>${u(32)}<div class="p6" data-pl="p">${t.pre.a[0]}<br>${t.pre.a[1]}</div></div></div></div>
<div class="preloader_bot"><div class="grid"><div class="preloader_dl"><div class="p6" data-pl="p">${t.pre.l[0]}<br>${t.pre.l[1]}</div></div><div class="preloader_dr"><div class="p6 a-right" data-pl="p">${t.pre.r[0]}<br>${t.pre.r[1]}</div></div></div>${u(8)}<div class="preloader_logo" data-pl-logo>${LOGO}</div>${u(8)}</div></div></div>`;

function hero(t) {
  const h = t.hero;
  const m = a => `<div class="hero-s_metriks"><h2 class="h4 mob_a-center" data-intro="h"><span class="h6">${a[0]}</span> ${a[1]}</h2>${u(12)}<h3 class="p6 mob_a-center" data-intro="p">${a[2]}<br>${a[3]}</h3></div>`;
  return `<section id="hero" class="section"><div class="container"><div class="hero-area">
<div class="mob_hero b-mob"><div class="img-w">${img('hero-m', '', 'img')}</div><i class="over-top"></i><i class="over-bot"></i><i class="over"></i></div>
<div class="hero-w" data-hero><div class="hero-s">
<div class="hero-s_t">${u(16, 'b-mob')}${u(104)}<div class="grid"><div class="hero-s_logo"><h1 class="p5 mob_a-center" data-intro="p">${h.label}</h1>${u(16)}<div class="hero-logo" data-hero-logo>${LOGO}</div></div>${m(h.m1)}${m(h.m2)}</div></div>
<div class="hero-s_b"><div class="grid"><div class="hero-s_title"><h2 class="h5" data-intro="h">${h.title}</h2></div></div>${u(48)}
<div class="hero-s_info"><h3 class="hero-info p6 b-desk" data-intro="p"><span class="active">${h.i1[0]}</span><span class="d-block">${h.i1[1]}</span></h3>
<h3 class="hero-info p6" data-intro="p"><span class="d-block">${h.i2[0]}</span>${h.i2[1]} <span class="active">${h.i2[2]}</span></h3>
<h3 class="hero-info p6 b-desk" data-intro="p"><span class="d-block">${h.i3[0]}</span>${h.i3[1]} <span class="active">${h.i3[2]}</span></h3></div>
${u(136, 'b-mob')}${u(72, 'b-desk')}${u(16)}<div class="hero-s_circle" data-intro="ctn">${circle(t.invest)}</div></div></div>
<div class="hero-bg b-desk" data-intro="video"><div class="img-w"><img src="/img/hero-a.webp" alt="" class="img" data-hero-a fetchpriority="high"><img src="/img/hero-b.webp" alt="" class="img hero-bg_b" data-hero-b></div><i class="over-grad"></i><i class="over-grad"></i><i class="over"></i></div>
</div>
<div class="hero-scene-over"><canvas class="scene" data-scene="heroOver"></canvas></div>
<div class="hero-scene-bg b-desk"><canvas class="scene" data-scene="heroBg"></canvas></div><div class="hero-themes"><i data-bg="light"></i><i data-bg="light"></i><i data-bg="dark"></i></div>
</div></div></section>`;
}

const prolog = t => `<section id="prolog" class="section bg-dark on-dark" data-bg="dark"><div class="container"><div class="prolog-w"><div class="prolog-s"><div class="grid fill"><div class="prolog-c">${u(136)}${title(t.prologue)}${u(32)}<h3 class="h5 a-center" data-highlight>${t.quote}</h3>${u(32)}<div class="btn-list" data-r="ctn">${btn(t.pdf, { small: false })}</div>${u(48)}</div></div></div><div class="prolog-scene b-desk" data-par="down"><canvas class="scene" data-scene="prolog"></canvas></div></div></div></section>
<div class="about-trans">${img('comb-1')}</div>`;

const about = t => `<section id="about" class="section" data-bg="light"><div class="container"><div class="about-w"><div class="about-s">${u(136)}
<div class="grid"><div class="about-s_title"><h2 class="h1 about-h" data-r="h">${t.brandTop}<br>${t.brandBot}</h2>${u(32)}<div class="p3-list" data-r="ctn"><span class="mini-mark">${LOGO}</span><p class="p3">${t.by}</p></div></div></div>${u(104)}
<div class="grid"><div class="about-s_about" data-par="up-d"><h3 class="h4" data-r="h">${t.about}</h3>${u(24)}<div class="divider-48">${divider()}</div>${u(24)}<p class="p6" data-r="p">${t.aboutText}</p>${u(32)}<div class="flex" data-r="ctn">${btn(t.cons)}</div></div>
<div class="about-s_concept" data-par="down-d">${u(136)}<h3 class="h4" data-r="h">${t.concept}</h3>${u(24)}<div class="divider-48">${divider()}</div>${u(24)}<p class="p6" data-r="p">${t.conceptText}<br><br>${t.conceptText2}</p>${u(32)}
<button type="button" class="video-card" data-media data-r="ctn"><span class="video-card_c"><i class="vl"></i><i class="vs"></i><span class="video-card_v"><video class="img" src="/img/film.mp4" poster="/img/land-2.webp" muted loop playsinline autoplay preload="metadata"></video></span><span class="video-card_ico">${play}</span></span>${u(8)}<span class="video-card_label p6">${t.video}</span></button></div></div>
<div class="about-s_img"><div class="about-img-w">${img('aerial', '', 'img img-auto about-img')}</div><div class="about-s_img_tr">${img('comb-2')}</div></div>
</div><div class="about-scene b-desk" data-par="down"><canvas class="scene" data-scene="about"></canvas></div></div></div></section>`;

function location(t) {
  const [a, b, c, d] = t.loc;
  const slides = t.slides.map(([n, w], i) => `<div class="loc-slide" data-slide><div class="loc-min"><div class="h1 loc-min_n">${n}<span class="h5">${t.min}</span></div><svg class="loc-ring" viewBox="0 0 360 360"><circle cx="180" cy="180" r="179.500" fill="none" stroke="currentColor" pathLength="1" stroke-dasharray="1" /></svg></div>${u(32)}<h4 class="p4 a-center"><span class="d-block">${t.walk}</span><span class="d-block">${w}</span></h4></div>`).join('');
  const cards = t.slides.map(([n, w]) => `<div class="swiper-slide mob-loc"><div class="mob-loc_card"><h4 class="h2">${n}<span class="h6">${t.min}</span></h4><p class="p6"><span class="d-block">${t.walkM}</span>${w}</p></div></div>`).join('');
  return `<section id="location" class="section bg-dark on-dark" data-bg="dark"><div class="container"><div class="location-s">${u(136)}
<div class="grid"><div class="loc-title"><h2 class="h1 loc-h" data-par="h1"><span class="r1" data-r="h">${a}</span><span class="r2"><span class="p1" data-r="ctn">${b}</span><span data-r="h">${c}</span></span><span class="r3" data-r="h">${d}</span></h2></div></div>${u(104)}
<div class="grid"><div class="loc-map"><div class="map-w">${mapSvg()}${pin(t, 'is-0', 'logo')}${pin(t, 'is-1', 'top', t.pins[0][0])}${pin(t, 'is-2', 'top', t.pins[1][0])}${pin(t, 'is-3', 'side', t.pins[2][0])}${pin(t, 'is-5', 'left', t.pins[3][0], t.pins[3][1])}${pin(t, 'is-6', 'right', t.pins[4][0], t.pins[4][1])}${pin(t, 'is-7', 'side', t.pins[5][0])}</div></div>
<div class="loc-desc"><p class="p4" data-r="p">${t.locText.map(l => `<span class="d-block">${l}</span>`).join('')}</p>${u(32)}<div class="flex" data-r="ctn">${btn(t.cons)}</div></div></div>
<div class="b-desk">${u(136)}<div class="grid-c"><div class="loc-slider on-light" data-slider-text data-par="down"><div class="loc-slider_t"><h3 class="p6">${t.infra}</h3></div><div class="loc-slides">${slides}</div>${pager(6, 'location')}</div></div>
<div class="grid-c"><div class="loc-cta-w"><div class="loc-cta"><div class="container"><div class="loc-addr">${u(16)}<h3 class="p6 text-gray">${t.locL}</h3>${u(4)}<p class="p6">${t.addr}</p>${u(24)}</div>${u(72)}<div class="loc-cta_btn">${circle(t.invest)}</div></div></div></div><div class="loc-img" data-par="up"><div class="img-w">${img('river')}</div></div></div></div>
<div class="b-mob"><div class="mob-loc-w on-light" data-par="down"><div class="swiper" data-swiper="free"><div class="swiper-wrapper">${cards}</div></div></div>${u(104)}<div class="loc-addr"><div class="p6 text-gray">${t.locL}</div>${u(4)}<p class="p6">${t.addr}</p></div></div>
${u(136)}</div></div></section>
<section class="section bg-dark"><div class="container">${u(136, 'b-desk')}</div></section>`;
}

const benefits = t => {
  const pics = ['room-1', 'room-2', 'field', 'room-3', 'room-4', 'fire', 'rocks', 'brand'];
  const card = ([name, lead, items], i) => `<div class="benefit-item"><div class="benefit-card" data-benefit data-i="${i}">
<div class="benefit-card_name on-color"><h4 class="p6 grow">${name}</h4><div class="benefit-card_btn"><span class="btn-ico"><span class="ico-16">${plus}</span><i class="btn-ico_bg"></i></span></div></div>
<div class="benefit-card_info on-dark" hidden><h5 class="h6">${lead}</h5>${u(48)}<div class="divider"><i></i><b></b></div>${items.map(x => `${u(16)}<p class="p6">${x}</p>${u(16)}<div class="line-s"></div>`).join('')}</div>
<div class="benefit-card_bg"><i class="over-bot"></i><div class="img-w">${img(pics[i])}</div>${i === 7 ? `<span class="brand-mark">${LOGO}</span>` : ''}</div></div></div>`;
  return `<section class="section"><div class="container"><div class="benefits-w"><div class="benefits-s"><div class="benefits-gap0 b-desk"></div>
<div class="benefits-title"><div class="grid"><div class="benefits-title_c">${title(t.uniq)}${u(32)}<h3 class="h3 a-center" data-r="h">${t.why}</h3></div></div></div>
<div class="benefits-intro"><div class="benefits-intro_c"><canvas class="scene" data-scene="benefitsIntro"></canvas></div></div>
<div id="benefits" class="benefits-gap"></div>
<div class="benefits-cms-w" data-benefits><div class="benefits-cms"><div class="benefits-list">${t.benefits.map(card).join('')}</div></div><div class="benefits-more b-mob"></div>
<div class="benefits-outro b-desk"><canvas class="scene" data-scene="benefitsOutro"></canvas></div>
<div class="benefits-gap-list b-desk">${t.benefits.map(() => '<i></i>').join('')}</div></div>
</div><div class="benefits-themes"><i data-bg="dark"></i><i data-bg="light"></i></div></div></div></section>`;
};

const timeline = t => `<section id="commissioning" class="section"><div class="container"><div class="com-w"><div class="com-s">${u(136)}
<h2 class="com-title h2" data-r="h"><span>${t.timeline[0]}</span><span>${t.timeline[1]}</span></h2>
<div class="com-img-w">${u(16, 'b-desk')}<div class="com-img"><div class="img-w">${img('court')}</div></div>${u(16, 'b-desk')}</div>
<div class="grid-c mob8"><div class="com-card-w on-dark" data-par-w><div class="com-card" data-par="img"><div class="com-card_t"><div class="h3">${t.tY[0]}</div><svg class="com-dash" viewBox="0 0 72 12"><path stroke="currentColor" d="M0 6h72"/></svg><div class="h3 a-right">${t.tY[1]}</div></div>${u(72)}<div class="line-s"></div>${t.stages.map(([a, b], i) => `${u(16)}<div class="row"><p class="p6 grow">${a}</p><p class="p6 a-right">${b}</p></div>${u(16)}${i < 2 ? '<div class="line-s"></div>' : ''}`).join('')}</div></div></div>${u(136, 'b-desk')}</div></div></div></section>`;

const apartments = t => {
  const pics = [[1, 2, 3, 4], [2, 5, 6, 1], [3, 1, 4, 6], [4, 6, 2, 5], [5, 3, 1, 2], [6, 4, 5, 3]];
  const tabs = t.units.map((x, i) => `<a href="#" class="apt-tab${i ? '' : ' is-active'}" data-tab="${i}"><svg class="apt-tab_ico" viewBox="0 0 8 12">${'<path fill="currentColor" d="M4 0c.4 3.600 1 5 4 6-3 1-3.600 2.400-4 6-.4-3.600-1-5-4-6 3-1 3.600-2.400 4-6Z"/>'}</svg><h5 class="p4">${x[0]}</h5></a>`).join('');
  const cards = t.units.map(([n, m, g, tags, d], i) => `<div class="apt-item${i ? '' : ' is-active'}" data-apt="${i}"><div class="apt-card"><div class="apt-info">
<div><div class="h2"><span class="h6">${t.from}</span> ${m} m<sup>2</sup></div>${u(24)}<h3 class="p4">${t.perM}</h3></div>${u(32)}
<div class="tag-list"><span class="tag prim"><span class="p6">${g}</span></span>${tags.map(x => `<span class="tag"><span class="p6">${x}</span></span>`).join('')}</div>${u(24)}
<div class="apt-info_bot"><p class="p6">${d}</p>${u(24)}<div class="apt-btns">${btn(t.ask)}<i class="nav-item-divider"></i><button type="button" class="btn-video" data-media><span class="btn-ico">${`<span class="ico-16">${play}</span>`}<i class="btn-ico_bg"></i></span><span class="p6">${t.watch[0]}<br>${t.watch[1]}</span></button></div></div>${u(4)}</div>
<div class="apt-gallery on-dark" data-slider>${pager(4)}<div class="apt-slides">${pics[i].map((p, j) => `<div class="apt-slide${j ? '' : ' is-active'}" data-slide>${img('room-' + p)}</div>`).join('')}</div></div></div></div>`).join('');
  return `<section class="section bg-light"><div class="container"><div class="apt-w"><div class="apt-s">${u(136)}
<div class="grid"><div class="apt-divider b-desk"><div class="divider-v"><i></i><b></b></div></div><div class="apt-content"><div class="apt-title">${title(t.apart)}</div>${u(32)}<h3 class="h5" data-highlight>${t.apartLead}</h3>${u(72)}<div class="grid g8"><div class="apt-desc"><p class="p4" data-r="p">${t.apartText.map(l => `<span class="d-block">${l}</span>`).join('')}</p><div class="header-h"></div></div></div></div></div>
<div id="apartments" class="grid"><div class="apt-tabs"><div class="apt-tabs_c">${u(16, 'b-desk')}${u(48, 'b-desk')}<h4 class="p6">${t.types}</h4><div class="b-mob">${u(8)}<div class="divider"><i></i><b></b></div></div>${u(16)}<div class="apt-tabs_list" data-tabs>${tabs}</div>${u(16)}<div class="b-mob"><div class="divider"><i></i><b></b></div>${u(8)}</div></div></div>
<div class="apt-divider b-desk apt-divider-2"><div class="divider-v"><i></i><b></b></div></div><div class="apt-cms"><div class="apt-list">${cards}</div></div></div>
${u(136, 'b-desk')}${u(72, 'b-mob')}<div class="com-tr">${img('comb-3')}</div></div>
<div class="apt-themes"><i data-bg="light"></i><i data-bg="dark"></i></div></div></div></section>`;
};

const finance = t => {
  const m = `<span class="h5">${t.fin}</span><svg class="ico-16" viewBox="0 0 8 12"><path fill="currentColor" d="M4 0c.4 3.600 1 5 4 6-3 1-3.600 2.400-4 6-.4-3.600-1-5-4-6 3-1 3.600-2.400 4-6Z"/></svg>`;
  const list = `<div class="marquee_list">${m.repeat(3)}</div>`;
  const data = t.data.map(([k, v, tip]) => `<div><div class="data-t"><h3 class="p6">${k}</h3>${tip ? `<span class="btn-info" tabindex="0"><span class="p6">(?)</span><span class="tool-tip on-light"><span class="p6">${tip}</span></span></span>` : ''}</div>${u(8)}<p class="p3">${v}</p></div>`).join('');
  return `<section id="finance" class="section bg-dark on-dark" data-bg="dark"><div class="container"><div class="fin-w"><div class="fin-s">${u(16)}<div>${divider()}${u(16)}<div class="marquee"><h2 class="sr">${t.fin}</h2>${list}${list}</div>${u(16)}${divider()}</div>${u(48)}
<div class="grid"><div class="fin-l1"><h3 class="p6">${t.divi}</h3>${u(24)}<div class="h3">${t.diviWhen[0]} ${t.diviWhen[1]}<br>${t.diviWhen[2]}</div>${u(32, 'b-mob')}</div><div class="fin-r"><div class="data-list">${data}</div></div></div>
<div class="mob-fin-scene b-mob"><div class="mob-fin-scene_c"><canvas class="scene" data-scene="fin" data-par="down"></canvas></div></div>${u(104)}
<div class="grid"><div class="fin-l2"><h2 class="p4">${t.forecast}</h2>${u(24)}<div class="line-s"></div>${t.fc.map(([a, b], i) => `${u(16)}<div class="row"><p class="p6 grow">${a}</p><p class="p6 a-right">${b}</p></div>${u(16)}${i < 1 ? '<div class="line-s"></div>' : ''}`).join('')}${u(48, 'b-mob')}</div>
<div class="fin-r"><h2 class="p4">${t.extra}</h2>${u(24)}<div class="line-s"></div>${t.ex.map((a, i) => `${u(16)}<p class="p6">${a}</p>${u(16)}${i < 2 ? '<div class="line-s"></div>' : ''}`).join('')}${u(48)}<div class="flex">${btn(t.cons)}</div></div></div>${u(136)}</div><div class="fin-scene b-desk"><canvas class="scene" data-scene="fin" data-par="down"></canvas></div></div></div></section>`;
};

const seasons = t => `<section id="seasons" class="section bg-dark on-dark" data-bg="dark"><div class="container">${u(136, 'b-desk')}<div class="sea-w"><div class="sea-s">
<div class="sea-tabs"><div class="sea-tabs_c" data-season-dial><div class="sea-tabs_label p6 a-center">${t.hold}</div>
<button type="button" class="sea-tab sea-tab-l is-active" data-season="0" aria-label="${t.season[0]}"><svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="4" fill="currentColor"/><path stroke="currentColor" d="M12 1v5M12 18v5M1 12h5M18 12h5M4 4l3.500 3.500M16.500 16.500 20 20M20 4l-3.500 3.500M7.500 16.500 4 20"/></svg></button>
<button type="button" class="sea-tab sea-tab-r" data-season="1" aria-label="${t.season[1]}"><svg viewBox="0 0 24 24" class="ico"><path stroke="currentColor" fill="none" d="M12 1v22M1 12h22M4 4l16 16M20 4 4 20"/></svg></button>
<svg class="sea-arc" viewBox="0 0 448 104" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-dasharray="1 5" stroke-linecap="round" d="M88 54c60 44 212 44 272 0"/></svg></div></div>
<div class="sea-slide is-active" data-season-slide>${u(104)}<div class="grid"><div class="sea-desc"><h2 class="h5">${t.summer}</h2>${u(48)}<div class="flex">${btn(t.cons)}</div></div></div>${u(104, 'b-desk')}</div>
<div class="sea-slide" data-season-slide hidden>${u(104)}<div class="grid"><div class="sea-desc"><h4 class="h1">${t.winterKm}<span class="h5">&nbsp;${t.km}</span></h4>${u(48)}<h2 class="h5">${t.winter}</h2>${u(48)}<div class="flex">${btn(t.cons)}</div></div></div>${u(104)}</div>
</div><div class="sea-scene b-desk" data-par="down"><canvas class="scene" data-scene="season"></canvas></div></div>${u(136)}</div></section>`;

const developer = t => `<section id="developer" class="section bg-dark on-dark" data-bg="dark"><div class="container"><div class="dev-w"><div class="dev-s">${u(136, 'b-desk')}<div class="grid"><div class="dev-lead">${title(t.dev)}${u(32)}<h3 class="h3 a-center" data-r="h">${t.devLead}</h3></div></div>${u(104)}
<div class="grid-c mob8"><div class="dev-card on-light" data-card data-par="up"><div class="dev-card_c"><div><p class="p6 a-center">${t.devCard}</p>${u(24)}<div class="center">${stars}</div></div><div class="dev-logo">${LOGO}</div><div>${u(48)}<div class="row"><p class="p6 grow">${t.devFoot[0]}</p><p class="p6">${t.devFoot[1]}</p></div>${u(16)}${divider()}</div></div></div></div></div>
<div class="dev-over b-desk"><div class="dev-clouds"><canvas class="scene" data-scene="clouds"></canvas></div></div><div class="dev-bg b-desk"><canvas class="scene" data-scene="ridges"></canvas></div></div></div></section>`;

const facts = t => `<section id="factoids" class="section bg-dark on-dark" data-bg="dark"><div class="container"><div class="fac-s">${u(136)}<div class="grid">${t.facts.map(([n, ...d], i) => `<div class="fac-card" data-par="${i % 2 ? 'down-d' : 'up-d'}"><div class="mob-line b-mob"><div class="line-s"></div></div>
<div class="fac-num b-desk"><h3 class="h1 a-center" data-count>${n}</h3>${u(48)}</div><div class="fac-desc b-desk"><p class="p6 a-center">${d.join('<br>')}</p></div><div class="fac-desc b-mob"><p class="p6">${d.join(' ')}</p></div><div class="fac-num b-mob"><p class="h2 a-right">${n}</p></div></div>`).join('')}</div>${u(16)}<div class="fac-scene"><div class="fac-scene_c"><canvas class="scene" data-scene="lake"></canvas></div></div></div></div></section>`;

const gallery = t => {
  const pics = ['hero-a', 'court', 'forest', 'hero-b', 'land-1', 'room-1', 'land-2', 'room-3', 'river', 'rocks', 'land-3', 'room-5', 'room-2', 'fire'];
  return `<section id="gallery" class="section"><div class="container"><div class="gal-w"><div class="gal-s">${u(16)}<div class="gal-title"><h2 class="h2" data-r="h">${t.gallery[0]}</h2><div class="h2" data-r="h">${t.gallery[1]}</div></div>${u(16)}
<div class="gal-cms on-dark" data-slider>${pager(14)}<i class="over-bot"></i><div class="gal-slides">${pics.map((p, i) => `<div class="gal-slide${i ? '' : ' is-active'}" data-slide>${img(p)}</div>`).join('')}</div></div>
<div class="grid-c"><div class="gal-card-w" data-par-w><div class="gal-card" data-par="img"><div class="gal-card_btn">${circle(t.invest)}</div><div class="grid g4"><div class="gal-card_d"><span class="mini-logo">${LOGO}</span>${u(32)}<p class="p6">${t.galleryCard}</p></div></div></div></div></div>${u(16)}</div>
<div class="gal-bg"><div class="gal-bg_tr">${img('comb-3')}</div><div class="gal-bg_b"></div></div></div></div></section>`;
};

const newsCard = (t, k) => {
  const [title_, sum, , pic] = t.articles[k];
  return `<div class="news-card"><a href="/${t.lang}/news/${SLUGS[k]}" class="news-card_link" data-link aria-label="${title_}"></a><div class="news-card_img"><div class="img-w">${img(pic)}</div></div>${u(24)}<div class="divider"><i></i><b></b></div>${u(16)}<h4 class="h5">${title_}</h4>${u(24)}<div class="divider-48"><div class="divider"><i></i><b></b></div></div>${u(24)}<p class="p6">${sum}</p></div>`;
};
const stage = ([d, ti]) => `<div class="stage"><a href="#" class="news-card_link" data-noop aria-label="${ti}"></a>${u(24)}<div class="grid"><div class="stage_date"><div class="p4">${d}</div></div><div class="stage_t"><h4 class="p4">${ti}</h4><svg class="ico-24" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" d="M6 3l5 5-5 5"/></svg></div></div>${u(24)}<div class="divider"><i></i><b></b></div></div>`;

const blog = t => `<section id="blog" class="section bg-dark on-dark clip" data-bg="dark"><div class="container"><div class="blog-s">${u(136)}<div class="blog-title">${title(t.blog)}${u(32)}<h3 class="h2 a-center" data-r="h">${t.news}</h3>${u(48)}
<div class="blog-sub"><div class="grow b-desk"><div class="p4">${t.last}</div></div><div class="tabs" data-blog-tabs><i class="tabs_hl"></i><button type="button" class="tab is-active p6" data-blog-tab="0">${t.tabs[0]}</button><button type="button" class="tab p6" data-blog-tab="1">${t.tabs[1]}</button></div><div class="grow b-desk"><div class="p4 a-right">${t.date}</div></div></div></div>${u(104)}
<div class="tab-list"><div class="tab-c is-active" data-blog-c><div class="news-slider swiper" data-swiper="news" data-tip-zone><div class="swiper-wrapper" data-slide-reveal>${['one', 'two', 'three'].map(k => `<div class="swiper-slide news-slide">${newsCard(t, k)}</div>`).join('')}</div></div>${u(72)}<div class="center">${viewAll(t)}</div></div>
<div class="tab-c" data-blog-c hidden><div class="line-s"></div>${t.progress.map(stage).join('')}${u(72)}<div class="center">${viewAll(t, 'construction-progress')}</div></div></div>${u(72)}</div></div></section>`;
const viewAll = (t, p = 'news') => `<a href="/${t.lang}/${p}" class="nav-item" data-link><span class="nav-item_label"><span class="p3">${t.viewAll}</span><span class="p3 is-2" aria-hidden="true">${t.viewAll}</span></span><span class="nav-item_line"><span class="divider"><i></i><b></b></span></span></a>`;

const cta = t => `<section id="cta" class="section"><div class="container"><div class="cta-w"><div class="cta-s"><div class="grid-c mob8"><div class="cta-card-w on-light" data-card data-par="up"><div class="cta-card"><div><p class="p6 a-center">${t.ctaT}</p>${u(24)}<div class="center">${stars}</div></div><div class="cta-card_m"></div><div><h3 class="h5 a-center">${t.ctaH}</h3>${u(24)}<div class="center">${btn(t.cons)}</div></div></div></div></div></div>
<div class="cta-bg"><div class="cta-tr-t">${img('comb-4')}</div><div class="img-w">${img('forest', '', 'img img-p', 'data-par="img"')}</div><div class="cta-tr-b">${img('comb-5')}</div></div></div></div></section>`;

const faq = t => `<section id="faq" class="section bg-dark on-dark" data-bg="dark"><div class="container"><div class="faq-w"><div class="faq-title"><div class="grid"><div class="faq-title_w"><div class="faq-title_c"><div class="h1">F</div><div class="faq-d1"><p class="p6">${t.faq[0]}<br>${t.faq[1]}</p></div><div class="h1">A</div><div class="faq-d2"><p class="p6 a-center">${t.faq[2]}<br>${t.faq[3]}</p></div><div class="h1">Q</div></div></div></div></div>
<div class="faq-scenes"><canvas class="scene" data-scene="faq"></canvas></div>${u(136)}${u(32)}
<div class="grid"><div class="faq-cms"><div class="line-s"></div>${t.faqs.map(([q, a], i) => `<div class="faq-card" data-faq><button type="button" class="faq-q" aria-expanded="false">${u(24)}<span class="faq-q_r"><span class="p5 faq-n">${String(i + 1).padStart(2, '0')}</span><span class="p5 grow">${q}</span><span class="faq-ico ico-plus"><i></i><i></i></span></span>${u(24)}</button><div class="faq-a"><div class="faq-a_c"><p class="p6">${a}</p>${u(24)}</div></div><div class="line-s"></div></div>`).join('')}</div></div>${u(136, 'b-desk')}</div></div></section>`;

const footer = t => `<div class="footer"><section class="section bg-dark on-dark"><div class="container"><div class="foot-area"><div class="foot-w"><div class="foot-s">${u(136)}<div class="foot-c">
<div class="foot-top"><div class="grid"><div class="foot-info-l"><h3 class="p6 text-gray">${t.footLoc}</h3>${u(4)}<p class="p6 foot-addr">${t.addr}</p>${u(24)}<div class="social"><span class="btn-ico"><span class="ico-16"><svg viewBox="0 0 16 16" class="ico"><rect x="2" y="2" width="12" height="12" rx="3" fill="none" stroke="currentColor"/><circle cx="8" cy="8" r="2.500" fill="none" stroke="currentColor"/></svg></span><i class="btn-ico_bg"></i></span><span class="btn-ico"><span class="ico-16"><svg viewBox="0 0 16 16" class="ico"><path fill="currentColor" d="M9 15V9h2l.5-2.500H9V5c0-.8.300-1.200 1.200-1.200h1.300V1.500C11 1.400 10.300 1.300 9.700 1.300 7.700 1.300 6.500 2.500 6.500 4.700v1.800h-2V9h2v6z"/></svg></span><i class="btn-ico_bg"></i></span><span class="btn-ico"><span class="ico-16"><svg viewBox="0 0 16 16" class="ico"><rect x="1" y="3" width="14" height="10" rx="2.500" fill="none" stroke="currentColor"/><path fill="currentColor" d="M6.500 5.500 11 8l-4.500 2.500z"/></svg></span><i class="btn-ico_bg"></i></span></div></div>
<div class="foot-info-r"><h3 class="p6 text-gray a-right">${t.sales}</h3>${u(4)}<div class="foot-r"><p class="p6 a-right">${t.cityA} ${t.addrA}</p></div>${u(16)}<p class="p6 text-gray a-right">${t.cityB}</p>${u(4)}<div class="foot-r"><p class="p6 a-right">${t.addrB[0]}<br>${t.addrB[1]}</p></div></div></div></div>
<div class="foot-mid b-mob"></div>
<div class="foot-bot"><div class="foot-big">${navItem(t.phone, '#', 'p2', 'data-noop')}${navItem(t.mail, '#', 'p2', 'data-noop')}</div></div>
<div class="foot-legal"><span class="p6 foot-copy">${t.copy}</span><a href="#" class="p6 foot-pp" data-noop>${t.privacy}</a></div>
</div></div><div class="foot-bg"><canvas class="scene" data-scene="footer"></canvas></div></div><div class="foot-trigger" id="footer"></div></div></div></section><div class="foot-themes"><i data-bg="dark"></i><i data-bg="light"></i></div></div>`;

export const shell = (t, { title: pageTitle, desc, body, path, altPath, page }) => `<!doctype html>
<html lang="${t.lang === 'ua' ? 'uk' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pageTitle}</title><meta name="description" content="${desc}"><meta property="og:title" content="${pageTitle}"><meta property="og:description" content="${desc}">
<link rel="icon" href="/favicon.svg"><style>html{background:#a89474}html.boot-dark{background:#2c2824}</style>
<script>(function(){var d=document.documentElement,c=d.classList,v,t;try{v=sessionStorage.getItem('zion-seen');t=sessionStorage.getItem('zion-trans')}catch(e){}c.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){c.add('boot');c.add(t?'boot-light':'boot-dark');if(!v)c.add('first');setTimeout(function(){if(!window.__zion)c.remove('boot','boot-dark','boot-light','first')},5000)}})()</script><link rel="stylesheet" href="/site.css"><link rel="preload" as="image" href="/img/hero-a.webp"></head>
<body class="page-${page}"><div class="noise"></div>${preloader(t)}${header(t, altPath)}<main>${body}</main>${footer(t)}${sound}${modals(t)}
<script src="/site.js" defer></script></body></html>`;

export const homePage = t => hero(t) + prolog(t) + about(t) + location(t) + benefits(t) + timeline(t) + apartments(t) + finance(t) + seasons(t) + developer(t) + facts(t) + gallery(t) + blog(t) + cta(t) + faq(t);

function articleBody(t, k) {
  const [ti, sum, date, pic] = t.articles[k];
  let li = 0;
  const say = n => { let s = ''; while (s.length < n) { s += t.lorem[li++ % t.lorem.length] + ' '; } return s.trim(); };
  const shape = shapes[SLUGS[k]] || [];
  const every = { one: 99, two: 12, three: 4 }[k];
  let pc = 0, hc = 0;
  const blocks = shape.map(b => {
    if (b.t === 'img') return `<figure>${img(pic, t.figcap, 'img', `style="aspect-ratio:${b.w}/${b.h};width:${Math.min(100, b.w / 9.28)}%;margin:0 auto"`)}<figcaption>${t.figcap}</figcaption></figure>`;
    if (b.t === 'h') { hc++; return hc % 3 === 0 ? `<h3>${t.subhead}</h3>` : `<h2>${t.subhead}</h2>`; }
    pc++;
    if (k === 'two' && pc % 7 === 0) return `<ul>${t.lorem.slice(0, 3).map(x => `<li>${x}</li>`).join('')}</ul>`;
    const q = pc % every === 0 ? `<blockquote>${t.quoteS}</blockquote>` : '';
    return `<p>${say(Math.round((b.n || 120) * (k === 'three' ? 1 : .9)))}</p>${q}`;
  }).join('');
  const others = ['one', 'two', 'three'];
  const nk = others[(others.indexOf(k) + 1) % 3];
  const [nt, ns, , np] = t.articles[nk];
  return `<section class="section" data-bg="light"><div class="container"><div class="art-w">
<div class="article-scene"><canvas class="scene" data-scene="article"></canvas></div><div class="art-s">${u(136)}<div class="art-back"><a href="/${t.lang}/news" class="btn-back" data-link><span class="btn-ico"><span class="ico-16">${arrow('prev')}</span><i class="btn-ico_bg"></i></span><span class="p6">${t.back}</span></a></div>
<div class="center"><div class="title">${stars}<span class="p6">${date}</span>${stars}</div></div>${u(32)}
<div class="grid"><div class="art-h"><h1 class="h2 a-center">${ti}</h1></div></div>${u(48)}
<div class="center"><div class="divider-104"><div class="divider"><i></i><b></b></div></div></div>${u(32)}
<div class="grid"><div class="art-d"><p class="p6 a-center">${sum}</p></div></div>${u(32)}
<div class="grid"><div class="art-col"><div class="art-slider on-dark" data-slider>${pager(3)}<i class="over-bot"></i><div class="art-slides">${[pic, 'hero-a', 'land-3'].map((p, i) => `<div class="art-slide${i ? '' : ' is-active'}" data-slide>${img(p)}</div>`).join('')}</div></div>${u(32)}<div class="article-text">${blocks}</div></div></div>${u(136)}</div>
</div></div></section>
<section class="section bg-light"><div class="container"><div class="next-s"><div class="next-t"><h2 class="p6">${t.next}</h2><a href="/${t.lang}/news" class="p6 next-all" data-link>${t.viewAll}</a></div>${u(12)}<div class="divider"><i></i><b></b></div>${u(16)}
<div class="next-card"><a href="/${t.lang}/news/${SLUGS[nk]}" class="news-card_link" data-link aria-label="${nt}"></a><div class="grid"><div class="next-a"><div class="h5">${nt}</div></div><div class="next-b"><div class="img-w">${img(np)}</div></div><div class="next-c"><p class="p6">${ns}</p>${u(16)}<span class="next-read p3">${t.read}</span></div></div></div></div></div><div class="next-tr">${img('comb-3')}</div></section>`;
}
export const articlePage = articleBody;

export const newsIndex = t => `<section class="section" data-bg="light"><div class="container">${u(136)}<div class="center">${title(t.blog)}</div>${u(32)}<h1 class="h2 a-center">${t.newsTitle}</h1>${u(104)}<div class="news-grid">${['one', 'two', 'three'].map(k => newsCard(t, k)).join('')}</div>${u(136)}</div></section>`;
export const progressIndex = t => `<section class="section" data-bg="light"><div class="container">${u(136)}<div class="center">${title(t.blog)}</div>${u(32)}<h1 class="h2 a-center">${t.progressTitle}</h1>${u(104)}<div class="line-s"></div>${t.progress.map(stage).join('')}${u(136)}</div></section>`;

// The woven scenes. Every picture here is painted from code for this site, in greys on black:
// black stays see-through, the rest becomes vertical bars whose width follows the grey.

const fract = x => x - Math.floor(x);
const hash = n => fract(Math.sin(n * 127.1) * 43758.5453);
const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
function n1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; }
const fbm1 = (x, o = 5) => { let v = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { v += a * n1(x * f + i * 17); a *= .5; f *= 2; } return v; };
function n2(x, y) {
  const i = Math.floor(x), j = Math.floor(y), f = x - i, g = y - j, u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), d = hash2(i + 1, j + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm2 = (x, y, o = 4) => { let v = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { v += a * n2(x * f + i * 9, y * f); a *= .5; f *= 2; } return v; };
const grey = v => { const c = Math.round(clamp(v) * 255); return `rgb(${c},${c},${c})`; };

function pixels(g, W, H, fn) {
  const d = g.createImageData(W, H), p = d.data;
  for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) { const v = fn(x / W, y / H); const c = clamp(v) * 255; p[i] = p[i + 1] = p[i + 2] = c; p[i + 3] = 255; }
  g.putImageData(d, 0, 0);
}
function disc(g, x, y, r, v) { g.fillStyle = grey(v); g.beginPath(); g.arc(x, y, Math.max(0, r), 0, 7); g.fill(); }
function oval(g, x, y, rx, ry, v, rot = 0) { g.fillStyle = grey(v); g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); g.fill(); }
function stroke(g, pts, width, v) { g.strokeStyle = grey(v); g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }

/* a long-necked bird in flight, seen from the side, heading right */
function crane(g, x, y, s, ph, v) {
  const flap = Math.sin(ph), far = v * .7;
  // far wing
  g.fillStyle = grey(far); g.beginPath(); g.moveTo(x + s * .22, y - s * .04); g.quadraticCurveTo(x - s * .05, y - s * (.1 + flap * .5), x - s * .35, y - s * flap * .95 - s * .08); g.lineTo(x - s * .28, y + s * .02); g.closePath(); g.fill();
  oval(g, x, y, s * .46, s * .115, v);
  stroke(g, [[x + s * .36, y - s * .03], [x + s * .78, y - s * .1], [x + s * 1.02, y - s * .14]], s * .075, v);
  disc(g, x + s * 1.04, y - s * .14, s * .065, v * .9);
  stroke(g, [[x + s * 1.08, y - s * .14], [x + s * 1.3, y - s * .1]], s * .03, v);
  stroke(g, [[x - s * .35, y + s * .03], [x - s * 1.25, y + s * .12 + flap * s * .03]], s * .035, v * .85);
  // near wing with fingered tip
  g.fillStyle = grey(v); g.beginPath(); g.moveTo(x + s * .26, y - s * .02); g.quadraticCurveTo(x, y - s * (.14 + flap * .62), x - s * .42, y - s * flap * 1.08 - s * .1); g.lineTo(x - s * .3, y - s * flap * .9); g.lineTo(x - s * .34, y - s * flap * .72 + s * .04); g.quadraticCurveTo(x - s * .12, y - s * flap * .2 + s * .05, x - s * .2, y + s * .1); g.closePath(); g.fill();
}
const flocks = [
  [[.2, .42, .15, 0], [.42, .3, .13, 1.4], [.62, .46, .14, 2.6], [.78, .32, .115, 3.9], [.5, .62, .12, 5.1]],
  [[.26, .5, .17, .6], [.58, .36, .16, 2.2], [.8, .56, .14, 4.1]],
  [[.14, .3, .11, .3], [.34, .46, .12, 1.7], [.52, .28, .1, 3.2], [.68, .5, .12, 4.4], [.86, .34, .1, 5.5], [.46, .68, .11, 2.2]],
  [[.36, .48, .19, 1.1], [.68, .4, .17, 3.1]],
];
const birds = kind => (g, w, h, t) => { for (const [x, y, s, p] of flocks[kind]) crane(g, w * x, h * y, w * s, t * 6.2 + p, .86 - (p % 1) * .25); };
function storkBig(g, w, h, t) {
  const f = Math.sin(t * 2.6), cx = w * .5, cy = h * .5, v = .78;
  const wing = sd => { g.fillStyle = grey(v); g.beginPath(); g.moveTo(cx + sd * w * .03, cy - h * .05); g.quadraticCurveTo(cx + sd * w * .22, cy - h * (.14 + f * .12), cx + sd * w * .46, cy - h * (.1 + f * .26)); g.lineTo(cx + sd * w * .4, cy - h * (.03 + f * .22)); g.lineTo(cx + sd * w * .42, cy + h * (.02 - f * .18)); g.quadraticCurveTo(cx + sd * w * .2, cy + h * .08, cx + sd * w * .04, cy + h * .1); g.closePath(); g.fill(); };
  wing(-1); wing(1); oval(g, cx, cy + h * .02, w * .045, h * .2, v);
  stroke(g, [[cx, cy - h * .16], [cx + w * .01, cy - h * .36]], w * .022, v); disc(g, cx + w * .012, cy - h * .37, w * .024, v * .9); stroke(g, [[cx + w * .012, cy - h * .38], [cx + w * .02, cy - h * .47]], w * .01, .95);
  stroke(g, [[cx - w * .012, cy + h * .2], [cx - w * .02, cy + h * .46]], w * .009, v); stroke(g, [[cx + w * .012, cy + h * .2], [cx + w * .02, cy + h * .46]], w * .009, v);
}

/* a sheep of my own drawing: wool as overlapping tufts */
function wool(g, cx, cy, rx, ry, seed, count, lo, hi) {
  for (let i = 0; i < count; i++) {
    const a = hash(i * 1.7 + seed) * 6.283, r = Math.sqrt(hash(i * 3.1 + seed)), s = .16 + hash(i * 5.3 + seed) * .2;
    const x = cx + Math.cos(a) * r * rx, y = cy + Math.sin(a) * r * ry;
    disc(g, x, y, Math.min(rx, ry) * s, lo + (hi - lo) * hash(i * 7.9 + seed));
  }
}
function sheepSide(g, x, y, s, seed, face = -1, nod = 0) {
  const leg = (dx, l) => stroke(g, [[x + dx * s, y + s * .3], [x + dx * s + s * .01, y + s * .3 + l * s]], s * .1, .3);
  leg(-.36, .5); leg(-.2, .54); leg(.22, .54); leg(.38, .5);
  oval(g, x, y, s * .66, s * .44, .55);
  wool(g, x, y, s * .66, s * .44, seed, 170, .34, .9);
  const hx = x + face * s * .72, hy = y - s * .1 + nod * s * .3;
  oval(g, hx - face * s * .08, hy, s * .2, s * .19, .55);
  wool(g, hx - face * s * .1, hy - s * .02, s * .19, s * .18, seed + 3, 30, .4, .85);
  oval(g, hx + face * s * .03, hy + s * .02, s * .17, s * .1, .36, face * .3);
  oval(g, hx - face * s * .06, hy - s * .11, s * .1, s * .04, .42, face * -.5);
  disc(g, hx + face * s * .05, hy, s * .02, .08);
}
function sheepFront(g, x, y, s, seed) {
  stroke(g, [[x - s * .17, y + s * .38], [x - s * .16, y + s * .88]], s * .1, .3);
  stroke(g, [[x + s * .17, y + s * .38], [x + s * .16, y + s * .88]], s * .1, .3);
  oval(g, x, y, s * .5, s * .52, .55);
  wool(g, x, y, s * .5, s * .52, seed, 170, .34, .9);
  oval(g, x, y - s * .06, s * .16, s * .24, .36);
  oval(g, x - s * .19, y - s * .15, s * .1, s * .035, .42, .4); oval(g, x + s * .19, y - s * .15, s * .1, s * .035, .42, -.4);
  disc(g, x - s * .07, y - s * .1, s * .018, .08); disc(g, x + s * .07, y - s * .1, s * .018, .08);
}
const flock = (g, w, h, t) => {
  sheepSide(g, w * .13, h * .44, w * .095, 3, -1, Math.max(0, Math.sin(t * .7)));
  sheepSide(g, w * .42, h * .5, w * .118, 7, 1, Math.max(0, Math.sin(t * .5 + 2)));
  sheepSide(g, w * .74, h * .42, w * .09, 11, -1, Math.max(0, Math.sin(t * .6 + 4)));
};
const flockFar = (g, w, h, t) => {
  sheepSide(g, w * .3, h * .55, w * .17, 5, -1, Math.max(0, Math.sin(t * .6)));
  sheepSide(g, w * .68, h * .6, w * .15, 9, 1, Math.max(0, Math.sin(t * .5 + 1)));
};
const stack = (g, w, h, t) => {
  const b = Math.sin(t * .9) * h * .002;
  sheepFront(g, w * .47, h * .16 + b, w * .3, 21);
  sheepSide(g, w * .5, h * .445 + b, w * .36, 23, -1);
  sheepSide(g, w * .46, h * .765, w * .4, 27, -1);
  sheepSide(g, w * .8, h * .9, w * .16, 29, 1, Math.max(0, Math.sin(t * .8)));
};

/* mountains: layered ridges with rock texture */
function ridges(layers) {
  return (g, w, h) => pixels(g, w, h, (u, v) => {
    let out = 0;
    for (const [base, amp, freq, seed, val, tex] of layers) {
      const top = base - amp * (fbm1(u * freq + seed) - .5) * 2;
      if (v >= top) out = clamp(val + (fbm2(u * freq * 7, v * 22 + seed, 3) - .5) * tex - (v - top) * .25, .03, 1);
    }
    return out;
  });
}
const mountainOver = ridges([[.34, .16, 3, 3, .78, .25], [.5, .13, 4, 8, .55, .35], [.68, .1, 5, 12, .3, .3], [.86, .06, 6, 15, .08, .08]]);
const mountainBg = ridges([[.3, .2, 2.4, 21, .55, .4], [.58, .14, 3.4, 25, .35, .3], [.8, .08, 4, 29, .12, .15]]);
const finPeak = (g, w, h) => pixels(g, w, h, (u, v) => {
  const ridge = .06 + Math.abs(u - .5 - (fbm1(v * 4) - .5) * .12) * 1.5 + (fbm1(u * 9) - .5) * .12;
  if (v < ridge) return 0;
  const n = fbm2(u * 14, v * 10, 4), crag = Math.abs(fract(u * 7 + v * 3 + n * 1.4) - .5) * 2;
  return clamp(.16 + crag * .35 + n * .3 - (v - ridge) * .12, .05, .75);
});
const summerArt = (g, w, h) => pixels(g, w, h, (u, v) => {
  const spire = .08 + Math.pow(Math.abs(u - .72 - (fbm1(v * 3 + 2) - .5) * .1) * 3.2, 1.4) + (fbm1(u * 11 + 4) - .5) * .08;
  const shore = .8 + (fbm1(u * 5 + 7) - .5) * .12;
  if (v > shore) { const s = fbm2(u * 10, v * 40 + 3, 3); return clamp(.08 + s * .5 * smooth(.3, .7, fract(u * 5 + v * 2)), .04, .7); }
  if (v < spire) return 0;
  const n = fbm2(u * 18, v * 12, 4);
  return clamp(.25 + n * .65 * (1 - (v - spire) * .5), .05, .9);
});
const winterArt = (g, w, h, t) => {
  if (!g._base) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const b = c.getContext('2d');
    pixels(b, w, h, (u, v) => {
      const top = .22 + Math.abs(u - .46 - (fbm1(v * 3) - .5) * .1) * 1.1 + (fbm1(u * 8 + 5) - .5) * .1;
      if (v < top) return 0;
      const snow = v < top + .22 * fbm2(u * 6, v * 3, 3) + .05;
      return snow ? .8 + fbm2(u * 12, v * 12, 2) * .2 : clamp(.14 + fbm2(u * 16, v * 16, 3) * .4, .05, .7);
    });
    g._base = c;
  }
  g.drawImage(g._base, 0, 0);
  for (let i = 0; i < 70; i++) disc(g, w * fract(hash(i) + Math.sin(t * .4 + i) * .02), h * fract(hash(i + 7) + t * (.05 + hash(i + 3) * .05)), w * .006, .9);
};
const cloudArt = seed => (g, w, h) => pixels(g, w, h, (u, v) => {
  const dx = (u - .5) * 2, dy = (v - .55) * 2.6, env = 1 - (dx * dx + dy * dy);
  const n = fbm2(u * 4.5 + seed, v * 6 + seed, 5);
  const d = n + env * .42 - .56;
  if (d <= 0) return 0;
  return clamp(.92 - d * 2.1 + (fbm2(u * 16, v * 16 + seed, 2) - .5) * .4, .12, .95);
});
const stones = (g, w, h) => pixels(g, w, h, (u, v) => { const m = (cx, wd, top) => { const d = Math.abs(u - cx) / wd; return d < 1 ? top + (1 - Math.sqrt(1 - d * d)) * (1 - top) : 2; }; const t = Math.min(m(.3, .24, .08), m(.72, .2, .2)); return v < t ? 0 : clamp(.16 + fbm2(u * 30, v * 16, 2) * .55, .08, .8); });

/* a tall pine that moves a little in the wind */
function pineTree(g, w, h, t) {
  g.save(); g.translate(w * .5, h); g.transform(1, 0, Math.sin(t * .6) * .025, 1, 0, 0);
  const H = h * .98, tiers = 16;
  stroke(g, [[0, 0], [0, -H]], w * .018, .14);
  for (let i = 0; i < tiers; i++) {
    const a = i / tiers, y = -H * (1 - a), wide = w * (.03 + a * .42);
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 7; k++) {
      const q = k / 7, dy = H * .05 * (1 + q) + (hash(i * 9 + k + s) - .5) * H * .02;
      g.fillStyle = grey(.14 + hash(i * 3 + k * 5 + s) * .46);
      g.beginPath(); g.moveTo(0, y); g.lineTo(s * wide * (.45 + q * .55), y + dy); g.lineTo(s * wide * (.3 + q * .3), y + dy + H * .025); g.closePath(); g.fill();
    }
  }
  g.restore();
}
/* wild flowers that grow when first seen, then sway */
function bloom(g, x, y, s, a, v) {
  for (let i = 0; i < 5; i++) { const b = a + i * 1.26; oval(g, x + Math.cos(b) * s * .5, y + Math.sin(b) * s * .4, s * .62, s * .42, v + hash(i) * .08, b); }
  disc(g, x, y, s * .22, .5);
}
const flowers = side => (g, w, h, t) => {
  const grow = smooth(0, 3.4, t), sway = Math.sin(t * .7) * w * .008;
  const plants = [[.46, .96, .08, .22, 1], [.72, .98, .3, .13, 3], [.26, .98, .5, .11, 5], [.58, .99, .58, .09, 7]];
  for (const [bx, by, top, size, seed] of plants) {
    const x0 = w * (side > 0 ? bx : 1 - bx), y0 = h * by, hh = (by - top) * h * grow;
    const pts = []; for (let i = 0; i <= 14; i++) { const q = i / 14; pts.push([x0 + Math.sin(q * 3 + seed) * w * .035 * q + sway * q * q, y0 - hh * q]); }
    stroke(g, pts, w * .016, .2);
    for (let k = 1; k <= 5; k++) {
      const p = pts[Math.round(k * 2.2)], dir = k % 2 ? 1 : -1, l = w * .15 * grow * (1 - k * .1);
      g.fillStyle = grey(.16 + hash(k + seed) * .14); g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo(p[0] + dir * l * .6, p[1] - l * .7, p[0] + dir * l, p[1] - l * .1); g.quadraticCurveTo(p[0] + dir * l * .5, p[1] + l * .1, p[0], p[1]); g.closePath(); g.fill();
    }
    const open = smooth(.55, 1, grow), tip = pts[14];
    if (open > 0) bloom(g, tip[0], tip[1], w * size * .8 * open, seed, .13);
  }
};
/* a black opening in the dark, which the view passes through */
const holeArt = (g, w, h) => pixels(g, w, h, (u, v) => {
  const dx = (u - .5) / .24, dy = (v - .68) / .13, r = Math.sqrt(dx * dx + dy * dy) + (fbm2(u * 9, v * 9, 3) - .5) * .5;
  if (r < 1) return 0;
  return clamp(.1 + fbm2(u * 7, v * 12, 3) * .16 + smooth(1, 1.5, 2 - r) * .3, .05, .6);
});
function hikers(g, w, h, t) {
  const man = (x, y, s, ph) => {
    oval(g, x, y - s * .52, s * .1, s * .34, .22); disc(g, x, y - s * .95, s * .09, .28);
    stroke(g, [[x, y - s * .2], [x - s * .12 * Math.sin(ph), y + s * .3]], s * .07, .16); stroke(g, [[x, y - s * .2], [x + s * .12 * Math.sin(ph), y + s * .3]], s * .07, .16);
    oval(g, x - s * .1, y - s * .58, s * .1, s * .24, .4);
  };
  pixelsHill(g, w, h);
  man(w * .42, h * .66, h * .17, t * 2); man(w * .55, h * .68, h * .14, t * 2 + 1.3);
}
function pixelsHill(g, w, h) { g.fillStyle = grey(.22); g.beginPath(); g.moveTo(0, h); g.quadraticCurveTo(w * .5, h * .5, w, h); g.closePath(); g.fill(); }
/* branches reaching down from the top */
function branches(g, w, h) {
  const grow = (x, y, a, l, d, seed) => {
    if (d <= 0 || l < 2) return;
    const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
    stroke(g, [[x, y], [x2, y2]], Math.max(1, d * w * .0035), .16 + (6 - d) * .04);
    grow(x2, y2, a - .35 - hash(seed) * .5, l * (.7 + hash(seed + 1) * .15), d - 1, seed * 1.3 + 1);
    grow(x2, y2, a + .3 + hash(seed + 2) * .5, l * (.66 + hash(seed + 3) * .15), d - 1, seed * 1.7 + 2);
  };
  [[.74, 0, 1.9, .24, 7, 3], [.92, 0, 2.3, .2, 7, 5], [.42, .02, 1.3, .18, 6, 9], [.1, .04, 1.1, .16, 6, 13]].forEach(([x, y, a, l, d, s]) => grow(w * x, h * y, a, h * l, d, s));
}
const riverArt = (g, w, h) => pixels(g, w, h, (u, v) => {
  const far = .2 - (fbm1(u * 4 + 3) - .5) * .16, near = .36 - (fbm1(u * 6 + 9) - .5) * .1;
  if (v < far) return 0;
  if (v < near) return clamp(.58 + fbm2(u * 22, v * 18, 3) * .4 - (v - far) * .6, .1, .95);
  const c = .5 + Math.sin(v * 6 + 1) * .2 * (1.2 - v), wid = .06 + v * .24, d = Math.abs(u - c) / wid;
  if (d < 1) return clamp(.14 + fbm2(u * 8, v * 30, 2) * .24 + (1 - d) * .2, .05, .7);
  return clamp(.66 + fbm2(u * 26, v * 36, 3) * .4 - (d - 1) * .05, .35, .98);
});
function standing(g, w, h, t) {
  const s = h * .92, x = w * .5, y = h * .98, a = Math.sin(t * .8) * .05;
  stroke(g, [[x - s * .05, y], [x - s * .05, y - s * .42]], s * .06, .2); stroke(g, [[x + s * .05, y], [x + s * .05, y - s * .42]], s * .06, .2);
  oval(g, x, y - s * .6, s * .11, s * .23, .24);
  stroke(g, [[x - s * .08, y - s * .74], [x - s * (.3 + a), y - s * .96]], s * .05, .32); stroke(g, [[x + s * .08, y - s * .74], [x + s * (.3 + a), y - s * .96]], s * .05, .32);
  disc(g, x, y - s * .88, s * .075, .36);
}
/* the fence line and ground of the ending */
const footGround = (g, w, h) => pixels(g, w, h, (u, v) => {
  const top = .22 + Math.sin(u * 3.1) * .05 + (fbm1(u * 6) - .5) * .08;
  const post = fract(u * 95), gate = fract(u * 7.3 + .1) < .1;
  const fenceTop = top - .26 - hash(Math.floor(u * 95)) * .05;
  if (v < fenceTop) return 0;
  if (v < top) return post < .5 ? .03 : (gate && v < fenceTop + .03 ? .03 : (Math.abs(v - fenceTop - .05) < .012 ? .03 : .9));
  const d = (v - top);
  return d < .22 ? clamp(.8 - d * 3.4, .03, .85) : .03;
});
const menuArt = ridges([[.76, .08, 3, 71, .1, .1], [.9, .08, 4, 72, .04, .05]]);

const ART = {
  mountainOver: [mountainOver, 640, 320], mountainBg: [mountainBg, 640, 320], stones: [stones, 128, 96], pine: [pineTree, 340, 400, 1], flock: [flock, 640, 178, 1], flockFar: [flockFar, 420, 240, 1],
  cloudA: [cloudArt(1.3), 420, 300], cloudB: [cloudArt(4.1), 420, 300], cloudC: [cloudArt(7.7), 420, 300],
  birdsA: [birds(0), 280, 280, 1], birdsB: [birds(1), 280, 280, 1], birdsC: [birds(2), 280, 280, 1], birdsD: [birds(3), 280, 280, 1], stork: [storkBig, 320, 288, 1],
  flowerL: [flowers(1), 380, 520, 1], flowerR: [flowers(-1), 380, 520, 1], hole: [holeArt, 512, 512], hikers: [hikers, 320, 320, 1], branches: [branches, 520, 520],
  fin: [finPeak, 480, 620], summer: [summerArt, 640, 460], winter: [winterArt, 420, 460, 1], river: [riverArt, 640, 460], person: [standing, 200, 280, 1], stack: [stack, 420, 624, 1], ground: [footGround, 720, 260],
};

const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const FS = `precision mediump float;
uniform sampler2D tex;uniform vec4 box;uniform vec2 grid,tsize,levels;uniform vec3 bg,fill;uniform float bgO,fO,gam;
bool empty(vec2 q){vec4 c=texture2D(tex,q);return c.a<.01||(c.r<.01&&c.g<.01&&c.b<.01);}
void main(){vec2 p=gl_FragCoord.xy;if(p.x<box.x||p.y<box.y||p.x>box.z||p.y>box.w)discard;
vec2 uv=(p-box.xy)/(box.zw-box.xy);vec2 cell=floor(uv*grid);vec2 mid=(cell+.5)/grid;vec2 q=vec2(mid.x,1.-mid.y);
if(empty(q))discard;vec2 s=1./tsize;if(empty(q+vec2(s.x,0.))||empty(q-vec2(s.x,0.))||empty(q+vec2(0.,s.y))||empty(q-vec2(0.,s.y)))discard;
vec3 c=texture2D(tex,q).rgb;if(gam!=1.)c=pow(c,vec3(gam));float r=levels.y-levels.x;if(r!=0.)c=clamp((c*255.-levels.x)/r,0.,1.);
float br=(c.r+c.g+c.b)/3.;float f=(1.-br)*1.04-.02;float x=fract(uv.x*grid.x)-.5;
gl_FragColor=abs(x)<f*.5?vec4(fill,fO):vec4(bg,bgO);}`;

const clock = () => performance.now() / 1000;
const DEF = { x: '0%', y: '0%', width: '100%', height: '100%', bp: 0, wp: 255, gamma: 1, xSquares: 100, ySquares: 100, bgO: 1, fO: 1 };

class Weave {
  constructor(canvas, layers) {
    this.c = canvas; this.layers = []; this.on = false; this.tls = []; this.t0 = 0; this.frame = 0;
    let st = canvas._gl;
    if (!st) {
      const gl = canvas._flat ? null : canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
      if (!gl) { canvas._flat = true; this.ctx = canvas.getContext('2d'); this.begin(layers); return; }
      const sh = (k, src) => { const s = gl.createShader(k); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);
      const u = {}; ['box', 'grid', 'tsize', 'levels', 'bg', 'fill', 'bgO', 'fO', 'gam'].forEach(n => { u[n] = gl.getUniformLocation(pr, n); });
      gl.uniform3f(u.bg, 168 / 255, 148 / 255, 116 / 255); gl.uniform3f(u.fill, 44 / 255, 40 / 255, 36 / 255);
      st = canvas._gl = { gl, u };
    }
    this.gl = st.gl; this.u = st.u;
    this.begin(layers);
  }
  begin(layers) {
    for (const [name, cfg] of layers) this.add(name, cfg);
    this.draw = this.draw.bind(this);
    this.io = new IntersectionObserver(es => { for (const e of es) this.show(e.isIntersecting); }, { threshold: .01, rootMargin: '20% 0px 20% 0px' });
    this.io.observe(this.c);
  }
  add(name, cfg) {
    const [art, w, h, live] = ART[name], gl = this.gl, can = document.createElement('canvas'); can.width = w; can.height = h;
    const g = can.getContext('2d', { willReadFrequently: false });
    let tex = null;
    if (gl) {
      tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    const L = { art, can, g, tex, live, w, h, cfg: { ...DEF, ...cfg }, painted: false };
    this.layers.push(L); return L;
  }
  paint(L, t) {
    const { g, w, h } = L;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h); L.art(g, w, h, t);
    if (!this.gl) { L.data = g.getImageData(0, 0, w, h).data; L.painted = true; return; }
    this.gl.bindTexture(this.gl.TEXTURE_2D, L.tex); this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, L.can);
    L.painted = true;
  }
  show(v) {
    if (v === this.on) return; this.on = v;
    if (v) { if (!this.t0) this.t0 = clock(); this.tls.forEach(t => t.play()); gsap.ticker.add(this.draw); }
    else { this.tls.forEach(t => t.pause()); gsap.ticker.remove(this.draw); if (this.gl) this.gl.clear(this.gl.COLOR_BUFFER_BIT); else if (this.ctx) this.ctx.clearRect(0, 0, this.c.width, this.c.height); }
  }
  size() {
    const r = this.c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 1.5), W = Math.round(this.c.offsetWidth * d), H = Math.round(this.c.offsetHeight * d);
    if (W && H && (this.c.width !== W || this.c.height !== H)) { this.c.width = W; this.c.height = H; if (this.gl) this.gl.viewport(0, 0, W, H); }
    this.css = this.c.offsetWidth; this.d = d;
  }
  px(v, total) {
    if (typeof v !== 'string') return v;
    if (v.endsWith('%')) return parseFloat(v) / 100 * total;
    if (v.endsWith('vw')) return parseFloat(v) / 100 * this.css * this.d;
    return parseFloat(v);
  }
  draw() {
    this.size(); const gl = this.gl, u = this.u, W = this.c.width, H = this.c.height; if (!W || !H) return;
    this.frame++;
    const t = clock() - this.t0;
    if (!gl) { if (this.frame % 8 === 1) this.drawFlat(t, W, H); return; }
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const L of this.layers) {
      if (!L.painted || (L.live && this.frame % 2 === 0)) this.paint(L, t);
      const c = L.cfg, x = this.px(c.x, W), y = this.px(c.y, H), w = this.px(c.width, W), h = this.px(c.height, H);
      gl.bindTexture(gl.TEXTURE_2D, L.tex);
      gl.uniform4f(u.box, x, H - (y + h), x + w, H - y);
      gl.uniform2f(u.grid, c.xSquares, c.ySquares); gl.uniform2f(u.tsize, L.w, L.h); gl.uniform2f(u.levels, c.bp, c.wp);
      gl.uniform1f(u.bgO, c.bgO); gl.uniform1f(u.fO, c.fO); gl.uniform1f(u.gam, c.gamma);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  drawFlat(t, W, H) {
    // the same weave on browsers without graphics acceleration, drawn less often and in one batch per layer
    const ctx = this.ctx; ctx.clearRect(0, 0, W, H);
    for (const L of this.layers) {
      if (!L.painted || L.live) this.paint(L, t);
      const c = L.cfg, x0 = this.px(c.x, W), y0 = this.px(c.y, H), w = this.px(c.width, W), h = this.px(c.height, H), cw = w / c.xSquares, ch = h / c.ySquares;
      const range = c.wp - c.bp, D = L.data, tw = L.w, th = L.h, bars = new Path2D(), base = new Path2D();
      const i0 = Math.max(0, Math.floor(-x0 / cw)), i1 = Math.min(c.xSquares, Math.ceil((W - x0) / cw)), j0 = Math.max(0, Math.floor(-y0 / ch)), j1 = Math.min(c.ySquares, Math.ceil((H - y0) / ch));
      for (let i = i0; i < i1; i++) {
        const px = x0 + i * cw, tx = Math.min(tw - 1, Math.floor((i + .5) / c.xSquares * tw));
        for (let j = j0; j < j1; j++) {
          const raw = D[(Math.min(th - 1, Math.floor((j + .5) / c.ySquares * th)) * tw + tx) * 4];
          if (raw < 3) continue;
          const br = range ? clamp((raw - c.bp) / range) : raw / 255, f = clamp((1 - br) * 1.04 - .02), py = y0 + j * ch;
          if (c.bgO) { if (c.fO || f <= 0) base.rect(px, py, cw + .5, ch + .5); else { const g = cw * (1 - f) / 2; base.rect(px, py, g + .3, ch + .5); base.rect(px + cw - g, py, g + .3, ch + .5); } }
          if (c.fO && f > 0) bars.rect(px + cw * (1 - f) / 2, py, cw * f, ch + .5);
        }
      }
      if (c.bgO) { ctx.fillStyle = 'rgba(168,148,116,' + c.bgO + ')'; ctx.fill(base); }
      if (c.fO) { ctx.fillStyle = 'rgba(44,40,36,' + c.fO + ')'; ctx.fill(bars); }
    }
  }
  destroy() { this.show(false); this.io && this.io.disconnect(); this.tls.forEach(t => t.kill()); if (this.gl) { for (const L of this.layers) this.gl.deleteTexture(L.tex); this.gl.clear(this.gl.COLOR_BUFFER_BIT); } }
}

/* the small flat scenes of the opening and the menu */
const PAINT = {
  preload(g, w, h, p, st) {
    const t = st.t || 0, flap = Math.sin(t * 1.15), cx = w * .5, cy = h * (.54 + flap * .025);
    crane(g, cx - w * .16, cy, w * .32, t * 1.15 + 1.5, .92);
  },
  menu(g, w, h) { menuArt(g, w, h); },
};
class Scene {
  constructor(canvas, name, { color = '#2c2824', pitch = 7 } = {}) {
    this.c = canvas; this.name = name; this.color = color; this.p = .5; this.st = { always: true }; this.pitch = pitch; this.dirty = true; this.lastW = 0;
    this.ctx = canvas.getContext('2d'); this.s = document.createElement('canvas'); this.g = this.s.getContext('2d', { willReadFrequently: true });
    this.resize();
  }
  resize() {
    const r = this.c.getBoundingClientRect(); const W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
    if (W === this.lastW && H === this.lastH) return;
    this.lastW = W; this.lastH = H; this.c.width = W; this.c.height = H;
    const unit = Math.max(4, W / 1440 * this.pitch * (W < 700 ? 1.6 : 1));
    this.cell = unit; this.cols = Math.ceil(W / unit); this.rows = Math.ceil(H / unit);
    this.s.width = this.cols; this.s.height = this.rows; this.dirty = true;
  }
  render() {
    if (!this.dirty || !this.c.offsetParent) return; this.dirty = false;
    const { g, ctx, cols, rows, cell } = this; const W = this.c.width, H = this.c.height;
    g.fillStyle = '#000'; g.fillRect(0, 0, cols, rows); ctx.clearRect(0, 0, W, H);
    PAINT[this.name](g, cols, rows, this.p, this.st);
    const d = g.getImageData(0, 0, cols, rows).data; ctx.fillStyle = this.color;
    for (let x = 0; x < cols; x++) {
      let y = 0;
      while (y < rows) {
        const v = d[(y * cols + x) * 4] / 255; if (v < .08) { y++; continue; }
        const lvl = Math.ceil(v * 4); let y2 = y + 1;
        while (y2 < rows && Math.ceil(d[(y2 * cols + x) * 4] / 255 * 4) === lvl) y2++;
        const wid = cell * (x % 2 ? .46 : 1) * (lvl / 4) * (lvl === 4 ? 1 : .86);
        ctx.fillRect(x * cell + (cell - wid) / 2, y * cell, wid, (y2 - y) * cell + .5);
        y = y2;
      }
    }
  }
}

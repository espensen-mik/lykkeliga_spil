// Jul i LykkeBy – tryk på knappen (mellemrum / Enter / klik) for julehygge.
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  const stage = $('stage');

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  // Fast "tilfældighed", så byen ser ens ud hver gang
  let seed = 20261224;
  function rnd() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  // ------------------------------------------------------------------
  // Byen: husene kommer fra lykkeby.svg (flettet ind af build-art.py)
  // ------------------------------------------------------------------
  const C = { night: '#1d3130', snow: '#fff4e2', ground: '#ffedce', cream: '#ffe1ad', tan: '#d9bc86', orange: '#ec693d', rust: '#b14f2e', mustard: '#ecb814', teal: '#00a388', brown: '#733f2c' };
  // Fra illustrationens koordinater til scenen (venstre og højre husblok)
  const S = 0.4;
  const aL = (x, y) => ({ x: x * S + 8.4, y: y * S - 1052 });
  const aR = (x, y) => ({ x: x * S + 469.4, y: y * S - 1052 });
  const chimneys = [aL(185, 3573), aL(349, 3573), aR(2403, 3699), aR(3258, 3585)];

  // Ægte kopier (ikke <use>), så kopierne også skifter farve, når det bliver aften
  function copyArt(id, transform, parent, opacity) {
    const c = $(id).cloneNode(true);
    c.removeAttribute('id');
    const g = el('g', { transform, class: 'artcopy' }, parent);
    if (opacity) g.setAttribute('opacity', opacity);
    g.appendChild(c);
    return g;
  }
  function pine(g, x, y, k) {
    copyArt('artPine', `translate(${x - 1354 * k},${y - 4825 * k}) scale(${k})`, g);
  }

  function buildTown() {
    const back = $('back'), front = $('front'), frontLit = $('frontLit');

    // Bakker, graner og en fjern husrække bag torvet
    el('path', { d: 'M0,470 Q300,350 640,440 T1300,410 T1920,370 V900 H0Z', fill: '#93cdc0', class: 'nf', style: '--n:#1f4b46' }, back);
    [[60, 440, .3], [330, 392, .34], [470, 402, .26], [900, 452, .36], [1000, 440, .28], [1240, 420, .32], [1500, 392, .28], [1790, 386, .36]]
      .forEach(p => pine(back, p[0], p[1], p[2]));
    el('path', { d: 'M0,590 Q420,500 820,570 T1520,540 T1920,560 V900 H0Z', fill: '#74bcad', class: 'nf', style: '--n:#173d39' }, back);
    [[880, 575, .3], [1262, 562, .34]].forEach(p => pine(back, p[0], p[1], p[2]));
    el('path', { d: 'M0,800 Q480,786 960,798 T1920,794 V1080 H0Z', fill: C.ground, class: 'nf', style: '--n:#6c8284' }, back);
    copyArt('artR', 'translate(306.2,-497.2) scale(.27)', back, .62);

    // Vej og forgrund
    el('path', { d: 'M0,918 H1920 V958 H0Z', fill: '#f3d9ab', class: 'nf', style: '--n:#5b7072' }, front);
    el('path', { d: 'M0,931 H1920 M0,946 H1920', stroke: C.tan, 'stroke-width': 3, 'stroke-dasharray': '60 26', opacity: .7, class: 'ns', style: '--n:#465b5d' }, front);
    el('path', { d: 'M0,1010 Q500,975 1000,1004 T1920,996 V1080 H0Z', fill: C.snow, class: 'nf', style: '--n:#7b9092' }, front);

    // Gadelygter
    const lamps = [872, 1240];
    lamps.forEach(x => {
      el('rect', { x: x - 5, y: 705, width: 10, height: 205, fill: C.night }, front);
      el('rect', { x: x - 13, y: 902, width: 26, height: 12, rx: 4, fill: C.night }, front);
      el('rect', { x: x - 17, y: 676, width: 34, height: 32, rx: 6, fill: C.cream, stroke: C.night, 'stroke-width': 5 }, front);
      el('polygon', { points: `${x - 24},678 ${x},658 ${x + 24},678`, fill: C.night }, front);
      el('ellipse', { cx: x, cy: 660, rx: 16, ry: 6, fill: C.snow }, front);
      const gl = el('g', { class: 'lampglow' }, frontLit);
      el('circle', { cx: x, cy: 692, r: 130, fill: 'url(#gGlow)' }, gl);
      el('rect', { x: x - 14, y: 679, width: 28, height: 26, rx: 4, fill: '#ffd24a' }, gl);
    });

    // Lyskæder hen over husene og torvet
    const pts = [aL(40, 3665), aL(600, 3690), aL(1250, 3935), aL(2040, 3935), { x: 872, y: 672 }, { x: 1240, y: 672 },
      aR(2150, 3990), aR(2500, 3950), aR(3010, 3950), aR(3570, 4060)];
    const colors = [C.orange, C.mustard, C.teal, '#ff9d7a', C.snow];
    const strings = $('strings');
    let n = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], dist = Math.hypot(b.x - a.x, b.y - a.y);
      const c = { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + Math.min(70, dist * .22) };
      el('path', { class: 'wire', d: `M${a.x},${a.y}Q${c.x},${c.y} ${b.x},${b.y}`, fill: 'none', stroke: C.night, 'stroke-width': 3 }, strings);
      const count = Math.max(2, Math.round(dist / 40));
      for (let k = 1; k < count; k++) {
        const t = k / count, u = 1 - t;
        const x = u * u * a.x + 2 * u * t * c.x + t * t * b.x, y = u * u * a.y + 2 * u * t * c.y + t * t * b.y + 7;
        const col = colors[n % colors.length];
        const bg = el('g', { class: 'bulb', style: `transition-delay:${n * 18}ms` }, strings);
        const tw = el('g', { class: 'twinkle', style: `animation-delay:${(-rnd() * 1.4).toFixed(2)}s` }, bg);
        el('circle', { cx: x, cy: y, r: 17, fill: col, opacity: .3 }, tw);
        el('circle', { cx: x, cy: y, r: 7.5, fill: col, stroke: C.night, 'stroke-width': 1.5 }, bg);
        n++;
      }
    }

    // Ekstra røg fra skorstenene
    const smoke = $('smoke');
    chimneys.forEach(c => {
      for (let k = 0; k < 6; k++) {
        el('circle', { class: 'puff', cx: c.x + rnd() * 8 - 4, cy: c.y - 4, r: 13, fill: C.cream, style: `animation-delay:${(-(k * .75 + rnd() * .3)).toFixed(2)}s` }, smoke);
      }
    });

    // Nisser (Christmas Elf 1-8.svg): tre kigger op bag tagene, fem popper op i sneen foran husene
    const ELF = [[600, 736], [630, 732], [499, 733], [617, 733], [648, 743], [619, 733], [624, 732], [599, 733]]; // bredde, højde
    const elf = (n, x, bottom, k, parent) =>
      el('use', { href: '#elf' + n, transform: `translate(${x - ELF[n - 1][0] * k / 2},${bottom - ELF[n - 1][1] * k}) scale(${k})` }, parent);
    const nisser = $('nisser');
    [[6, aL(420, 3640)], [1, aL(905, 3800)], [4, aR(3120, 3640)]].forEach(([n, p], i) => {
      const g = el('g', { class: 'nisse', style: `transition-delay:${i * 180}ms` }, nisser);
      const w = el('g', { class: 'wob', style: `animation-delay:${-i * .35}s` }, g);
      elf(n, p.x, p.y + 42, .2, w); // ca. overkroppen stikker op over taget
    });
    const nisserFront = $('nisserFront');
    [[5, 235, 1012], [2, 505, 996], [3, 985, 1004], [7, 1215, 992], [8, 1440, 1010]].forEach(([n, x, y], i) => {
      const g = el('g', { class: 'elfpop', style: `transition-delay:${200 + i * 140}ms` }, nisserFront);
      const w = el('g', { class: 'wob', style: `animation-delay:${-i * .27}s` }, g);
      elf(n, x, y, .2, w);
    });

    // Stjerner
    const stars = $('stars');
    for (let i = 0; i < 110; i++) {
      el('circle', {
        class: 'star', cx: (rnd() * 1920).toFixed(0), cy: (rnd() * 520).toFixed(0), r: (1.2 + rnd() * 2.6).toFixed(1),
        fill: C.cream, style: `animation-delay:${(-rnd() * 3).toFixed(2)}s`
      }, stars);
    }
  }

  function buildTree() {
    const tree = el('g', { transform: 'translate(96,34)' }, $('tree'));
    const body = el('g', {}, tree);
    el('ellipse', { cx: 960, cy: 938, rx: 150, ry: 16, fill: '#ecd09c' }, body);
    el('rect', { x: 938, y: 890, width: 44, height: 48, fill: C.brown }, body);
    [['770,900 960,640 1150,900', '#008a74'], ['810,785 960,560 1110,785', '#009780'], ['855,675 960,500 1065,675', C.teal]]
      .forEach(t => el('polygon', { points: t[0], fill: t[1], 'stroke-linejoin': 'round', stroke: t[1], 'stroke-width': 10 }, body));
    el('polygon', { points: '928,552 960,500 992,552 975,545 960,556 945,545', fill: C.snow }, body);
    ['M780,898 q30,-18 55,0 q25,-18 50,0', 'M1035,898 q30,-18 55,0 q25,-18 50,0', 'M820,783 q25,-14 45,0', 'M1055,783 q25,-14 45,0']
      .forEach(d => el('path', { d, stroke: C.snow, 'stroke-width': 12, 'stroke-linecap': 'round', fill: 'none' }, body));
    ['M900,640 Q960,672 1020,640', 'M868,745 Q960,800 1052,745', 'M835,855 Q960,920 1085,855']
      .forEach(d => el('path', { d, stroke: C.mustard, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, body));

    const lights = el('g', {}, tree);
    const colors = [C.orange, C.mustard, C.snow, '#ff9d7a', '#ffd66b'];
    [[960, 560], [935, 605], [988, 612], [905, 652], [960, 668], [1015, 650], [898, 720], [945, 738], [1002, 730], [1048, 752],
     [868, 760], [960, 795], [880, 832], [928, 856], [992, 850], [1052, 836], [1104, 878], [822, 880], [960, 885], [1010, 790], [905, 790]]
      .forEach((p, i) => {
        const g = el('g', { class: 'twinkle', style: `animation-delay:${(-rnd() * 1.4).toFixed(2)}s` }, lights);
        el('circle', { cx: p[0], cy: p[1], r: 20, fill: colors[i % 5], opacity: .3 }, g);
        el('circle', { cx: p[0], cy: p[1], r: 9, fill: colors[i % 5] }, lights);
      });
    let star = '';
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 15 : 36, a = -Math.PI / 2 + i * Math.PI / 5;
      star += `${(960 + r * Math.cos(a)).toFixed(1)},${(492 + r * Math.sin(a)).toFixed(1)} `;
    }
    const sg = el('g', { id: 'treeStar' }, lights);
    el('circle', { cx: 960, cy: 492, r: 60, fill: 'url(#gGlow)' }, sg);
    el('polygon', { points: star, fill: '#ffd24a', stroke: C.mustard, 'stroke-width': 3, 'stroke-linejoin': 'round' }, sg);
  }

  function buildSnowman() {
    const g = el('g', {}, $('snowman'));
    const x = 690;
    el('ellipse', { cx: x, cy: 972, rx: 80, ry: 12, fill: '#ecd09c' }, g);
    el('path', { d: `M${x - 34},850 L${x - 84},806 M${x - 70},818 l-16,6 M${x + 34},850 L${x + 86},800 M${x + 72},812 l4,-16`, stroke: C.brown, 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none' }, g);
    [[922, 54], [848, 40], [790, 28]].forEach(c => el('circle', { cx: x, cy: c[0], r: c[1], fill: C.snow, stroke: C.tan, 'stroke-width': 3 }, g));
    el('rect', { x: x - 30, y: 808, width: 60, height: 14, rx: 7, fill: C.orange }, g);
    el('rect', { x: x + 8, y: 812, width: 14, height: 44, rx: 6, fill: C.orange }, g);
    el('rect', { x: x - 34, y: 764, width: 68, height: 8, rx: 4, fill: C.night }, g);
    el('rect', { x: x - 22, y: 728, width: 44, height: 38, rx: 3, fill: C.night }, g);
    el('rect', { x: x - 22, y: 754, width: 44, height: 8, fill: C.orange }, g);
    el('circle', { cx: x - 10, cy: 784, r: 3.5, fill: C.night }, g);
    el('circle', { cx: x + 10, cy: 784, r: 3.5, fill: C.night }, g);
    el('polygon', { points: `${x},789 ${x + 34},796 ${x},800`, fill: C.orange }, g);
    el('path', { d: `M${x - 12},803 q12,9 24,0`, stroke: C.night, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
    [838, 858, 905].forEach(y => el('circle', { cx: x, cy: y, r: 4.5, fill: C.night }, g));
  }

  buildTown();
  buildTree();
  buildSnowman();

  // ------------------------------------------------------------------
  // Sne og fyrværkeri (canvas)
  // ------------------------------------------------------------------
  const cv = $('fx'), ctx = cv.getContext('2d');
  const W = 1920, H = 1080;
  const flakes = [], rockets = [], sparks = [];
  let fireworksUntil = 0, nextRocket = 0, snowAlpha = 0;
  function startSnow() {
    flakes.length = 0;
    for (let k = 0; k < 280; k++) {
      flakes.push({ x: Math.random() * (W + 200) - 100, y: Math.random() * (H + 300) - 300, r: 2 + Math.random() * 5, vy: 70 + Math.random() * 110, ph: Math.random() * 6.28, sw: 15 + Math.random() * 30 });
    }
  }

  function burst(x, y) {
    const hue = Math.random() * 360, two = Math.random() < .4, count = 70 + Math.random() * 40 | 0;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 300;
      sparks.push({
        x, y, px: x, py: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, decay: .55 + Math.random() * .4, hue: two && i % 2 ? (hue + 150) % 360 : hue
      });
    }
  }

  let prev = performance.now();
  function frame(now) {
    const dt = Math.min(.05, (now - prev) / 1000); prev = now;
    ctx.clearRect(0, 0, W, H);

    // Fyrværkeri
    if (now < fireworksUntil && now > nextRocket) {
      nextRocket = now + 220 + Math.random() * 380;
      rockets.push({ x: 180 + Math.random() * 1560, y: 620, vy: -(520 + Math.random() * 220), ty: 90 + Math.random() * 230 });
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y += r.vy * dt;
      ctx.strokeStyle = 'rgba(255,230,170,.9)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(r.x, r.y + 34); ctx.lineTo(r.x, r.y); ctx.stroke();
      if (r.y <= r.ty) { burst(r.x, r.y); rockets.splice(i, 1); }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.px = s.x; s.py = s.y;
      s.vx *= 1 - 1.6 * dt; s.vy = s.vy * (1 - 1.6 * dt) + 150 * dt;
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= s.decay * dt;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.strokeStyle = `hsla(${s.hue},100%,${55 + s.life * 25}%,${s.life})`;
      ctx.lineWidth = 2 + s.life * 3;
      ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(s.x, s.y); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    // Sne
    const snowing = active('snow');
    snowAlpha = snowing ? Math.min(1, snowAlpha + dt * 2) : Math.max(0, snowAlpha - dt / 1.5);
    if (!snowing && snowAlpha === 0) flakes.length = 0;
    ctx.globalAlpha = snowAlpha * .92;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    for (let i = flakes.length - 1; i >= 0; i--) {
      const f = flakes[i];
      f.y += f.vy * dt; f.ph += dt * 1.3; f.x += Math.sin(f.ph) * f.sw * dt + 12 * dt;
      if (f.y > H + 10) { f.y = -10; f.x = Math.random() * (W + 200) - 100; }
      ctx.moveTo(f.x + f.r, f.y); ctx.arc(f.x, f.y, f.r, 0, 6.2832);
    }
    ctx.fill();
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------
  // Standby: rolig vinterdag med drivende skyer og en bil i ny og næ
  // ------------------------------------------------------------------
  const active = name => stage.classList.contains(name);
  const EFFECTS = ['snow', 'night', 'lights', 'tree', 'snowman', 'smoke', 'aurora', 'nisser'];
  let endTimer = 0;
  function standby() {
    stage.classList.remove(...EFFECTS);
    fireworksUntil = 0;
  }

  // Bilerne kommer fra "Car Cartoon Collection.svg": [midte x, bund y, bredde, kører mod højre?]
  const CARS = [[577, 944, 856, true], [1480, 943, 817, false], [1481, 1625, 862, false], [2377, 944, 840, false], [2434, 1625, 835, false], [546, 1625, 762, true]];
  let lastCar = -1, carLtr = Math.random() < .5;
  function driveCar() {
    let n; do { n = Math.random() * CARS.length | 0; } while (n === lastCar);
    lastCar = n;
    const [cx, by, w, facesRight] = CARS[n];
    carLtr = !carLtr; // skiftevis fra venstre og fra højre
    const ltr = carLtr, k = 200 / w, dir = ltr ? 1 : -1;
    const layer = $('carLayer');
    const g = el('g', {}, layer);
    const flip = el('g', { transform: `scale(${ltr === facesRight ? k : -k},${k})` }, g);
    const putt = el('g', { class: 'putt' }, flip);
    el('use', { href: '#car' + n, transform: `translate(${-cx},${-by})` }, putt);
    const x0 = ltr ? -130 : 2050, x1 = ltr ? 2050 : -130, dur = 13000 + Math.random() * 4000, y = 958;
    const frames = [{ transform: `translate(${x0}px,${y}px)` }, { transform: `translate(${x1}px,${y}px)` }];
    const a = g.animate(frames, { duration: dur, easing: 'linear', fill: 'both' });
    // Forlygter og baglygte, som kun ses om aftenen (ligger over den dæmpede bil)
    const lights = el('g', { class: 'carlight' }, $('carLights'));
    const lg = el('g', { transform: `scale(${dir},1)` }, lights);
    el('polygon', { points: '90,-44 300,-92 300,2 90,-30', fill: 'url(#gBeam)' }, lg);
    el('circle', { cx: 92, cy: -37, r: 26, fill: 'url(#gGlow)' }, lg);
    el('circle', { cx: 92, cy: -37, r: 6, fill: '#fff6cf' }, lg);
    el('circle', { cx: -95, cy: -42, r: 14, fill: '#ff5a3c', opacity: .35 }, lg);
    el('circle', { cx: -95, cy: -42, r: 4.5, fill: '#ff6a4a' }, lg);
    lights.animate(frames, { duration: dur, easing: 'linear', fill: 'both' });
    // Små udstødningsskyer bag bilen
    const t0 = performance.now();
    const puffer = setInterval(() => {
      const x = x0 + (x1 - x0) * (performance.now() - t0) / dur - dir * 98;
      const p = el('circle', { cx: x, cy: y - 22, r: 7, fill: C.snow, stroke: C.tan, 'stroke-width': 1.5 }, layer);
      p.animate([
        { transform: 'translate(0,0) scale(.5)', opacity: .95 },
        { transform: `translate(${-dir * 34}px,-30px) scale(2.1)`, opacity: 0 }
      ], { duration: 1500, easing: 'ease-out', fill: 'both' }).onfinish = () => p.remove();
      p.style.transformBox = 'fill-box'; p.style.transformOrigin = 'center';
    }, 420);
    a.onfinish = () => { clearInterval(puffer); g.remove(); lights.remove(); };
  }
  (function carLoop() {
    setTimeout(() => { if (!document.hidden) driveCar(); carLoop(); }, 14000 + Math.random() * 22000);
  })();
  setTimeout(driveCar, 5000);

  function flySanta() {
    const layer = $('santaLayer');
    const u = el('use', { href: '#santaProto' }, layer);
    const ltr = Math.random() < .5, y0 = 150 + Math.random() * 70, sc = .2;
    const xs = ltr ? [-520, 960, 2440] : [2440, 960, -520];
    const flip = ltr ? `scale(${-sc},${sc})` : `scale(${sc})`; // tegningen flyver mod venstre
    const tilt = ltr ? -1 : 1;
    const anim = u.animate([
      { transform: `translate(${xs[0]}px,${y0 + 110}px) rotate(${-6 * tilt}deg) ${flip}` },
      { transform: `translate(${xs[1]}px,${y0}px) rotate(0deg) ${flip}`, offset: .5 },
      { transform: `translate(${xs[2]}px,${y0 + 80}px) rotate(${5 * tilt}deg) ${flip}` }
    ], { duration: 10000, easing: 'linear', fill: 'both' });
    anim.onfinish = () => u.remove();
  }

  // Julemanden suser forbi på scooter og taber tre gaver (santa_scooter.svg)
  const GIFTS = [[2007, 1512, 113], [1952, 1270, 213], [2131, 1061, 263]]; // midte x, midte y, højde
  function rideScooter() {
    const layer = $('scooterLayer');
    const ltr = Math.random() < .5, dir = ltr ? 1 : -1, k = .12, y = 966, dur = 4200;
    const x0 = ltr ? -220 : 2140, x1 = ltr ? 2140 : -220;
    const g = el('g', {}, layer);
    const flip = el('g', { transform: `scale(${ltr ? -k : k},${k})` }, g); // tegningen kører mod venstre
    const putt = el('g', { class: 'putt' }, flip);
    el('use', { href: '#scooter', transform: 'translate(-1031,-1793)' }, putt);
    g.animate([{ transform: `translate(${x0}px,${y}px)` }, { transform: `translate(${x1}px,${y}px)` }],
      { duration: dur, easing: 'linear', fill: 'both' }).onfinish = () => g.remove();

    [.3, .5, .7].forEach((f, i) => setTimeout(() => {
      const [cx, cy, h] = GIFTS[i], kg = .19;
      const sx = x0 + (x1 - x0) * f - dir * 72, sy = y - 112;
      const lx = Math.min(sx - dir * (70 + Math.random() * 90), 1470 - Math.random() * 90), ly = y + 8 + Math.random() * 22 - h * kg / 2;
      const spin = -dir * (300 + Math.random() * 200), rest = Math.random() * 24 - 12;
      const gift = el('g', {}, layer);
      layer.insertBefore(gift, g);
      el('use', { href: '#gift' + i, transform: `scale(${kg}) translate(${-cx},${-cy})` }, gift);
      const at = (px, py, r, sc = 1) => `translate(${px}px,${py}px) rotate(${r}deg) scale(${sc})`;
      gift.animate([
        { transform: at(sx, sy, 0, .6), easing: 'ease-out' },
        { transform: at((sx + lx) / 2, sy - 60, spin * .5), offset: .3, easing: 'ease-in' },
        { transform: at(lx, ly, spin + rest), offset: .68, easing: 'ease-out' },
        { transform: at(lx - dir * 10, ly - 18, spin + rest - dir * 20), offset: .82, easing: 'ease-in' },
        { transform: at(lx - dir * 18, ly, spin + rest) }
      ], { duration: 1300, fill: 'both' });
      // Gaven bliver liggende lidt og forsvinder så igen
      setTimeout(() => {
        gift.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: 'forwards' }).onfinish = () => gift.remove();
      }, 6500 - dur * f);
    }, dur * f));
  }

  // ------------------------------------------------------------------
  // Hændelser – én ad gangen, valgt tilfældigt, og så tilbage til standby
  // ------------------------------------------------------------------
  const events = [
    { name: 'sne', on: ['snow'], ms: 9000, run: startSnow },
    { name: 'aften', on: ['night'], ms: 8000 },
    { name: 'lyskæder', on: ['night', 'lights'], ms: 9000 },
    { name: 'juletræ', on: ['tree'], ms: 8000 },
    { name: 'snemand', on: ['snowman'], ms: 7000 },
    { name: 'skorstensrøg', on: ['smoke'], ms: 9000 },
    { name: 'nordlys', on: ['night', 'aurora'], ms: 9000 },
    { name: 'nisser', on: ['nisser'], ms: 6000 },
    { name: 'julemand', on: [], ms: 10000, run: flySanta },
    { name: 'scooter', on: [], ms: 8000, run: rideScooter },
    { name: 'fyrværkeri', on: ['night'], ms: 8500, run: () => { fireworksUntil = performance.now() + 6000; } }
  ];
  let last = null;
  const played = new Set();
  function pick() {
    // Alle hændelser når at blive vist, før en af dem kommer igen.
    let fresh = events.filter(e => !played.has(e) && e !== last);
    if (!fresh.length) { played.clear(); fresh = events.filter(e => e !== last); }
    const e = fresh[Math.random() * fresh.length | 0];
    played.add(e); last = e;
    return e;
  }

  // ------------------------------------------------------------------
  // Styring: buzzer (mellemrum / Enter) eller klik
  // ------------------------------------------------------------------
  let lastPress = -1e9, idleTimer = 0;
  function press() {
    const now = performance.now();
    if (now - lastPress < 1200) return;
    lastPress = now;
    if (!document.fullscreenElement && document.documentElement.requestFullscreen && !/[?&]vindue\b/.test(location.search)) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    stage.classList.remove('idle');
    const e = pick();
    clearTimeout(endTimer);
    standby();
    stage.classList.add(...e.on);
    stage.dataset.event = e.name;
    if (e.run) e.run();
    endTimer = setTimeout(() => { standby(); stage.dataset.event = ''; }, e.ms);
    clearTimeout(idleTimer); idleTimer = setTimeout(() => stage.classList.add('idle'), 75000);
  }
  addEventListener('keydown', ev => {
    if (ev.code !== 'Space' && ev.code !== 'Enter' && ev.code !== 'NumpadEnter') return;
    ev.preventDefault();
    if (!ev.repeat) press();
  });
  addEventListener('pointerdown', ev => { ev.preventDefault(); press(); });

  // ?plakat viser en fast aftenscene – bruges til forsidebilledet på LykkeSpil
  if (/[?&]plakat\b/.test(location.search)) {
    stage.classList.remove('idle');
    stage.classList.add('poster', 'night', 'lights', 'tree', 'snowman', 'snow');
    startSnow();
  }

  requestAnimationFrame(frame);
})();

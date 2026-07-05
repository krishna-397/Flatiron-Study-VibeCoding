/* ============================================================
   THE FLATIRON — AN EXPLODING HISTORY
   Pen-and-ink style exploded axonometric, generated in code.

   Scroll timeline (1000vh):
     0.00–0.08  blank paper, centered title
     0.06–0.18  title fades out, drawing fades in
     0.18–0.60  disassembly, roof first
     0.60–0.72  hold: fully exploded (hover + click live here)
     0.72–0.94  reassembly
     then       colophon

   Features: ink-wobble filter, ghost of the whole, self-drawing
   285 FT dimension, hover focus, click deep-dives with period
   photographs, elevator progress rail, wind at the prow.
   ============================================================ */

// ---------- 1. PLAN GEOMETRY ----------
const B = [0, 33];
const C = [33, 0];
const A1 = [102.3, 99];
const A2 = [99, 102.3];
const PLAN = [A1, A2, B, C];
const CENTROID = [
  (A1[0] + A2[0] + B[0] + C[0]) / 4,
  (A1[1] + A2[1] + B[1] + C[1]) / 4,
];

function scalePlan(p, f) {
  return [
    CENTROID[0] + (p[0] - CENTROID[0]) * f,
    CENTROID[1] + (p[1] - CENTROID[1]) * f,
  ];
}

// ---------- 2. AXONOMETRIC PROJECTION ----------
function proj(p, z) {
  return [(p[0] - p[1]) * 1.2, (p[0] + p[1]) * 0.30 - z];
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(42);

const SVG_NS = "http://www.w3.org/2000/svg";
function el(name, attrs, parent) {
  const node = document.createElementNS(SVG_NS, name);
  for (const key in attrs) node.setAttribute(key, attrs[key]);
  if (parent) parent.appendChild(node);
  return node;
}
function poly(points) {
  return points.map((pt) => pt.join(",")).join(" ");
}

const INK = "#14110d";
const PAPER = "#f7f5ef";
const GLASS = "#ddd6c6";
const TOP = "#efece3";

function facesFor(plan) {
  const [a1, a2, b, c] = plan;
  return [
    { p: c,  q: a1, tone: "#2b2620" },
    { p: a1, q: a2, tone: "#231f19" },
    { p: a2, q: b,  tone: "#1a1613" },
  ];
}

// ---------- 3. DRAWING PIECES ----------
function drawPrism(group, plan, z0, z1) {
  facesFor(plan).forEach((f) => {
    el("polygon", {
      points: poly([proj(f.p, z0), proj(f.q, z0), proj(f.q, z1), proj(f.p, z1)]),
      fill: f.tone, stroke: INK, "stroke-width": 1, "stroke-linejoin": "round",
    }, group);
  });
  el("polygon", {
    points: poly(plan.map((p) => proj(p, z1))),
    fill: TOP, stroke: INK, "stroke-width": 1, "stroke-linejoin": "round",
  }, group);
}

function drawFloorLines(group, p, q, z0, z1, step, opacity) {
  for (let z = z0 + step; z < z1 - 1; z += step) {
    const s = proj(p, z), e = proj(q, z);
    el("line", {
      x1: s[0], y1: s[1], x2: e[0], y2: e[1],
      stroke: GLASS, "stroke-width": 0.6, opacity: opacity,
    }, group);
  }
}

function drawWindows(group, p, q, z0, z1, cols, rows) {
  const margin = 0.07;
  const floorH = (z1 - z0) / rows;
  for (let r = 0; r < rows; r++) {
    const wz0 = z0 + floorH * (r + 0.3) + (rnd() - 0.5);
    const wz1 = z0 + floorH * (r + 0.85) + (rnd() - 0.5);
    for (let i = 0; i < cols; i++) {
      const t0 = margin + (1 - 2 * margin) * (i + 0.22) / cols;
      const t1 = margin + (1 - 2 * margin) * (i + 0.78) / cols;
      const p0 = [p[0] + (q[0] - p[0]) * t0, p[1] + (q[1] - p[1]) * t0];
      const p1 = [p[0] + (q[0] - p[0]) * t1, p[1] + (q[1] - p[1]) * t1];
      el("polygon", {
        points: poly([proj(p0, wz0), proj(p1, wz0), proj(p1, wz1), proj(p0, wz1)]),
        fill: GLASS, stroke: "none", opacity: 0.8 + rnd() * 0.2,
      }, group);
    }
  }
}

function drawHatching(group, p, q, z0, z1) {
  for (let i = 0; i < 20; i++) {
    const t = (i + rnd() * 0.8) / 20;
    const pt = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
    const s = proj(pt, z0 + rnd() * 3), e = proj(pt, z1 - rnd() * 3);
    el("line", {
      x1: s[0], y1: s[1], x2: e[0], y2: e[1],
      stroke: PAPER, "stroke-width": 0.4 + rnd() * 0.4,
      opacity: 0.04 + rnd() * 0.07,
    }, group);
  }
}

function detailFaces(group, plan, z0, z1, cols, rows, lineStep) {
  facesFor(plan).forEach((f, idx) => {
    const c = idx === 1 ? 1 : cols;
    if (rows > 0) drawWindows(group, f.p, f.q, z0, z1, c, rows);
    if (lineStep) drawFloorLines(group, f.p, f.q, z0, z1, lineStep, 0.35);
    drawHatching(group, f.p, f.q, z0, z1);
  });
}

// ---------- 4. COMPONENTS: GEOMETRY + LAYOUT + HISTORY ----------
const SLIDE = 640;
const IMG = (name) =>
  "https://commons.wikimedia.org/wiki/Special:FilePath/" + name + "?width=560";

const segments = [
  {
    name: "ROOF", z0: 506, z1: 514, side: -1, pieceY: -510, cardY: -510,
    story: "285 feet, 22 stories, finished in 1902 in barely a year thanks to the steel frame. Never the tallest in New York — the Park Row Building had it beat — just the most famous silhouette.",
    more: "The Flatiron topped out at 285 feet — tall, but never the record: the Park Row Building (1899) already stood 391 feet. What made it famous wasn't height but geometry and position: a freestanding tower visible down two avenues at once, photographed from every angle. The flag went up in 1902, about a year after the first steel was set — a pace made possible by the repetitive steel cage and a terracotta skin that could be hung floor by floor.",
    draw(g) {
      const rPlan = PLAN.map((p) => scalePlan(p, 0.96));
      drawPrism(g, rPlan, 506, 514);
      const top = proj(CENTROID, 514);
      el("line", {
        x1: top[0], y1: top[1], x2: top[0], y2: top[1] - 38,
        stroke: INK, "stroke-width": 1.2,
      }, g);
      el("polygon", {
        points: poly([[top[0], top[1] - 38], [top[0] + 16, top[1] - 33], [top[0], top[1] - 28]]),
        fill: INK,
      }, g);
    },
  },
  {
    name: "CORNICE", z0: 490, z1: 506, side: 1, pieceY: -430, cardY: -430,
    story: "A huge overhanging terracotta cornice crowns the composition — ornament 285 feet up that nobody asked for and everybody photographs. The floor beneath it was an afterthought, added as a penthouse in 1905.",
    more: "The crown is a classical entablature blown up to street scale: molded terracotta panels, dentils, and a deep overhang designed to be read from 285 feet below. In 1905 an extra penthouse floor was slipped in beneath it. Critics who hated the building's thinness loved the crown — the whole facade follows the strict base-shaft-capital formula of a classical column, which is exactly how Burnham's office defended the design.",
    draw(g) {
      const cPlan = PLAN.map((p) => scalePlan(p, 1.12));
      drawPrism(g, cPlan, 490, 506);
      facesFor(cPlan).forEach((f) => drawWindows(g, f.p, f.q, 490.5, 495, 18, 1));
    },
  },
  {
    name: "ATTIC · FL 19–21", z0: 430, z1: 490, side: -1, pieceY: -335, cardY: -335,
    story: "The “capital” of the column, with its arched colonnade. Alfred Stieglitz and Edward Steichen photographed it through mist and snow in 1903–04 — and turned an office block into the icon of modern New York.",
    more: "A two-story arched colonnade — the capital of the column, and the stretch of the building that photography made immortal. Stieglitz shot it in the snow in 1903 and wrote that it seemed “to be moving toward me like the bow of a monster ocean steamer — a picture of a new America still in the making.” Steichen's misty 1904 print of the same silhouette became one of the most reproduced photographs in the history of the medium.",
    img: "Steichen_flatiron.jpg",
    imgCap: "Edward Steichen, The Flatiron, 1904 (public domain)",
    draw(g) {
      drawPrism(g, PLAN, 430, 490);
      detailFaces(g, PLAN, 434, 486, 9, 2, 0);
    },
  },
  {
    name: "SHAFT · FL 15–18", z0: 335, z1: 430, side: 1, pieceY: -250, cardY: -250,
    story: "Burnham's firm (much of the drawing by Frederick Dinkelberg) composed it like a classical column: base, shaft, capital. The skin is molded terracotta — fireproof, cheap, cast with Greek faces you'd need binoculars to spot.",
    more: "Daniel Burnham was the most powerful architect in America — director of works for the 1893 Chicago World's Fair — and this was his firm's first New York skyscraper. Much of the actual design is credited to Frederick P. Dinkelberg, a draftsman in Burnham's office. The skin is molded architectural terracotta hung on steel: Greek keys, medusa heads, and flowers cast in clay — fireproofing dressed up as ornament, repeating with subtle variation floor by floor.",
    draw(g) {
      drawPrism(g, PLAN, 335, 430);
      detailFaces(g, PLAN, 335, 430, 7, 4, 24);
    },
  },
  {
    name: "SHAFT · FL 10–14", z0: 215, z1: 335, side: -1, pieceY: -140, cardY: -140,
    story: "It never wobbled. A riveted steel cage carries all the weight — the thin terracotta skin just hangs on it. At the prow the building narrows to about 6.5 feet: the point offices end in a sharp angle with a desk wedged in.",
    more: "The engineering is the real trick: a riveted steel cage fabricated by the American Bridge Company, wind-braced by engineers Purdy & Henderson, carrying every load so the walls carry only themselves. Skeptics bet the “freak” shape would blow over in a gale; instead the frame proved so stiff that workers at the prow reported feeling nothing in storms. At its point the plan narrows to roughly 6.5 feet — the famous point offices with wedge-shaped desks.",
    img: "Flatiron_Building_Construction,_New_York_Times_-_Library_of_Congress,_1901-1902_crop.JPG",
    imgCap: "The steel frame rising, 1901–02 (Library of Congress)",
    draw(g) {
      drawPrism(g, PLAN, 215, 335);
      detailFaces(g, PLAN, 215, 335, 7, 5, 24);
    },
  },
  {
    name: "SHAFT · FL 5–9", z0: 95, z1: 215, side: 1, pieceY: -70, cardY: -70,
    story: "Officially the Fuller Building — but nobody ever called it that. New Yorkers looked up, saw a clothes iron, and the name stuck. Skeptics called it “Burnham's Folly” and bet the wind would knock it over.",
    more: "The George A. Fuller Company — the contractor that effectively invented the modern general contractor — built it as its own headquarters and named it the Fuller Building. The public refused: the triangular block had been called “the flat iron” for decades, and the name transferred to the tower before it was even finished. Space on a lot everyone called unbuildable turned out to be excellent business: the building filled with publishers, insurance men, and music companies.",
    draw(g) {
      drawPrism(g, PLAN, 95, 215);
      detailFaces(g, PLAN, 95, 215, 7, 5, 24);
    },
  },
  {
    name: "BASE · FL 1–4", z0: 0, z1: 95, side: -1, pieceY: 55, cardY: 55,
    story: "Winds around the prow famously lifted skirts on 23rd Street — cops shooing away gawkers supposedly coined “23 skidoo!” The glass shop on the point, added against the architects' wishes, was nicknamed the cowcatcher.",
    more: "The ground floors are rusticated like a stone palazzo. At the very point sits the “cowcatcher” — a one-story glass retail pavilion added to squeeze rent from the last few square feet, over the architects' objections; United Cigar took the lease. The corner became famous for wind: downdrafts off the tower lifted hems on 23rd Street, crowds gathered to watch, and the phrase the cops used to move them along — “23 skidoo” — entered the language.",
    img: "Stieglitz_Flat_iron_1903.jpg",
    imgCap: "Alfred Stieglitz, The Flat Iron, 1903 (public domain)",
    draw(g) {
      drawPrism(g, PLAN, 0, 95);
      detailFaces(g, PLAN, 4, 90, 6, 3, 12);
      // wind curls at the prow — visible once the piece lands
      this.wind = el("g", { opacity: 0, fill: "none" }, g);
      const wy = proj(CENTROID, 22)[1] + 34;   // just off the prow
      [0, 10, 20].forEach((dy, i) => {
        el("path", {
          d: `M ${-46 + i * 4} ${wy + dy} C ${-18} ${wy + dy - 8}, ${14} ${wy + dy + 6}, ${46 - i * 4} ${wy + dy - 4}`,
          class: "wind", stroke: INK, "stroke-width": 1,
          "stroke-opacity": 0.35, fill: "none",
        }, this.wind);
      });
    },
  },
  {
    name: "THE SITE", z0: -10, z1: 0, side: 1, pieceY: 110, cardY: 110,
    story: "A leftover wedge where Broadway slices diagonally across Fifth Avenue at 23rd Street. Too small, too pointy — and exactly where the Fuller Company decided a skyscraper could fit on a slice of pie.",
    more: "The wedge exists because Broadway ignores the grid: an old Lenape trail cutting diagonally across Manhattan, colliding with Fifth Avenue at 23rd Street. The plot was nicknamed “Eno's flatiron” after landowner Amos Eno decades before the tower existed. When the Fuller Company bought it in 1901, conventional wisdom said nothing serious could stand on a triangle — the building is the rebuttal.",
    draw(g) {
      const sitePlan = PLAN.map((p) => scalePlan(p, 1.5));
      drawPrism(g, sitePlan, -10, 0);
      el("polygon", {
        points: poly(PLAN.map((p) => proj(p, 0))),
        fill: "none", stroke: INK, "stroke-width": 1, "stroke-dasharray": "4 3",
      }, g);
    },
  },
];

// ---------- 5. BUILD THE SVG ----------
const svg = document.getElementById("axon");

// ---- ghost of the assembled building ----
const ghost = el("g", { opacity: 0, fill: "none" }, svg);
(function buildGhost() {
  const ZT = 514;
  const heavy = { stroke: INK, "stroke-width": 2.4, "stroke-opacity": 0.4,
                  "stroke-linejoin": "round", fill: "none" };
  const light = { stroke: INK, "stroke-width": 0.4, "stroke-opacity": 0.15, fill: "none" };
  const seam  = { stroke: INK, "stroke-width": 0.8, "stroke-opacity": 0.25, fill: "none" };

  const s = [proj(B, 0), proj(B, ZT), proj(C, ZT), proj(C, 0),
             proj(A1, 0), proj(A2, 0)];
  el("polygon", { points: poly(s), ...heavy }, ghost);

  el("polyline", {
    points: poly([proj(B, ZT), proj(A2, ZT), proj(A1, ZT), proj(C, ZT)]),
    ...light,
  }, ghost);
  [A1, A2].forEach((p) => {
    const a = proj(p, 0), b = proj(p, ZT);
    el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], ...light }, ghost);
  });

  const faceEdges = [[C, A1], [A1, A2], [A2, B]];
  for (let z = 23; z < ZT - 2; z += 23) {
    faceEdges.forEach(([p, q]) => {
      const a = proj(p, z), b = proj(q, z);
      el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], ...light }, ghost);
    });
  }
  [95, 215, 335, 430, 490, 506].forEach((z) => {
    faceEdges.forEach(([p, q]) => {
      const a = proj(p, z), b = proj(q, z);
      el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], ...seam }, ghost);
    });
  });

  // window outlines, light — same grids as the solid pieces, no jitter
  const win = { stroke: INK, "stroke-width": 0.35, "stroke-opacity": 0.14, fill: "none" };
  function ghostWindows(z0, z1, cols, rows) {
    const margin = 0.07;
    const floorH = (z1 - z0) / rows;
    faceEdges.forEach(([p, q], idx) => {
      const c = idx === 1 ? 1 : cols;      // single column on the prow face
      for (let r = 0; r < rows; r++) {
        const wz0 = z0 + floorH * (r + 0.3);
        const wz1 = z0 + floorH * (r + 0.85);
        for (let i = 0; i < c; i++) {
          const t0 = margin + (1 - 2 * margin) * (i + 0.22) / c;
          const t1 = margin + (1 - 2 * margin) * (i + 0.78) / c;
          const p0 = [p[0] + (q[0] - p[0]) * t0, p[1] + (q[1] - p[1]) * t0];
          const p1 = [p[0] + (q[0] - p[0]) * t1, p[1] + (q[1] - p[1]) * t1];
          el("polygon", {
            points: poly([proj(p0, wz0), proj(p1, wz0), proj(p1, wz1), proj(p0, wz1)]),
            ...win,
          }, ghost);
        }
      }
    });
  }
  ghostWindows(4, 90, 6, 3);       // base
  ghostWindows(95, 215, 7, 5);     // shaft 5–9
  ghostWindows(215, 335, 7, 5);    // shaft 10–14
  ghostWindows(335, 430, 7, 4);    // shaft 15–18
  ghostWindows(434, 486, 9, 2);    // attic

  const top = proj(CENTROID, ZT);
  el("line", { x1: top[0], y1: top[1], x2: top[0], y2: top[1] - 38, ...light }, ghost);
  el("polygon", {
    points: poly(PLAN.map((p) => proj(p, 0))),
    ...light, "stroke-dasharray": "4 3",
  }, ghost);
})();

// ---- self-drawing "285 FT" dimension beside the ghost ----
const dim = el("g", { opacity: 1 }, svg);
const dimTopY = proj(B, 514)[1];
const dimBotY = proj(B, 0)[1];
const DIMX = -104;
const dimLen = dimBotY - dimTopY;
const dimLine = el("line", {
  x1: DIMX, y1: dimBotY, x2: DIMX, y2: dimTopY,
  stroke: INK, "stroke-width": 1, "stroke-opacity": 0.6,
  "stroke-dasharray": dimLen, "stroke-dashoffset": dimLen,
}, dim);
const dimEnds = el("g", { opacity: 0 }, dim);
[dimTopY, dimBotY].forEach((y) => {
  el("line", { x1: DIMX - 6, y1: y, x2: DIMX + 6, y2: y,
               stroke: INK, "stroke-width": 1, "stroke-opacity": 0.6 }, dimEnds);
});
const dimText = el("text", {
  x: DIMX - 10, y: (dimTopY + dimBotY) / 2,
  transform: `rotate(-90 ${DIMX - 10} ${(dimTopY + dimBotY) / 2})`,
  "text-anchor": "middle", opacity: 0,
}, dim);
dimText.textContent = "285 FT";

// ---- pieces, drawn bottom-up so the stack reads solid ----
[...segments].reverse().forEach((seg) => {
  const g = el("g", { class: "piece" }, svg);
  seg.draw(g);
  seg.node = g;
  seg.restY = proj(B, (seg.z0 + seg.z1) / 2)[1];
  seg.dx = seg.side * SLIDE;
  seg.dy = seg.pieceY - seg.restY;
});

// ---- history cards, on top of everything ----
segments.forEach((seg) => {
  const cardX = seg.side < 0 ? -555 : 345;
  const cardG = el("g", { opacity: 0 }, svg);
  el("foreignObject", {
    x: cardX, y: seg.cardY - 80, width: 210, height: 300,
  }, cardG);
  const fo = cardG.firstChild;
  const div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
  div.setAttribute("class", "card");
  div.setAttribute("style", seg.side < 0 ? "text-align:right" : "");
  seg.num = String(segments.indexOf(seg) + 1).padStart(2, "0");
  div.innerHTML = `<h4><span class="num">${seg.num}</span> ${seg.name}</h4>
                   <p>${seg.story}</p><span class="more-cue">click for more +</span>`;
  fo.appendChild(div);
  seg.card = cardG;
  seg.cardDiv = div;
});

// ---------- 6. HOVER FOCUS + CLICK DEEP-DIVE ----------
let exploded = false;   // true during the fully-exploded hold

function setFocus(target) {
  segments.forEach((s) => {
    const dimmed = target && s !== target;
    s.node.style.opacity = dimmed ? 0.18 : "";
    s.card.style.opacity = dimmed ? 0.18 : "";
  });
}

const dive = document.getElementById("dive");
const diveBody = document.getElementById("dive-body");

const scrim = document.getElementById("scrim");

function openDive(seg) {
  let html = `<h3>${seg.num} · ${seg.name}</h3><p>${seg.more}</p>`;
  if (seg.img) {
    html += `<figure><img src="${IMG(seg.img)}" alt="${seg.imgCap}" loading="lazy"
             onerror="this.parentElement.style.display='none'">
             <figcaption>${seg.imgCap}</figcaption></figure>`;
  }
  diveBody.innerHTML = html;
  dive.classList.add("open");
  scrim.classList.add("open");
}
function closeDive() {
  dive.classList.remove("open");
  scrim.classList.remove("open");
}

document.getElementById("dive-close").addEventListener("click", closeDive);
scrim.addEventListener("click", closeDive);
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closeDive(); });

// one-time "hover / click to inspect" cue during the hold
const inspectHint = document.getElementById("inspect-hint");
let inspected = false;

segments.forEach((seg) => {
  [seg.node, seg.cardDiv].forEach((elm) => {
    elm.addEventListener("mouseenter", () => {
      if (exploded) { setFocus(seg); inspected = true; }
    });
    elm.addEventListener("mouseleave", () => setFocus(null));
    elm.addEventListener("click", () => {
      if (exploded) { openDive(seg); inspected = true; }
    });
  });
});

// ---------- 7. SCROLL TIMELINE ----------
function smoothstep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

const intro = document.getElementById("intro");
const liftCar = document.getElementById("liftcar");
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// clickable elevator rail: jump to any point in the sequence
const rail = document.querySelector(".lift-rail");
rail.addEventListener("click", (ev) => {
  const rect = rail.getBoundingClientRect();
  const frac = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));
  const max = document.querySelector(".scroll-space").offsetHeight - window.innerHeight;
  window.scrollTo({ top: frac * max, behavior: "smooth" });
});

// colophon replay link: scroll back to the middle of the hold
document.getElementById("replay").addEventListener("click", (ev) => {
  ev.preventDefault();
  const max = document.querySelector(".scroll-space").offsetHeight - window.innerHeight;
  window.scrollTo({ top: 0.68 * max, behavior: "smooth" });
});

function update() {
  const max = document.querySelector(".scroll-space").offsetHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;

  // Phase 1: title alone on paper -> drawing fades in.
  intro.style.opacity = 1 - smoothstep(p / 0.08);
  svg.style.opacity = smoothstep((p - 0.06) / 0.12);

  // Explosion progress: out (0.16–0.56), hold (0.56–0.80), back (0.80–0.96).
  // The hold is wide on purpose — it's the interactive exhibit.
  let pe;
  if (p < 0.16) pe = 0;
  else if (p < 0.56) pe = (p - 0.16) / 0.40;
  else if (p < 0.80) pe = 1;
  else if (p < 0.96) pe = 1 - (p - 0.80) / 0.16;
  else pe = 0;
  if (REDUCED) pe = 1;   // reduced motion: static exploded diagram

  // hover/click come alive while fully exploded
  exploded = pe > 0.92;
  svg.classList.toggle("exploded", exploded);
  if (!exploded) closeDive();

  // ghost + dimension emerge with the explosion
  ghost.setAttribute("opacity", smoothstep((pe - 0.05) / 0.35));
  const d = smoothstep((pe - 0.5) / 0.35);
  dimLine.setAttribute("stroke-dashoffset", (1 - d) * dimLen);
  dimEnds.setAttribute("opacity", d);
  dimText.setAttribute("opacity", d);

  segments.forEach((seg, i) => {
    const e = smoothstep((pe - i * 0.07) / 0.5);
    const x = e * seg.dx;
    const y = e * seg.dy;
    seg.node.setAttribute("transform", `translate(${x} ${y})`);
    seg.card.setAttribute("opacity", smoothstep((e - 0.75) / 0.25));
    if (seg.wind) seg.wind.setAttribute("opacity", smoothstep((e - 0.85) / 0.15));
  });

  // elevator rail: descend from FL 22 to G as you scroll
  liftCar.style.top = (p * 100) + "%";
  const fl = Math.max(0, Math.round(22 * (1 - p)));
  liftCar.textContent = fl === 0 ? "G" : fl;

  // inspect cue: visible during the hold until first interaction
  inspectHint.classList.toggle("show", exploded && !inspected);
}

window.addEventListener("scroll", update, { passive: true });
window.addEventListener("resize", update);
update();

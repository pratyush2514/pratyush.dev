/**
 * Stack: a full-stack app as three layers held apart. At the bottom a data
 * drum with two platter grooves round its face; on it the api plate, with a
 * row of ports along its near edges; on top the ui plate, a window with its
 * three controls. Each layer is a little smaller than the one under it. The
 * pointer's x opens the stack, on a spring; its y picks the layer that takes
 * the bright edge, judged against where the layers are going, never where
 * they are. At rest the gaps are uneven and one port is lit. The slider is
 * the widest gap.
 *
 * The pattern: scrub and pick.
 */
const {
  Cam, circ, clamp, extremes, facing, fit, lerp, open, poly, proj, rings, ringAt, rrect, run, seg, spring, stepS,
  disposer, flatDot, mk, place, pointer, prism, put, register, solid,
} = HL;

const DRUM = 48;
const LAYERS = [
  { name: "data", h: 26, ring: circ(DRUM, 64), inner: circ(DRUM - 1.8, 64) },
  { name: "api", h: 8, ...pair(rings(-40, -40, 40, 40, 9, 1.6)) },
  { name: "ui", h: 6, ...pair(rings(-33, -33, 33, 33, 8, 1.4)) },
];
const REST = [0.5, 0.85], GMIN = 3, PORTS = [-24, -12, 0, 12, 24];

function pair([ring, inner]) { return { ring, inner }; }

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let G = value;

  const C = Cam(45, 0.5, 1.78);
  const most = 26 + 8 + 6 + 2 * 36;
  fit(C, [[-DRUM, -DRUM, 0], [DRUM, DRUM, 0], [DRUM, -DRUM, 0], [-DRUM, DRUM, 0], [-33, -33, most]], 200, 160);
  const P = proj(C), front = facing(C);
  const win = rrect(-23, -23, 23, 23, 5, 6);

  // Back to front is bottom to top: each layer covers the one under it, and
  // its guides are painted just before it, so they run behind it.
  const g = mk("g", {}, svg);
  const parts = LAYERS.map((L, i) => {
    const guide = i > 0 ? mk("path", { class: "nf dash" }, g) : null;
    const el = solid(g);
    const marks = mk("path", { class: "nf lo" }, el.g);
    const dots = [];
    if (L.name === "api") for (let k = 0; k < 10; k++) dots.push(flatDot(el.g, C, 1.2, k === 7 ? "dot" : "dot off"));
    if (L.name === "ui") for (let k = 0; k < 3; k++) dots.push(flatDot(el.g, C, 0.95, "dot off"));
    return { ...L, guide, el, marks, dots };
  });

  const gaps = REST.map((f) => spring(f * G, { eps: 0.02 }));
  let pick = -1, drawn = "";

  /** The bottom of each layer for a pair of gaps. */
  const bases = (g0, g1) => [0, 26 + g0, 26 + g0 + 8 + g1];

  function draw() {
    const z = bases(gaps[0].x, gaps[1].x), key = z.join();
    if (key === drawn) return;
    drawn = key;
    parts.forEach((p, i) => {
      const z0 = z[i], z1 = z0 + p.h;
      put(p.el, prism(P, front, p.ring, p.inner, z0, z1));
      if (p.guide) {
        const below = z[i - 1] + parts[i - 1].h;
        p.guide.setAttribute("d", extremes(P, p.ring).slice(0, 2).map((q) => seg(P(q.u, q.v, below), P(q.u, q.v, z0))).join(""));
      }
      if (p.name === "data") {
        const face = run(p.ring, front);
        p.marks.setAttribute("d", [9, 17].map((h) => open(ringAt(P, face, z0 + h))).join(""));
      }
      if (p.name === "api") {
        // five ports along each near edge
        p.dots.forEach((d, k) => {
          const s = PORTS[k % 5];
          place(d, k < 5 ? P(35, s, z1) : P(s, 35, z1));
        });
      }
      if (p.name === "ui") {
        p.marks.setAttribute("d", poly(ringAt(P, win, z1)));
        p.dots.forEach((d, k) => place(d, P(-28, -20 + k * 5, z1)));
      }
    });
  }

  const Bd = register(stage, (dt) => {
    let m = false;
    for (const s of gaps) if (stepS(s, dt)) m = true;
    draw();
    return m;
  });
  bag.add(Bd.unregister);

  function setPick(i) {
    if (i === pick) return;
    pick = i;
    parts.forEach((p, k) => p.el.sil.classList.toggle("hi", k === i));
    parts[1].dots[7].classList.toggle("off", i >= 0);
    read.textContent = i < 0 ? "rest" : parts[i].name;
  }

  function onMove([x, y]) {
    const gap = lerp(GMIN, G, clamp((x - 80) / 240, 0, 1));
    gaps[0].t = gap; gaps[1].t = gap;
    // pick against the targets: where each layer's middle is going
    const z = bases(gap, gap);
    let best = 0, bd = Infinity;
    parts.forEach((p, i) => {
      const d = Math.abs(P(0, 0, z[i] + p.h / 2)[1] - y);
      if (d < bd) { bd = d; best = i; }
    });
    setPick(best);
    Bd.wake();
  }

  function onLeave() {
    gaps.forEach((s, i) => { s.t = REST[i] * G; });
    setPick(-1);
    Bd.wake();
  }

  bag.add(pointer(stage, { move: onMove, leave: onLeave }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { G = v; if (pick < 0) onLeave(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "stack",
  means: "A full-stack app as three layers: move across to open the stack, up and down to pick a layer.",
  rules: [1, 4, 5, 6, 9],
  range: [16, 26, 36],
  tour: [[130, 230], [220, 150], [300, 80], null],
  mount,
});

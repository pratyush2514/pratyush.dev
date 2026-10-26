/**
 * Keys: seven keycaps in a low case, two rows, the last key a wide one with a
 * lamp set in its top. Each cap tapers from its foot to a smaller top, and
 * each top carries a legend for one step of the work: build, branch, read,
 * test, guard, data, and the wide return key that ships it. Legends are
 * strokes lying on the cap, so they ride it down. The key under the pointer
 * goes down; its neighbours dip after it, less the farther they are,
 * staggered outwards from it on the 700ms lift curve. The hit test reads the
 * caps' rest tops, which never move. At rest a few keys sit part-way down and
 * the lamp is lit. The slider is the reach, in key widths.
 *
 * The pattern: one of many, with a falloff.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, proj, ringAt, rings, rrect, run, unproj,
  tdone, tset, tval, tween, disposer, flatDot, mk, place, pointer, prism, put, register, solid,
} = HL;

const U = 24, PITCH = 28, H = 13, LOW = 8, TAPER = 3.6, STEP = 45;

/** A ring of n points round (cx, cy), radii rx and ry, from a0 to a1 radians. */
const arc = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 18) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const a = a0 + ((a1 - a0) * k) / n;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });

// Legends, as polylines in the cap's own plane: x to the right, y towards the
// reader, about ±5 units round the middle of the top.
const LEGENDS = {
  build: [[[-4, -3], [-1, 0], [-4, 3]], [[0.5, 3.2], [4.5, 3.2]]],
  branch: [
    arc(-2.5, -3.6, 1.3, 1.3), arc(-2.5, 3.6, 1.3, 1.3), arc(3, -2.2, 1.3, 1.3),
    [[-2.5, -2.3], [-2.5, 2.3]],
    [[3, -0.9], [3, 0.2], [1.6, 1.6], [-1.4, 2.6]],
  ],
  read: [arc(-1, -1, 3, 3), [[1.2, 1.2], [4.2, 4.2]]],
  test: [[[-4, 0.2], [-1.2, 3], [4, -3]]],
  guard: [[[0, -4.6], [4, -3.1], [3.5, 1], [0, 4.6], [-3.5, 1], [-4, -3.1], [0, -4.6]]],
  data: [
    arc(0, -3, 4, 1.5),
    [[-4, -3], [-4, 3]], [[4, -3], [4, 3]],
    arc(0, 3, 4, 1.5, 0, Math.PI, 12),
    arc(0, 0, 4, 1.5, 0, Math.PI, 12),
  ],
  ship: [[[7, -3.4], [7, 1.2], [-6, 1.2]], [[-3.2, -1.6], [-6, 1.2], [-3.2, 4]]],
};

// A legend is printed square to the reader, not to the cap: its x runs along
// world (1, -1), which is level on screen, and its y along (1, 1), which is
// straight down, stretched by LIFT so the 2:1 view does not flatten it.
const R = Math.SQRT1_2 * 0.85, LIFT = 1.5;
const onCap = (k, u, v) => [k.lx + R * (u + LIFT * v), k.cy + R * (-u + LIFT * v)];

const KEYS = [
  [0, 0, 1, "build"], [1, 0, 1, "branch"], [2, 0, 1, "read"], [3, 0, 1, "test"],
  [0, 1, 1, "guard"], [1, 1, 1, "data"], [2, 1, 2, "ship"],
].map(([c, r, w, name]) => ({ c, r, name, x: c * PITCH, y: r * PITCH, w: U + (w - 1) * PITCH }));
const REST = [0, 0.18, 0, 0.35, 0, 0.12, 0.5];
const X0 = -7, Y0 = -7, X1 = 3 * PITCH + U + 7, Y1 = PITCH + U + 7;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value;

  const C = Cam(45, 0.5, 1.98);
  fit(C, [[X0, Y0, -9], [X1, Y1, -9], [X1, Y0, -9], [X0, Y1, -9], [X0, Y0, H]], 200, 168);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [cr, ci] = rings(X0, Y0, X1, Y1, 8, 2);
  put(solid(g), prism(P, front, cr, ci, -9, 0));

  // Nearest last: append by ascending x + y of the key's middle.
  const keys = KEYS.map((k) => ({ ...k, cx: k.x + k.w / 2, cy: k.y + U / 2 }));
  const order = keys.map((k, i) => i).sort((a, b) => (keys[a].cx + keys[a].cy) - (keys[b].cx + keys[b].cy));
  for (const i of order) {
    const k = keys[i];
    k.foot = rrect(k.x, k.y, k.x + k.w, k.y + U, 4, 4);
    k.top = rrect(k.x + TAPER, k.y + TAPER, k.x + k.w - TAPER, k.y + U - TAPER, 3, 4);
    k.inner = rrect(k.x + TAPER + 1.2, k.y + TAPER + 1.2, k.x + k.w - TAPER - 1.2, k.y + U - TAPER - 1.2, 2, 4);
    k.el = solid(g);
    k.legend = mk("path", { class: "nf lo glyph" }, k.el.g);
    // the wide key's legend sits left of its lamp
    k.lx = k.name === "ship" ? k.cx - 4 : k.cx;
    k.tw = tween(REST[i]);
    k.drawn = NaN;
  }
  const wide = keys[6];
  const lamp = flatDot(wide.el.g, C, 1.3, "dot");

  function drawKey(k, d) {
    if (d === k.drawn) return;
    k.drawn = d;
    const z1 = H - (H - LOW) * d;
    put(k.el, {
      sil: poly(hull(ringAt(P, k.foot, 0).concat(ringAt(P, k.top, z1)))),
      crease: open(ringAt(P, run(k.inner, front), z1)),
    });
    k.legend.setAttribute("d", LEGENDS[k.name].map((line) => open(line.map(([u, v]) => P(...onCap(k, u, v), z1)))).join(""));
    if (k === wide) place(lamp, P(k.x + k.w - TAPER - 5, k.cy, z1));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const k of keys) { drawKey(k, tval(k.tw, now)); if (!tdone(k.tw, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  /** The key whose rest top holds the point, or the nearest within half a key; -1 off the keys. */
  function hit([sx, sy]) {
    const [x, y] = unproj(C, sx, sy, H);
    let best = -1, bd = Infinity;
    keys.forEach((k, i) => {
      const dx = Math.max(0, Math.abs(x - k.cx) - k.w / 2), dy = Math.max(0, Math.abs(y - k.cy) - U / 2);
      const d = Math.hypot(dx, dy);
      if (d < bd) { bd = d; best = i; }
    });
    return bd <= U / 2 ? best : -1;
  }

  let act = -1;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    keys.forEach((k, i) => {
      const dist = Math.hypot(k.cx - keys[from].cx, k.cy - keys[from].cy) / PITCH;
      const to = a < 0 ? REST[i] : clamp(1 - dist / reach, 0, 1);
      tset(k.tw, to, now, dist * STEP);
      k.el.sil.classList.toggle("hi", i === a);
      k.legend.classList.toggle("hi", i === a);
    });
    lamp.classList.toggle("off", a >= 0);
    read.textContent = a < 0 ? "rest" : keys[a].name;
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; if (act >= 0) { const a = act; act = -1; setActive(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "keys",
  means: "Seven keys, one for each step of the work: the key under the pointer goes down, and its neighbours dip after it.",
  rules: [1, 2, 3, 5, 9],
  range: [0.6, 1.4, 2.4],
  tour: [[150, 150], [250, 150], [230, 205], null],
  mount,
});

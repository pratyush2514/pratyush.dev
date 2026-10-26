/**
 * Keys: seven keycaps in a low case, two rows, the last key a wide one with a
 * lamp set in its top. Each cap tapers from its foot to a smaller, dished top.
 * The key under the pointer goes down; its neighbours dip after it, less the
 * farther they are, staggered outwards from it on the 700ms lift curve. The
 * hit test reads the caps' rest tops, which never move. At rest a few keys sit
 * part-way down and the lamp is lit. The slider is the reach, in key widths.
 *
 * The pattern: one of many, with a falloff.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, proj, ringAt, rings, rrect, run, unproj,
  tdone, tset, tval, tween, disposer, flatDot, mk, place, pointer, prism, put, register, solid,
} = HL;

const U = 24, PITCH = 28, H = 13, LOW = 8, TAPER = 3.6, STEP = 45;
const KEYS = [
  [0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 1],
  [0, 1, 1], [1, 1, 1], [2, 1, 2],
].map(([c, r, w]) => ({ c, r, x: c * PITCH, y: r * PITCH, w: U + (w - 1) * PITCH }));
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
  const order = KEYS.map((k, i) => i).sort((a, b) => (KEYS[a].x + KEYS[a].w / 2 + KEYS[a].y) - (KEYS[b].x + KEYS[b].w / 2 + KEYS[b].y));
  const keys = KEYS.map((k) => ({ ...k, cx: k.x + k.w / 2, cy: k.y + U / 2 }));
  for (const i of order) {
    const k = keys[i];
    k.foot = rrect(k.x, k.y, k.x + k.w, k.y + U, 4, 4);
    k.top = rrect(k.x + TAPER, k.y + TAPER, k.x + k.w - TAPER, k.y + U - TAPER, 3, 4);
    k.inner = rrect(k.x + TAPER + 1.2, k.y + TAPER + 1.2, k.x + k.w - TAPER - 1.2, k.y + U - TAPER - 1.2, 2, 4);
    k.dish = rrect(k.x + TAPER + 4, k.y + TAPER + 4, k.x + k.w - TAPER - 4, k.y + U - TAPER - 4, 3, 4);
    k.el = solid(g);
    k.dishEl = mk("path", { class: "nf lo" }, k.el.g);
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
    k.dishEl.setAttribute("d", poly(ringAt(P, k.dish, z1)));
    if (k === wide) place(lamp, P(k.x + k.w - TAPER - 7, k.cy, z1));
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
    });
    lamp.classList.toggle("off", a >= 0);
    read.textContent = a < 0 ? "rest" : `key ${keys[a].r + 1}·${keys[a].c + 1}`;
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
  means: "Seven keycaps in a case: the key under the pointer goes down, and its neighbours dip after it.",
  rules: [1, 2, 3, 5, 9],
  range: [0.6, 1.4, 2.4],
  tour: [[150, 150], [250, 150], [230, 205], null],
  mount,
});

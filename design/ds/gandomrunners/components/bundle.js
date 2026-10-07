/* @ds-bundle: {"format":4,"namespace":"GandomRunners","components":[{"name":"Button"},{"name":"Tag"},{"name":"Eyebrow"},{"name":"ServiceCard"},{"name":"LocationCard"},{"name":"CoachCard"},{"name":"OverlayCard"},{"name":"RouteMarker"},{"name":"RouteDivider"},{"name":"RouteWordMap"},{"name":"Icon"}]} */
(function () {
  "use strict";
  var React = window.React;
  var h = React.createElement;

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(" ");
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- seeded noise (deterministic GPS wobble) ---------- */
  function hashSeed(str) {
    var s = 2166136261;
    for (var i = 0; i < str.length; i++) { s ^= str.charCodeAt(i); s = Math.imul(s, 16777619); }
    return s >>> 0;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
    };
  }

  /* ---------- icons: Tabler Icons outline (MIT), 24 grid, 2px round stroke ---------- */
  var ICON_SVG = {"run": "<path d=\"M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /><path d=\"M4 17l5 1l.75 -1.5\" /><path d=\"M15 21l0 -4l-4 -3l1 -6\" /><path d=\"M7 12l0 -3l5 -1l3 3l3 1\" />", "walk": "<path d=\"M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /><path d=\"M7 21l3 -4\" /><path d=\"M16 21l-2 -4l-3 -3l1 -6\" /><path d=\"M6 12l2 -3l4 -1l3 3l3 1\" />", "stretching": "<path d=\"M16 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /><path d=\"M5 20l5 -.5l1 -2\" /><path d=\"M18 20v-5h-5.5l2.5 -6.5l-5.5 1l1.5 2\" />", "shoe": "<path d=\"M4 6h5.426a1 1 0 0 1 .863 .496l1.064 1.823a3 3 0 0 0 1.896 1.407l4.677 1.114a4 4 0 0 1 3.074 3.89v2.27a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1z\" /><path d=\"M14 13l1 -2\" /><path d=\"M8 18v-1a4 4 0 0 0 -4 -4h-1\" /><path d=\"M10 12l1.5 -3\" />", "mountain": "<path d=\"M3 20h18l-6.921 -14.612a2.3 2.3 0 0 0 -4.158 0l-6.921 14.612z\" /><path d=\"M7.5 11l2 2.5l2.5 -2.5l2 3l2.5 -2\" />", "trees": "<path d=\"M16 5l3 3l-2 1l4 4l-3 1l4 4h-9\" /><path d=\"M15 21l0 -3\" /><path d=\"M8 13l-2 -2\" /><path d=\"M8 12l2 -2\" /><path d=\"M8 21v-13\" /><path d=\"M5.824 16a3 3 0 0 1 -2.743 -3.69a3 3 0 0 1 .304 -4.833a3 3 0 0 1 4.615 -3.707a3 3 0 0 1 4.614 3.707a3 3 0 0 1 .305 4.833a3 3 0 0 1 -2.919 3.695h-4z\" />", "sunrise": "<path d=\"M3 17h1m16 0h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7m-9.7 5.7a4 4 0 0 1 8 0\" /><path d=\"M3 21l18 0\" /><path d=\"M12 9v-6l3 3m-6 0l3 -3\" />", "stopwatch": "<path d=\"M5 13a7 7 0 1 0 14 0a7 7 0 0 0 -14 0z\" /><path d=\"M14.5 10.5l-2.5 2.5\" /><path d=\"M17 8l1 -1\" /><path d=\"M14 3h-4\" />", "route": "<path d=\"M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" /><path d=\"M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4z\" /><path d=\"M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5\" />", "heartbeat": "<path d=\"M19.5 13.572l-7.5 7.428l-2.896 -2.868m-6.117 -8.104a5 5 0 0 1 9.013 -3.022a5 5 0 1 1 7.5 6.572\" /><path d=\"M3 13h2l2 3l2 -6l1 3h3\" />", "flame": "<path d=\"M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z\" />", "trending-up": "<path d=\"M3 17l6 -6l4 4l8 -8\" /><path d=\"M14 7l7 0l0 7\" />", "medal": "<path d=\"M12 4v3m-4 -3v6m8 -6v6\" /><path d=\"M12 18.5l-3 1.5l.5 -3.5l-2 -2l3 -.5l1.5 -3l1.5 3l3 .5l-2 2l.5 3.5z\" />", "trophy": "<path d=\"M8 21l8 0\" /><path d=\"M12 17l0 4\" /><path d=\"M7 4l10 0\" /><path d=\"M17 4v8a5 5 0 0 1 -10 0v-8\" /><path d=\"M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /><path d=\"M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />", "flag": "<path d=\"M5 5a5 5 0 0 1 7 0a5 5 0 0 0 7 0v9a5 5 0 0 1 -7 0a5 5 0 0 0 -7 0v-9z\" /><path d=\"M5 21v-7\" />", "target-arrow": "<path d=\"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /><path d=\"M12 7a5 5 0 1 0 5 5\" /><path d=\"M13 3.055a9 9 0 1 0 7.941 7.945\" /><path d=\"M15 6v3h3l3 -3h-3v-3z\" /><path d=\"M15 9l-3 3\" />", "users-group": "<path d=\"M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" /><path d=\"M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1\" /><path d=\"M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" /><path d=\"M17 10h2a2 2 0 0 1 2 2v1\" /><path d=\"M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" /><path d=\"M3 13v-1a2 2 0 0 1 2 -2h2\" />", "calendar-event": "<path d=\"M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z\" /><path d=\"M16 3l0 4\" /><path d=\"M8 3l0 4\" /><path d=\"M4 11l16 0\" /><path d=\"M8 15h2v2h-2z\" />", "map-pin": "<path d=\"M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" /><path d=\"M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z\" />", "current-location": "<path d=\"M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" /><path d=\"M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0\" /><path d=\"M12 2l0 2\" /><path d=\"M12 20l0 2\" /><path d=\"M20 12l2 0\" /><path d=\"M2 12l2 0\" />", "message-circle": "<path d=\"M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1\" />", "arrow-left": "<path d=\"M5 12l14 0\" /><path d=\"M5 12l6 6\" /><path d=\"M5 12l6 -6\" />", "rosette-discount-check": "<path d=\"M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1\" /><path d=\"M9 12l2 2l4 -4\" />", "clock": "<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" /><path d=\"M12 7v5l3 3\" />", "arrow-right": "<path d=\"M5 12l14 0\" /><path d=\"M13 18l6 -6\" /><path d=\"M13 6l6 6\" />", "arrow-up-right": "<path d=\"M17 7l-10 10\" /><path d=\"M8 7l9 0l0 9\" />", "building": "<path d=\"M3 21l18 0\" /><path d=\"M9 8l1 0\" /><path d=\"M9 12l1 0\" /><path d=\"M9 16l1 0\" /><path d=\"M14 8l1 0\" /><path d=\"M14 12l1 0\" /><path d=\"M14 16l1 0\" /><path d=\"M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16\" />", "user": "<path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\" /><path d=\"M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\" />", "brand-instagram": "<path d=\"M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z\" /><path d=\"M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" /><path d=\"M16.5 7.5l0 .01\" />"};
  var ICON_ALIAS = { arrow: "arrow-forward", message: "message-circle", badge: "rosette-discount-check" };
  function Icon(props) {
    var name = ICON_ALIAS[props.name] || props.name;
    var flip = name === "arrow-forward";
    if (flip) name = "arrow-right";
    var inner = ICON_SVG[name];
    if (!inner) return null;
    var size = props.size || 24;
    var a11y = props.label ? { role: "img", "aria-label": props.label } : { "aria-hidden": "true" };
    return h("svg", Object.assign({ className: cx("gr-icon", flip && "gr-flip-rtl", props.className), width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: props.strokeWidth || 2, strokeLinecap: "round", strokeLinejoin: "round", focusable: "false", dangerouslySetInnerHTML: { __html: inner } }, a11y));
  }

  /* ---------- Button ---------- */
  function Button(props) {
    var variant = props.variant || "primary";
    var size = props.size || "md";
    var tag = props.href ? "a" : "button";
    var rest = {};
    for (var k in props) if (["variant", "size", "icon", "children", "className"].indexOf(k) < 0) rest[k] = props[k];
    rest.className = cx("gr-btn", "gr-btn-" + variant, size === "lg" && "gr-btn-lg", props.className);
    if (tag === "button" && !rest.type) rest.type = "button";
    return h(tag, rest, props.children, props.icon ? h(Icon, { name: props.icon, size: 18 }) : null);
  }

  /* ---------- Tag ---------- */
  function Tag(props) {
    return h("span", { className: cx("gr-tag", props.tone && props.tone !== "neutral" && "gr-tag-" + props.tone, props.en && "gr-en") }, props.children);
  }

  /* ---------- Eyebrow ---------- */
  function Eyebrow(props) {
    return h("span", { className: "gr-eyebrow" }, props.children);
  }

  /* ---------- small route squiggle used on cards ---------- */
  function CardRoute(props) {
    var r = rng(hashSeed(String(props.seed || "gandom")));
    var pts = [[2, 14]], x = 2, y = 14;
    var turns = 5;
    for (var i = 0; i < turns; i++) {
      x += 14 + Math.round((r() + 1) * 8);
      pts.push([x, y]);
      y = y === 14 ? 6 + Math.round((r() + 1) * 2) : 14;
      if (i < turns - 1) { x += Math.round((r() + 1) * 4); pts.push([x, y]); }
    }
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + " " + p[1]; }).join(" ");
    var last = pts[pts.length - 1];
    return h("svg", { className: "gr-card-route", viewBox: "0 0 " + (last[0] + 6) + " 22", preserveAspectRatio: "xMinYMid meet", "aria-hidden": "true" },
      h("path", { d: d }), h("circle", { cx: last[0], cy: last[1], r: 4 }));
  }

  /* ---------- ServiceCard ---------- */
  function ServiceCard(props) {
    return h("article", { className: "gr-card" },
      h(CardRoute, { seed: props.title }),
      props.tag ? h("div", null, h(Tag, { tone: props.tagTone || "route" }, props.tag)) : null,
      h("h3", null, props.title),
      props.description ? h("p", null, props.description) : null,
      props.audience ? h("dl", { className: "gr-meta" }, h("div", null, h("dt", null, "مناسب برای"), h("dd", null, props.audience))) : null,
      h("div", { className: "gr-card-foot" }, h(Button, { variant: "ghost", href: props.ctaHref || "#contact", icon: "arrow-forward" }, props.ctaLabel || "برای جزئیات پیام بده")));
  }

  /* ---------- LocationCard ---------- */
  function LocationCard(props) {
    var rows = [["نوع تمرین", props.type, true], ["سطح", props.level, true], ["زمان", props.time || "برنامه هفتگی اعلام می‌شود", false]];
    return h("article", { className: "gr-card" },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
        h("h3", null, props.name),
        h(Tag, { tone: props.nature ? "nature" : "route" }, props.nature ? "طبیعت" : "شهری")),
      h("dl", { className: "gr-meta" }, rows.filter(function (r) { return r[1]; }).map(function (r) {
        return h("div", { key: r[0] }, h("dt", null, r[0]), h("dd", { className: r[2] && /^[A-Za-z]/.test(r[1]) ? "gr-en" : null }, r[1]));
      })),
      props.description ? h("p", null, props.description) : null,
      h("div", { className: "gr-card-foot" }, h(Button, { variant: "ghost", href: props.ctaHref || "#contact", icon: "message-circle" }, props.ctaLabel || "برنامه دقیق رو در اینستاگرام بپرس")));
  }

  /* ---------- CoachCard ---------- */
  function CoachCard(props) {
    return h("div", { className: "gr-cq" },
      h("article", { className: "gr-card gr-coach" },
        props.logoSrc ? h("div", { className: "gr-coach-mark" }, h("img", { src: props.logoSrc, alt: "" })) : null,
        h("div", { className: "gr-coach-body" },
          props.eyebrow ? h(Eyebrow, null, props.eyebrow) : null,
          h("h3", null, props.name),
          props.role ? h("p", null, props.role) : null,
          props.quote ? h("blockquote", null, "«" + props.quote + "»") : null,
          props.credential ? h("span", { className: "gr-credential" }, h(Icon, { name: "rosette-discount-check", size: 16 }), props.credential) : null)));
  }

  /* ---------- OverlayCard ---------- */
  function OverlayCard(props) {
    return h("div", { className: cx("gr-overlay", props.panel && "gr-overlay-panel"), style: props.style },
      props.eyebrow ? h(Eyebrow, null, props.eyebrow) : null,
      props.title ? h("h2", null, props.title) : null,
      props.description ? h("p", null, props.description) : null,
      props.ctaLabel ? h(Button, { variant: "secondary", href: props.ctaHref || "#", icon: "arrow-forward" }, props.ctaLabel) : null);
  }

  /* ---------- RouteMarker ---------- */
  function RouteMarker(props) {
    var kind = props.kind || "origin";
    var done = props.state === "completed";
    var blink = kind === "origin" && props.blink !== false && !done;
    return h("svg", { className: cx("gr-marker", done && "is-completed"), viewBox: "-14 -14 28 28", role: "img", "aria-label": props.label || (kind === "origin" ? "نقطه شروع" : "مقصد") },
      blink ? h("circle", { className: "pulse", r: 7 }) : null,
      kind === "origin"
        ? [h("circle", { key: "d", className: "dot", r: 7 }), h("circle", { key: "c", className: "core", r: 2.6 })]
        : [h("circle", { key: "r", className: "ring core", r: 7, style: { stroke: done ? undefined : "var(--route-orange)", strokeWidth: 2.5 } }), h("circle", { key: "d", className: "dot", r: 3 })]);
  }

  /* ---------- RouteDivider ---------- */
  function RouteDivider(props) {
    var height = props.height || 160;
    var r = rng(hashSeed("divider" + height));
    var d = "M12 0";
    for (var y = 8; y <= height - 8; y += 8) d += " L" + (12 + r() * 1.2).toFixed(2) + " " + y;
    d += " L12 " + (height - 8);
    return h("svg", { className: "gr-divider", width: 24, height: height, viewBox: "0 0 24 " + height, "aria-hidden": "true" },
      h("path", { d: d }), props.end !== false ? h("circle", { cx: 12, cy: height - 6, r: 6 }) : null);
  }

  /* =====================================================================
     RouteWordMap — route alphabet + engine
     Each glyph is ONE continuous polyline on a 0..w × 0..6 grid (y down).
     Entry sits on the left edge, exit on the right edge, so letters chain
     through the gap "street" between them. Retracing is allowed — GPS routes do.
     ===================================================================== */
  var ALPHABET = {
    A: { w: 4, p: [[0, 6], [0, 2], [2, 0], [4, 2], [4, 3], [0, 3], [4, 3], [4, 6]] },
    B: { w: 4, p: [[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3], [3, 3], [4, 4], [4, 5], [3, 6], [0, 6], [4, 6]] },
    C: { w: 4, p: [[0, 3], [0, 1], [1, 0], [4, 0], [1, 0], [0, 1], [0, 5], [1, 6], [4, 6]] },
    D: { w: 4, p: [[0, 6], [0, 0], [3, 0], [4, 1], [4, 5], [3, 6], [0, 6], [3, 6], [4, 5]] },
    E: { w: 4, p: [[0, 3], [3, 3], [0, 3], [0, 0], [4, 0], [0, 0], [0, 6], [4, 6]] },
    F: { w: 4, p: [[0, 6], [0, 0], [4, 0], [0, 0], [0, 3], [3, 3]] },
    G: { w: 4, p: [[0, 3], [0, 1], [1, 0], [4, 0], [1, 0], [0, 1], [0, 5], [1, 6], [4, 6], [4, 3], [2, 3], [4, 3]] },
    H: { w: 4, p: [[0, 0], [0, 6], [0, 3], [4, 3], [4, 0], [4, 6]] },
    I: { w: 2, p: [[0, 0], [2, 0], [1, 0], [1, 6], [0, 6], [2, 6]] },
    J: { w: 4, p: [[0, 4], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]] },
    K: { w: 4, p: [[0, 0], [0, 6], [0, 3], [1, 3], [4, 0], [1, 3], [4, 6]] },
    L: { w: 4, p: [[0, 0], [0, 6], [4, 6]] },
    M: { w: 5, p: [[0, 6], [0, 0], [2.5, 3], [5, 0], [5, 6]] },
    N: { w: 4, p: [[0, 6], [0, 0], [4, 6], [4, 0]] },
    O: { w: 4, p: [[0, 5], [0, 1], [1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [1, 6], [3, 6], [4, 5]] },
    P: { w: 4, p: [[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3], [3, 3]] },
    Q: { w: 4, p: [[0, 5], [0, 1], [1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [1, 6], [3, 6], [2, 4], [4, 6]] },
    R: { w: 4, p: [[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3], [1, 3], [4, 6]] },
    S: { w: 4, p: [[0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3], [1, 3], [0, 2], [0, 1], [1, 0], [4, 0]] },
    T: { w: 4, p: [[0, 0], [2, 0], [2, 6], [2, 0], [4, 0]] },
    U: { w: 4, p: [[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]] },
    V: { w: 4, p: [[0, 0], [2, 6], [4, 0]] },
    W: { w: 5, p: [[0, 0], [1, 6], [2.5, 2], [4, 6], [5, 0]] },
    X: { w: 4, p: [[0, 6], [4, 0], [2, 3], [0, 0], [4, 6]] },
    Y: { w: 4, p: [[0, 0], [2, 3], [2, 6], [2, 3], [4, 0]] },
    Z: { w: 4, p: [[0, 0], [4, 0], [0, 6], [4, 6]] }
  };
  var LETTER_H = 6, LETTER_GAP = 2;

  function wordWidth(word) {
    var w = 0, n = 0;
    for (var i = 0; i < word.length; i++) { var g = ALPHABET[word[i]]; if (g) { w += g.w; n++; } }
    return w + Math.max(0, n - 1) * LETTER_GAP;
  }

  /* points (grid units) of a whole word starting at (x0, y0); letters joined through the gap street */
  function buildWordPoints(word, x0, y0) {
    var pts = [], x = x0, prev = null;
    word = String(word || "").toUpperCase();
    for (var i = 0; i < word.length; i++) {
      var g = ALPHABET[word[i]];
      if (!g) continue;
      var glyph = g.p.map(function (p) { return [x + p[0], y0 + p[1]]; });
      if (prev) {
        var gx = x - LETTER_GAP / 2;
        pts.push([gx, prev[1]], [gx, glyph[0][1]]);
      }
      Array.prototype.push.apply(pts, glyph);
      prev = glyph[glyph.length - 1];
      x += g.w + LETTER_GAP;
    }
    return pts;
  }

  function dedupe(pts) {
    var out = [];
    for (var i = 0; i < pts.length; i++) {
      var l = out[out.length - 1];
      if (!l || Math.abs(l[0] - pts[i][0]) > 1e-6 || Math.abs(l[1] - pts[i][1]) > 1e-6) out.push(pts[i]);
    }
    return out;
  }

  /* subdivide + seeded jitter: the whole line wobbles a little, ends stay put */
  function gpsify(pts, step, amp, seed) {
    var r = rng(seed), out = [pts[0]];
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      var len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      var n = Math.max(1, Math.round(len / step));
      for (var k = 1; k <= n; k++) {
        var t = k / n;
        var x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
        var edge = (i === pts.length - 1 && k === n);
        if (!edge) { x += r() * amp; y += r() * amp; }
        out.push([x, y]);
      }
    }
    return out;
  }

  function cumulative(pts) {
    var c = [0];
    for (var i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return c;
  }
  function pointAt(pts, cum, d) {
    var total = cum[cum.length - 1];
    d = clamp(d, 0, total);
    for (var i = 1; i < cum.length; i++) {
      if (cum[i] >= d) {
        var seg = cum[i] - cum[i - 1] || 1, t = (d - cum[i - 1]) / seg;
        return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
      }
    }
    return pts[pts.length - 1];
  }
  function toPath(pts) {
    return pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2); }).join(" ");
  }

  /* ---------- RouteWordMap — one continuous route, one centred line per word ----------
     Item i's segment: start (origin, or the previous item's waypoint) → left lane → word i →
     right lane → down to the street under the line → its centre (waypoint i). The last item ends
     at `finish` (above the wordmark under the map) and pulses there. */
  var WORD_BOUNDS = { desktop: { x: 25, y: 16, width: 50, height: 60 }, mobile: { x: 6, y: 14, width: 88, height: 42 } };
  var DEFAULT_FINISH_Y = { desktop: 86, mobile: 56 };

  function normalizeWord(w) { return String(w || "").toUpperCase().replace(/[^A-Z]/g, ""); }

  function buildRouteLayout(items, size, opts) {
    opts = opts || {};
    var W = size.w, H = size.h, mobile = W < 768;
    var wb = opts.wordBounds || {};
    var b = mobile ? (wb.mobile || WORD_BOUNDS.mobile) : (wb.desktop || WORD_BOUNDS.desktop);
    var bx = b.x / 100 * W, by = b.y / 100 * H, bw = b.width / 100 * W, bh = b.height / 100 * H;
    var cx = bx + bw / 2;
    var n = Math.max(1, items.length), rowH = bh / n;
    var widest = 1;
    items.forEach(function (it) { widest = Math.max(widest, wordWidth(normalizeWord(it.word))); });
    var u = Math.min(bw / (widest + 2), (rowH * 0.6) / LETTER_H);
    var wobble = opts.wobbleIntensity == null ? 1 : opts.wobbleIntensity;
    var y0first = by + (rowH - LETTER_H * u) / 2;
    var origin = opts.origin ? [opts.origin.x / 100 * W, opts.origin.y / 100 * H] : [cx, Math.max(H * 0.03, y0first - 1.6 * u)];
    var fin = opts.finish || {};
    var finish = [fin.x != null ? fin.x / 100 * W : cx, (fin.y != null ? fin.y : (mobile ? DEFAULT_FINISH_Y.mobile : DEFAULT_FINISH_Y.desktop)) / 100 * H];
    var start = origin, lines = [];
    var routes = items.map(function (it, i) {
      var word = normalizeWord(it.word);
      var ww = Math.max(1, wordWidth(word));
      var x0 = cx - ww * u / 2, y0 = by + i * rowH + (rowH - LETTER_H * u) / 2;
      lines.push([x0 - u, y0 - u * 0.6, ww * u + 2 * u, LETTER_H * u + 1.2 * u]);
      var wordPts = buildWordPoints(word, 0, 0).map(function (p) { return [x0 + p[0] * u, y0 + p[1] * u]; });
      if (!wordPts.length) wordPts = [[x0, y0 + 3 * u]];
      var entry = wordPts[0], exit = wordPts[wordPts.length - 1];
      var xl = x0 - u, xr = x0 + ww * u + u;
      var under = by + (i + 1) * rowH;              // the street between this line and the next
      var last = i === items.length - 1;
      var lead = [start, [xl, start[1]], [xl, entry[1]]];
      var tail = last
        ? [[xr, exit[1]], [xr, under], [finish[0], under], finish]
        : [[xr, exit[1]], [xr, under], [cx, under]];
      var dest = tail[tail.length - 1];
      var raw = dedupe(lead.concat(wordPts, tail));
      var pts = gpsify(raw, Math.max(4, u * 0.45), u * 0.06 * wobble, hashSeed(word + i));
      pts[0] = start.slice();                         // segments join exactly
      var cum = cumulative(pts);
      var headLen = cumulative(dedupe(lead.concat(wordPts)));
      var allLen = cumulative(raw);
      var wordEnd = headLen[headLen.length - 1] / (allLen[allLen.length - 1] || 1) || 0.85;
      start = dest;
      return { word: word, d: toPath(pts), pts: pts, cum: cum, total: cum[cum.length - 1], wordEnd: wordEnd, dest: dest, last: last };
    });
    return { mobile: mobile, origin: origin, finish: finish, routes: routes, W: W, H: H, u: u, blockLeft: bx, blockRight: bx + bw, keepOut: lines.concat([[finish[0] - 3 * u, finish[1] - 3 * u, 6 * u, 6 * u]]) };
  }

  /* 0–.10 start · .10–.70 lane + word · .70–.85 down to the waypoint · .85–1 hold */
  var PHASES = { start: 0.10, word: 0.70, dest: 0.85 };
  function phases() { return PHASES; }
  function drawnFraction(t, wordEnd, ph) {
    ph = ph || PHASES;
    if (t <= ph.start) return 0;
    if (t <= ph.word) return wordEnd * ((t - ph.start) / (ph.word - ph.start));
    if (t <= ph.dest) return wordEnd + (1 - wordEnd) * ((t - ph.word) / (ph.dest - ph.word));
    return 1;
  }
  function ramp(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }

  /* static abstract city, built once per size: streets on a 2-cell block grid, broken alleys,
     parks (no street crosses them) and small X-marked buildings 1×1 / 1×2 / 2×1 */
  function buildCity(W, H, g, keepOut) {
    var r = rng(11), cols = Math.ceil(W / g) + 1, rows = Math.ceil(H / g) + 1;
    function hitsKeepOut(c, rw, wc, hc) {
      var x = c * g, y = rw * g, w = wc * g, hh = hc * g;
      for (var i = 0; i < keepOut.length; i++) {
        var k = keepOut[i];
        if (x < k[0] + k[2] && x + w > k[0] && y < k[1] + k[3] && y + hh > k[1]) return true;
      }
      return false;
    }
    var owner = {}; // "c,r" → park index
    function free(c, rw, wc, hc) {
      for (var a = c - 1; a < c + wc + 1; a++) for (var bb = rw - 1; bb < rw + hc + 1; bb++) if (owner[a + "," + bb] != null) return false;
      return c >= 0 && rw >= 0 && c + wc <= cols && rw + hc <= rows && !hitsKeepOut(c, rw, wc, hc);
    }
    var parks = [], shapes = [[2, 2], [4, 2], [2, 4], [4, 4], [6, 2]];
    var target = Math.max(4, Math.round(cols * rows / 140));
    for (var tries = 0; tries < 400 && parks.length < target; tries++) {
      var s = shapes[Math.floor((r() + 1) / 2 * shapes.length) % shapes.length];
      var c = 2 * Math.floor((r() + 1) / 2 * (cols / 2)), rw = 2 * Math.floor((r() + 1) / 2 * (rows / 2));
      if (!free(c, rw, s[0], s[1])) continue;
      for (var a = c; a < c + s[0]; a++) for (var bb = rw; bb < rw + s[1]; bb++) owner[a + "," + bb] = parks.length;
      parks.push([c, rw, s[0], s[1]]);
    }
    function inner(c1, r1, c2, r2) { var p = owner[c1 + "," + r1]; return p != null && p === owner[c2 + "," + r2]; }
    var streets = "", alleys = "", avenues = "";
    function seg(x1, y1, x2, y2) { return "M" + x1 + " " + y1 + "L" + x2 + " " + y2; }
    var keepAlley = {};
    for (var k = 0; k <= cols; k++) {
      var cls = k % 6 === 3 ? "av" : k % 2 === 0 ? "st" : "al";
      for (var a2 = 0; a2 < rows; a2++) {
        if (inner(k - 1, a2, k, a2)) continue;
        if (cls === "al") {
          var key = "v" + k + "_" + (a2 >> 1);
          if (keepAlley[key] == null) keepAlley[key] = r() > -0.6;
          if (!keepAlley[key]) continue;
        }
        var d = seg(k * g, a2 * g, k * g, (a2 + 1) * g);
        if (cls === "av") avenues += d; else if (cls === "st") streets += d; else alleys += d;
      }
    }
    for (var k2 = 0; k2 <= rows; k2++) {
      var cls2 = k2 % 6 === 3 ? "av" : k2 % 2 === 0 ? "st" : "al";
      for (var a3 = 0; a3 < cols; a3++) {
        if (inner(a3, k2 - 1, a3, k2)) continue;
        if (cls2 === "al") {
          var key2 = "h" + k2 + "_" + (a3 >> 1);
          if (keepAlley[key2] == null) keepAlley[key2] = r() > -0.6;
          if (!keepAlley[key2]) continue;
        }
        var d2 = seg(a3 * g, k2 * g, (a3 + 1) * g, k2 * g);
        if (cls2 === "av") avenues += d2; else if (cls2 === "st") streets += d2; else alleys += d2;
      }
    }
    // buildings: a plan-style rectangle with an X, inset inside its cells
    var bld = "", taken = {}, sizes = [[1, 1], [1, 1], [1, 2], [2, 1]];
    var nB = Math.round(cols * rows / 26);
    for (var t2 = 0, placed = 0; t2 < nB * 8 && placed < nB; t2++) {
      var sz = sizes[Math.floor((r() + 1) / 2 * sizes.length) % sizes.length];
      // a 2×1 / 1×2 building must sit inside one 2×2 block so no street crosses it
      var bc = Math.floor((r() + 1) / 2 * cols), br = Math.floor((r() + 1) / 2 * rows);
      if (sz[0] === 2) bc = bc & ~1;
      if (sz[1] === 2) br = br & ~1;
      var clash = false;
      for (var a4 = bc; a4 < bc + sz[0]; a4++) for (var b4 = br; b4 < br + sz[1]; b4++) if (owner[a4 + "," + b4] != null || taken[a4 + "," + b4]) clash = true;
      if (clash || hitsKeepOut(bc, br, sz[0], sz[1])) continue;
      for (a4 = bc; a4 < bc + sz[0]; a4++) for (b4 = br; b4 < br + sz[1]; b4++) taken[a4 + "," + b4] = 1;
      var pad = g * 0.2, x = bc * g + pad, y = br * g + pad, w = sz[0] * g - 2 * pad, hh = sz[1] * g - 2 * pad;
      bld += "M" + x + " " + y + "h" + w + "v" + hh + "h" + (-w) + "Z" + "M" + x + " " + y + "l" + w + " " + hh + "M" + (x + w) + " " + y + "l" + (-w) + " " + hh;
      placed++;
    }
    return { parks: parks, streets: streets, alleys: alleys, avenues: avenues, buildings: bld, g: g };
  }

  function CityMap(props) {
    var c = props.city, g = c.g;
    return h("g", null,
      c.parks.map(function (p, i) {
        return h("rect", { key: "p" + i, className: "park", x: p[0] * g + 3, y: p[1] * g + 3, width: p[2] * g - 6, height: p[3] * g - 6, rx: 4 });
      }),
      h("path", { className: "street-minor", d: c.alleys }),
      h("path", { className: "street", d: c.streets }),
      h("path", { className: "avenue", d: c.avenues }),
      h("path", { className: "building", d: c.buildings }));
  }

  /* the step copy opens as a glass popup from its destination marker.
     Desktop: alternating halves (item 0 left, 1 right, 2 left…), in the margin beside the word column.
     Mobile, or a margin too narrow: below the marker (above it when there is no room). */
  var POP_W = 300;
  function popPlacement(L, d, i) {
    if (!L.mobile) {
      var leftRoom = L.blockLeft - 64, rightRoom = L.W - L.blockRight - 64;
      var side = i % 2 === 0 ? "left" : "right";
      var room = side === "left" ? leftRoom : rightRoom;
      if (room < 220) { side = side === "left" ? "right" : "left"; room = side === "left" ? leftRoom : rightRoom; }
      if (room >= 220) {
        var w = Math.min(POP_W, room);
        var edge = side === "left" ? L.blockLeft - 36 : L.blockRight + 36;   // the card edge the leader reaches
        return { mode: side, w: w, edge: edge, cy: clamp(d[1], 120, L.H - 120) };
      }
    }
    var w2 = Math.min(L.W * 0.88, 420), left = clamp(d[0] - w2 / 2, L.W * 0.06, L.W * 0.94 - w2);
    return { mode: d[1] + 230 > L.H ? "above" : "below", w: w2, left: left };
  }
  function StepPopup(props) {
    var it = props.item || {}, L = props.layout, d = props.dest, open = props.open, pl = props.place;
    if (open <= 0.001) return null;
    var st = { width: pl.w, opacity: open, pointerEvents: open > 0.6 ? "auto" : "none" };
    var sc = "scale(" + (0.92 + 0.08 * open) + ")";
    if (pl.mode === "left" || pl.mode === "right") {
      st.top = pl.cy;
      st.left = pl.mode === "left" ? pl.edge - pl.w : pl.edge;
      st.transform = "translateY(-50%) " + sc;
      st.transformOrigin = (pl.mode === "left" ? "100%" : "0") + " 50%";
      st["--tail-y"] = (d[1] - pl.cy) + "px";
    } else {
      var up = pl.mode === "above";
      st.left = pl.left;
      st.top = up ? d[1] - 20 : d[1] + 20;
      st.transform = (up ? "translateY(-100%) " : "") + sc;
      st.transformOrigin = (d[0] - pl.left) + "px " + (up ? "100%" : "0");
      st["--tail"] = (d[0] - pl.left) + "px";
    }
    return h("div", { className: cx("gr-rwm-pop", pl.mode), style: st, role: "group", "aria-hidden": props.hidden ? "true" : null, "aria-label": it.title || it.word },
      it.eyebrow ? h(Eyebrow, null, it.eyebrow) : null,
      it.title ? h("h3", null, it.title) : null,
      it.description ? h("p", null, it.description) : null,
      it.ctaLabel ? h("div", { style: { marginTop: 4 } }, h(Button, { variant: props.last ? "primary" : "secondary", href: it.ctaHref || "#", icon: "arrow-forward", tabIndex: open < 0.9 ? -1 : null }, it.ctaLabel)) : null);
  }

  /* the dashed leader from the destination to the side popup */
  function leader(d, pl, open, key) {
    if ((pl.mode !== "left" && pl.mode !== "right") || open <= 0.001) return null;
    return h("path", { key: key, className: "pop-leader", d: "M" + d[0] + " " + d[1] + "H" + pl.edge, pathLength: 100, strokeDasharray: "100 100", strokeDashoffset: 100 * (1 - open), style: { opacity: open } });
  }

  function RouteWordMap(props) {
    var items = (props.items || []).filter(function (it) { return normalizeWord(it.word).length; });
    var n = Math.max(1, items.length);
    var p = clamp(props.progress == null ? n : props.progress, 0, n);
    var rootRef = React.useRef(null);
    var sz = React.useState({ w: 960, h: 540 }), size = sz[0], setSize = sz[1];
    React.useEffect(function () {
      var el = rootRef.current;
      if (!el || typeof ResizeObserver === "undefined") return;
      var ro = new ResizeObserver(function () {
        var b = el.getBoundingClientRect();
        if (b.width && b.height) setSize(function (s) { return Math.abs(s.w - b.width) < 1 && Math.abs(s.h - b.height) < 1 ? s : { w: Math.round(b.width), h: Math.round(b.height) }; });
      });
      ro.observe(el);
      return function () { ro.disconnect(); };
    }, []);
    var key = JSON.stringify(items.map(function (i) { return i.word; })) + JSON.stringify([props.origin, props.finish, props.wordBounds]);
    var layout = React.useMemo(function () { return buildRouteLayout(items, size, { wobbleIntensity: props.wobbleIntensity, origin: props.origin, finish: props.finish, wordBounds: props.wordBounds }); },
      [key, size.w, size.h, props.wobbleIntensity]);
    var cityEl = React.useMemo(function () {
      return h(CityMap, { city: buildCity(layout.W, layout.H, layout.mobile ? 22 : 28, layout.keepOut) });
    }, [layout]);
    var idx = Math.min(Math.floor(p), n - 1);
    var t = p - idx;
    var route = layout.routes[idx];
    var f = route ? drawnFraction(t, route.wordEnd) : 0;
    var lineW = props.lineWidth || (layout.mobile ? 3 : 4);
    var doneOp = props.completedOpacity == null ? 0.32 : props.completedOpacity;
    var color = props.routeColor ? { stroke: props.routeColor } : null;
    var mk = layout.mobile ? 6 : 7;

    var layers = [];
    layout.routes.forEach(function (r, i) {
      if (i >= idx) return;
      layers.push(h("path", { key: "done" + i, className: "route route-done", d: r.d, strokeWidth: lineW - 1, style: { opacity: doneOp } }));
    });
    layout.routes.forEach(function (r, i) {
      if (i >= idx) return;
      layers.push(h("circle", { key: "wp" + i, className: "waypoint done", cx: r.dest[0], cy: r.dest[1], r: mk * 0.55, style: { opacity: Math.max(doneOp, 0.6) } }));
    });
    var finished = route && route.last && f >= 1;
    if (route) {
      layers.push(h("path", { key: "active", className: "route route-active", d: route.d, strokeWidth: lineW, pathLength: 1000, strokeDasharray: "1000 1000", strokeDashoffset: 1000 * (1 - f), style: color }));
      var destOp = ramp(t, PHASES.word - 0.04, PHASES.word + 0.02);
      if (destOp > 0 && !route.last) layers.push(h("g", { key: "ad", style: { opacity: destOp } },
        h("circle", { className: "dest-ring", cx: route.dest[0], cy: route.dest[1], r: mk }),
        h("circle", { className: "dest", cx: route.dest[0], cy: route.dest[1], r: mk * 0.42 })));
      if (f > 0 && f < 1) {
        var hp = pointAt(route.pts, route.cum, f * route.total);
        layers.push(h("circle", { key: "head", className: "head", cx: hp[0], cy: hp[1], r: mk * 0.7 }));
      }
    }
    var o = layout.origin, fz = layout.finish;
    var waiting = idx === 0 && f === 0;

    // popups: the current one opens as the route reaches its destination; the previous one closes as the next word starts
    var pops = [], leaders = [];
    if (idx > 0) {
      var prevOpen = 1 - ramp(t, 0, 0.12);
      var pr = layout.routes[idx - 1], ppl = popPlacement(layout, pr.dest, idx - 1);
      leaders.push(leader(pr.dest, ppl, prevOpen, "lp"));
      pops.push(h(StepPopup, { key: "pop" + (idx - 1), item: items[idx - 1], dest: pr.dest, layout: layout, place: ppl, open: prevOpen, hidden: true }));
    }
    if (route) {
      var curOpen = ramp(t, PHASES.dest - 0.08, PHASES.dest);
      var cpl = popPlacement(layout, route.dest, idx);
      leaders.push(leader(route.dest, cpl, curOpen, "lc"));
      pops.push(h(StepPopup, { key: "pop" + idx, item: items[idx], dest: route.dest, layout: layout, place: cpl, open: curOpen, last: idx === n - 1 }));
    }

    return h("section", { ref: rootRef, className: cx("gr-rwm", layout.mobile && "is-mobile", props.className), style: { height: props.height || 540 }, "aria-label": "Route: " + items.map(function (i) { return normalizeWord(i.word); }).join(" · ") },
      h("svg", { className: "gr-rwm-map", width: layout.W, height: layout.H, viewBox: "0 0 " + layout.W + " " + layout.H, "aria-hidden": "true" },
        cityEl,
        leaders,
        layers,
        waiting ? h("circle", { className: "origin-pulse", cx: o[0], cy: o[1], r: mk * 1.1 }) : null,
        h("circle", { className: "origin", cx: o[0], cy: o[1], r: mk * 1.1, style: props.routeColor ? { fill: props.routeColor } : null }),
        h("circle", { className: "origin-core", cx: o[0], cy: o[1], r: mk * 0.42 }),
        finished ? h("g", { key: "fin" },
          h("circle", { className: "origin-pulse", cx: fz[0], cy: fz[1], r: mk * 1.2 }),
          h("circle", { className: "origin", cx: fz[0], cy: fz[1], r: mk * 1.2 }),
          h("circle", { className: "origin-core", cx: fz[0], cy: fz[1], r: mk * 0.45 })) : null),
      h("div", { className: "gr-rwm-pops", "aria-live": "polite" }, pops));
  }

  var api = {
    Button: Button, Tag: Tag, Eyebrow: Eyebrow, ServiceCard: ServiceCard, LocationCard: LocationCard,
    CoachCard: CoachCard, OverlayCard: OverlayCard, RouteMarker: RouteMarker, RouteDivider: RouteDivider,
    RouteWordMap: RouteWordMap, Icon: Icon, iconNames: Object.keys(ICON_SVG).concat(["arrow-forward"]),
    routeAlphabet: ALPHABET, buildWordPoints: buildWordPoints, buildRouteLayout: buildRouteLayout, drawnFraction: drawnFraction, phases: phases, normalizeWord: normalizeWord, buildCity: buildCity
  };
  window.GandomRunners = Object.assign(window.GandomRunners || {}, api);
})();

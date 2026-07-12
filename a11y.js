/* ============================================================
   ברזילי אירועים ונופש — רכיב נגישות
   תקן ישראלי 5568 / WCAG 2.0 AA
   קובץ עצמאי: מזריק סגנונות + כפתור + פאנל לכל עמוד.
   שימוש:  <script src="a11y.js" defer></script>
   ============================================================ */
(function () {
  "use strict";

  /* ---------- שמירת העדפות (נכשל בשקט אם חסום) ---------- */
  var KEY = "brz_a11y";
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  var state = load();
  var FS_STEPS = [92, 100, 110, 120, 135];   // אחוזים
  if (typeof state.fs !== "number") state.fs = 1; // אינדקס 1 = 100%

  /* ---------- סגנונות ---------- */
  var css = `
  /* --- שינוי גודל טקסט (העיצוב בנוי ב-rem) --- */
  html.a11y-fs-0 { font-size: 92%; }
  html.a11y-fs-1 { font-size: 100%; }
  html.a11y-fs-2 { font-size: 110%; }
  html.a11y-fs-3 { font-size: 120%; }
  html.a11y-fs-4 { font-size: 135%; }

  /* --- גווני אפור --- */
  html.a11y-gray body { filter: grayscale(100%); }

  /* --- ניגודיות שלילית --- */
  html.a11y-invert body { filter: invert(100%) hue-rotate(180deg); }
  html.a11y-invert img, html.a11y-invert video { filter: invert(100%) hue-rotate(180deg); }

  /* --- ניגודיות גבוהה --- */
  html.a11y-hc, html.a11y-hc body { background: #000 !important; }
  html.a11y-hc body *:not(img):not(svg):not(path):not(circle) {
    background-color: transparent !important;
    background-image: none !important;
    color: #fff !important;
    border-color: #fff !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
  html.a11y-hc body a, html.a11y-hc body a *,
  html.a11y-hc body button, html.a11y-hc body button * { color: #ffdd00 !important; }
  html.a11y-hc body svg { fill: #ffdd00 !important; stroke: #ffdd00 !important; }
  html.a11y-hc body .khatam { background: #ffdd00 !important; }

  /* --- רקע בהיר --- */
  html.a11y-light, html.a11y-light body { background: #fff !important; }
  html.a11y-light body *:not(img):not(svg):not(path):not(circle) {
    background-color: transparent !important;
    background-image: none !important;
    color: #111 !important;
    border-color: #555 !important;
    text-shadow: none !important;
  }
  html.a11y-light body a, html.a11y-light body a * { color: #00439c !important; }
  html.a11y-light body svg { fill: #00439c !important; stroke: #00439c !important; }
  html.a11y-light body .khatam { background: #00439c !important; }

  /* --- הדגשת קישורים --- */
  html.a11y-links body a, html.a11y-links body button {
    text-decoration: underline !important;
    text-underline-offset: 3px !important;
    outline: 2px dashed currentColor !important;
    outline-offset: 2px !important;
  }

  /* --- גופן קריא --- */
  html.a11y-font body, html.a11y-font body * {
    font-family: Arial, "Segoe UI", Tahoma, sans-serif !important;
    letter-spacing: .02em !important;
  }

  /* --- עצירת אנימציות --- */
  html.a11y-still body *, html.a11y-still body *::before, html.a11y-still body *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }

  /* ============ הרכיב עצמו ============ */
  #a11yBtn {
    position: fixed; bottom: 20px; inset-inline-start: 20px; z-index: 9998;
    width: 56px; height: 56px; border-radius: 50%; cursor: pointer;
    background: #0E3B37; border: 2px solid #E3BC5E;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 20px rgba(0,0,0,.3);
    transition: transform .18s ease, background .18s ease; padding: 0;
  }
  #a11yBtn:hover, #a11yBtn:focus-visible { transform: scale(1.08); background: #15514B; }
  #a11yBtn svg { width: 30px; height: 30px; fill: #E3BC5E; }

  #a11yPanel {
    position: fixed; bottom: 88px; inset-inline-start: 20px; z-index: 9999;
    width: 250px; max-height: 78vh; overflow-y: auto;
    background: #fff; border: 1px solid #d8cfb8; border-radius: 14px;
    box-shadow: 0 14px 44px rgba(0,0,0,.28);
    font-family: Arial, "Segoe UI", Tahoma, sans-serif;
    direction: rtl; text-align: right; padding: 8px;
    display: none;
  }
  #a11yPanel.open { display: block; }
  #a11yPanel h2 {
    font-size: 16px; color: #0E3B37; margin: 8px 10px 10px;
    font-family: inherit; font-weight: bold; padding-bottom: 8px;
    border-bottom: 1px solid #eadfc4;
  }
  #a11yPanel button.a11y-opt {
    display: flex; align-items: center; gap: 10px; width: 100%;
    background: transparent; border: none; border-radius: 8px; cursor: pointer;
    padding: 10px 10px; font-size: 15px; color: #221C15; text-align: right;
    font-family: inherit; min-height: 42px;
  }
  #a11yPanel button.a11y-opt:hover, #a11yPanel button.a11y-opt:focus-visible { background: #F5ECD8; }
  #a11yPanel button.a11y-opt[aria-pressed="true"] { background: #0E3B37; color: #fff; font-weight: bold; }
  #a11yPanel button.a11y-opt .ic { width: 20px; text-align: center; flex: none; font-size: 16px; }
  #a11yPanel .a11y-sep { height: 1px; background: #eadfc4; margin: 8px 6px; }
  #a11yPanel a.a11y-link {
    display: block; padding: 9px 10px; font-size: 14px; color: #0E3B37;
    text-decoration: underline; font-family: inherit;
  }
  #a11yPanel a.a11y-link:hover { background: #F5ECD8; border-radius: 8px; }

  /* הרכיב עצמו חייב להישאר קריא גם במצבי ניגודיות */
  html.a11y-hc #a11yPanel, html.a11y-hc #a11yPanel *,
  html.a11y-light #a11yPanel, html.a11y-light #a11yPanel * {
    background-color: #fff !important; color: #000 !important; border-color: #333 !important;
  }
  html.a11y-hc #a11yPanel button.a11y-opt[aria-pressed="true"],
  html.a11y-light #a11yPanel button.a11y-opt[aria-pressed="true"] {
    background-color: #000 !important; color: #fff !important;
  }
  html.a11y-hc #a11yBtn, html.a11y-light #a11yBtn {
    background-color: #000 !important; border-color: #ffdd00 !important;
  }
  html.a11y-hc #a11yBtn svg, html.a11y-light #a11yBtn svg { fill: #ffdd00 !important; }
  html.a11y-invert #a11yBtn, html.a11y-invert #a11yPanel { filter: invert(100%) hue-rotate(180deg); }
  html.a11y-gray #a11yBtn, html.a11y-gray #a11yPanel { filter: none; }

  /* דילוג לתוכן */
  .a11y-skip {
    position: absolute; inset-inline-start: -9999px; top: 8px; z-index: 10000;
    background: #0E3B37; color: #fff; padding: 12px 20px; border-radius: 8px;
    font-weight: bold; text-decoration: none;
  }
  .a11y-skip:focus { inset-inline-start: 8px; }
  `;

  var st = document.createElement("style");
  st.setAttribute("data-a11y", "");
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- החלת מצב ---------- */
  var TOGGLES = ["gray", "invert", "hc", "light", "links", "font", "still"];

  function apply() {
    var h = document.documentElement;
    for (var i = 0; i < FS_STEPS.length; i++) h.classList.remove("a11y-fs-" + i);
    h.classList.add("a11y-fs-" + state.fs);
    TOGGLES.forEach(function (t) { h.classList.toggle("a11y-" + t, !!state[t]); });

    // אנימציות: דגל גלובלי שקוד האתר יכול לקרוא (עצירת הקרוסלה)
    window.__a11yStill = !!state.still;
    try { window.dispatchEvent(new Event("a11y:change")); } catch (e) {}

    document.querySelectorAll("#a11yPanel button.a11y-opt[data-t]").forEach(function (b) {
      b.setAttribute("aria-pressed", state[b.dataset.t] ? "true" : "false");
    });
    save(state);
  }

  function toggle(name) {
    // ניגודיות גבוהה / שלילית / אפור / רקע בהיר — לא משתלבים זה בזה
    var EXCL = ["gray", "invert", "hc", "light"];
    if (EXCL.indexOf(name) > -1 && !state[name]) EXCL.forEach(function (e) { state[e] = false; });
    state[name] = !state[name];
    apply();
  }
  function fs(dir) {
    state.fs = Math.min(FS_STEPS.length - 1, Math.max(0, state.fs + dir));
    apply();
  }
  function reset() { state = { fs: 1 }; apply(); }

  /* ---------- בניית הרכיב ---------- */
  function build() {
    // דילוג לתוכן
    var main = document.getElementById("main") || document.querySelector("main");
    if (main) {
      var skip = document.createElement("a");
      skip.className = "a11y-skip";
      skip.href = "#main";
      skip.textContent = "דילוג לתוכן הראשי";
      skip.setAttribute("data-a11y", "");
      document.body.insertBefore(skip, document.body.firstChild);
    }

    var btn = document.createElement("button");
    btn.id = "a11yBtn";
    btn.setAttribute("data-a11y", "");
    btn.setAttribute("aria-label", "פתיחת תפריט נגישות");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "a11yPanel");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4" r="2"/>' +
      '<path d="M20.5 7.3c-2.6.9-5.4 1.4-8.5 1.4S6.1 8.2 3.5 7.3a1 1 0 1 0-.6 1.9c1.9.6 3.9 1.1 6.1 1.3v2.1L6.6 20a1 1 0 1 0 1.9.7L11 14.3h2l2.5 6.4a1 1 0 1 0 1.9-.7L15 12.6v-2.1c2.2-.2 4.2-.7 6.1-1.3a1 1 0 1 0-.6-1.9Z"/></svg>';

    var panel = document.createElement("div");
    panel.id = "a11yPanel";
    panel.setAttribute("data-a11y", "");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "כלי נגישות");

    var OPTS = [
      { ic: "A+", label: "הגדל טקסט", act: function () { fs(1); } },
      { ic: "A-", label: "הקטן טקסט", act: function () { fs(-1); } },
      { t: "hc",     ic: "◐", label: "ניגודיות גבוהה" },
      { t: "invert", ic: "◑", label: "ניגודיות שלילית" },
      { t: "gray",   ic: "▦", label: "גווני אפור" },
      { t: "light",  ic: "☀", label: "רקע בהיר" },
      { t: "links",  ic: "🔗", label: "הדגשת קישורים" },
      { t: "font",   ic: "𝐀", label: "גופן קריא" },
      { t: "still",  ic: "⏸", label: "עצירת אנימציות" }
    ];

    var html = '<h2>כלי נגישות</h2>';
    OPTS.forEach(function (o, i) {
      html += '<button type="button" class="a11y-opt" data-i="' + i + '"' +
        (o.t ? ' data-t="' + o.t + '" aria-pressed="false"' : "") + '>' +
        '<span class="ic" aria-hidden="true">' + o.ic + "</span>" + o.label + "</button>";
    });
    html += '<div class="a11y-sep"></div>';
    html += '<button type="button" class="a11y-opt" data-reset="1"><span class="ic" aria-hidden="true">↺</span>איפוס הגדרות</button>';
    html += '<div class="a11y-sep"></div>';
    html += '<a class="a11y-link" href="accessibility.html">הצהרת נגישות מלאה</a>';
    html += '<a class="a11y-link" href="tel:+97235590765">נתקלתם בבעיה? התקשרו: 03-559-0765</a>';
    panel.innerHTML = html;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    panel.querySelectorAll("button.a11y-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.reset) return reset();
        var o = OPTS[+b.dataset.i];
        if (o.t) toggle(o.t); else o.act();
      });
    });

    function open(v) {
      panel.classList.toggle("open", v);
      btn.setAttribute("aria-expanded", v ? "true" : "false");
      btn.setAttribute("aria-label", v ? "סגירת תפריט נגישות" : "פתיחת תפריט נגישות");
      if (v) { var f = panel.querySelector("button"); if (f) f.focus(); }
    }
    btn.addEventListener("click", function () { open(!panel.classList.contains("open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) { open(false); btn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (panel.classList.contains("open") && !panel.contains(e.target) && !btn.contains(e.target)) open(false);
    });

    apply();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();

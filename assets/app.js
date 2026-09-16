// TDS Field Guide: the few interactive bits. No framework, no tracking.
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // localStorage can be missing or throw (private mode, blocked storage). Everything must work without it.
  var store = {
    get: function (k, fallback) {
      try { var v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ---------- theme ---------- */

  var themeBtn = $("#theme"), themeLbl = $("#themeLbl");
  function currentTheme() { return document.documentElement.getAttribute("data-theme") || "auto"; }
  function paintThemeLabel() {
    var t = currentTheme();
    themeLbl.textContent = t === "auto" ? "Auto" : t === "light" ? "Light" : "Dark";
    themeBtn.setAttribute("aria-label", "Colour theme: " + themeLbl.textContent + ". Click to change.");
  }
  themeBtn.addEventListener("click", function () {
    var next = { auto: "light", light: "dark", dark: "auto" }[currentTheme()];
    if (next === "auto") {
      document.documentElement.removeAttribute("data-theme");
      try { localStorage.removeItem("tfg-theme"); } catch (e) {}
    } else {
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("tfg-theme", next); } catch (e) {}
    }
    paintThemeLabel();
  });
  paintThemeLabel();

  /* ---------- the term, drawn to scale ---------- */

  var DAY = 86400000;
  function d(s) { return Date.UTC(2026, +s.slice(0, 2) - 1, +s.slice(3, 5)); }
  var START = d("05-10"), END = d("09-17"), SPAN = END - START;
  function pct(t) { return ((t - START) / SPAN * 100).toFixed(3) + "%"; }

  // May 2026 dates, from tds.s-anand.net. End dates are inclusive.
  var ROWS = [
    { k: "GA0", href: "#ga0", type: "ga", from: "05-13", to: "06-21", label: "13 May – 21 Jun" },
    { k: "GA1", href: "#ga", type: "ga", from: "06-17", to: "06-28", label: "17 – 28 Jun" },
    { k: "GA2", href: "#ga", type: "ga", from: "06-28", to: "07-08", label: "28 Jun – 8 Jul" },
    { k: "P1", href: "#projects", type: "p", from: "07-05", to: "07-30", label: "5 – 30 Jul" },
    { k: "GA3", href: "#ga", type: "ga", from: "07-05", to: "07-22", label: "5 – 22 Jul" },
    { k: "GA4", href: "#ga", type: "ga", from: "07-08", to: "07-22", label: "8 – 22 Jul" },
    { k: "GA5", href: "#ga", type: "ga", from: "07-17", to: "08-10", label: "17 Jul – 10 Aug" },
    { k: "GA6", href: "#ga", type: "ga", from: "07-27", to: "08-09", label: "27 Jul – 9 Aug" },
    { k: "ROE", href: "#roe", type: "roe", from: "08-02", label: "Sun 2 Aug, 1:00 PM" },
    { k: "GA7", href: "#ga", type: "ga", from: "08-09", to: "08-21", label: "9 – 21 Aug" },
    { k: "P2", href: "#projects", type: "p", from: "08-17", to: "09-05", label: "17 Aug – 5 Sep" },
    { k: "GA8", href: "#ga", type: "ga", from: "08-18", to: "08-28", label: "18 – 28 Aug" },
    { k: "ET", href: "#et", type: "et", from: "09-13", label: "Sun 13 Sep" }
  ];
  var MONTHS = [["May", "05-10"], ["June", "06-01"], ["July", "07-01"], ["August", "08-01"], ["September", "09-01"]];
  var CRUNCH = ["07-17", "07-22"];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var gantt = $("#gantt");
  if (gantt) {
    var months = el("div", "gantt__months");
    MONTHS.forEach(function (m) {
      var t = el("span", "gantt__month", m[0]);
      t.style.left = pct(d(m[1]));
      if (m[1] === "05-10") t.style.borderLeft = "0";
      months.appendChild(t);
    });
    gantt.appendChild(months);

    var rows = el("div", "gantt__rows");
    MONTHS.slice(1).forEach(function (m) {
      var v = el("span", "gantt__vline");
      v.style.left = pct(d(m[1]));
      rows.appendChild(v);
    });
    var crunch = el("span", "gantt__crunch");
    crunch.style.left = pct(d(CRUNCH[0]));
    crunch.style.width = ((d(CRUNCH[1]) + DAY - d(CRUNCH[0])) / SPAN * 100).toFixed(3) + "%";
    crunch.title = "17–22 July: P1, GA3, GA4 and GA5 all open";
    rows.appendChild(crunch);

    ROWS.forEach(function (r) {
      var row = el("div", "gantt__row");
      var lab = el("span", "gantt__label");
      var a = el("a", null, r.k);
      a.href = r.href;
      lab.appendChild(a);
      row.appendChild(lab);

      var from = d(r.from), to = r.to ? d(r.to) + DAY : from;
      var dates = el("span", "gantt__dates", r.label);
      if (r.to) {
        var bar = el("span", "gantt__bar gantt__bar--" + r.type);
        bar.style.left = pct(from);
        bar.style.width = ((to - from) / SPAN * 100).toFixed(3) + "%";
        row.appendChild(bar);
      } else {
        var dot = el("span", "gantt__dot" + (r.type === "et" ? " gantt__dot--et" : ""));
        dot.style.left = pct(from + DAY / 2);
        row.appendChild(dot);
        to = from + DAY / 2 + DAY * 1.2;
      }
      // Late items put their dates on the left so nothing runs off the chart.
      if (from > d("08-14")) {
        dates.style.right = "calc(" + (100 - parseFloat(pct(from))) + "% + " + (r.to ? 4 : 12) + "px)";
        dates.style.textAlign = "right";
      } else {
        dates.style.left = pct(to);
      }
      row.appendChild(dates);
      rows.appendChild(row);
    });
    gantt.appendChild(rows);
  }

  /* ---------- chapter index: highlight where the reader is ---------- */

  var tocLinks = $$("#toc a");
  if ("IntersectionObserver" in window && tocLinks.length) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        tocLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var a = byId[e.target.id];
        if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    $$(".chapter").forEach(function (s) { io.observe(s); });
  }

  // Close the mobile chapter list after picking a chapter.
  var tocM = $(".toc-m");
  if (tocM) $$("a", tocM).forEach(function (a) { a.addEventListener("click", function () { tocM.open = false; }); });

  /* ---------- readiness checklist ---------- */

  var ready = $("#readiness");
  if (ready) {
    var boxes = $$("input[type=checkbox]", ready);
    var saved = store.get("tfg-ready", []);
    boxes.forEach(function (b) { b.checked = saved.indexOf(b.value) !== -1; });
    var paintReady = function () {
      var on = boxes.filter(function (b) { return b.checked; });
      var n = on.length, total = boxes.length;
      $("#readyCount").textContent = n + " of " + total;
      $("#readyBar").style.width = (n / total * 100) + "%";
      var msg;
      if (n === 0) msg = "Tick the boxes above.";
      else if (n <= 4) msg = "Honest answer: take TDS in a later term. Spend this one on Python, the terminal and Git, then come back.";
      else if (n <= 7) msg = "Borderline. Do all five bootcamp days properly and take GA0 seriously. Your GA0 score decides.";
      else if (n < total) msg = "Good shape. Fill the gaps during the bootcamp and do GA0 early to confirm.";
      else msg = "You're ready. Do GA0 anyway, then help a friend through the bootcamp.";
      $("#readyVerdict").textContent = msg;
      store.set("tfg-ready", on.map(function (b) { return b.value; }));
    };
    boxes.forEach(function (b) { b.addEventListener("change", paintReady); });
    paintReady();
  }

  /* ---------- marks: eligibility + calculator share one state ---------- */

  var marks = store.get("tfg-marks", {});
  function num(v) {
    if (v === "" || v == null) return null;
    var n = parseFloat(String(v).replace(",", "."));
    if (!isFinite(n)) return null;
    return Math.max(0, Math.min(100, n));
  }
  function fmt(n) { return (Math.round(n * 10) / 10).toString(); }
  function stamp(kind, text) {
    return '<span class="stamp stamp--' + kind + '">' + text + "</span>";
  }
  function grade(t) {
    return t >= 90 ? "S" : t >= 80 ? "A" : t >= 70 ? "B" : t >= 60 ? "C" : t >= 50 ? "D" : t >= 40 ? "E" : "U";
  }

  // Average of the best 4 of GA0..GA4. Needs at least 4 scores.
  function eligibility() {
    var got = [];
    for (var i = 0; i < 5; i++) { var v = num(marks["ga" + i]); if (v !== null) got.push(v); }
    if (got.length < 4) return { ready: false, count: got.length };
    got.sort(function (a, b) { return b - a; });
    var avg = (got[0] + got[1] + got[2] + got[3]) / 4;
    return { ready: true, avg: avg, ok: avg >= 40, count: got.length };
  }

  function eligHtml(e) {
    if (!e.ready) return stamp("wait", "Need " + (4 - e.count) + " more");
    return stamp(e.ok ? "ok" : "no", e.ok ? "Eligible" : "Not eligible") +
      '<small>Best 4 of first 5 average: ' + fmt(e.avg) + (e.ok ? "" : ". You need 40.") + "</small>";
  }

  var inputs = $$("[data-ga],[data-elig],[data-part]");
  function keyOf(inp) {
    if (inp.hasAttribute("data-ga")) return "ga" + inp.getAttribute("data-ga");
    if (inp.hasAttribute("data-elig")) return "ga" + inp.getAttribute("data-elig");
    return inp.getAttribute("data-part");
  }

  function paintMarks(source) {
    inputs.forEach(function (inp) {
      if (inp === source) return;
      var v = marks[keyOf(inp)];
      inp.value = v == null ? "" : v;
    });

    var e = eligibility();
    var eligOut = $("#eligOut");
    if (eligOut) eligOut.innerHTML = eligHtml(e);

    var gas = [], entered = 0;
    for (var i = 0; i < 9; i++) {
      var v = num(marks["ga" + i]);
      if (v !== null) entered++;
      gas.push(v === null ? 0 : v);
    }
    gas.sort(function (a, b) { return b - a; });
    var gaa = gas.slice(0, 7).reduce(function (s, x) { return s + x; }, 0) / 7;

    var oGa = $("#oGa"), oT = $("#oT"), oElig = $("#oElig"), oNeed = $("#oNeed");
    if (!oGa) return;

    if (entered === 0) oGa.innerHTML = "&ndash;<small>Enter GA scores</small>";
    else oGa.innerHTML = fmt(gaa) + "<small>" + entered + " of 9 entered" + (entered < 7 ? ". Missing ones count as 0." : ".") + "</small>";

    var parts = ["roe", "p1", "p2", "et"].map(function (k) { return num(marks[k]); });
    var anything = entered > 0 || parts.some(function (p) { return p !== null; });
    var sumOthers = parts.slice(0, 3).reduce(function (s, x) { return s + (x || 0); }, 0);
    var et = parts[3];
    var t = 0.2 * (gaa + sumOthers + (et || 0));

    if (!anything) oT.innerHTML = "&ndash;<small>Empty boxes count as 0</small>";
    else oT.innerHTML = fmt(t) + "<small>Grade band: " + grade(t) + (et === null ? " (end term not entered)" : "") + "</small>";

    oElig.innerHTML = eligHtml(e);

    var need = "";
    if (anything && et === null) {
      var req = (40 - 0.2 * (gaa + sumOthers)) / 0.2;
      if (req <= 0) need = "On these numbers you're past 40 before the end term. You still have to attend it to get a grade.";
      else if (req > 100) need = "On these numbers, even 100 in the end term won't reach 40. Check your inputs, and talk to your instructors early.";
      else need = "To reach a total of 40, you'd need about " + Math.ceil(req) + " in the end term.";
    }
    oNeed.textContent = need;
  }

  inputs.forEach(function (inp) {
    inp.addEventListener("input", function () {
      var k = keyOf(inp), v = num(inp.value);
      if (v === null) delete marks[k]; else marks[k] = inp.value.trim();
      store.set("tfg-marks", marks);
      paintMarks(inp);
    });
    inp.addEventListener("blur", function () {
      var v = num(inp.value);
      if (inp.value.trim() !== "" && v === null) inp.value = "";
      else if (v !== null && String(v) !== inp.value.trim()) { inp.value = String(v); marks[keyOf(inp)] = String(v); store.set("tfg-marks", marks); }
    });
  });
  var clear = $("#calcClear");
  if (clear) clear.addEventListener("click", function () {
    marks = {};
    store.del("tfg-marks");
    paintMarks(null);
  });
  paintMarks(null);

  /* ---------- doubts: search + filter ---------- */

  var faq = $("#faq");
  if (faq) {
    var items = $$("details", faq);
    var search = $("#faqSearch"), chips = $$(".chip"), count = $("#faqCount"), empty = $("#faqEmpty");
    var cat = "all";
    var texts = items.map(function (it) { return it.textContent.toLowerCase(); });

    var paintFaq = function () {
      var words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
      var shown = 0;
      items.forEach(function (it, i) {
        var okCat = cat === "all" || it.getAttribute("data-cat") === cat;
        var okText = words.every(function (w) { return texts[i].indexOf(w) !== -1; });
        var show = okCat && okText;
        it.hidden = !show;
        if (show) shown++;
      });
      count.textContent = shown === items.length ? items.length + " doubts" : "Showing " + shown + " of " + items.length;
      empty.hidden = shown !== 0;
    };
    search.addEventListener("input", paintFaq);
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        cat = c.getAttribute("data-cat");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        paintFaq();
      });
    });
    paintFaq();
  }
})();

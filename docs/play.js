// 画面の写しを、押したところに合わせて切り替えるだけのプログラム（計算はしない・通信しない）
(function () {
  var KEY = "taiken", D = window.DATA, F, T = "close", P = "";
  var blank = { i: "", r: "", c: "", x: 0, w: 0, a: 0, v: "" };
  function load() { try { F = Object.assign({}, blank, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { F = Object.assign({}, blank); } }
  function keep() { try { localStorage.setItem(KEY, JSON.stringify(F)); } catch (e) {} }
  function add(s, c) { return s.indexOf(c) < 0 ? (s + c).split("").sort().join("") : s; }
  function open(n) { return D.c[n].replace(/<!--#(\d+)-->/g, function (_, k) { return open(+k); }); }
  function put(id, n) { var el = document.getElementById(id); if (el) el.innerHTML = n == null ? "" : open(n); }
  function toast(t) { var el = document.getElementById("toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove("on"); }, 2600); }
  function base() { return "c" + F.i + "-" + F.r + "-" + F.c + "-" + F.x; }
  function phase() { return F.x ? "x" + F.c : "o"; }
  function draw() {
    if (document.body.dataset.page === "driver") { put("app", D.s["d" + F.w + F.a][0]); put("who", D.s.who[0]); return; }
    var s = D.s[T === "m8" ? "m8" : base()];
    ["hd", "rail", "tabs", "app"].forEach(function (id, k) { put(id, s[k]); });
    if (T !== "close" && T !== "m8") {
      put("app", (D.s["t" + T + "-" + (T === "adv" ? F.v : phase()) + (T === "pl" ? P : "")] || D.s["t" + T + "-" + phase()])[0]);
      document.querySelectorAll("#tabs [data-a]").forEach(function (b) { b.classList.toggle("on", b.dataset.a === "t:" + T); });
    }
    var bd = document.querySelector('#tabs [data-a="t:adv"] .badge');
    if (bd) { var n = 2 - F.v.length; if (n) bd.textContent = n; else bd.remove(); }
  }
  function go(t) { T = t; P = ""; draw(); scrollTo(0, 0); }
  function act(a, el) {
    var k = a.split(":"), y = scrollY, ok = function (m) { keep(); draw(); scrollTo(0, y); if (m) toast(m); };
    if (k[0] === "t") return go(k[1]);
    if (k[0] === "m") return go("m8");
    if (k[0] === "p") { P = k[1]; draw(); scrollTo(0, y); return; }
    if (k[0] === "o") { var r = document.querySelector('[data-b="' + k[1] + '"]'); if (r) { r.hidden = !r.hidden; el.textContent = r.hidden ? "▸" : "▾"; } return; }
    if (k[0] === "s") { var d = document.querySelector('[data-d="' + k[1] + '"]'); if (d) { d.open = true; d.scrollIntoView({ behavior: "smooth", block: "center" }); } return; }
    if (k[0] === "z") { if (confirm("最初の状態に戻します")) { F = Object.assign({}, blank); keep(); go("close"); toast("最初に戻しました"); } return; }
    if (k[0] === "i") { el.disabled = true; el.textContent = "読み取り中…"; setTimeout(function () { F.i = add(F.i, k[1]); ok("明細を取り込みました"); }, 1100); return; }
    if (k[0] === "r") { if (F.i.length < 4) return toast("先に4社の明細を入れてください"); F.r = add(F.r, k[1]); return ok(); }
    if (k[0] === "c") { if (F.i.length < 4) return toast("先に4社の明細を入れてください"); F.c = k[1]; return ok(k[1] === "b" ? "請求書にしました" : "翌月に繰り越しました"); }
    if (k[0] === "x") { if (confirm("9月分の報酬を確定します。よろしいですか")) { F.x = 1; F.r = "01234"; ok("9月分を確定しました"); } return; }
    if (k[0] === "v") { F.v = add(F.v, k[1]); return ok("「振込待ち」にしました"); }
    if (k[0] === "l") { document.querySelectorAll("#app a[href^='slips/']").forEach(function (x) { window.open(x.getAttribute("href"), "_blank"); }); return; }
    if (k[0] === "w") { F.w = +k[1]; return ok(k[1] === "1" ? "稼働を始めました。気をつけて" : "おつかれさまでした"); }
    if (k[0] === "a") { if (confirm("今月の前払いを申し込みますか")) { F.a = 1; ok("前払いを申し込みました"); } return; }
    toast("この体験版では動かない操作です");
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-a]");
    if (el && el.tagName !== "SELECT") { e.preventDefault(); act(el.dataset.a, el); }
  });
  document.addEventListener("change", function (e) { if (e.target.dataset.a === "h") { e.target.value === "8" ? go("m8") : go("close"); } });
  addEventListener("storage", function () { load(); draw(); });
  load(); draw();
})();

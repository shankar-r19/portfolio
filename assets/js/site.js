// Swap the thumbnail for the YouTube player on click. YouTube rejects embeds
// without a referrer (error 153), so pages opened from disk just follow the link.
if (location.protocol.startsWith('http')) {
  document.querySelectorAll('[data-youtube]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + el.dataset.youtube + '?autoplay=1';
      frame.title = el.getAttribute('aria-label');
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allowFullscreen = true;
      var box = document.createElement('div');
      box.className = 'video-embed';
      box.appendChild(frame);
      el.replaceWith(box);
    });
  });
}

// A single wave line that draws across the menu bar, then keeps gently waving.
// Each page sets its colour with data-line-color on the header.
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var cv = document.createElement('canvas');
  cv.className = 'header-line';
  cv.setAttribute('aria-hidden', 'true');
  header.prepend(cv);
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1;
  var COLOUR = header.dataset.lineColor || '#1f6fe0', DRAW_IN = 1.8;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
  }
  var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

  function render(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var head = W * ease(Math.min(1, t / DRAW_IN));
    var amp = H * .22, k = 2 * Math.PI * 1.3 / Math.max(W, 1);
    ctx.strokeStyle = COLOUR; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (var x = 0; x <= head; x += 3) {
      var y = H / 2 + amp * Math.sin(x * k + 1.2 + t * .5) + amp * .08 * Math.sin(x * k * 2.1 - t * .4);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  resize();
  if (still) {
    render(DRAW_IN);
    window.addEventListener('resize', function () { resize(); render(DRAW_IN); });
    return;
  }
  window.addEventListener('resize', resize);
  var start = performance.now();
  (function frame(now) {
    render((now - start) / 1000);
    requestAnimationFrame(frame);
  })(start);
})();

// Faint vertical lines in the right-hand margin that drift with parallax while scrolling,
// then braid together by the end of the page. Hidden when there is no margin beside the content.
(function () {
  var COLOURS = ['#1f6fe0', '#e23a3a', '#e9b000', '#2e9e4f'];
  var cv = document.createElement('canvas');
  cv.className = 'bg-lines';
  cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = null, raf = 0;

  var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var clamp = function (x) { return Math.max(0, Math.min(1, x)); };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
  }

  function target() {
    var max = document.documentElement.scrollHeight - H;
    return { y: window.scrollY, p: max > 0 ? clamp(window.scrollY / max) : 0 };
  }

  function render(sy, p) {
    var n = COLOURS.length, e = ease(clamp((p - .35) / .65));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // the strip between the content column (980px, centred) and the window edge
    var margin = (W - 980) / 2;
    if (margin < 70) return;
    var x0 = W - margin + 16, x1 = W - 12, sw = x1 - x0, cx = (x0 + x1) / 2;
    var A = Math.min(sw * .3, 40), kb = 2 * Math.PI / 220, ks = 2 * Math.PI / Math.max(H, 600);
    var segs = [];
    for (var i = 0; i < n; i++) {
      var base = x0 + sw * (.1 + .8 * i / (n - 1));
      var rate = .0011 * (1 + i * .45);
      var off = 2 * Math.PI * i / n, pts = [];
      for (var y = -10; y <= H + 10; y += 6) {
        var spread = base + sw * .1 * Math.sin(y * ks * 1.4 + i * 1.7 - sy * rate) + sw * .06 * Math.sin(sy * .0008 * (i + 1));
        var braid = cx + A * Math.sin(y * kb + off - sy * .002);
        pts.push([spread + (braid - spread) * e, y, Math.cos(y * kb + off - sy * .002)]);
      }
      // short segments so crossings can be layered over / under
      for (var j = 0; j < pts.length - 1; j += 3) {
        var seg = pts.slice(j, j + 4);
        segs.push({ z: seg[1][2] * e + i * .001, pts: seg, c: COLOURS[i] });
      }
    }
    segs.sort(function (a, b) { return a.z - b.z; });
    ctx.lineJoin = 'round';
    segs.forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(s.pts[0][0], s.pts[0][1]);
      for (var k = 1; k < s.pts.length; k++) ctx.lineTo(s.pts[k][0], s.pts[k][1]);
      if (e > 0) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.lineCap = 'butt'; ctx.stroke(); }
      ctx.strokeStyle = s.c; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
    });
  }

  // ease toward the scroll position so the motion glides
  function frame() {
    var t = target();
    if (!cur || still) cur = t;
    else { cur.y += (t.y - cur.y) * .12; cur.p += (t.p - cur.p) * .12; }
    render(cur.y, cur.p);
    raf = (Math.abs(t.y - cur.y) > .5 || Math.abs(t.p - cur.p) > .0005) ? requestAnimationFrame(frame) : 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  resize();
  window.addEventListener('resize', function () { resize(); cur = null; kick(); });
  window.addEventListener('scroll', kick, { passive: true });
  kick();
})();

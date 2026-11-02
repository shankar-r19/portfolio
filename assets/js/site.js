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

// A single blue wave line that draws across the menu bar, then keeps gently waving.
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var cv = document.createElement('canvas');
  cv.className = 'header-line';
  cv.setAttribute('aria-hidden', 'true');
  header.prepend(cv);
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1;
  var BLUE = '#1f6fe0', DRAW_IN = 1.8;
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
    ctx.strokeStyle = BLUE; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
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

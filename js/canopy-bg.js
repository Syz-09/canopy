// Simple full-screen animated background for CANOPY homepage
(function () {
  var canvas = document.getElementById("canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var dpr = window.devicePixelRatio || 1;
  var width = 0;
  var height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  var blobs = [];
  var colors = ["#4caf50", "#2d5a3d", "#60aed5", "#ff8a65"];
  var NUM_BLOBS = 6;

  function initBlobs() {
    blobs = [];
    for (var i = 0; i < NUM_BLOBS; i++) {
      blobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 200 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: colors[i % colors.length],
      });
    }
  }

  initBlobs();

  function step() {
    ctx.clearRect(0, 0, width, height);
    // 深色基底
    ctx.fillStyle = "#02030a";
    ctx.fillRect(0, 0, width, height);

    blobs.forEach(function (b) {
      // 运动
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.r) b.x = width + b.r;
      if (b.x > width + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = height + b.r;
      if (b.y > height + b.r) b.y = -b.r;

      var grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, hexToRgba(b.color, 0.9));
      grad.addColorStop(1, hexToRgba(b.color, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  function hexToRgba(hex, alpha) {
    var h = hex.replace("#", "");
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + (alpha || 1) + ")";
  }

  step();
})();


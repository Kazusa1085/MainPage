// Canvas-based animated background: flowing nebula + soft aurora bands.
// Theme-aware: reads the current data-theme and uses different palettes.
// Reduced motion renders a static frame only.

const PALETTES = {
  dark: {
    nebula1: [108, 92, 231],
    nebula2: [196, 167, 231],
    nebula3: [0, 255, 159],
    aurora1: [196, 167, 231],
    aurora2: [0, 255, 159],
    star: [224, 222, 244],
    nebulaAlpha: 0.1,
    auroraAlpha: 0.08,
    starAlpha: 0.4,
  },
  light: {
    nebula1: [136, 192, 208],
    nebula2: [94, 129, 172],
    nebula3: [216, 222, 233],
    aurora1: [136, 192, 208],
    aurora2: [94, 129, 172],
    star: [76, 86, 106],
    nebulaAlpha: 0.08,
    auroraAlpha: 0.06,
    starAlpha: 0.24,
  },
};

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class BackgroundCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.time = 0;
    this.lastTime = 0;
    this.particles = [];
    this.raf = null;
    this.reduced = prefersReducedMotion();

    this.resize();
    this.createParticles();
    if (this.reduced) {
      this.render();
    }
  }

  get mode() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  get palette() {
    return PALETTES[this.mode];
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.createParticles();
  }

  createParticles() {
    const count = this.reduced ? 18 : 48;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.35 + Math.random() * 0.65,
      r: 0.5 + Math.random() * 1.4,
      speed: 0.004 + Math.random() * 0.012,
      phase: Math.random() * Math.PI * 2,
      twinkle: 1 + Math.random() * 2,
    }));
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      if (this.reduced) this.render();
    });
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / this.width) * 2 - 1;
      this.mouseY = (e.clientY / this.height) * 2 - 1;
    });
    document.addEventListener('themechange', () => {
      if (this.reduced) this.render();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else this.start();
    });
  }

  start() {
    if (this.reduced || this.raf) return;
    this.lastTime = performance.now();
    this.raf = requestAnimationFrame((t) => this.loop(t));
  }

  stop() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }

  loop(t) {
    const dt = Math.min(0.05, (t - this.lastTime) / 1000);
    this.lastTime = t;
    this.time += dt;
    this.currentX += (this.mouseX - this.currentX) * 0.045;
    this.currentY += (this.mouseY - this.currentY) * 0.045;
    this.render();
    this.raf = requestAnimationFrame((next) => this.loop(next));
  }

  render() {
    const ctx = this.ctx;
    const { width: w, height: h } = this;
    const palette = this.palette;
    const reduced = this.reduced;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    // 在深色下让光带更亮，浅色下保持克制。
    ctx.globalCompositeOperation = this.mode === 'dark' ? 'lighter' : 'source-over';
    ctx.globalAlpha = 1;

    this.renderNebula(ctx, w, h, palette, reduced);
    this.renderAurora(ctx, w, h, palette, reduced);
    this.renderStars(ctx, w, h, palette, reduced);

    ctx.restore();
  }

  renderNebula(ctx, w, h, palette, reduced) {
    const colors = [palette.nebula1, palette.nebula2, palette.nebula3];
    const positions = [
      { x: 0.2, y: 0.28, r: 0.5, drift: 0.0 },
      { x: 0.82, y: 0.22, r: 0.52, drift: 1.4 },
      { x: 0.5, y: 0.72, r: 0.58, drift: 2.2 },
    ];

    for (let i = 0; i < positions.length; i++) {
      const cfg = positions[i];
      const drift = reduced ? 0 : Math.sin(this.time * 0.04 + cfg.drift);
      const cx = cfg.x * w + drift * w * 0.06 + this.currentX * -24;
      const cy = cfg.y * h - drift * h * 0.04 + this.currentY * -18;
      const radius = Math.max(1, cfg.r * Math.max(w, h));
      const color = colors[i];
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${palette.nebulaAlpha})`);
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  }

  renderAurora(ctx, w, h, palette, reduced) {
    const bands = [
      { color: palette.aurora1, phase: 0, width: 0.32, height: 0.34 },
      { color: palette.aurora2, phase: 2.1, width: 0.45, height: 0.18 },
    ];

    for (const band of bands) {
      const middleY = h * (band.height + Math.sin(this.time * 0.08 + band.phase) * 0.035 + this.currentY * 0.026);
      const c1y = middleY - h * 0.22 + Math.sin(this.time * 0.12 + band.phase) * h * 0.05;
      const c2y = middleY + h * 0.18 + Math.cos(this.time * 0.1 + band.phase) * h * 0.055;
      const startX = -w * 0.25;
      const endX = w * 1.25;

      ctx.beginPath();
      ctx.moveTo(startX, middleY + Math.sin(this.time * 0.07 + band.phase) * h * 0.02);
      ctx.bezierCurveTo(
        w * 0.25 + Math.cos(this.time * 0.07 + band.phase) * w * 0.08,
        c1y,
        w * 0.75 + Math.sin(this.time * 0.09 + band.phase) * w * 0.08,
        c2y,
        endX,
        middleY + Math.cos(this.time * 0.1 + band.phase) * h * 0.02,
      );

      const baseAlpha = palette.auroraAlpha;
      ctx.strokeStyle = `rgba(${band.color[0]}, ${band.color[1]}, ${band.color[2]}, ${baseAlpha})`;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(30, band.width * w);
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.lineWidth = Math.max(14, band.width * w * 0.55);
      ctx.globalAlpha = 0.75;
      ctx.stroke();
      ctx.lineWidth = Math.max(5, band.width * w * 0.22);
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  renderStars(ctx, w, h, palette, reduced) {
    if (reduced) return;
    for (const p of this.particles) {
      p.y -= p.speed;
      if (p.y < -0.05) p.y = 1.05;

      const px = p.x * w + this.currentX * 22 * p.z;
      const py = p.y * h + this.currentY * 18 * p.z;
      const size = p.r * (0.5 + p.z * 0.8);
      const alpha = palette.starAlpha * (0.45 + 0.55 * Math.sin(this.time * p.twinkle + p.phase));
      ctx.globalAlpha = Math.max(0.05, alpha);
      ctx.fillStyle = `rgba(${palette.star[0]}, ${palette.star[1]}, ${palette.star[2]}, 1)`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export function initBackground() {
  if (document.querySelector('.background-canvas')) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'background-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);

  const bg = new BackgroundCanvas(canvas);
  bg.bindEvents();
  bg.start();
  return bg;
}

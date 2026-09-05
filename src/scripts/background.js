// Canvas-based animated background: deep, mostly calm black nebula flow.
// A bright light band only sweeps across occasionally, like a passing comet.
// The design keeps a layered/volumetric feel through multiple soft nebula clouds
// and sparse star particles, rather than a constant loud decorative layer.

const PALETTES = {
  dark: {
    nebula: [120, 80, 220],
    nebula2: [196, 167, 231],
    accent: [0, 255, 159],
    star: [255, 255, 255],
    nebulaAlpha: 0.08,
    beamAlpha: 0.2,
    starAlpha: 0.4,
    stars: 38,
  },
  light: {
    nebula: [136, 192, 208],
    nebula2: [94, 129, 172],
    accent: [136, 192, 208],
    star: [76, 86, 106],
    nebulaAlpha: 0.05,
    beamAlpha: 0.08,
    starAlpha: 0.18,
    stars: 24,
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
    const count = this.reduced ? 14 : this.palette.stars;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.35 + Math.random() * 0.65,
      r: 0.4 + Math.random() * 1.1,
      speed: 0.003 + Math.random() * 0.008,
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
      this.createParticles();
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
    const isDark = this.mode === 'dark';
    const reduced = this.reduced;

    ctx.clearRect(0, 0, w, h);

    if (isDark) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
    }

    ctx.save();
    ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over';

    this.renderNebula(ctx, w, h, palette, reduced);
    this.renderSweep(ctx, w, h, palette, reduced);
    this.renderStars(ctx, w, h, palette, reduced);

    ctx.restore();
  }

  renderNebula(ctx, w, h, palette, reduced) {
    const maxR = Math.max(w, h);
    const clouds = [
      { x: 0.3, y: 0.32, r: 0.42, color: palette.nebula, alpha: palette.nebulaAlpha, drift: 0.0 },
      { x: 0.7, y: 0.58, r: 0.46, color: palette.nebula2, alpha: palette.nebulaAlpha * 0.9, drift: 1.6 },
      { x: 0.5, y: 0.45, r: 0.34, color: palette.nebula, alpha: palette.nebulaAlpha * 0.7, drift: 3.1 },
    ];

    for (let i = 0; i < clouds.length; i++) {
      const cfg = clouds[i];
      const driftA = reduced ? 0 : Math.sin(this.time * 0.025 + cfg.drift);
      const driftB = reduced ? 0 : Math.cos(this.time * 0.023 + cfg.drift);
      const cx = cfg.x * w + driftA * maxR * 0.08 + this.currentX * 26 * (cfg.r / 0.42);
      const cy = cfg.y * h + driftB * maxR * 0.05 + this.currentY * 20 * (cfg.r / 0.42);
      const radius = Math.max(1, cfg.r * maxR);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, `rgba(${cfg.color[0]}, ${cfg.color[1]}, ${cfg.color[2]}, ${cfg.alpha})`);
      g.addColorStop(0.55, `rgba(${cfg.color[0]}, ${cfg.color[1]}, ${cfg.color[2]}, ${cfg.alpha * 0.45})`);
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  }

  renderSweep(ctx, w, h, palette, reduced) {
    if (reduced) return;

    // A slow sweep happens only once per cycle, with a fade in/out envelope.
    const cycle = 11;
    const phase = (this.time % cycle) / cycle;
    if (phase > 0.42) return;

    const local = phase / 0.42;
    const envelope = Math.sin(local * Math.PI);
    const accent = palette.accent;

    const sweepX = -w * 0.35 + local * (w * 1.7);
    const y = h * (0.25 + Math.sin(this.time * 0.2) * 0.08) + this.currentY * 18;
    const c1y = y - h * 0.18;
    const c2y = y + h * 0.18;

    const gradient = ctx.createLinearGradient(sweepX, y, sweepX + w * 0.7, y);
    gradient.addColorStop(0, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0)`);
    gradient.addColorStop(0.5, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${palette.beamAlpha * envelope})`);
    gradient.addColorStop(1, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0)`);

    ctx.beginPath();
    ctx.moveTo(sweepX, y);
    ctx.bezierCurveTo(
      sweepX + w * 0.18,
      c1y,
      sweepX + w * 0.5,
      c2y,
      sweepX + w * 0.82,
      y,
    );

    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(36, w * 0.1);
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.lineWidth = Math.max(12, w * 0.035);
    ctx.globalAlpha = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  renderStars(ctx, w, h, palette, reduced) {
    if (reduced) return;
    for (const p of this.particles) {
      p.y -= p.speed;
      if (p.y < -0.05) p.y = 1.05;

      const px = p.x * w + this.currentX * 34 * p.z;
      const py = p.y * h + this.currentY * 28 * p.z;
      const size = p.r * (0.4 + p.z * 1.1);
      const alpha = palette.starAlpha * (0.25 + 0.75 * Math.abs(Math.sin(this.time * p.twinkle + p.phase)));
      ctx.globalAlpha = Math.max(0.03, alpha);
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

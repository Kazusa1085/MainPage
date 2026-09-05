// Canvas-based animated background: deep-space nebula + a single sweeping light band.
// Dark mode uses pure black as the base, with a focused high-impact center.
// Reduced motion renders a static frame only.

const PALETTES = {
  dark: {
    nebula: [120, 80, 220],
    nebula2: [196, 167, 231],
    accent: [0, 255, 159],
    star: [255, 255, 255],
    nebulaAlpha: 0.14,
    beamAlpha: 0.16,
    starAlpha: 0.55,
    stars: 34,
  },
  light: {
    nebula: [136, 192, 208],
    nebula2: [94, 129, 172],
    accent: [136, 192, 208],
    star: [76, 86, 106],
    nebulaAlpha: 0.07,
    beamAlpha: 0.07,
    starAlpha: 0.2,
    stars: 22,
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
    const count = this.reduced ? 12 : this.palette.stars;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.35 + Math.random() * 0.65,
      r: 0.4 + Math.random() * 1.1,
      speed: 0.003 + Math.random() * 0.009,
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
    this.renderBeam(ctx, w, h, palette, reduced);
    this.renderStars(ctx, w, h, palette, reduced);

    ctx.restore();
  }

  renderNebula(ctx, w, h, palette, reduced) {
    const cx = w * 0.5 + this.currentX * 28;
    const cy = h * 0.42 + this.currentY * 22;
    const maxR = Math.max(w, h);

    // Layered radial gradients give the nebula a soft volumetric feel.
    const layers = [
      { color: palette.nebula, r: 0.48, alpha: palette.nebulaAlpha },
      { color: palette.nebula2, r: 0.3, alpha: palette.nebulaAlpha * 1.35 },
      { color: palette.accent, r: 0.16, alpha: palette.nebulaAlpha * 0.8 },
    ];

    for (const layer of layers) {
      const drift = reduced ? 0 : Math.sin(this.time * 0.05) * maxR * 0.04;
      const gx = cx + drift;
      const gy = cy - drift * 0.35;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, layer.r * maxR);
      g.addColorStop(0, `rgba(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]}, ${layer.alpha})`);
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  }

  renderBeam(ctx, w, h, palette, reduced) {
    const t = reduced ? 0.2 : this.time;
    const accent = palette.accent;

    // One wide, diagonal light band across the screen.
    const baseY = h * 0.52 + Math.sin(t * 0.12) * h * 0.08 + this.currentY * 26;
    const c1y = baseY - h * 0.32 + Math.sin(t * 0.18) * h * 0.09;
    const c2y = baseY + h * 0.28 + Math.cos(t * 0.14) * h * 0.1;
    const startX = -w * 0.3 + Math.sin(t * 0.1) * w * 0.06;
    const endX = w * 1.3 + Math.cos(t * 0.08) * w * 0.05;

    const gradient = ctx.createLinearGradient(startX, baseY, endX, baseY);
    gradient.addColorStop(0, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0)`);
    gradient.addColorStop(0.45, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${palette.beamAlpha})`);
    gradient.addColorStop(0.55, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${palette.beamAlpha})`);
    gradient.addColorStop(1, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0)`);

    ctx.beginPath();
    ctx.moveTo(startX, baseY + Math.sin(t * 0.11) * h * 0.03);
    ctx.bezierCurveTo(
      w * 0.25 + Math.sin(t * 0.13) * w * 0.1,
      c1y,
      w * 0.75 + Math.cos(t * 0.1) * w * 0.1,
      c2y,
      endX,
      baseY + Math.cos(t * 0.13) * h * 0.03,
    );

    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(80, w * 0.22);
    ctx.globalAlpha = 0.75;
    ctx.stroke();
    ctx.lineWidth = Math.max(34, w * 0.09);
    ctx.globalAlpha = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  renderStars(ctx, w, h, palette, reduced) {
    if (reduced) return;
    // Sparse, high-contrast stars with depth parallax.
    for (const p of this.particles) {
      p.y -= p.speed;
      if (p.y < -0.05) p.y = 1.05;

      const px = p.x * w + this.currentX * 34 * p.z;
      const py = p.y * h + this.currentY * 28 * p.z;
      const size = p.r * (0.4 + p.z * 1.1);
      const alpha = palette.starAlpha * (0.3 + 0.7 * Math.abs(Math.sin(this.time * p.twinkle + p.phase)));
      ctx.globalAlpha = Math.max(0.04, alpha);
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

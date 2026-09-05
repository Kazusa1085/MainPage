// Canvas-based animated background: mostly calm black nebula with occasional
// fast shooting-star meteors that leave a long, fading trail.

const PALETTES = {
  dark: {
    nebula: [120, 80, 220],
    nebula2: [196, 167, 231],
    accent: [0, 255, 159],
    star: [255, 255, 255],
    nebulaAlpha: 0.08,
    starAlpha: 0.4,
    meteorAlpha: 0.22,
    stars: 38,
  },
  light: {
    nebula: [136, 192, 208],
    nebula2: [94, 129, 172],
    accent: [136, 192, 208],
    star: [76, 86, 106],
    nebulaAlpha: 0.1,
    starAlpha: 0.26,
    meteorAlpha: 0.14,
    stars: 28,
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
    this.meteors = [];
    this.nextMeteor = 0;
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
    this.updateMeteors();
    this.render();
    this.raf = requestAnimationFrame((next) => this.loop(next));
  }

  updateMeteors() {
    for (const m of this.meteors) {
      m.life += 1 / 60;
      m.progress = Math.min(1, m.life / m.duration);
    }
    this.meteors = this.meteors.filter((m) => m.progress < 1);

    if (this.time >= this.nextMeteor) {
      this.spawnMeteor();
      this.nextMeteor = this.time + 2.5 + Math.random() * 5;
    }
  }

  spawnMeteor() {
    const w = this.width;
    const h = this.height;
    const accent = this.palette.accent;
    const startX = w * (0.05 + Math.random() * 0.8);
    const startY = h * (0.02 + Math.random() * 0.42);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const dx = direction * (w * (0.16 + Math.random() * 0.14));
    const dy = h * (0.14 + Math.random() * 0.12);
    this.meteors.push({
      x: startX,
      y: startY,
      dx,
      dy,
      duration: 0.26 + Math.random() * 0.22,
      life: 0,
      progress: 0,
      trail: 0.4 + Math.random() * 0.22,
      color: accent,
    });
  }

  renderMeteors(ctx, w, h, palette, reduced) {
    if (reduced) return;
    for (const m of this.meteors) {
      const t = m.progress;
      const headX = m.x + m.dx * t;
      const headY = m.y + m.dy * t;
      const tailX = headX - m.dx * m.trail;
      const tailY = headY - m.dy * m.trail;
      const envelope = Math.sin(t * Math.PI);

      const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
      gradient.addColorStop(0, `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, 0)`);
      gradient.addColorStop(0.55, `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, ${palette.meteorAlpha * 0.45 * envelope})`);
      gradient.addColorStop(1, `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, ${palette.meteorAlpha * envelope})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();

      ctx.fillStyle = `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, ${palette.meteorAlpha * envelope})`;
      ctx.beginPath();
      ctx.arc(headX, headY, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
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
    } else {
      this.renderLightBase(ctx, w, h);
    }

    ctx.save();
    ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over';

    this.renderNebula(ctx, w, h, palette, reduced);
    this.renderMeteors(ctx, w, h, palette, reduced);
    this.renderStars(ctx, w, h, palette, reduced);

    ctx.restore();
  }

  renderLightBase(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(246, 248, 251, 0.65)');
    g.addColorStop(0.5, 'rgba(229, 233, 240, 0)');
    g.addColorStop(1, 'rgba(170, 188, 208, 0.32)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
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

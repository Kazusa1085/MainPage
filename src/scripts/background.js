// Canvas-based animated background: perspective floor grid + floating particles.
// Theme-aware: reads the current data-theme and uses soft/dark palettes.
// Reduced motion renders a static frame only.

const PALETTES = {
  dark: {
    line: [196, 167, 231],
    accent: [0, 255, 159],
    particle: [224, 222, 244],
    glow: [196, 167, 231],
    glow2: [0, 255, 159],
    lineAlpha: 0.18,
    particleAlpha: 0.45,
  },
  light: {
    line: [76, 86, 106],
    accent: [136, 192, 208],
    particle: [76, 86, 106],
    glow: [136, 192, 208],
    glow2: [216, 222, 233],
    lineAlpha: 0.12,
    particleAlpha: 0.28,
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
    const count = this.reduced ? 24 : 64;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.35 + Math.random() * 0.65,
      r: 0.6 + Math.random() * 1.6,
      speed: 0.008 + Math.random() * 0.02,
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
    const mode = this.mode;
    const palette = this.palette;
    const reduced = this.reduced;

    // Clear the canvas. The body/css still provides the base background color.
    ctx.clearRect(0, 0, w, h);

    const horizon = h * (0.34 + this.currentY * 0.025);
    const vanishX = w / 2 + this.currentX * 36;

    // Soft horizon glow.
    const glowRadius = Math.max(1, Math.max(w, h) * 0.65);
    const glow = ctx.createRadialGradient(vanishX, horizon, 0, vanishX, horizon, glowRadius);
    const glowColor = mode === 'light' ? palette.glow : palette.glow;
    const glowAlpha = reduced ? 0.05 : mode === 'light' ? 0.06 : 0.09;
    glow.addColorStop(0, `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, ${glowAlpha})`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Perspective radial lines.
    const rays = 22;
    ctx.strokeStyle = `rgba(${palette.line[0]}, ${palette.line[1]}, ${palette.line[2]}, ${palette.lineAlpha})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < rays; i++) {
      const bottomX = (i / (rays - 1)) * w;
      ctx.beginPath();
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(bottomX, h);
      ctx.stroke();
    }

    // Horizontal floor rows flowing toward the viewer.
    const rows = 18;
    const flow = reduced ? 0.35 : (this.time * 0.06) % 1;
    for (let i = 0; i < rows; i++) {
      const t = ((i + flow) / rows) % 1;
      const eased = Math.pow(t, 2.3);
      const y = horizon + (h - horizon) * eased;
      const alpha = palette.lineAlpha * (1 - eased * 0.55);
      ctx.strokeStyle = `rgba(${palette.line[0]}, ${palette.line[1]}, ${palette.line[2]}, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Floating particles.
    if (!reduced) {
      const dt = this.lastTime ? 1 : 1;
      ctx.fillStyle = `rgba(${palette.particle[0]}, ${palette.particle[1]}, ${palette.particle[2]}, ${palette.particleAlpha})`;
      for (const p of this.particles) {
        p.y -= p.speed * dt;
        if (p.y < -0.08) p.y = 1.08;
        const px = p.x * w + this.currentX * 18 * p.z;
        const py = p.y * h + this.currentY * 18 * p.z;
        const size = p.r * (0.5 + p.z * 0.8);
        const alpha = palette.particleAlpha * (0.55 + 0.45 * Math.sin(this.time * p.twinkle + p.phase));
        ctx.globalAlpha = Math.max(0.06, alpha);
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
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

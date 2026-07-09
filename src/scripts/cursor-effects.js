// 全局鼠标动效：自定义跟随光标 + 背景网格视差
// 移植自 MoeHome 原项目的 CustomCursor / GridParallax

const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = () =>
  !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * CustomCursor - 自定义跟随光标
 * 用 requestAnimationFrame + 缓动跟随鼠标，悬浮可交互元素时放大高亮
 */
class CustomCursor {
  constructor() {
    this.cursor = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.animationId = null;
  }

  init() {
    this.cursor = document.querySelector('.cursor');
    if (!this.cursor) {
      this.cursor = document.createElement('div');
      this.cursor.className = 'cursor';
      document.body.appendChild(this.cursor);
    }
    this.bindEvents();
    this.animate();
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stopAnimation();
      else this.animate();
    });
    document.addEventListener('mouseleave', () => { this.cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { this.cursor.style.opacity = '1'; });

    const interactiveSelectors = 'a, button, input, textarea, [role="button"], [tabindex]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) this.cursor.classList.add('hover');
      else this.cursor.classList.remove('hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) this.cursor.classList.remove('hover');
    });
  }

  animate() {
    this.cursorX += (this.mouseX - this.cursorX) * 0.15;
    this.cursorY += (this.mouseY - this.cursorY) * 0.15;
    this.cursor.style.transform = `translate(${this.cursorX - 10}px, ${this.cursorY - 10}px)`;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  stopAnimation() {
    if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; }
  }
}

/**
 * GridParallax - 背景网格视差
 * 注意：原项目里"持续下移"用 CSS @keyframes、"鼠标视差"用 JS 直接改 inline transform，
 * 两者会互相覆盖导致鼠标视差基本不可见。这里改为由 JS 在同一个 rAF 循环里
 * 把"持续滚动位移"与"鼠标视差偏移"合并计算，两个效果才能同时生效。
 */
class GridParallax {
  constructor() {
    this.gridBg = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.scrollOffset = 0;
    this.animationId = null;
  }

  init() {
    this.gridBg = document.querySelector('.grid-bg');
    if (!this.gridBg) {
      this.gridBg = document.createElement('div');
      this.gridBg.className = 'grid-bg';
      document.body.insertBefore(this.gridBg, document.body.firstChild);
    }
    this.bindEvents();
    this.animate();
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX - window.innerWidth / 2) * 0.01;
      this.mouseY = (e.clientY - window.innerHeight / 2) * 0.01;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stopAnimation();
      else this.animate();
    });
  }

  animate() {
    // 网格背景 background-size 为 50px，偏移循环到 50 后归零，形成连续流动的错觉
    this.scrollOffset = (this.scrollOffset + 0.15) % 50;
    const translateY = this.scrollOffset + this.mouseY;
    this.gridBg.style.transform =
      `perspective(500px) rotateX(60deg) translateY(${translateY}px) translateX(${this.mouseX}px)`;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  stopAnimation() {
    if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; }
  }
}

export function initCursorEffects() {
  // 无障碍：偏好减少动画的用户，不启用这两个纯装饰性动效
  if (prefersReducedMotion()) return;
  // 只在有精确指针(鼠标)的设备上启用跟随光标，触屏设备没有意义
  if (hasFinePointer()) new CustomCursor().init();
  new GridParallax().init();
}
// 全局鼠标动效：自定义跟随光标 + 背景网格（全端显示，桌面端额外叠加鼠标视差）
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

// 背景网格：始终创建（全端可见）。持续流动动效由 CSS @keyframes 动画 background-position 驱动，
// 这里的 JS 只负责创建元素，不涉及任何动画逻辑。
function initGridBackground() {
  if (document.querySelector('.grid-bg')) return null;
  const gridBg = document.createElement('div');
  gridBg.className = 'grid-bg';
  document.body.insertBefore(gridBg, document.body.firstChild);
  return gridBg;
}

/**
 * GridParallax - 桌面端鼠标视差（仅叠加轻微倾斜跟随，不接管持续流动）
 * 关键点：CSS 的 gridMove 动画只动 background-position，这里 JS 只动 transform，
 * 两个属性互不相干，可以同时生效，不会出现互相覆盖的问题。
 */
class GridParallax {
  constructor(gridBg) {
    this.gridBg = gridBg;
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.animationId = null;
  }

  init() {
    if (!this.gridBg) return;
    this.bindEvents();
    this.animate();
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX - window.innerWidth / 2) * 0.02;
      this.mouseY = (e.clientY - window.innerHeight / 2) * 0.02;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stopAnimation();
      else this.animate();
    });
  }

  animate() {
    this.currentX += (this.mouseX - this.currentX) * 0.06;
    this.currentY += (this.mouseY - this.currentY) * 0.06;
    this.gridBg.style.transform =
      `perspective(500px) rotateX(60deg) translateY(${this.currentY}px) translateX(${this.currentX}px)`;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  stopAnimation() {
    if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; }
  }
}

export function initCursorEffects() {
  const reduced = prefersReducedMotion();
  const finePointer = hasFinePointer();

  // 网格背景：始终创建（全端可见）。偏好减少动画时，CSS 的 reduced-motion 规则会自动停掉流动动画，
  // 保留静态网格作为背景，不需要在 JS 这里额外判断。
  const gridBg = initGridBackground();

  if (reduced) return; // 无障碍：偏好减少动画的用户，跳过下面两个纯装饰性动效

  // 跟随光标：只在有精确指针(鼠标)的设备上启用，触屏设备没有意义
  if (finePointer) {
    new CustomCursor().init();
    // 鼠标视差：同样只在桌面端(有鼠标)叠加，移动端网格仅保留基础流动动画
    new GridParallax(gridBg).init();
  }
}
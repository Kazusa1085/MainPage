// 全局鼠标动效：自定义跟随光标 + Canvas 动画背景
// 背景由 background.js 负责，这里只处理光标动效。

import { initBackground } from './background.js';

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

export function initCursorEffects() {
  const reduced = prefersReducedMotion();
  const finePointer = hasFinePointer();

  // Canvas 背景：始终初始化，模块内部会处理 reduced-motion 和隐藏暂停。
  initBackground();

  if (reduced) return; // 无障碍：偏好减少动画的用户，跳过纯装饰性光标动效

  // 跟随光标：只在有精确指针(鼠标)的设备上启用，触屏设备没有意义
  if (finePointer) {
    new CustomCursor().init();
  }
}

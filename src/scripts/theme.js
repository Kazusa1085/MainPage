// Theme Manager - 仅深色/浅色两种模式切换（无配色方案）
// 主题初始化 (FOUC 防止) 已内联在 BaseLayout 中
import { buildStyleString } from '../data/theme-data.js';

const STORAGE_KEY = 'homepage_theme';

export class ThemeManager {
  constructor(defaultMode) {
    this.defaultMode = defaultMode === 'light' ? 'light' : 'dark';
    this.currentMode = this.getSavedMode() || this.defaultMode;
    this.applyTheme();
  }

  getSavedMode() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : null;
      return parsed && (parsed.mode === 'light' || parsed.mode === 'dark') ? parsed.mode : null;
    } catch { return null; }
  }

  getMode() {
    return this.currentMode;
  }

  setMode(mode) {
    if (mode !== 'light' && mode !== 'dark') return;
    this.currentMode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode }));
    } catch {}
    this.applyTheme();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { mode } }));
  }

  toggle() {
    this.setMode(this.currentMode === 'dark' ? 'light' : 'dark');
    return this.currentMode;
  }

  applyTheme() {
    const root = document.documentElement;
    root.setAttribute('data-theme', this.currentMode);
    root.style.cssText = buildStyleString(this.currentMode);
  }
}

// 初始化（DOM ready 时调用）
export function initTheme(defaultMode) {
  if (window.__themeManager) return window.__themeManager;
  try {
    window.__themeManager = new ThemeManager(defaultMode);
  } catch (e) {
    console.warn('ThemeManager init failed:', e);
  }
  return window.__themeManager;
}

// 辅助：获取当前主题管理器实例
export function getTheme() {
  return window.__themeManager;
}

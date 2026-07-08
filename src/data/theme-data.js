// Theme color data - shared between build (Astro frontmatter) and runtime (theme.js)
//
// 仅两种模式，无配色方案选择：
// - dark：赛博绿(cyberGreen)的纯黑背景 + 鸢尾紫(rosePineMoon)的强调色/文字/边框
// - light：冰川青(nordSnowStorm) 配色，数值取自 MoeHome 原项目 theme-data.js

export const themes = {
  dark: {
    accent: '#c4a7e7',
    bgPrimary: '#0a0a0a',
    bgSecondary: '#111111',
    textPrimary: '#e0def4',
    textSecondary: '#6e6a86',
    border: '#393552',
  },
  light: {
    accent: '#88C0D0',
    bgPrimary: '#E5E9F0',
    bgSecondary: '#ECEFF4',
    textPrimary: '#2E3440',
    textSecondary: '#4C566A',
    border: '#D8DEE9',
  },
};

// 衍生色的透明度配置（同一套比例，深浅模式各一份，与 MoeHome 原项目一致）
const deriveConfig = {
  light: {
    accentDim: 0.1, gridColor: 0.05, hover: 0.08, active: 0.15,
    shadowSm: 0.05, shadowMd: 0.1, glow: 0.2, navbarScrolled: 1,
    cardBorderStrong: 0.5, cardBorderMuted: 0.25,
  },
  dark: {
    accentDim: 0.1, gridColor: 0.03, hover: 0.1, active: 0.2,
    shadowSm: 0.3, shadowMd: 0.5, glow: 0.3, navbarScrolled: 0.98,
    cardBorderStrong: 0.4, cardBorderMuted: 0.2,
  },
};

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  if (short) return `${parseInt(short[1] + short[1], 16)}, ${parseInt(short[2] + short[2], 16)}, ${parseInt(short[3] + short[3], 16)}`;
  return '0, 0, 0';
}

export function darkenColor(hex, amount) {
  const rgb = hexToRgb(hex).split(', ').map(Number);
  const darkened = rgb.map((c) => Math.max(0, Math.round(c * (1 - amount))));
  return `#${darkened.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * 构建某一模式的完整 CSS 变量数组（含玻璃光泽、终端专属色等衍生变量）
 * @param {'light'|'dark'} mode
 */
export function buildCSSVariablesArray(mode) {
  const colors = themes[mode];
  const derive = deriveConfig[mode];
  const accentRgb = hexToRgb(colors.accent);
  const bgPrimaryRgb = hexToRgb(colors.bgPrimary);
  const isLight = mode === 'light';

  return [
    `--bg-primary:${colors.bgPrimary}`,
    `--bg-secondary:${colors.bgSecondary}`,
    `--text-primary:${colors.textPrimary}`,
    `--text-secondary:${colors.textSecondary}`,
    `--accent:${colors.accent}`,
    `--accent-deep:${darkenColor(colors.accent, 0.2)}`,
    `--border:${colors.border}`,
    `--accent-dim:rgba(${accentRgb},${derive.accentDim})`,
    `--grid-color:rgba(${accentRgb},${derive.gridColor})`,
    `--notice-bg-warning:rgba(255,149,0,${isLight ? 0.08 : 0.05})`,
    `--notice-bg-info:rgba(0,161,255,${isLight ? 0.08 : 0.05})`,
    `--notice-bg-success:rgba(39,201,63,${isLight ? 0.08 : 0.05})`,
    `--hover-bg:rgba(${accentRgb},${derive.hover})`,
    `--active-bg:rgba(${accentRgb},${derive.active})`,
    `--focus-ring:${colors.accent}`,
    `--shadow-sm:rgba(0,0,0,${derive.shadowSm})`,
    `--shadow-md:rgba(0,0,0,${derive.shadowMd})`,
    `--glow:rgba(${accentRgb},${derive.glow})`,
    `--glow-subtle:rgba(${accentRgb},0.08)`,
    `--navbar-bg-scrolled:rgba(${bgPrimaryRgb},${derive.navbarScrolled})`,
    `--divider-glow:rgba(${accentRgb},0.4)`,
    `--card-border-strong:rgba(${accentRgb},${derive.cardBorderStrong})`,
    `--card-border-muted:rgba(${accentRgb},${derive.cardBorderMuted})`,
    `--glass-border-top:${isLight ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`,
    `--glass-border-bottom:${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.5)'}`,
    `--glass-border-side:rgba(255,255,255,0.03)`,
    `--glass-outer-shadow:${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.4)'}`,
    `--glass-hover-border:rgba(${accentRgb},${isLight ? 0.25 : 0.15})`,
    `--terminal-bg:${colors.bgSecondary}`,
    `--terminal-text:${colors.textSecondary}`,
    `--terminal-prompt:${colors.accent}`,
    `--terminal-cursor:${colors.accent}`,
    // 兼容旧版组件仍在使用的变量名
    `--gradient-start:${colors.textPrimary}`,
    `--gradient-end:${colors.accent}`,
  ];
}

export function buildStyleString(mode) {
  return buildCSSVariablesArray(mode).join(';');
}

// Kazusa1085 Personal Homepage Configuration
// 所有可配置内容集中管理，组件通过 import 读取

export const site = {
  name: 'Kazusa1085',
  tagline: '寄术博主 / 炸板小能手 / 摸鱼怪',
  url: '',
  ogImage: 'https://avatars.githubusercontent.com/u/195487617?v=4',
};

export const seo = {
  title: 'Kazusa1085 - 寄术博主 / 炸板小能手 / 摸鱼怪',
  description: 'Hi，欢迎访问我的个人主页。',
  keywords: ['Kazusa1085', '技术博客', 'Astro', '自动化部署'],
  og: {
    title: 'Kazusa1085 - 个人主页',
    description: '寄术博主 / 炸板小能手 / 摸鱼怪 - 什么都做，什么都写。',
    image: 'https://avatars.githubusercontent.com/u/195487617?v=4',
  },
};

export const pages = {
  404: {
    title: '页面未找到',
    description: '抱歉，您访问的页面不存在或已被删除',
    robots: 'noindex, nofollow',
  },
};

// 主题：仅深色/浅色两种模式（无配色方案选择）
// dark：赛博绿的纯黑背景 + 鸢尾紫的强调色/文字/边框
// light：冰川青 (nordSnowStorm) 配色
export const theme = {
  default: 'dark',
};

export const nav = {
  enabled: true,
  brand: {
    showPrompt: true,
    hoverText: '~/whoami',
  },
  menus: [],
};

export const profile = {
  name: 'Kazusa1085',
  tagline: {
    prefix: '🐾',
    highlight: '欢迎来到我的主页！',
  },
  avatar: '/images/avatar.jpg',
};

export const favicon = {
  path: '/images/icon.png',
};

export const identity = ["Hi, I'm Kazusa1085.", '开源爱好者', '炸板小能手', '摸鱼怪'];
export const interests = ['Touch Fish🐟', 'NAS & HomeAssistant', '嵌入式Linux开发', '自动化部署'];
export const gear = [];

export const terminal = {
  title: '🐾 user@host:~|',
  prompts: [
    { command: 'whoami', output: 'identity' },
    { command: 'cat interests.txt', output: 'interests' },
    { command: 'cat gear.txt', output: 'gear' },
    { command: './wisdom.sh', output: 'dynamic' },
  ],
};

export const quotes = [
  'Empty your mind, be formless, shapeless, like water...',
  'Be water, my friend.',
  'The time you enjoy wasting is not wasted time.',
  'I know that I know nothing.',
  'The only important thing in life is to be yourself.',
  'The only way to true freedom is to be able to walk away.',
  'Inspiration is perishable. Act on it immediately.',
  'Who looks outside, dreams; who looks inside, awakes.',
  'You have to figure out what your own aptitudes are.',
  'You have to compete within your own area of competence.',
];

export const music = {
  enabled: false,
  volume: 0.5,
  autoplay: false,
  playMode: 'list',
  mode: 'meting',
  meting: {
    server: 'netease',
    type: 'playlist',
    id: '',
    apis: [
      'https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r',
      'https://api.injahow.cn/meting/?server=:server&type=:type&id=:id',
      'https://api.moeyao.cn/meting/?server=:server&type=:type&id=:id',
    ],
  },
  local: [],
};

export const animation = {
  fadeInDelay: 1000,
  typingSpeed: 60,
  quoteDisplayTime: 4000,
  quoteDeleteSpeed: 42,
};

export const rss = {
  enabled: true,
  url: 'https://blog.raana.icu/rss.xml',
  count: 4,
  openInNewTab: true,
  title: { text: '近期更新', icon: 'fa-solid fa-newspaper' },
  display: { showDate: true, showDescription: true, maxDescriptionLength: 100 },
};

export const projects = {
  enabled: false,
  title: { text: '我的项目', icon: 'fa-solid fa-folder-open' },
  githubUser: 'https://github.com/Kazusa1085',
  count: 5,
  exclude: ['.github'],
};

export const contribution = {
  enabled: false,
  useRealData: true,
  githubUser: '',
};

export const linksConfig = {
  enabled: true,
  title: { text: '链接导航', icon: 'fa-solid fa-link' },
};

export const links = [
  {
    name: 'Blog',
    description: '技术文章 & 教程',
    url: 'https://blog.raana.icu',
    icon: 'fa-solid fa-pen-nib',
    brand: 'blog',
    external: true,
    color: '#00ff9f',
    enabled: true,
  },
  {
    name: 'GitHub',
    description: '开源项目 & 代码',
    url: 'https://github.com/Kazusa1085',
    icon: 'fa-brands fa-github',
    brand: 'github',
    external: true,
    color: '#58a6ff',
    enabled: true,
  },
  {
    name: 'Email',
    description: '联系 & 合作',
    url: 'mailto:example@email.com',
    icon: 'fa-solid fa-envelope',
    brand: 'email',
    external: false,
    color: '#ea4335',
    antiCrawler: true,
    enabled: true,
  },
];

export const footer = {
  copyright: { year: '2018-2026', name: 'Kazusa1085', url: 'https://blog.raana.icu/' },
  icp: { enabled: false, number: '京ICP备XXXXXXXX号', url: 'https://beian.miit.gov.cn/' },
};

export const notice = {
  enabled: false,
  type: 'warning',
  icon: 'fa-solid fa-shield-halved',
  text: '声明：本人不会主动邀请或联系任何人，任何冒用本人名义的一切事物，请务必谨防受骗！',
};

export const analytics = {
  googleAnalytics: { enabled: false, id: 'G-XXXXXXXXXX' },
  microsoftClarity: { enabled: false, id: 'xxxxxxxxxxxx' },
  umami: '',
  customScripts: [],
};

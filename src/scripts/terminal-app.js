// Terminal bio interactive logic.
// Receives build-time data as a plain object, so Astro can keep this as a normal module.

import { initTheme, getTheme } from './theme.js';

export function initTerminalApp(data) {
  const { identity, interests, gear, quotes, articles, repos, linksData, site, profile, defaultMode } = data;

  initTheme(defaultMode);

  const body = document.getElementById('terminal-body');
  const output = document.getElementById('terminal-output');
  const input = document.getElementById('terminal-input');
  const form = document.getElementById('terminal-form');

  function print(text, cls = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${cls}`.trim();
    if (text === '') {
      line.innerHTML = '&nbsp;';
    } else {
      line.textContent = text;
    }
    output.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function printWelcome() {
    const neofetch = document.createElement('div');
    neofetch.className = 'neofetch';
    const themeMode = getTheme()?.getMode() || defaultMode;
    neofetch.innerHTML = `
      <pre class="neofetch-logo" aria-hidden="true">
 ██╗  ██╗
 ██║ ██╔╝
 █████╔╝
 ██╔═██╗
 ██║  ██╗
 ╚═╝  ╚═╝
      </pre>
      <div class="neofetch-info">
        <div class="nf-user">visitor@raana.icu</div>
        <div class="nf-divider">-----------------</div>
        <div>OS: Astro ${defaultMode}</div>
        <div>Host: raana.icu</div>
        <div>Kernel: astro</div>
        <div>Uptime: ∞</div>
        <div>Shell: zsh</div>
        <div>Theme: ${themeMode}</div>
      </div>
    `;
    output.appendChild(neofetch);

    print("Welcome to " + site.name + "'s Mainpage terminal.");
    print('--------------------------------------------------', 'muted');
    print('Type "help" to see available commands.');
    print('');
    body.scrollTop = body.scrollHeight;
  }

  function clearScreen() {
    output.innerHTML = '';
    printWelcome();
  }

  function execute(raw) {
    const [cmd] = raw.split(/\s+/);
    const args = raw.split(/\s+/).slice(1);

    switch (cmd) {
      case 'help':
        print('Available commands:', 'muted');
        print('  help              show this help');
        print('  welcome           show the welcome screen');
        print('  whoami            about me');
        print('  cat interests     my interests');
        print('  cat gear          my gear');
        print('  ls                list sections');
        print('  posts             recent blog posts');
        print('  projects          open-source projects');
        print('  links             contact & links');
        print('  neofetch          system info');
        print('  theme             toggle dark/light');
        print('  clear             clear terminal');
        break;
      case 'welcome':
        printWelcome();
        break;
      case 'whoami':
        print(identity.join(' / '));
        break;
      case 'cat':
        if (args[0] === 'interests') {
          print(interests.join(' / '));
        } else if (args[0] === 'gear') {
          print(gear.length ? gear.join(' / ') : 'no gear configured');
        } else {
          print('usage: cat interests|gear');
        }
        break;
      case 'ls':
        print('posts  projects  links  profile');
        break;
      case 'posts':
        if (articles.length === 0) {
          print('No recent posts.');
        } else {
          articles.forEach((a, i) => {
            print(`${i + 1}. ${a.title}  [${a.date || 'date unknown'}]`);
            print(`   ${a.link}`);
          });
        }
        break;
      case 'projects':
        if (repos.length === 0) {
          print('No projects enabled.');
        } else {
          repos.forEach((r) => {
            print(`- ${r.name}  ★${r.stars}  ${r.language || ''}`);
            print(`  ${r.url}`);
            if (r.description) print(`  ${r.description}`);
          });
        }
        break;
      case 'links':
        linksData.filter((l) => l.enabled !== false).forEach((l) => {
          print(`- ${l.name}  ->  ${l.url}`);
        });
        break;
      case 'neofetch':
        print('        ▄▄▄▄▄▄▄▄▄▄▄        ' + site.name);
        print('      ▄█▀▀▀▀▀▀▀▀▀▀▀▀▀█▄      OS: Astro ' + defaultMode);
        print('      █  ▄▄▄▄▄▄▄▄▄▄▄  █      Host: raana.icu');
        print('     █ ▄█▀▀▀▀▀▀▀▀▀▀█▄ █      Uptime: ∞');
        print('     █ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ █      Theme: ' + (getTheme()?.getMode() || defaultMode));
        print('      ▀█▄▄▄▄▄▄▄▄▄▄▄▄▄█▀      Shell: zsh');
        print('        ▀▀▀▀▀▀▀▀▀▀▀▀▀        ' + (profile.tagline.highlight || ''));
        break;
      case 'theme':
        getTheme()?.toggle();
        print('Theme toggled.');
        break;
      case 'clear':
        clearScreen();
        break;
      default:
        print(`command not found: ${cmd}`);
        print('Type "help" to see available commands.');
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;
    print('$ ' + raw, 'cmd');
    execute(raw);
    input.value = '';
    body.scrollTop = body.scrollHeight;
  });

  document.addEventListener('keydown', (e) => {
    if (document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) {
      if (e.key.length === 1 || e.key === 'Backspace') {
        input.focus();
      }
    }
  });

  window.addEventListener('click', () => {
    if (window.getSelection()?.toString()) return;
    input.focus();
  });

  printWelcome();
  input.focus();
}

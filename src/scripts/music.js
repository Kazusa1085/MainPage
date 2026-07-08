// Music Player - standalone client-side module

export class MusicPlayer {
  constructor(config) {
    this.config = config;
    this.audio = new Audio();
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.playMode = config.playMode || 'list';

    this.audio.volume = config.volume || 0.5;
  }

  get elements() {
    return {
      player: document.getElementById('music-player'),
      playBtn: document.getElementById('music-play'),
      playIcon: document.getElementById('music-play-icon'),
      prevBtn: document.getElementById('music-prev'),
      nextBtn: document.getElementById('music-next'),
      progress: document.getElementById('music-progress'),
      progressFill: document.getElementById('music-progress-fill'),
      timeDisplay: document.getElementById('music-time'),
      titleDisplay: document.getElementById('music-title'),
    };
  }

  async loadPlaylist() {
    const { meting, mode, local } = this.config;
    if (mode === 'meting' && meting?.id) {
      await this.loadMeting(meting);
    } else if (mode === 'local' && local?.length > 0) {
      this.loadLocal(local);
    }
  }

  async loadMeting(meting) {
    for (const api of meting.apis || []) {
      try {
        const url = api.replace(':server', meting.server).replace(':type', meting.type).replace(':id', meting.id) + '&r=' + Math.random();
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.playlist = data.map(s => ({
            url: s.url,
            name: (s.name || s.title || '') + (s.artist ? ' - ' + s.artist : ''),
          })).filter(i => i.url);
          if (this.playlist.length > 0) break;
        }
      } catch {}
    }
    this.currentIndex = 0;
    this.updateTitle();
  }

  loadLocal(local) {
    this.playlist = local.filter(u => u).map(url => ({
      url,
      name: decodeURIComponent(url.split('/').pop() || '').replace(/\.[^.]+$/, '') || '未知歌曲',
    }));
    this.currentIndex = 0;
    this.updateTitle();
  }

  updateTitle() {
    const el = this.elements.titleDisplay?.querySelector('span');
    const song = this.playlist[this.currentIndex];
    if (el && song) el.textContent = song.name || '未知歌曲';
  }

  togglePlay() { this.isPlaying ? this.pause() : this.play(); }

  play() {
    const song = this.playlist[this.currentIndex];
    if (!song?.url) return;
    this.audio.src = song.url;
    this.audio.play().catch(() => this.onPause());
  }

  pause() { this.audio.pause(); }

  prev(force) {
    if (this.playlist.length === 0) return;
    this.currentIndex = this.playMode === 'random'
      ? Math.floor(Math.random() * this.playlist.length)
      : (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.updateTitle();
    if (force || this.isPlaying) this.play();
  }

  next(force) {
    if (this.playlist.length === 0) return;
    this.currentIndex = this.playMode === 'random'
      ? Math.floor(Math.random() * this.playlist.length)
      : (this.currentIndex + 1) % this.playlist.length;
    this.updateTitle();
    if (force || this.isPlaying) this.play();
  }

  seekTo(e) {
    const rect = this.elements.progress?.getBoundingClientRect();
    if (!rect || !this.audio.duration) return;
    this.audio.currentTime = ((e.clientX - rect.left) / rect.width) * this.audio.duration;
  }

  formatTime(s) {
    if (isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }

  bindEvents() {
    const el = this.elements;
    el.playBtn?.addEventListener('click', () => this.togglePlay());
    el.prevBtn?.addEventListener('click', () => this.prev(true));
    el.nextBtn?.addEventListener('click', () => this.next(true));
    el.progress?.addEventListener('click', (e) => this.seekTo(e));

    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.next(true));
    this.audio.addEventListener('play', () => this.onPlay());
    this.audio.addEventListener('pause', () => this.onPause());
    this.audio.addEventListener('error', () => setTimeout(() => this.next(true), 1000));
  }

  updateProgress() {
    if (this.elements.progressFill && this.audio.duration) {
      this.elements.progressFill.style.width = `${(this.audio.currentTime / this.audio.duration) * 100}%`;
    }
    if (this.elements.timeDisplay) {
      this.elements.timeDisplay.textContent = `${this.formatTime(this.audio.currentTime)} / ${this.formatTime(this.audio.duration)}`;
    }
  }

  onPlay() {
    this.isPlaying = true;
    this.elements.playBtn?.classList.add('playing');
    this.elements.player?.classList.add('playing');
    if (this.elements.playIcon) this.elements.playIcon.className = 'fa-solid fa-pause';
    document.querySelector('.avatar')?.classList.add('music-playing');
  }

  onPause() {
    this.isPlaying = false;
    this.elements.playBtn?.classList.remove('playing');
    this.elements.player?.classList.remove('playing');
    if (this.elements.playIcon) this.elements.playIcon.className = 'fa-solid fa-play';
    document.querySelector('.avatar')?.classList.remove('music-playing');
  }
}

export function initMusicPlayer(config) {
  const toggleBtn = document.getElementById('music-toggle');
  const musicArea = document.getElementById('music-area');
  const playerEl = document.getElementById('music-player');
  if (!toggleBtn || !musicArea) return;

  let player = null;
  let expanded = false;

  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    musicArea.classList.toggle('is-expanded', expanded);
    toggleBtn.classList.toggle('is-active', expanded);
    toggleBtn.setAttribute('aria-expanded', String(expanded));

    if (expanded && !player && playerEl) {
      player = new MusicPlayer(config);
      player.bindEvents();
      player.loadPlaylist();
    }
  });
}

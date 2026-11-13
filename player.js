// Player behavior. Add songs in tracks.js.
(() => {
  const audio = document.getElementById('audio');
  const play = document.getElementById('play');
  const select = document.getElementById('track');
  const seek = document.getElementById('seek');
  const volume = document.getElementById('volume');
  const mute = document.getElementById('mute');
  const time = document.getElementById('time');
  const errorMessage = document.getElementById('error');
  const tracks = window.SITE_TRACKS;
  if (!Array.isArray(tracks) || !tracks.length) return;

  tracks.forEach((track, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = track.title;
    select.appendChild(option);
  });

  audio.src = tracks[0].src;
  audio.volume = Number(volume.value);
  audio.controls = false;
  audio.hidden = true;
  document.getElementById('custom-controls').hidden = false;
  let request = 0;

  function format(seconds) {
    if (!Number.isFinite(seconds)) return '—:——';
    return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  }

  function updateTime() {
    const duration = audio.duration;
    seek.disabled = !Number.isFinite(duration) || duration <= 0;
    seek.max = Number.isFinite(duration) && duration > 0 ? String(duration) : '100';
    seek.value = String(audio.currentTime || 0);
    seek.setAttribute('aria-valuetext', format(audio.currentTime) + ' of ' + format(duration));
    time.textContent = format(audio.currentTime) + ' / ' + format(duration);
  }

  function updatePlay() {
    play.textContent = audio.paused ? 'PLAY' : 'PAUSE';
    play.setAttribute('aria-label', audio.paused ? 'Play music' : 'Pause music');
  }

  function updateVolume() {
    const silent = audio.muted || audio.volume === 0;
    mute.textContent = silent ? 'UNMUTE' : 'MUTE';
    mute.setAttribute('aria-pressed', String(silent));
    mute.setAttribute('aria-label', silent ? 'Unmute music' : 'Mute music');
  }

  async function start() {
    const currentRequest = ++request;
    errorMessage.hidden = true;
    try {
      await audio.play();
    } catch (error) {
      if (currentRequest !== request || error.name === 'AbortError') return;
      errorMessage.textContent = 'AUDIO UNAVAILABLE — PLEASE TRY AGAIN';
      errorMessage.hidden = false;
      updatePlay();
    }
  }

  play.addEventListener('click', () => {
    if (audio.paused) start();
    else { ++request; audio.pause(); }
  });

  select.addEventListener('change', () => {
    const resume = !audio.paused;
    ++request;
    audio.pause();
    audio.src = tracks[Number(select.value)].src;
    audio.load();
    updateTime();
    errorMessage.hidden = true;
    if (resume) start();
  });

  seek.addEventListener('input', () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value);
    updateTime();
  });
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
    audio.muted = false;
    updateVolume();
  });
  mute.addEventListener('click', () => {
    if (audio.muted || audio.volume === 0) {
      if (audio.volume === 0) { audio.volume = 0.5; volume.value = '0.5'; }
      audio.muted = false;
    } else audio.muted = true;
    updateVolume();
  });
  audio.addEventListener('play', updatePlay);
  audio.addEventListener('playing', updatePlay);
  audio.addEventListener('pause', updatePlay);
  audio.addEventListener('error', () => {
    errorMessage.textContent = 'AUDIO UNAVAILABLE — PLEASE TRY AGAIN';
    errorMessage.hidden = false;
    updatePlay();
  });
  audio.addEventListener('loadedmetadata', updateTime);
  audio.addEventListener('durationchange', updateTime);
  audio.addEventListener('timeupdate', updateTime);
  audio.addEventListener('volumechange', updateVolume);
  updateTime();
})();

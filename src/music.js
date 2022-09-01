const channels = 5;
let playing = false;
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const gain = ctx.createGain();
gain.connect(ctx.destination);
const merger = ctx.createChannelMerger(channels);
merger.connect(gain);

class Music {
  constructor(channels) {
    this.oscillators = [];
    this.createOscillators(channels);
  }

  createOscillators(number) {
    for (let i = 0; i < number; i++) {
      this.oscillators.push(new Oscillator(i, (i + 1) * 150 + 200, (i + 1) * 100));
    }
  }

  on() {
    this.oscillators.forEach((osc) => {
      osc.start();
    });
  }

  off() {
    this.oscillators.forEach((osc) => {
      osc.stop();
    });
  }
}

class Oscillator {
  constructor(channel, tempo, lowestNote) {
    this.osc = ctx.createOscillator();
    this.osc.connect(merger, 0, channel);
    this.tempo = tempo;
    this.lowestNote = lowestNote;
    this.osc.start();
    this.osc.frequency.setValueAtTime(randomFrequency(this.lowestNote), ctx.currentTime);
  }

  start() {
    gain.gain.setValueAtTime(1 / channels, ctx.currentTime);
    this.interval = setInterval(() => {
      this.osc.frequency.setValueAtTime(randomFrequency(this.lowestNote), ctx.currentTime);
    }, this.tempo);
  }

  stop() {
    gain.gain.setValueAtTime(0, ctx.currentTime);
    clearInterval(this.interval);
  }
}

function randomFrequency(lowestNote) {
  return Math.random() * 300 + lowestNote;
}

function initializeMusic() {
  let music = null;
  let toggleButton = document.getElementById("music-toggle");

  toggleButton.onclick = () => {
    if (!music) {
      music = new Music(channels);
    }
    playing ? music.off() : music.on();
    toggleButton.textContent = playing ? "Music On" : "Music Off";
    playing = !playing;
  };
}

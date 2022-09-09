const TEMPO = 400;
const channels = 2;
const SCALES = [
  [110, 130.8128, 164.8138],
  [220, 246.9416, 261.6256, 293.6648, 329.6276, 369.9944, 415.304]
];

let playing = false;
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const gain = ctx.createGain();
gain.connect(ctx.destination);
const merger = ctx.createChannelMerger(channels);
merger.connect(gain);

class Music {
  constructor(scales) {
    this.oscillators = scales.map((scale, i) => new Oscillator(i, scale, TEMPO / (i + 1)));
  }

  on() {
    this.oscillators.forEach((osc) => osc.start());
  }

  off() {
    this.oscillators.forEach((osc) => osc.stop());
  }
}

class Oscillator {
  constructor(channel, scale, tempo) {
    this.scale = scale;
    this.tempo = tempo;

    this.osc = ctx.createOscillator();
    this.osc.connect(merger, 0, channel);
    this.osc.start();
    this.osc.frequency.setValueAtTime(this.randomNote(), ctx.currentTime);
    this.index = 0;
  }

  start() {
    gain.gain.setValueAtTime(1 / (2 * channels), ctx.currentTime);
    this.interval = setInterval(() => {
      this.osc.frequency.setValueAtTime(this.randomNote(), ctx.currentTime);
    }, this.tempo);
  }

  stop() {
    gain.gain.setValueAtTime(0, ctx.currentTime);
    clearInterval(this.interval);
  }

  randomNote() {
    let index = Math.floor(Math.random() * this.scale.length);
    if (index === this.index) index = (index + 1) % this.scale.length;
    this.index = index;
    return this.scale[index];
  }
}


function initializeMusic() {
  let music = null;
  let toggleButton = document.getElementById("music-toggle");

  toggleButton.onclick = () => {
    if (!music) {
      music = new Music(SCALES);
    }
    playing ? music.off() : music.on();
    toggleButton.textContent = playing ? "Music On" : "Music Off";
    playing = !playing;
  };
}

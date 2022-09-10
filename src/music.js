const TEMPO = 15;
const OFFSET = 80;
let key = 0;

const keys = [
  [makeScale([0, 5, 8], 1, 1), makeScale([2, 3, 5, 11], 2, 2), makeScale([0, 2, 3, 5, 7, 8, 11], 3, 2)],
  [makeScale([3, 8, 11], 1, 1), makeScale([2, 5, 6, 8], 2, 2), makeScale([2, 3, 5, 6, 8, 10, 11], 3, 2)],
  [makeScale([2, 6, 11], 1, 1), makeScale([5, 8, 9, 11], 2, 2), makeScale([1, 2, 5, 6, 8, 9, 11], 3, 2)],
  [makeScale([2, 5, 9], 1, 1), makeScale([0, 2, 8, 11], 2, 2), makeScale([0, 2, 4, 5, 8, 9, 11], 3, 2)],
];

let playing = false;
let audioCtx;
let merger;
let gain;

class Music {
  constructor(keys) {
    this.oscillators = keys[key].map((scale, i) => new Oscillator(1 / (1 + i * 4), scale, TEMPO * (i + 1)));
  }

  on() {
    this.oscillators.forEach((osc) => osc.start());
  }

  off() {
    this.oscillators.forEach((osc) => osc.stop());
  }

  modulate() {
    key = (key + 1) % keys.length;
    this.oscillators.forEach((osc, i) => (osc.scale = keys[key][i]));
  }
}

class Oscillator {
  constructor(amplitude, scale, tempo) {
    this.scale = scale;
    this.tempo = 60000 / tempo;
    this.amplitude = amplitude;

    this.osc = audioCtx.createOscillator();
    this.osc.connect(gain);
    this.index = 0;
    this.osc.frequency.setValueAtTime(this.randomNote(), audioCtx.currentTime);
    this.osc.start();
  }

  start() {
    gain.gain.setValueAtTime(this.amplitude, audioCtx.currentTime);
    this.interval = setInterval(() => {
      this.osc.frequency.setValueAtTime(this.randomNote(), audioCtx.currentTime);
    }, this.tempo);
  }

  stop() {
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    clearInterval(this.interval);
  }

  randomNote() {
    let index = Math.floor(Math.random() * this.scale.length);
    if (index === this.index) index = (index + 1) % this.scale.length;
    this.index = index;
    return this.scale[index];
  }
}

let music = null;

function toggleMusic(event) {
  if (music === null) {
    initialize();
  }

  playing ? music.off() : music.on();
  event.target.textContent = playing ? "Music On" : "Music Off";
  playing = !playing;
}

function makeScale(notes, octave, range = 1) {
  const a0 = 27.5;
  const chromatic = Array.from({ length: 12 * range }, (_, i) => a0 * 2 ** (i / 12));
  return chromatic.filter((_, i) => notes.includes(i % 12)).map((note) => note * 2 ** octave);
}

function initialize() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  gain = audioCtx.createGain();
  gain.connect(audioCtx.destination);
  music = new Music(keys);
}

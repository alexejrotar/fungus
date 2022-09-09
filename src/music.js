const TEMPO = 400;
const scales = [
        makeScale([0, 3, 7], 2, 2),
        makeScale([0, 2, 3, 5, 7, 8, 11], 3, 2)
      ];

let playing = false;
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const gain = ctx.createGain();
gain.connect(ctx.destination);
const merger = ctx.createChannelMerger(scales.length);
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
    // this.osc.frequency.setValueAtTime(this.randomNote(), ctx.currentTime);
    this.index = 0;
  }

  start() {
    this.osc.start();
    gain.gain.setValueAtTime(1 / 4, ctx.currentTime);
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

const music = new Music(scales);

function toggleMusic(event) {
    playing ? music.off() : music.on();
    event.target.textContent = playing ? "Music On" : "Music Off";
    playing = !playing;
}

function makeScale(notes, octave, range = 1) {
  const a0 = 27.5;
  const chromatic = Array.from({length: 12 * range}, (_, i) => a0 * 2**(i/12));
  return chromatic
    .filter((_, i) => notes.includes(i % 12))
    .map(note => note * 2**octave);
}

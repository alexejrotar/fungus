const channels = 5;
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const merger = ctx.createChannelMerger(channels);
merger.connect(ctx.destination);

class Music {
  constructor() {
    this.oscillators = [];
    this.createOscillators(channels);
  }

  createOscillators(number) {
    for (let i = 0; i < number; i++) {
      this.oscillators.push(new Oscillator(i));
    }
  }

  on() {
    this.oscillators.forEach((osc) => {
      osc.start();
    });
  }

  off() {
    this.oscillators.forEach((osc) => {
      osc.start();
    });
  }
}

class Oscillator {
  constructor(channel) {
    this.osc = ctx.createOscillator();
    this.osc.connect(merger, 0, channel);
  }

  start() {
    this.osc.frequency.setValueAtTime(randomFrequency(), ctx.currentTime);
    this.osc.start();
    this.interval = setInterval(() => {
      this.osc.frequency.setValueAtTime(randomFrequency(), ctx.currentTime);
    }, Math.random() * 700 + 300);
  }

  stop() {
    this.osc.stop();
    clearInterval(this.interval);
  }
}

function randomFrequency() {
  return Math.random() * 300 + 200;
}

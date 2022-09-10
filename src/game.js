class Game {
  constructor(levelDescriptions) {
    this.levelDescriptions = levelDescriptions;
    this.currentLevel = undefined;
    this.levelIndex = localStorage.getItem("levelIndex") ?? 0;
    introBox.addEventListener("click", () => introBox.classList.add("closed"));
  }

  start() {
    this.nextLevel();
    window.setInterval(() => this.render(), 20);
  }

  nextLevel() {
    if (this.levelIndex >= this.levelDescriptions.length) return;
    this.levelIndex++;

    if (music) {
      music.modulate();
    }

    this.resetLevel();
  }

  resetLevel() {
    localStorage.setItem("levelIndex", this.levelIndex - 1);
    const desc = this.levelDescriptions[this.levelIndex - 1];
    if (desc.t !== undefined) {
      introBox.innerHTML = desc.t;
      introBox.classList.remove("closed");
    }

    const molecules = desc.m.map((m) => DraggableMolecule.from(m));
    this.currentLevel = new Level(molecules, () => this.nextLevel());
  }

  resetGame() {
    this.levelIndex = 1;
    this.resetLevel();
  }

  render() {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    this.currentLevel.render(ctx);
  }
}

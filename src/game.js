class Game {
    constructor(grid, levelDescriptions, canvas, introWrapper) {
        this.canvas = canvas;
        this.levelDescriptions = levelDescriptions;
        this.introWrapper = introWrapper;
        this.currentLevel = undefined;
        this.levelIndex = localStorage.getItem("levelIndex") ?? 0;
        this.grid = grid;
        this.reactive = new ReactiveGrid(canvas, grid);
        introWrapper.addEventListener("click", () => introWrapper.classList.add("closed"));
    }

    start() {
        this.nextLevel();
        window.setInterval(() => this.render(), 20)
    }

    nextLevel() {
        if (this.levelIndex >= this.levelDescriptions.length) return;
        this.levelIndex++;
        this.resetLevel();
    }

    resetLevel() {
        localStorage.setItem("levelIndex", this.levelIndex - 1);
        const desc = this.levelDescriptions[this.levelIndex - 1];
        if (desc.t !== undefined) {
            this.introWrapper.innerHTML = desc.t;
            this.introWrapper.classList.remove("closed");
        }

        const molecules = desc.m.map(m => DraggableMolecule.from(m, this.grid));
        this.currentLevel = new Level(this.grid, molecules, this.reactive, () => this.nextLevel());
    }

    resetGame() {
        this.levelIndex = 1;
        this.resetLevel();
    }

    render() {
        const ctx = this.canvas.getContext("2d");
        ctx.save();
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
        this.currentLevel.render(ctx);
    }
}
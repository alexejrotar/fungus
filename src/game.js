class Game {
    constructor(levelDescriptions, canvas, introWrapper) {
        this.canvas = canvas;
        this.levelDescriptions = levelDescriptions;
        this.introWrapper = introWrapper;
        this.currentLevel = undefined;
        this.reactive = new ReactiveGrid(canvas);
        introWrapper.addEventListener("click", () => introWrapper.classList.add("closed"));
    }

    start() {
        this.nextLevel();
        window.setInterval(() => this.render(), 20)
    }

    nextLevel() {
        if (this.levelDescriptions.length === 0) return;
        const desc = this.levelDescriptions.shift();
        const { g, m } = desc;
        if (desc.t !== undefined) {
            this.introWrapper.innerHTML = desc.t;
            this.introWrapper.classList.remove("closed");
        }

        let grid = Grid.from(g);
        const molecules = m.map(m => DraggableMolecule.from(m, grid));
        this.reactive.setGrid(grid);

        this.currentLevel = new Level(grid, molecules, this.reactive, () => this.nextLevel());
    }

    render() {
        const ctx = this.canvas.getContext("2d");
        ctx.save();
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
        this.currentLevel?.render(ctx);
    }
}
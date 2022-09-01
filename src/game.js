class Game {
    constructor(levelDescriptions, canvas, introWrapper) {
        this.canvas = canvas;
        this.levelDescriptions = levelDescriptions;
        this.introWrapper = introWrapper;
        this.currentLevel = undefined;
        this.introText = "";
    }

    start() {
        this.nextLevel();
        this.introWrapper.addEventListener("click", () => this.closeIntro());
        window.setInterval(() => this.render(), 10)
    }

    nextLevel() {
        if (this.levelDescriptions.length === 0) return;
        const { g, m, t } = this.levelDescriptions.shift();
        this.introWrapper.innerHTML = t;
        this.introWrapper.classList.remove("closed");

        let grid = Grid.from(g);
        const molecules = DraggableMolecule.from(m, grid);

        this.currentLevel = new Level(new ReactiveGrid(grid, this.canvas), molecules, this.nextLevel.bind(this));
    }

    closeIntro() {
        this.introWrapper.classList.add("closed");
    }

    render() {
        if (!this.currentLevel) return;
        const ctx = this.canvas.getContext("2d");
        ctx.save();
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
        this.currentLevel.render(ctx);
    }
}
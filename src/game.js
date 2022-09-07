class Game {
    constructor(levelDescriptions, canvas, introWrapper) {
        this.canvas = canvas;
        this.levelDescriptions = levelDescriptions;
        this.introWrapper = introWrapper;
        this.currentLevel = undefined;
    }

    start() {
        this.nextLevel();
        this.introWrapper.addEventListener("click", () => this.closeIntro());
        window.setInterval(() => this.render(), 20)
    }

    nextLevel() {
        if (this.levelDescriptions.length === 0) return;
        const desc = this.levelDescriptions.shift();
        const { g, m } = desc;
        if (desc.t !== undefined) {
            this.introWrapper.innerHTML = desc.t;
            this.introWrapper.classList.remove("closed");
            console.log(desc.t);
        }

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
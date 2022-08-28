class Game {
    constructor(levelDescriptions, canvas) {
        this.canvas = canvas;
        this.levelDescriptions = levelDescriptions;
        this.currentLevel = undefined;
    }

    start() {
        this.nextLevel();
        window.setInterval(() => this.render(), 10)
    }

    nextLevel() {
        if (this.levelDescriptions.length === 0) return;
        const { g, m } = this.levelDescriptions.shift();

        let grid = new Grid(g.r, new Cartesian(g.c.x, g.c.y), g.s, "#777");
        grid = new ReactiveGrid(grid, canvas);

        const molecules = m.map(({ s, c }) => {
            const shape = s.map(pos => new Part(new Position(...pos)));
            const molecule = new Molecule(shape, grid, c);
            return new DraggableMolecule(molecule);
        })

        this.currentLevel = new Level(grid, molecules, this.nextLevel.bind(this));
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
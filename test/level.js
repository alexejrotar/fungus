{
    const runner = new VisualTestRunner(500, 300);

    runner.test("a level with multiple draggable molecules", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid(canvas);
        const molecules = [];
        const level = new Level(grid, molecules);
        
        level.molecules.push(defaultMolecule(grid, level))
        level.molecules.push(defaultMolecule(grid, level).moveTo({ row: 0, col: 0 }, { row: 0, col: 3 }));
        window.setInterval(() => {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, 500, 300);
            ctx.restore();
            level.render(ctx);
        }, 100)
    })

    function defaultGrid(canvas) {
        return new ReactiveGrid(new ColoredGrid(
            new RenderedGrid(new Grid(30, 4, 10)),
            "#ddd"
        ), canvas);
    }

    function defaultMolecule(grid, level) {
        return new DraggableMolecule(
            new RenderedMolecule(
                new Molecule(defaultShape(), grid)
            ), grid, level);
    }

    function defaultShape() {
        return [
            { row: 0, col: 0 },
            { row: 1, col: 0, sides: [0, 5] },
            { row: 2, col: 0 },
            { row: 0, col: 1, sides: [4, 5] }
        ];
    }
    runner.run();
}
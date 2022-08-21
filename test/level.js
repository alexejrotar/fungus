{
    const runner = new VisualTestRunner(500, 300);

    runner.test("a level with multiple draggable molecules", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid(canvas);
        const molecules = [];
        const level = new Level(grid, molecules);
        
        level.molecules.push(new DraggableMolecule(defaultMolecule(grid, level).moveTo(new Transform(new Position(0, 0), new Position(0, 3))), level));
        level.molecules.push(new DraggableMolecule(defaultMolecule(grid, level).moveTo(new Transform(new Position(0, 0), new Position(0, 1))), level));
        window.setInterval(() => {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, 500, 300);
            ctx.restore();
            level.render(ctx);
        }, 100)
    })

    function defaultGrid(canvas) {
        return new ReactiveGrid(new Grid(30, new Position(4, 10),"#ddd"), canvas);
    }

    function defaultMolecule(grid, level) {
        return new Molecule(defaultShape(), grid);
    }

    function defaultShape() {
        return [
            new Part(new Position(0, 0)),
            new Part(new Position(1, 0), [0, 5]),
            new Part(new Position(2, 0)),
            new Part(new Position(0, 1), [4, 5])
        ];
    }
    runner.run();
}
{
    const runner = new VisualTestRunner(800, 800);

    runner.test("a level with multiple draggable molecules", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid(canvas);
        const molecules = [];
        const level = new Level(grid, molecules);
        
        // level.molecules.push(new DraggableMolecule((new MoleculeTypeA(grid)).moveTo(new Transform(new Position(0, 0, 0), new Position(2, 0, 2)))));
        level.molecules.push(new DraggableMolecule(new MoleculeTypeA(grid)));
        window.setInterval(() => {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, 800, 800);
            ctx.restore();
            level.render(ctx);
        }, 100)
    })

    function defaultGrid(canvas) {
        return new ReactiveGrid(new Grid(30, 300, 300, 6, "#555"), canvas);
    }

    runner.run();
}
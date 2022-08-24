{
    const runner = new VisualTestRunner(500, 300);

    runner.test("a level with multiple draggable molecules", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid(canvas);
        const molecules = [];
        const level = new Level(grid, molecules);
        
        level.molecules.push(new DraggableMolecule((new MoleculeTypeA(grid)).moveTo(new Transform(new Position(0, 0), new Position(0, 3)))));
        level.molecules.push(new DraggableMolecule((new MoleculeTypeA(grid)).moveTo(new Transform(new Position(0, 0), new Position(0, 1)))));
        window.setInterval(() => {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, 500, 300);
            ctx.restore();
            level.render(ctx);
        }, 100)
    })

    function defaultGrid(canvas) {
        return new ReactiveGrid(new Grid(30, new Position(4, 10),"#555"), canvas);
    }

    runner.run();
}
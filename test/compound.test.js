{
    const runner = new VisualTestRunner(800, 500);

    runner.test("a simple compound", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid(canvas);
        const compound = new Compound([
            new MoleculeTypeA(grid),
            new MoleculeTypeA(grid).moveTo(new Transform(new Position(0,0), new Position(1,1)))
        ]);
        grid.render(ctx);
        compound.render(ctx);
    })

    function defaultGrid(canvas) {
        return new ReactiveGrid(new Grid(30, new Position(8, 15),"#ddd"), canvas);
    }

    runner.run();
}
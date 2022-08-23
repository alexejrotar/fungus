{
    const runner = new VisualTestRunner(800, 500);

    runner.test("a corpse", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid(canvas);
        const level = new Level(grid);

        level.corpses.push(new Corpse([
            new MoleculeTypeA(grid).moveTo(new Transform(new Position(0, 0), new Position(2, 5))),
            new MoleculeTypeA(grid).moveTo(new Transform(new Position(0, 0), new Position(4, 6)))
        ]));

        window.setInterval(() => {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, 800, 500);
            ctx.restore();
            level.render(ctx);
        }, 100)
    })

    function defaultGrid(canvas) {
        return new ReactiveGrid(new Grid(30, new Position(8, 15),"#888"), canvas);
    }

    runner.run();
}
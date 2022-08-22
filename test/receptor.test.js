{
    const runner = new VisualTestRunner(800, 500);

    runner.test("a simple receptor", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid(canvas);
        const level = new Level(grid);
        level.molecules.push(new DraggableMolecule((new MoleculeTypeA(grid)).moveTo(new Transform(new Position(0, 0), new Position(0, 3))), level));
        level.molecules.push(new DraggableMolecule((new MoleculeTypeA(grid)).moveTo(new Transform(new Position(0, 0), new Position(0, 1))), level));

        level.receptors.push(new Receptor([
            new MoleculeTypeA(grid).moveTo(new Transform(new Position(0, 0), new Position(2, 5))),
            new MoleculeTypeA(grid).moveTo(new Transform(new Position(0, 0), new Position(4, 6)))
        ]));

        window.setInterval(() => {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, 500, 300);
            ctx.restore();
            level.render(ctx);
        }, 100)
    })

    function defaultGrid(canvas) {
        return new ReactiveGrid(new Grid(30, new Position(8, 15),"#ddd"), canvas);
    }

    runner.run();
}
{
    const runner = new VisualTestRunner(500, 300);

    runner.test("a molecule", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid();
        const molecule = new RenderedMolecule(new Molecule(defaultShape(), grid));
        grid.render(ctx);
        molecule.render(ctx);
    })

    runner.test("a moved molecule", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid();
        const molecule = new RenderedMolecule(new Molecule(defaultShape(), grid, { source: { row: 0, col: 0 }, target: { row: 0, col: 1 } }));
        grid.render(ctx);
        molecule.render(ctx);
    })

    // runner.test("a draggable molecule", (canvas) => {
    //     const ctx = canvas.getContext("2d");
    //     const grid = new ReactiveGrid(defaultGrid(), canvas);
    //     const molecule =
    //         new DraggableMolecule(
    //             new RenderedMolecule(
    //                 new Molecule(defaultShape(), grid).moveTo({ row: 0, col: 0 }, { row: 0, col: 3 })
    //             ), grid);
    //     window.setInterval(() => {
    //         ctx.save()
    //         ctx.fillStyle = "white";
    //         ctx.fillRect(0, 0, 500, 300);
    //         ctx.restore()
    //         grid.render(ctx);
    //         molecule.render(ctx);
    //     }, 100)
    // })

    runner.run();

    function defaultGrid() {
        return new ColoredGrid(
            new RenderedGrid(new Grid(30, 4, 10)),
            "#ddd"
        );
    }

    function defaultShape() {
        return [
            { row: 0, col: 0 },
            { row: 1, col: 0, sides: [0, 5] },
            { row: 2, col: 0 },
            { row: 0, col: 1, sides: [4, 5] }
        ];
    }
}
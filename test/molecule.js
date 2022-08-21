{
    const runner = new VisualTestRunner(500, 300);

    runner.test("a molecule", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid();
        const molecule = new Molecule(defaultShape(), grid);
        grid.render(ctx);
        molecule.render(ctx);
    })

    runner.test("a moved molecule", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid();
        const molecule = new Molecule(defaultShape(), grid).moveTo(new Transform(new GridPosition(0, 0), new GridPosition(0, 1)));
        grid.render(ctx);
        molecule.render(ctx);
    })

    runner.run();

    function defaultGrid() {
        return new Grid(30, new GridPosition(4, 10), "#ddd");
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
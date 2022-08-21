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
        const molecule = new Molecule(defaultShape(), grid).moveTo(new Transform(new Position(0, 0), new Position(0, 1)));
        grid.render(ctx);
        molecule.render(ctx);
    })

    runner.run();

    function defaultGrid() {
        return new Grid(30, new Position(4, 10), "#ddd");
    }

    function defaultShape() {
        return [
            new Part(new Position(0, 0)),
            new Part(new Position(1, 0), [0, 5]),
            new Part(new Position(2, 0)),
            new Part(new Position(0, 1), [4, 5])
        ];
    }
}
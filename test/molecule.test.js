class MoleculeTypeA extends Molecule {
    constructor(grid, color = "#0aa") {
        const shape = [
            new Position(0, 0, 0),
            new Position(1, 0, 0),
            new Position(2, 0, 0),
            new Position(0, 1, 0)
        ]

        super(shape, grid, color);
    }
}

{
    const runner = new VisualTestRunner(500, 500);

    runner.test("a molecule", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid();
        const molecule = new MoleculeTypeA(grid);
        grid.render(ctx);
        molecule.render(ctx);
    })

    runner.test("a moved molecule", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = defaultGrid();
        const molecule = (new MoleculeTypeA(grid)).transform(new Transform(new Transpose(new Position(0, 0, 0), new Position(0, 1, 0))));
        grid.render(ctx);
        molecule.render(ctx);
    })


    for (let rotation = 1; rotation < 6; rotation++) {
        runner.test(`a ${rotation} rotated molecule`, (canvas) => {
            const ctx = canvas.getContext("2d");
            const grid = defaultGrid();
            const molecule = (new MoleculeTypeA(grid)).transform(new Transform(new Rotation(new Position(0, 0, 0), rotation)));
            grid.render(ctx);
            molecule.render(ctx);
        })
    }

    runner.run();

    function defaultGrid() {
        return new Grid(30, new Vector(200, 200), 5, "#ddd");
    }
}

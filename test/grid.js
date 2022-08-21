{

    const runner = new VisualTestRunner(500, 300);

    runner.test("a hexagon", (canvas) => {
        const ctx = canvas.getContext("2d");
        const hexagon = new RenderedHexagon(new Hexagon(50, 50, 50));
        hexagon.render(ctx);
    })

    runner.test("a colored hexagon", (canvas) => {
        const ctx = canvas.getContext("2d");
        const hexagon = new RenderedHexagon(new Hexagon(50, 50, 50), "#ddd");
        hexagon.render(ctx);
    })

    runner.test("a partial hexagon", (canvas) => {
        const ctx = canvas.getContext("2d");
        const hexagon = new RenderedHexagon(new PartialHexagon(
            new Hexagon(50, 50, 50),
            [0, 1, 2]
        ));
        hexagon.render(ctx);

    })

    runner.test("a hexagon at 2, 2", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = new Grid(50, 5, 5);
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const hexagon = new RenderedHexagon(grid.getHexagon(new GridPosition(row, col)), "#ddd");
                hexagon.render(ctx);
            }
        }
        const hexagon = new RenderedHexagon(grid.getHexagon(new GridPosition(2, 2)));
        hexagon.render(ctx);

    })


    runner.test("a 4x5 grid", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = new Grid(30, new GridPosition(4, 5));
        grid.render(ctx);
    })

    runner.test("a colored grid", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = new Grid(30, new GridPosition(4, 5), "#ddd");
        grid.render(ctx);
    })

    runner.test("a reactive grid", (canvas) => {
        const ctx = canvas.getContext("2d");
        let grid =
            new ReactiveGrid(
                new Grid(30, new GridPosition(4, 10)),
                canvas
            );
        grid = grid
            .withMousedownListener(({ row, col }) => console.log(`clicked at ${row}, ${col}`))
            .withMousemoveListener(({ row, col }) => console.log(`moved to ${row}, ${col}`))
            .withMouseupListener(({ row, col }) => console.log(`released at ${row}, ${col}`));
        grid.render(ctx);
    })

    runner.run();
}
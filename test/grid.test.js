{

    const runner = new VisualTestRunner(500, 500);

    runner.test("a hexagon", (canvas) => {
        const ctx = canvas.getContext("2d");
        const hexagon = new RenderedHexagon(new Hexagon(50, new Cartesian(50, 50)));
        hexagon.render(ctx);
    })

    runner.test("a colored hexagon", (canvas) => {
        const ctx = canvas.getContext("2d");
        const hexagon = new RenderedHexagon(new Hexagon(50, new Cartesian(50, 50)), "#ddd");
        hexagon.render(ctx);
    })

    runner.test("a partial hexagon", (canvas) => {
        const ctx = canvas.getContext("2d");
        const hexagon = new RenderedHexagon(new PartialHexagon(
            new Hexagon(50, new Cartesian(50, 50)),
            [0, 1, 2]
        ));
        hexagon.render(ctx);

    })

    runner.test("a simple grid", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = new Grid(30, new Cartesian(200, 200), 5);
        grid.render(ctx);
    })

    runner.test("a reactive grid", (canvas) => {
        const ctx = canvas.getContext("2d");
        let grid =
            new ReactiveGrid(
                new Grid(30, new Cartesian(200, 200), 5),
                canvas
            );
        grid = grid
            .withMousedownListener((position) => console.log(`clicked at ${position.coordinates}`))
            .withMousemoveListener((position) => console.log(`moved to ${position.coordinates}`))
            .withMouseupListener((position) => console.log(`released at ${position.coordinates}`));
        grid.render(ctx);
    })

    runner.run();
}
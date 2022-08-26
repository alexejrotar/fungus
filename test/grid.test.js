{

    const runner = new VisualTestRunner(500, 500);

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

    runner.test("a simple grid", (canvas) => {
        const ctx = canvas.getContext("2d");
        const grid = new Grid(30, 200, 200, 5);
        grid.render(ctx);
    })


    // runner.test("a hexagon at 2, 2", (canvas) => {
    //     const ctx = canvas.getContext("2d");
    //     const grid = new Grid(50, 5, 5);
    //     for (let row = 0; row < 2; row++) {
    //         for (let col = 0; col < 2; col++) {
    //             const hexagon = new RenderedHexagon(grid.getHexagon(new Position(row, col)), "#ddd");
    //             hexagon.render(ctx);
    //         }
    //     }
    //     const hexagon = new RenderedHexagon(grid.getHexagon(new Position(2, 2)));
    //     hexagon.render(ctx);

    // })


    // runner.test("a 4x5 grid", (canvas) => {
    //     const ctx = canvas.getContext("2d");
    //     const grid = new Grid(30, new Position(4, 5));
    //     grid.render(ctx);
    // })

    // runner.test("a colored grid", (canvas) => {
    //     const ctx = canvas.getContext("2d");
    //     const grid = new Grid(30, new Position(4, 5), "#ddd");
    //     grid.render(ctx);
    // })

    runner.test("a reactive grid", (canvas) => {
        const ctx = canvas.getContext("2d");
        let grid =
            new ReactiveGrid(
                new Grid(30, 200, 200, 5),
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
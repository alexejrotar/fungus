const runner = new VisualTestRunner();

runner.test("hexagon at 0, 0", (canvas) => {
    const ctx = canvas.getContext("2d");
    const renderer = new Renderer(ctx, 50);
    renderer.hexagon(0, 0);
})

runner.test("gray hexagon", (canvas) => {
    const ctx = canvas.getContext("2d");
    const renderer = new Renderer(ctx, 50);
    renderer.hexagon(0, 0, "#ddd");
})

runner.test("hexagon at 0, 1", (canvas) => {
    const ctx = canvas.getContext("2d");
    const renderer = new Renderer(ctx, 50);
    renderer.hexagon(0, 0, "#ddd");
    renderer.hexagon(0, 1);
})

runner.test("hexagon at 1,2", (canvas) => {
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const renderer = new Renderer(ctx, 50);
    for (let column = 0; column < 3; column++) {
        renderer.hexagon(0, column, "#ddd");
    }
    renderer.hexagon(1, 2);
})

runner.test("grid of size 4, 5", (canvas) => {
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    const renderer = new Renderer(ctx, 50);
    renderer.grid(4, 5);
})

runner.run();
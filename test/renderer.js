const runner = new VisualTestRunner();

runner.test("green square", (ctx) => {
    ctx.fillStyle = "green";
    ctx.fillRect(10, 10, 50, 50);
})

runner.run();
{
    const runner = new VisualTestRunner(500, 300);

    runner.test("a molecule at 0, 0", (canvas) => {
        const ctx = canvas.getContext("2d");
        const molecule = Molecule.variant1();
        const renderer = new Renderer(ctx, 30);
        renderer.grid(5, 7, "#ddd");
        renderer.molecule(molecule);
    })

    runner.test("a molecule at 2, 2", (canvas) => {
        const ctx = canvas.getContext("2d");
        const renderer = new Renderer(ctx, 30);
        const molecule = Molecule.variant1(2, 2);
        renderer.grid(5, 7, "#ddd");
        renderer.molecule(molecule);
    })

    runner.run();
}

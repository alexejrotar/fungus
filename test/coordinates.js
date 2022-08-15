const runner = new TestRunner();

runner.test("passing test", () => {
    console.log("this should pass");
})

runner.test("failing example", () => {
    throw new Error("this must fail");
})

runner.run();
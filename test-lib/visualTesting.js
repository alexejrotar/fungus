class VisualTestRunner {
    constructor() {
        this.tests = {};
    }

    test(name, testCode) {
        this.tests[name] = testCode;
    }

    run() {
        const testOutput = document.getElementById("test-output");
        Object.entries(this.tests).forEach(([name, testCode]) => {
            const nameElement = document.createElement("p");
            nameElement.textContent = name;
            testOutput.appendChild(nameElement);

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            testOutput.appendChild(canvas);
            testCode.call(null, ctx);
        })
    }
}
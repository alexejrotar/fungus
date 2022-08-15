class VisualTestRunner {
    constructor(width = 300, height = 150) {
        this.tests = {};
        this.width = width;
        this.height = height;
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
            canvas.width = this.width;
            canvas.height = this.height;
            testOutput.appendChild(canvas);
            testCode.call(null, canvas);
        })
    }
}
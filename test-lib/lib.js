class TestRunner {
    constructor() {
        this.tests = {};
    }

    test(name, testCode) {
        this.tests[name] = testCode;
    }

    run() {
        Object.entries(this.tests).forEach(([name, testCode]) => {
            const testOutput = document.getElementById("test-output");
            const content = document.createElement("p");
            content.textContent = name;
            let output = "passed";
            try {
                testCode.call();
            } catch (e) {
                output = `failed: ${e}`;
            }
            content.textContent += `: ${output}`;
            testOutput.appendChild(content);
        })
    }
}
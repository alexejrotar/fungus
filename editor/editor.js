class Editor {
    constructor(grid, canvas, outputContainer, molecules = []) {
        this.canvas = canvas;
        this.molecules = molecules;
        this.drawing = false;
        this.selectedIndex = 0;
        this.deleteMode = false;

        this.outputContainer = outputContainer;
        this.grid = grid;
        (new ReactiveGrid(canvas, grid)).setListeners({
            mousedown: this.handleMousedown.bind(this),
            mousemove: this.handleMousemove.bind(this),
            mouseup: this.handleMouseup.bind(this),
            left: this.handleLeft.bind(this),
            right: this.handleRight.bind(this),
            special: () => this.deleteMode = !this.deleteMode
        });
        this.updateOutput();

        this.outputContainer.addEventListener("input", () => this.handleInput())
        const shareButton = document.getElementById("share");
        shareButton.addEventListener("click", () => this.share());

        const colorInput = document.getElementById("color");
        colorInput.addEventListener("change", () => {
            if (this.selectedIndex < this.molecules.length) {
                this.molecules[this.selectedIndex].color = colorInput.value;
            }
        })
    }

    handleMousedown(position) {
        let molecule = this.molecules.find(molecule => molecule.isAt(position));

        if (molecule !== undefined) {
            if (this.selectedIndex < this.molecules.length && this.molecules[this.selectedIndex] === molecule) {
                molecule.shape = molecule.shape.filter(other => !other.equals(position));
            } else if (this.deleteMode) {
                this.molecules = this.molecules.filter(other => other !== molecule);
                this.selectedIndex = this.molecules.length;
            }

        } else if (this.selectedIndex < this.molecules.length) {
            this.drawing = true;
            this.molecules[this.selectedIndex].shape.push(position);
        } else {
            molecule = new HighlightedMolecule([position], this.grid, randomColor());
            this.molecules.push(molecule);
            this.selectedIndex = this.molecules.length - 1;
            this.drawing = true;
        }
        this.updateOutput();
    }

    handleMousemove(position) {
        if (!this.drawing) return;
        if (this.molecules.some(molecule => molecule.isAt(position))) return;
        this.molecules[this.selectedIndex].shape.push(position);
        this.updateOutput();
    }

    handleMouseup() {
        this.drawing = false;
        this.updateOutput();
    }

    updateOutput() {
        this.molecules = this.molecules.filter(molecule => molecule.shape.length > 0);
        const output = {
            m: this.molecules.map(molecule => molecule.output()),
        };
        this.outputContainer.innerHTML = JSON.stringify(output);
    }

    handleInput() {
        try {
            const { m } = JSON.parse(this.outputContainer.innerHTML.replaceAll(/\s/g, ""));

            this.molecules = m.map(m => Molecule.from(m, this.grid));
            this.selectedIndex = this.molecules.length;
        } catch (e) {
            console.warn(e);
        }
    }

    handleLeft() {
        if (this.selectedIndex < this.molecules.length) {
            this.molecules[this.selectedIndex] = this.molecules[this.selectedIndex].unhighlighted()
        }
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        if (this.selectedIndex < this.molecules.length) {
            this.molecules[this.selectedIndex] = this.molecules[this.selectedIndex].highlighted();
        }
    }
    handleRight() {
        if (this.selectedIndex < this.molecules.length) {
            this.molecules[this.selectedIndex] = this.molecules[this.selectedIndex].unhighlighted()
        }
        this.selectedIndex = Math.min(this.molecules.length, this.selectedIndex + 1);
        if (this.selectedIndex < this.molecules.length) {
            this.molecules[this.selectedIndex] = this.molecules[this.selectedIndex].highlighted();
        }
    }
    share() {
        const output = {
            m: this.molecules.map(molecule => molecule.output()),
        };
        const json = JSON.stringify(output);
        const b64 = window.btoa(json);
        navigator.clipboard.writeText(b64);
    }

    start() {
        window.setInterval(() => this.render(), 10);
    }

    render() {
        const ctx = this.canvas.getContext("2d");
        ctx.save();
        ctx.fillStyle = this.deleteMode ? "#322" : "#222";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
        this.grid.render(ctx);
        this.molecules.forEach(molecule => molecule.render(ctx));
    }
}

function startEditor() {
    const canvas = document.getElementById("canvas");
    const outputArea = document.getElementById("output");
    const grid = new Grid(15, new Vector(canvas.width / 2, canvas.height / 2), 15, "#777");
    const b64 = new URLSearchParams(window.location.search).get("level");
    let molecules = [];
    if (b64) {
        const json = window.atob(b64);
        const { m } = JSON.parse(json);
        molecules = m.map(m => Molecule.from(m, grid));
    }
    const editor = new Editor(grid, canvas, outputArea, molecules);
    editor.start();
}

function randomColor() {
    const random = (lower, upper) => Math.floor(Math.random() * (upper - lower)) + lower;
    const red = random(100, 256);
    const green = random(100, 256);
    const blue = random(100, 256);
    return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;
}
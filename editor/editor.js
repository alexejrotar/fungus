class Editor {
    constructor(grid, canvas, outputContainer, molecules = []) {
        this.canvas = canvas;
        this.molecules = molecules;
        this.drawing = false;
        this.selected = undefined;
        this.deleteSingle = false;
        this.outputContainer = outputContainer;
        this.grid = grid;
        (new ReactiveGrid(this.grid, canvas))
            .withListener("mousedown", this.handleMousedown.bind(this))
            .withListener("mousemove", this.handleMousemove.bind(this))
            .withListener("mouseup", this.handleMouseup.bind(this))
            .withListener("left", this.handleLeft.bind(this))
            .withListener("right", this.handleRight.bind(this));
        this.updateOutput();

        this.outputContainer.addEventListener("input", () => this.handleInput())
        const shareButton = document.getElementById("share");
        shareButton.addEventListener("click", () => this.share());
    }

    handleMousedown(position) {
        let molecule = this.molecules.find(molecule => molecule.isAt(position));

        if (molecule !== undefined) {
            if (!this.deleteSingle) {
                this.molecules = this.molecules.filter(other => other !== molecule);
                this.updateOutput();
            } else {
                molecule.shape = molecule.shape.filter(other => !other.equals(position));
            }

        } else if (this.selected !== undefined) {
            this.drawing = true;
        } else {
            molecule = new Molecule([position], this.grid, randomColor());
            this.molecules.push(molecule);
            this.selected = molecule;
            this.drawing = true;
        }
    }

    handleMousemove(position) {
        if (!this.drawing) return;
        if (this.molecules.some(molecule => molecule.isAt(position))) return;

        this.selected.shape.push(position);
    }

    handleMouseup() {
        this.drawing = false;
        this.selected = undefined;
        this.updateOutput();
    }

    updateOutput() {
        const output = {
            g: this.grid.output(),
            m: this.molecules.map(molecule => molecule.output()),
        };
        this.outputContainer.innerHTML = JSON.stringify(output);
    }

    handleInput() {
        try {
            const { g, m } = JSON.parse(this.outputContainer.innerHTML);
    
            let grid = Grid.from(g);
            this.molecules = Molecule.from(m, grid);
        } catch (e) {
            console.warn(e);
        }
    }

    handleLeft() {

        if (this.selected == undefined) {
            this.moleculeCounter = 1;
        } else {
            if (this.moleculeCounter < this.molecules.length) {
                this.moleculeCounter++;
            }

        }
        this.selected = this.molecules[this.molecules.length - this.moleculeCounter];
    }
    handleRight() {
        this.deleteSingle = !this.deleteSingle;
    }
    share() {
        const output = {
            g: this.grid.output(),
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
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
        this.grid.render(ctx);
        this.molecules.forEach(molecule => molecule.render(ctx));
    }
}

function startEditor() {
    const canvas = document.getElementById("canvas");
    const outputArea = document.getElementById("output");
    const grid = new Grid(15, new Vector(canvas.width / 2, canvas.height / 2), 15, "#666");
    const b64 = new URLSearchParams(window.location.search).get("description");
    let molecules = [];
    if (b64) {
        const json = window.atob(b64);
        const { m } = JSON.parse(json);
        molecules = Molecule.from(m, grid);
    }
    const editor = new Editor(grid, canvas, outputArea, molecules);
    editor.start();
}

function randomColor() {
    const random = (lower, upper) => Math.floor(Math.random() * (upper - lower)) + lower;
    const red = random(100, 256);
    const green = random(100, 256);
    const blue = random(100, 256);
    return `rgb(${red}, ${green}, ${blue})`;
}
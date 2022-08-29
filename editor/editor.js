class Editor {
    constructor(grid, canvas) {
        this.canvas = canvas;
        this.molecules = [];
        this.selected = undefined;
        this.lastPosition = undefined;
        this.grid = grid
            .withMousedownListener(this.handleMousedown.bind(this))
            .withMousemoveListener(this.handleMousemove.bind(this))
            .withMouseupListener(this.handleMouseup.bind(this));
        this.updateOutput();
    }

    handleMousedown(position) {
        let molecule = this.molecules.find(molecule => molecule.getPartAt(position) !== undefined);

        if (molecule !== undefined) {
            this.molecules = this.molecules.filter(other => other !== molecule);
            this.updateOutput();
        } else {
            molecule = new Molecule([new Part(position)], this.grid, randomColor());
            this.molecules.push(molecule);
            this.selected = molecule;
            this.lastPosition = position;
        }
    }

    handleMousemove(position) {
        if (this.selected === undefined) return;
        if (this.molecules.find(molecule => molecule.getPartAt(position) !== undefined) !== undefined) return;
        if (!this.lastPosition.isNeighbor(position)) return;

        this.selected.shape.push(new Part(position));
        this.lastPosition = position;
    }

    handleMouseup() {
        this.selected = undefined;
        this.updateOutput();
    }

    updateOutput() {
        const outputContainer = document.getElementById("output");
        const output = {
            g: this.grid.output(),
            m: this.molecules.map(molecule => molecule.output()),
        };
        outputContainer.innerHTML = JSON.stringify(output);
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
    const grid = new ReactiveGrid(new Grid(20, new Cartesian(canvas.width/2, canvas.height/2), 15, "#666"), canvas);
    const editor = new Editor(grid, canvas);
    editor.start();
}

function randomColor() {
    const random = (lower, upper) => Math.floor(Math.random() * (upper - lower)) + lower;
    const red = random(64, 256);
    const green = random(64, 256);
    const blue = random(64, 256);
    return `rgb(${red}, ${green}, ${blue})`;
}
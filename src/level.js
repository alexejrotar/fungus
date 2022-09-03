class Level {
    constructor(grid, molecules = [], completed = () => {}) {
        this.molecules = molecules;
        this.hints = [];
        this.color = "#222";
        this.completed = completed;
        this.grid = grid
            .withListener("mousedown", position => this.handleMousedown(position))
            .withListener("mousemove", position => this.handleMousemove(position))
            .withListener("mouseup", position => this.handleMouseup(position))
            .withListener("left", this.handleLeft.bind(this))
            .withListener("right", this.handleRight.bind(this));
    }

    isOccupied(molecules, position) {
        return molecules.some(molecule => molecule.isAt(position));
    }

    dissovle(molecule) {
        this.molecules = this.molecules.filter(other => other !== molecule);
        if (this.molecules.length === 0) this.completed();
    }

    hintAt(position) {
        this.hints.push(new Hint(position, this.expireHint.bind(this), this.grid.getHexagon.bind(this.grid)));
    }

    expireHint(hint) {
        this.hints = this.hints.filter(other => hint !== other);
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();

        this.grid.render(ctx);
        this.molecules.forEach(molecule => molecule.render(ctx));
        this.hints.forEach(hint => hint.render(ctx));
    }

    handleMousedown(position) {
        this.molecules.forEach(molecule => molecule.mousedown(position));
    }

    handleMousemove(position) {
        this.molecules.forEach(molecule => molecule.mousemoved(
            position,
            this.dissovle.bind(this),
            this.isOccupied.bind(this, this.molecules.filter(other => other !== molecule)),
            this.hintAt.bind(this),
        ));
    }

    handleMouseup(_) {
        this.molecules.forEach(molecule => molecule.mouseup());
    }

    handleLeft() {
        this.molecules.forEach(molecule => molecule.left(
            this.dissovle.bind(this),
            this.isOccupied.bind(this, this.molecules.filter(other => other !== molecule)),
            this.hintAt.bind(this),
        ));
    }

    handleRight() {
        this.molecules.forEach(molecule => molecule.right(
            this.dissovle.bind(this),
            this.isOccupied.bind(this, this.molecules.filter(other => other !== molecule)),
            this.hintAt.bind(this),
        ));
    }
}
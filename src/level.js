class Level {
    constructor(grid, molecules = [], completed = () => {}) {
        this.molecules = molecules;
        this.color = "#222";
        this.completed = completed;
        this.grid = grid
            .withListener("mousedown", position => this.handleMousedown(position))
            .withListener("mousemove", position => this.handleMousemove(position))
            .withListener("mouseup", position => this.handleMouseup(position))
            .withListener("left", this.handleLeft.bind(this))
            .withListener("right", this.handleRight.bind(this));
    }

    tryMove(source, target) {
        return !this.molecules.some(molecule => molecule !== source && molecule.overlaps(target))
    }

    dissovle(molecule) {
        this.molecules = this.molecules.filter(other => other !== molecule);
        if (this.molecules.length === 0) this.completed();
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();

        this.grid.render(ctx);
        this.molecules.forEach(molecule => molecule.render(ctx));
    }

    handleMousedown(position) {
        this.molecules.forEach(molecule => molecule.mousedown(position));
    }

    handleMousemove(position) {
        this.molecules.forEach(molecule => molecule.mousemoved(position, this.tryMove.bind(this), this.dissovle.bind(this)));
    }

    handleMouseup(_) {
        this.molecules.forEach(molecule => molecule.mouseup());
    }

    handleLeft() {
        this.molecules.forEach(molecule => molecule.left(this.tryMove.bind(this), this.dissovle.bind(this)));
    }

    handleRight() {
        this.molecules.forEach(molecule => molecule.right(this.tryMove.bind(this), this.dissovle.bind(this)));
    }
}
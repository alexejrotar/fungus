class Level {
    constructor(grid, molecules = []) {
        this.molecules = molecules;
        this.color = "#432";
        this.grid = grid
            .withMousedownListener(position => this.handleMousedown(position))
            .withMousemoveListener(position => this.handleMousemove(position))
            .withMouseupListener(position => this.handleMouseup(position));
    }

    tryMove(source, target) {
        return !this.molecules.some(molecule => molecule !== source && molecule.overlaps(target))
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
        this.molecules.forEach(molecule => molecule.mousemoved(position, this.tryMove.bind(this)));
    }

    handleMouseup(_) {
        this.molecules.forEach(molecule => molecule.mouseup(this.tryMove.bind(this)));
    }
}
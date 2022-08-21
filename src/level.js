// TODO make this decorate the grid
class Level {
    constructor(grid, molecules) {
        this.grid = grid;
        this.molecules = molecules;
    }

    tryMove(source, target) {
        return !this.molecules.some(molecule => molecule !== source && molecule.overlaps(target));
    }

    render(ctx) {
        this.grid.render(ctx);
        this.molecules.forEach(molecule => molecule.render(ctx));
    }

    withMousedownListener(callback) {
        this.grid = this.grid.withMousedownListener(callback);
        return this;
    }
    withMouseupListener(callback) {
        this.grid = this.grid.withMouseupListener(callback);
        return this;
    }
    withMousemoveListener(callback) {
        this.grid = this.grid.withMousemoveListener(callback);
        return this;
    }
}
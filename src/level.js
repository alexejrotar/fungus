// TODO register the events for the reactive grid instead of the molecules
class Level {
    constructor(grid, molecules = [], receptors = [], corpses = []) {
        this.molecules = molecules;
        this.receptors = receptors;
        this.corpses = corpses;
        this.color = "#432";
        this.grid = grid
            .withMousedownListener(position => this.handleMousedown(position));
    }

    tryMove(source, target) {
        if (this.molecules.some(molecule => molecule !== source && molecule.overlaps([target]))) {
            return false;
        }
        this.receptors = this.receptors
            .map(receptor => {
                const result = receptor.resolve(this.molecules);
                this.molecules = result.molecules;
                return result.receptor;
            })
            .filter(receptor => receptor !== undefined);
        return true;
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();

        this.grid.render(ctx);
        this.molecules.forEach(molecule => molecule.render(ctx));
        this.receptors.forEach(receptor => receptor.render(ctx));
        this.corpses.forEach(corpse => corpse.render(ctx));
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

    handleMousedown(position) {
        this.corpses.forEach(corpse => {
            const molecule = corpse.decompose(position);
            if (molecule) {
                this.molecules.push(new DraggableMolecule(molecule, this));
            }
        })
    }
}
class Level {
    constructor(grid, molecules = [], receptors = [], corpses = []) {
        this.molecules = molecules;
        this.receptors = receptors;
        this.corpses = corpses;
        this.color = "#432";
        this.grid = grid
            .withMousedownListener(position => this.handleMousedown(position))
            .withMousemoveListener(position => this.handleMousemove(position))
            .withMouseupListener(position => this.handleMouseup(position));
    }

    tryMove(source, target) {
        if (this.molecules.some(molecule => molecule !== source && molecule.overlaps([target]))) {
            return false;
        }
        // TODO not quite happy with this implementation..
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

    takeMolecule(molecule) {
        this.molecules.push(new DraggableMolecule(molecule));
    }

    handleMousedown(position) {
        this.corpses.forEach(corpse => corpse.mousedown(position, this.takeMolecule.bind(this)));
        this.molecules.forEach(molecule => molecule.mousedown(position));
    }

    handleMousemove(position) {
        this.molecules.forEach(molecule => molecule.mousemoved(position));
    }

    handleMouseup(_) {
        this.molecules.forEach(molecule => molecule.mouseup(this.tryMove.bind(this)));
    }
}
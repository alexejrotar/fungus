class Corpse {
    constructor(molecules) {
        this.molecules = molecules;
    }

    render(ctx) {
        this.molecules.forEach(molecule => molecule.render(ctx));
    }

    mousedown(position, take) {
        const decomposedMolecule = this.molecules.find(molecule => molecule.getPartAt(position) !== undefined);
        if (decomposedMolecule) {
            this.molecules = this.molecules.filter(molecule => molecule !== decomposedMolecule);
            take(decomposedMolecule);
        }
    }
}
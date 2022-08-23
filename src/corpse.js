class Corpse {
    constructor(molecules) {
        this.molecules = molecules;
    }

    render(ctx) {
        this.molecules.forEach(molecule => molecule.render(ctx));
    }

    decompose(position) {
        const decomposedMolecule = this.molecules.find(molecule => molecule.getPartAt(position) !== undefined);
        console.log(decomposedMolecule);
        this.molecules = this.molecules.filter(molecule => molecule !== decomposedMolecule);
        return decomposedMolecule;
    }
}
class Receptor {
    constructor(molecules) {
        this.molecules = molecules;
    }

    resolve(molecules) {
        const overlapping = molecules.filter(molecule => molecule.overlaps(this.molecules));

        if (overlapping.every(molecule => molecule.containedIn(this.molecules)) &&
            this.molecules.every(molecule => molecule.containedIn(overlapping))) {

            return { molecules: molecules.filter(molecule => !overlapping.includes(molecule)), receptor: undefined };
        }
        return { molecules, receptor: this };
    }

    render(ctx) {
        this.molecules.forEach(molecule => molecule.render(ctx));
    }
}
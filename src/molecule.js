class Molecule {
    constructor(shape, grid, color = "#000") {
        this.shape = shape;
        this.grid = grid;
        this.transform = new Transform(new Position(0, 0), new Position(0, 0));
        this.color = color;
    }

    getPartAt(position) {
        const part = this.shape.find(part => {
            const partPosition = part.getTransformedPosition(this.transform);
            return partPosition.equals(position);
        })
        if (part) {
            return part.getPosition();
        } else {
            return undefined;
        }
    }

    moveTo(transform) {
        const movedMolecule = this.copy();
        movedMolecule.transform = transform;

        if (!movedMolecule.shape.every(part => {
            const position = part.getTransformedPosition(movedMolecule.transform);
            return this.grid.isInside(position);
        })) {
            movedMolecule.transform = this.transform;
        }
        return movedMolecule;
    }

    overlaps(molecules) {
        return this.shape.some(part => {
            const position = part.getTransformedPosition(this.transform);
            return molecules.some(molecule => molecule.getPartAt(position) !== undefined)
        });
    }

    containedIn(molecules) {
        return this.shape.every(part => {
            const position = part.getTransformedPosition(this.transform);
            return molecules.some(molecule => molecule.getPartAt(position) !== undefined)
        });
    }

    render(ctx) {
        ctx.save();
        ctx.lineWidth = 3;
        this.shape.forEach(part => {
            const position = part.getTransformedPosition(this.transform);
            let hexagon = this.grid.getHexagon(position);
            if (part.sides) {
                hexagon = new PartialHexagon(hexagon, part.sides);
            }
            (new RenderedHexagon(hexagon, this.color, true)).render(ctx);
        })
        ctx.restore();
    }

    copy() {
        const molecule = new Molecule(this.shape.map(part => part.copy()), this.grid, this.color);
        molecule.transform = this.transform.copy();
        return molecule;
    }
}

class DraggableMolecule {
    constructor(molecule, level) {
        this.molecule = molecule;
        this.target = this.molecule.copy();
        this.selected = undefined;
        this.level = level
            .withMousedownListener((position) => {
                this.selected = this.molecule.getPartAt(position);
            })
            .withMousemoveListener((position) => {
                if (this.selected) {
                    this.target = this.target.moveTo(new Transform(this.selected, position));
                }
            })
            .withMouseupListener((_) => {
                if (this.selected) {
                    this.selected = undefined;
                    const previousMolecule = this.molecule;
                    this.molecule = this.target;
                    this.molecule = this.level.tryMove(this, this.molecule) ? this.molecule : previousMolecule;
                    this.target = this.molecule.copy();
                }
            });
    }

    render(ctx) {
        this.molecule.render(ctx);
        if (this.selected) {
            this.target.render(ctx);
        }
    }

    overlaps(molecules) {
        return this.molecule.overlaps(molecules);
    }

    containedIn(molecules) {
        return this.molecule.containedIn(molecules);
    }

    getPartAt(position) {
        return this.molecule.getPartAt(position);
    }
}

class Transform {
    constructor(source, target) {
        this.source = source;
        this.target = target;
    }

    offset() {
        return this.target.subtract(this.source);
    }

    copy() {
        return new Transform(this.source.copy(), this.target.copy());
    }
}

class Part {
    constructor(position, sides) {
        this.position = position;
        this.sides = sides;
    }

    getTransformedPosition(transform) {
        const offset = transform.offset();
        let correctedPosition = this.position.add(offset);
        if (offset.col % 2 === 1) {
            const rowCorrection = this.position.col % 2 - transform.source.col % 2;
            correctedPosition = correctedPosition.add(new Position(rowCorrection, 0));
        }
        return correctedPosition;
    }

    getPosition() {
        return this.position.copy();
    }

    copy() {
        return new Part(this.position.copy(), this.sides ? [...this.sides] : undefined);
    }
}

class MoleculeTypeA extends Molecule {
    constructor(grid, color = "#0aa") {
        const shape = [
                new Part(new Position(0, 0)),
                new Part(new Position(1, 0), [0, 5]),
                new Part(new Position(2, 0)),
                new Part(new Position(0, 1), [4, 5])
            ]

        super(shape, grid, color);
    }
}
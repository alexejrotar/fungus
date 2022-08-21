class Molecule {
    constructor(shape, grid) {
        this.shape = shape;
        this.grid = grid;
        this.transform = new Transform(new Position(0, 0), new Position(0, 0));
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
        const movedMolecule = new Molecule(this.shape, this.grid);
        movedMolecule.transform = transform;

        if (!movedMolecule.shape.every(part => {
            const position = part.getTransformedPosition(movedMolecule.transform);
            return this.grid.isInside(position);
        })) {
            movedMolecule.transform = this.transform;
        }
        return movedMolecule;
    }

    overlaps(molecule) {
        return this.shape.some(part => {
            const position = part.getTransformedPosition(this.transform);
            return molecule.getPartAt(position) !== undefined;
        });
    }

    render(ctx) {
        this.shape.forEach(part => {
            const position = part.getTransformedPosition(this.transform);
            let hexagon = this.grid.getHexagon(position);
            if (part.sides) {
                hexagon = new PartialHexagon(hexagon, part.sides);
            }
            (new RenderedHexagon(hexagon)).render(ctx);
        })
    }
}

class DraggableMolecule {
    constructor(molecule, level) {
        this.molecule = molecule;
        this.target = undefined;
        this.selected = undefined;
        this.level = level
            .withMousedownListener((position) => {
                this.selected = this.molecule.getPartAt(position);
            })
            .withMousemoveListener((position) => {
                if (this.selected) {
                    // TODO replace with this.target.moveTo
                    this.target = this.molecule.moveTo(new Transform(this.selected, position));
                }
            })
            .withMouseupListener((_) => {
                if (this.selected && this.target) {
                    this.selected = undefined
                    this.molecule = this.level.tryMove(this, this.target) ? this.target : this.molecule;
                    this.target = undefined;
                }
            });
    }

    render(ctx) {
        this.molecule.render(ctx);
        if (this.target) {
            this.target.render(ctx);
        }
    }

    overlaps(molecule) {
        return this.molecule.overlaps(molecule);
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
}
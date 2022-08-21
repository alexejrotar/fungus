// TODO make object for shape
// TODO make object for part of shape
class Molecule {
    constructor(shape, grid) {
        this.shape = shape;
        this.grid = grid;
        this.transform = new Transform(new GridPosition(0, 0), new GridPosition(0, 0));
    }

    getPartAt(gridPosition) {
        const part = this.shape.find(part => {
            const partCoordinates = this.getCorrectedCoordinates(new GridPosition(part.row, part.col));
            return partCoordinates.equals(gridPosition);
        })
        if (part) {
            return new GridPosition(part.row, part.col);
        } else {
            return undefined;
        }
    }

    getCorrectedCoordinates(gridPosition) {
        const offset = this.transform.getOffset();
        let correctedPosition = gridPosition.add(offset);
        if (offset.col % 2 === 1) {
            const rowCorrection = gridPosition.col % 2 - this.transform.source.col % 2;
            correctedPosition = correctedPosition.add(new GridPosition(rowCorrection, 0));
        }
        return correctedPosition;
    }

    moveTo(transform) {
        const movedMolecule = new Molecule(this.shape, this.grid);
        movedMolecule.transform = transform;

        if (!movedMolecule.shape.every(part => {
            const partCoordinates = movedMolecule.getCorrectedCoordinates(new GridPosition(part.row, part.col));
            return this.grid.isInside(partCoordinates);
        })) {
            movedMolecule.transform = this.transform;
        }
        return movedMolecule;
    }

    overlaps(molecule) {
        return this.shape.some(part => {
            const partCoordinates = this.getCorrectedCoordinates(new GridPosition(part.row, part.col));
            return molecule.getPartAt(partCoordinates) !== undefined;
        });
    }

    render(ctx) {
        this.shape.forEach(part => {
            const gridPosition = this.getCorrectedCoordinates(new GridPosition(part.row, part.col));
            let hexagon = this.grid.getHexagon(gridPosition);
            if (part.sides) {
                hexagon = new PartialHexagon(hexagon, part.sides);
            }
            (new RenderedHexagon(hexagon)).render(ctx);
        })
    }
}

class DraggableMolecule {
    constructor(molecule, grid, level) {
        this.molecule = molecule;
        this.target = undefined;
        this.selected = undefined;
        this.level = level;
        this.grid = grid
            .withMousedownListener((gridPosition) => {
                this.selected = this.molecule.getPartAt(gridPosition)
            })
            .withMousemoveListener((gridPosition) => {
                if (this.selected) {
                    // TODO replace with this.target.moveTo
                    this.target = this.molecule.moveTo(new Transform(this.selected, gridPosition));
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

    getOffset() {
        return this.target.subtract(this.source);
    }
}
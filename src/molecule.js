class Molecule {
    constructor(shape, grid, transform) {
        this.shape = shape;
        this.grid = grid;
        this.transform = transform;
    }

    getPartAt(row, col) {
        return this.shape.find(part => {
            const partCoordinates = this.getCorrectedCoordinates(part.row, part.col);
            return partCoordinates.row === row && partCoordinates.col === col;
        })
    }

    getCorrectedCoordinates(row, col) {
        let offset = { row: 0, col: 0 };
        if (this.transform) {
            offset = {
                row: this.transform.target.row - this.transform.source.row,
                col: this.transform.target.col - this.transform.source.col
            };
        }
        const correctedCol = col + offset.col;
        let correctedRow = row + offset.row;
        if (offset.col % 2 === 1) {
            const rowCorrection = col % 2 - this.transform.source.col % 2;
            correctedRow += rowCorrection;
        }
        return { row: correctedRow, col: correctedCol };
    }

    getHexagons() {
        return this.shape.map(part => {
            const { row, col } = this.getCorrectedCoordinates(part.row, part.col);
            let hexagon = this.grid.getHexagon(row, col);
            if (part.sides) {
                hexagon = new PartialHexagon(hexagon, part.sides);
            }
            return hexagon;
        })
    }

    moveTo(source, target) {
        return new Molecule(this.shape, this.grid, { source, target });
    }

    overlaps(molecule) {
        return this.shape.some(part => {
            const partCoordinates = this.getCorrectedCoordinates(part.row, part.col);
            return molecule.getPartAt(partCoordinates.row, partCoordinates.col) !== undefined;
        });
    }

}

class RenderedMolecule {
    constructor(molecule) {
        this.molecule = molecule;
    }

    getHexagons() {
        return this.molecule.getHexagons();
    }

    moveTo(source, target) {
        return new RenderedMolecule(this.molecule.moveTo(source, target));
    }

    getPartAt(row, col) {
        return this.molecule.getPartAt(row, col);
    }

    render(ctx) {
        this.molecule.getHexagons().forEach(hexagon => (new RenderedHexagon(hexagon)).render(ctx));
    }

    overlaps(molecule) {
        return this.molecule.overlaps(molecule);
    }
}

class ColoredMolecule {
    constructor(renderedMolecule, color) {
        this.molecule = renderedMolecule;
        this.color = color;
    }

    getHexagons() {
        return this.molecule.getHexagons();
    }

    moveTo(source, target) {
        return new ColoredMolecule(this.molecule.moveTo(source, target), this.color);
    }

    getPartAt(row, col) {
        return this.molecule.getPartAt(row, col);
    }

    render(ctx) {

    }
    overlaps(molecule) {
        return this.molecule.overlaps(molecule);
    }
}

class DraggableMolecule {
    constructor(molecule, grid, level) {
        this.molecule = molecule;
        this.target = undefined;
        this.selected = undefined;
        this.level = level;
        this.grid = grid
            .withMousedownListener(({ row, col }) => this.selected = this.molecule.getPartAt(row, col))
            .withMousemoveListener(({ row, col }) => {
                if (this.selected) {
                    this.target = this.molecule.moveTo(this.selected, { row, col });
                }
            })
            .withMouseupListener((_) => {
                if (this.selected) {
                    this.selected = undefined
                    this.molecule = this.level.tryMove(this, this.target)? this.target : this.molecule;
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

    getHexagons() {
        this.molecule.getHexagons();
    }

    getPartAt(row, col) {
        return this.molecule.getPartAt(row, col);
    }

    moveTo(source, target) {
        return new DraggableMolecule(this.molecule.moveTo(source, target), this.grid, this.level);
    }

    overlaps(molecule) {
        return this.molecule.overlaps(molecule);
    }
}
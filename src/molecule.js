class Molecule {
    constructor(shape, grid, transform) {
        this.shape = shape;
        this.grid = grid;
        this.transform = transform;
    }

    isAt(row, col) {
        return this.shape.some(part => part.row === row && part.col === col);
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

}

class RenderedMolecule {
    constructor(molecule) {
        this.molecule = molecule;
    }

    isAt(row, col) {
        return this.molecule.isAt(row, col);
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
}

class ColoredMolecule {
    constructor(renderedMolecule, color) {
        this.molecule = renderedMolecule;
        this.color = color;
    }

    isAt(row, col) {
        return this.molecule.isAt(row, col);
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
}

class DraggableMolecule {
    constructor(renderedMolecule, reactiveGrid) {
        this.molecule = renderedMolecule;
        this.selected = undefined;
        this.grid = reactiveGrid
            .withMousedownListener(({ row, col }) => this.selected = this.molecule.getPartAt(row, col))
            .withMousemoveListener(({ row, col }) => {
                if (this.selected) {
                    this.molecule = this.molecule.moveTo(this.selected, {row, col});
                }
            })
            .withMouseupListener((_) => this.selected = false);
    }

    isAt(row, col) {
        return this.molecule.isAt(row, col);
    }

    render(ctx) {
        this.molecule.render(ctx);
    }

    getHexagons() {
        this.molecule.getHexagons();
    }

    getPartAt(row, col) {
        return this.molecule.getPartAt(row, col);
    }

    moveTo(source, target) {
        return new DraggableMolecule(this.molecule.moveTo(source, target));
    }
}
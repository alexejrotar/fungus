class Molecule {
    constructor(shape, grid, color = "#000") {
        this.shape = shape;
        this.grid = grid;
        this.transform = new Transform(new Position(0, 0, 0), new Position(0, 0, 0));
        this.color = color;
    }

    getPartAt(position) {
        const part = this.shape.find(part => {
            const partPosition = part.getTransformedPosition(this.transform, this.grid);
            return partPosition.equals(position);
        })
        if (part) {
            return part.getPosition();
        } else {
            return undefined;
        }
    }

    moveTo(transform, dissolve) {
        const movedMolecule = this.copy();
        movedMolecule.transform = transform;

        if (movedMolecule.shape.every(part => {
            const position = part.getTransformedPosition(movedMolecule.transform, this.grid);
            return !this.grid.isInside(position);
        })) {
            dissolve();
        }
        return movedMolecule;
    }

    overlaps(molecule) {
        return this.shape.some(part => {
            const position = part.getTransformedPosition(this.transform, this.grid);
            return molecule.getPartAt(position) !== undefined;
        });
    }

    render(ctx) {
        ctx.save();
        ctx.lineWidth = 3;
        this.shape.forEach(part => {
            const position = part.getTransformedPosition(this.transform, this.grid);
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

// TODO get rid of undefined
class DraggableMolecule {
    constructor(molecule) {
        this.molecule = molecule;
        this.selected = undefined;
        this.currentPosition = undefined;
    }

    mousedown(position) {
        this.selected = this.molecule.getPartAt(position);
        this.currentPosition = position;
    }

    mousemoved(position, tryMove, dissolve) {
        if (!this.selected) return;

        // TODO
        // const offset = (new Transform(this.currentPosition, position)).offset();
        // if (Math.abs(offset.row) > 1 || Math.abs(offset.col) > 1) return;
        
        const previous = this.molecule;
        this.molecule = this.molecule.moveTo(new Transform(this.selected, position), () => dissolve(this));

        if (tryMove(this, this.molecule)) {
            this.currentPosition = position;
        } else {
            this.molecule = previous;
        }
    }

    mouseup() {
        if (this.selected) {
            this.selected = undefined;
        }
    }

    render(ctx) {
        this.molecule.render(ctx);
    }

    overlaps(molecule) {
        return this.molecule.overlaps(molecule);
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

    cartesianOffset(grid) {
        const cartesianSource = grid.getCartesian(this.source);
        const cartesianTarget = grid.getCartesian(this.target);
        return cartesianTarget.subtract(cartesianSource);
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

    getTransformedPosition(transform, grid) {
        const offset = transform.cartesianOffset(grid);
        let cartesian = grid.getCartesian(this.position)
            .add(offset);

        return grid.getPosition(cartesian);
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
            new Part(new Position(0, 0, 0)),
            new Part(new Position(1, 0, 0), [0, 5]),
            new Part(new Position(2, 0, 0)),
            new Part(new Position(0, 1, 0), [4, 5])
        ]

        super(shape, grid, color);
    }
}
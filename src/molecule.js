class Molecule {
    constructor(shape, grid, color = "#000") {
        this.shape = shape;
        this.grid = grid;
        this.color = color;
    }

    getPartAt(position) {
        const part = this.shape.find(other => {
            return other.equals(position);
        })
        if (part) {
            return part;
        } else {
            return undefined;
        }
    }

    transform(transformation, dissolve = () => { }) {
        const movedMolecule = this.copy();
        movedMolecule.shape = movedMolecule.shape.map(position => {
            const newPosition = transformation.transform(position, this.grid);
            return newPosition;
        })

        if (movedMolecule.shape.every(position => !this.grid.isInside(position))) {
            dissolve();
        }
        return movedMolecule;
    }

    overlaps(molecule) {
        return this.shape.some(position => molecule.getPartAt(position) !== undefined);
    }

    render(ctx) {
        ctx.save();
        ctx.lineWidth = 3;
        this.shape.forEach(position => {
            let hexagon = this.grid.getHexagon(position);
            (new RenderedHexagon(hexagon, this.color, true)).render(ctx);
        })
        ctx.restore();
    }

    copy() {
        const molecule = new Molecule(this.shape.map(position => position.copy()), this.grid, this.color);
        return molecule;
    }

    output() {
        return { c: this.color, s: this.shape.map(position => position.output()) };
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

        if (!position.isNeighbor(this.currentPosition)) return;

        const previous = this.molecule;
        this.molecule = this.molecule.transform(new Transpose(this.selected, position), () => dissolve(this));

        if (tryMove(this, this.molecule)) {
            this.currentPosition = position;
            this.selected = position;
        } else {
            this.molecule = previous;
        }
    }

    mouseup() {
        this.selected = undefined;
    }

    // TODO
    left(tryMove, dissolve) {
        if (!this.selected) return;
        const previous = this.molecule;
        this.molecule = this.molecule.transform(new Rotation(this.selected, 1), () => dissolve(this));
        if (!tryMove(this, this.molecule)) {
            this.molecule = previous;
        }
    }
    right(tryMove, dissolve) {
        if (!this.selected) return;
        const previous = this.molecule;
        this.molecule = this.molecule.transform(new Rotation(this.selected, -1), () => dissolve(this));
        if (!tryMove(this, this.molecule)) {
            this.molecule = previous;
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

class Transpose {
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

    transform(position, grid) {
        const transposeOffset = this.cartesianOffset(grid);
        let cartesian = grid.getCartesian(position)
            .add(transposeOffset);
        return grid.getPosition(cartesian);
    }

    copy() {
        return new Transpose(this.source.copy(), this.target.copy());
    }
}

class Rotation {
    constructor(pivot, rotation) {
        this.pivot = pivot;
        this.rotation = rotation;
    }

    cartesianOffset(grid, position) {
        const { sin, cos, PI } = Math;

        const pivotCartesian = grid.getCartesian(this.pivot);
        const cartesian = grid.getCartesian(position).subtract(pivotCartesian);
        const angle = this.rotation * PI / 3;
        const rotated = new Cartesian(
            cartesian.x * cos(angle) - cartesian.y * sin(angle),
            cartesian.x * sin(angle) + cartesian.y * cos(angle),
        );

        return rotated.subtract(cartesian);
    }

    transform(position, grid) {
        const rotationOffset = this.cartesianOffset(grid, position);
        let cartesian = grid.getCartesian(position)
            .add(rotationOffset);

        return grid.getPosition(cartesian);
    }
}

class MoleculeTypeA extends Molecule {
    constructor(grid, color = "#0aa") {
        const shape = [
            new Position(0, 0, 0),
            new Position(1, 0, 0),
            new Position(2, 0, 0),
            new Position(0, 1, 0)
        ]

        super(shape, grid, color);
    }
}
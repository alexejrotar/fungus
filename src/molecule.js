class Molecule {
    constructor(shape, grid, color = "#000") {
        this.shape = shape;
        this.grid = grid;
        this.color = color;
    }

    isAt(position) {
        return this.shape.some(other => other.equals(position));
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
        return this.shape.some(position => molecule.isAt(position));
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
    }

    mousedown(position) {
        this.selected = this.molecule.isAt(position) ? position : undefined;
    }

    mousemoved(position, tryMove, dissolve) {
        if (!this.selected) return;

        if (!position.isNeighbor(this.selected)) return;

        const previous = this.molecule;
        this.molecule = this.molecule.transform(new Transpose(this.selected, position), () => dissolve(this));

        if (tryMove(this, this.molecule)) {
            this.selected = position;
        } else {
            this.molecule = previous;
        }
    }

    mouseup() {
        this.selected = undefined;
    }

    left(tryMove, dissolve) {
        this.rotate(tryMove, dissolve, new Rotation(this.selected, 1));
    }
    right(tryMove, dissolve) {
        this.rotate(tryMove, dissolve, new Rotation(this.selected, -1));
    }

    rotate(tryMove, dissolve, rotation) {
        if (!this.selected) return;
        const previous = this.molecule;
        this.molecule = this.molecule.transform(rotation, () => dissolve(this));
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

    isAt(position) {
        return this.molecule.isAt(position);
    }
}

class Transpose {
    constructor(source, target) {
        this.source = source;
        this.target = target;
    }

    transform(position, grid) {
        const cartesianSource = grid.getCartesian(this.source);
        const cartesianTarget = grid.getCartesian(this.target);
        const transposeOffset = cartesianTarget.subtract(cartesianSource);

        let cartesian = grid.getCartesian(position).add(transposeOffset);
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
        const rotated = new Vector(
            cartesian.v[0] * cos(angle) - cartesian.v[1] * sin(angle),
            cartesian.v[0] * sin(angle) + cartesian.v[1] * cos(angle),
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
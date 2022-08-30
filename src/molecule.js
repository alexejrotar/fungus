class Molecule {
    constructor(shape, grid, color = "#000") {
        this.shape = shape;
        this.grid = grid;
        this.color = color;
    }

    isAt(position) {
        return this.shape.some(other => other.equals(position));
    }

    // TODO eventually remove the defaults
    transform(transformation, dissolve = () => { }, isOccupied = (_) => false) {
        let aborted = false;
        const movedMolecule = this.copy();
        for (let i = 0; i < movedMolecule.shape.length; i++) {
            movedMolecule.shape[i] = transformation.transform(this.shape[i], this.grid, isOccupied, () => aborted = true);
        }

        if (aborted) return this;

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

    mousemoved(position, dissolve, isOccupied) {
        if (!this.selected) return;

        const previous = this.molecule;
        this.molecule = this.molecule.transform(
            new Transform(new Transpose(this.selected, position)),
            () => dissolve(this),
            isOccupied,
        );

        if (previous !== this.molecule) {
            this.selected = position;
        }
    }

    mouseup() {
        this.selected = undefined;
    }

    left(dissolve, isOccupied) {
        this.rotate(dissolve, isOccupied, new Rotation(this.selected, 1));
    }
    right(dissolve, isOccupied) {
        this.rotate(dissolve, isOccupied, new Rotation(this.selected, -1));
    }

    rotate(dissolve, isOccupied, rotation) {
        if (!this.selected) return;
        this.molecule = this.molecule.transform(new Transform(rotation), () => dissolve(this), isOccupied);
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

class Transform {
    constructor(transformation) {
        this.transformation = transformation;
    }

    transform(position, grid, isOccupied, abort) {
        const trace = this.transformation.getTrace(position, grid);
        const positions = Array.from(grid.traceToPositions(trace));

        return positions.reduce((_, transformed) => {
            if (isOccupied(transformed)) abort();
            return transformed;
        }, position)
    }
}

class Transpose {
    constructor(source, target) {
        this.source = source;
        this.target = target;
    }

    getTrace(position, grid) {
        const cartesianSource = grid.getCartesian(this.source);
        const cartesianTarget = grid.getCartesian(this.target);
        const offset = cartesianTarget.subtract(cartesianSource);
        const cartesian = grid.getCartesian(position);

        const steps = Array.from(Array(101), (_, i) => i / 100);
        return steps.map(step => cartesian.add(offset.scale(step)));
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

    getTrace(position, grid) {
        const { sin, cos, PI } = Math;
        const pivotCartesian = grid.getCartesian(this.pivot);
        const cartesian = grid.getCartesian(position).subtract(pivotCartesian);

        const steps = Array.from(Array(101), (_, i) => i / 100);
        return steps.map(step => {
            const angle = step * this.rotation * PI / 3;
            const rotationMatrix = new Matrix([
                [cos(angle), -sin(angle)],
                [sin(angle), cos(angle)],
            ]);
            return rotationMatrix.multiply(cartesian).add(pivotCartesian);

        });
    }
}

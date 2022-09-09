class Molecule {
    constructor(shape,color) {
        this.shape = shape;
        this.color = color;
    }

    isAt(position) {
        return this.shape.some(other => other.equals(position));
    }

    transform(transformation, dissolve, isOccupied, hintAt) {
        let aborted = false;
        const shape = this.shape.map(position => transformation.transform(position, isOccupied, () => aborted = true, hintAt));

        if (aborted) return false;

        if (shape.every(position => !grid.isInside(position))) dissolve();
        this.shape = shape;
        return true;
    }

    overlaps(molecule) {
        return this.shape.some(position => molecule.isAt(position));
    }

    render() {
        ctx.save();
        ctx.lineWidth = 3;
        this.shape.forEach(position => {
            let hexagon = grid.getHexagon(position);
            (new RenderedHexagon(hexagon, this.color, 0.4)).render();
        })
        ctx.restore();
    }

    output() {
        return { c: this.color, s: this.shape.map(position => position.output()) };
    }

    highlighted() {
        return new HighlightedMolecule(this.shape, this.color);
    }

    unhighlighted() {
        return new Molecule(this.shape, this.color);
    }

    draggable() {
        return new DraggableMolecule(this.shape, this.color);
    }

    static from({ s, c }) {
        const shape = s.map(pos => new Position(...pos));
        return new Molecule(shape, c);
    }
}

class HighlightedMolecule extends Molecule {
    constructor(shape, color) {
        super(shape, color);
    }

    render() {
        ctx.save();
        ctx.lineWidth = 3;
        this.shape.forEach(position => {
            let hexagon = grid.getHexagon(position);
            (new RenderedHexagon(hexagon, this.color, 0.7)).render();
        })
        ctx.restore();
    }
}

class DraggableMolecule extends Molecule {
    constructor(shape, color) {
        super(shape, color);
        this.selected = undefined;
    }

    mousedown(position) {
        this.selected = super.isAt(position) ? position : undefined;
    }

    mousemoved(position, dissolve, isOccupied, hintAt) {
        if (!this.selected) return;

        const transformSuccessful = super.transform(
            new Transpose(this.selected, position),
            () => dissolve(this),
            isOccupied,
            hintAt,
        );

        if (transformSuccessful) this.selected = position;
    }

    mouseup() {
        this.selected = undefined;
    }

    left(dissolve, isOccupied, hintAt) {
        if (!this.selected) return;
        super.transform(new Rotation(this.selected, 1), () => dissolve(this), isOccupied, hintAt);
    }

    right(dissolve, isOccupied, hintAt) {
        if (!this.selected) return;
        super.transform(new Rotation(this.selected, -1), () => dissolve(this), isOccupied, hintAt);
    }

    static from(description) {
        return Molecule.from(description).draggable();
    }
}

class Transformation {
    transform(position, isOccupied, abort, hintAt) {
        const trace = this.getTrace(position);
        const positions = Array.from(grid.traceToPositions(trace));

        for (const transformed of positions) {
            if (isOccupied(transformed)) {
                hintAt(transformed);
                hintAt(position);
                abort();
                return position;
            }
        }
        return positions[positions.length - 1];
    }
}

class Transpose extends Transformation {
    constructor(source, target) {
        super();
        this.source = source;
        this.target = target;
    }

    getTrace(position) {
        const cartesianSource = grid.getCartesian(this.source);
        const cartesianTarget = grid.getCartesian(this.target);
        const offset = cartesianTarget.subtract(cartesianSource);
        const cartesian = grid.getCartesian(position);

        const maxDistance = grid.maxPositionsBetween(cartesianSource, cartesianTarget);
        if (maxDistance === 0) {
            return [cartesian.add(offset)];
        }
        return Array.from(Array(maxDistance + 1), (_, i) => cartesian.add(offset.scale(i / maxDistance)));
    }
}

class Rotation extends Transformation {
    constructor(pivot, rotation) {
        super();
        this.pivot = pivot;
        this.rotation = rotation;
    }

    getTrace(position) {
        const { sin, cos, PI } = Math;
        const pivotCartesian = grid.getCartesian(this.pivot);
        const cartesian = grid.getCartesian(position).subtract(pivotCartesian);

        const steps = Array.from(Array(31), (_, i) => i / 30);
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

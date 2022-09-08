class Molecule {
    constructor(shape, grid, color) {
        this.shape = shape;
        this.grid = grid;
        this.color = color;
    }

    isAt(position) {
        return this.shape.some(other => other.equals(position));
    }

    transform(transformation, dissolve, isOccupied, hintAt) {
        let aborted = false;
        const shape = this.shape.map(position => transformation.transform(position, this.grid, isOccupied, () => aborted = true, hintAt));

        if (aborted) return false;

        if (shape.every(position => !this.grid.isInside(position))) dissolve();
        this.shape = shape;
        return true;
    }

    overlaps(molecule) {
        return this.shape.some(position => molecule.isAt(position));
    }

    render(ctx) {
        ctx.save();
        ctx.lineWidth = 3;
        this.shape.forEach(position => {
            let hexagon = this.grid.getHexagon(position);
            (new RenderedHexagon(hexagon, this.color, 0.4)).render(ctx);
        })
        ctx.restore();
    }

    output() {
        return { c: this.color, s: this.shape.map(position => position.output()) };
    }

    highlighted() {
        return new HighlightedMolecule(this.shape, this.grid, this.color);
    }

    unhighlighted() {
        return new Molecule(this.shape, this.grid, this.color);
    }

    draggable() {
        return new DraggableMolecule(this.shape, this.grid, this.color);
    }

    static from({ s, c }, grid) {
        const shape = s.map(pos => new Position(...pos));
        return new Molecule(shape, grid, c);
    }
}

class HighlightedMolecule extends Molecule {
    constructor(shape, grid, color) {
        super(shape, grid, color);
    }

    render(ctx) {
        ctx.save();
        ctx.lineWidth = 3;
        this.shape.forEach(position => {
            let hexagon = this.grid.getHexagon(position);
            (new RenderedHexagon(hexagon, this.color, 0.7)).render(ctx);
        })
        ctx.restore();
    }
}

class DraggableMolecule extends Molecule {
    constructor(shape, grid, color) {
        super(shape, grid, color);
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

    static from(description, grid) {
        return Molecule.from(description, grid).draggable();
    }
}

class Transpose {
    constructor(source, target) {
        this.source = source;
        this.target = target;
    }

    transform(position, grid, isOccupied, abort, hintAt) {
        if (this.source.equals(this.target)) {
            return position;
        }
        const trace = this.getTrace(position, grid);
        const positions = Array.from(grid.traceToPositions(trace));

        for (const transformed of positions) {
            if (isOccupied(transformed)) {
                hintAt(transformed);
                hintAt(position);
                abort();
                return position;
            }
        }
        if (positions.length === 0) return position;
        return positions[positions.length - 1];
    }

    getTrace(position, grid) {
        const cartesianSource = grid.getCartesian(this.source);
        const cartesianTarget = grid.getCartesian(this.target);
        const offset = cartesianTarget.subtract(cartesianSource);
        const cartesian = grid.getCartesian(position);

        const maxDistance = Math.floor(cartesianSource.distance(cartesianTarget) / (2 * Math.cos(Math.PI / 3) * grid.radius));
        if (maxDistance === 0) {
            return [cartesian.add(offset)];
        }
        const steps = Array.from(Array(maxDistance + 1), (_, i) => i / maxDistance);
        return steps.map(step => cartesian.add(offset.scale(step)));
    }
}

class Rotation {
    constructor(pivot, rotation) {
        this.pivot = pivot;
        this.rotation = rotation;
    }
    transform(position, grid, isOccupied, abort, hintAt) {
        const trace = this.getTrace(position, grid);
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

    getTrace(position, grid) {
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

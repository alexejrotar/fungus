class Grid {
    constructor(radius, center, size, color = "#000") {
        this.radius = radius;
        this.center = center;
        this.size = size;
        this.color = color;
        this.circle = Array.from(Position.circle(this.size)).map(position => this.getHexagon(position));
    }

    render(ctx) {
        for (const hexagon of this.circle) {
            (new RenderedHexagon(hexagon, this.color)).render(ctx);
        }
    }

    getHexagon(position) {
        const cartesian = this.getCartesian(position);
        return new Hexagon(this.radius, cartesian);
    }

    getCartesian(position) {
        const cartesian = position.toNormalizedCartesian().scale(this.radius);
        return cartesian.add(this.center);
    }

    getPositions(cartesian) {
        const normalizedCartesian = cartesian.subtract(this.center).scale(1 / this.radius);
        return Position.fromNormalizedCartesian(normalizedCartesian);
    }

    getPosition(cartesian) {
        return this.getPositions(cartesian)[0];
    }

    *traceToPositions(trace) {
        const seenPositions = [];
        for (const cartesian of trace) {
            const positions = this.getPositions(cartesian).filter(position => seenPositions.find(other => position.equals(other)) === undefined);
            for (const position of positions) {
                seenPositions.push(position);
                yield position;
            }
        }
    }

    isInside(position) {
        return position.isInside(this.size);
    }

    output() {
        return { c: this.center.output(), r: this.radius, s: this.size };
    }

    static from(description) {
        return new Grid(description.r, new Vector(...description.c), description.s, "#777");
    }
}

class ReactiveGrid {
    constructor(canvas, grid) {
        this.grid = grid;
        this.canvas = canvas;
        this.mouseCoordinates = new Position(-1, -1);
        this.setListeners();

        canvas.addEventListener("mousedown", (event) => {
            const coordinates = this.grid.getPosition(new Vector(event.offsetX, event.offsetY));
            this.listeners.mousedown(coordinates)
        });
        canvas.addEventListener("mouseup", (event) => {
            const coordinates = this.grid.getPosition(new Vector(event.offsetX, event.offsetY));
            this.listeners.mouseup(coordinates)
        }
        )
        canvas.addEventListener("mousemove", (event) => {
            const coordinates = this.grid.getPosition(new Vector(event.offsetX, event.offsetY));
            if (!coordinates.equals(this.mouseCoordinates)) {
                this.mouseCoordinates = coordinates;
                this.listeners.mousemove(coordinates)
            }
        })
        window.addEventListener("keydown", (event) => {
            switch (event.code) {
                case "KeyQ": {
                    this.listeners.left();
                    break;
                }
                case "KeyE": {
                    this.listeners.right();
                    break;
                }
            }
        })
    }

    setListeners(
        listeners = {
            mousedown: () => {},
            mousemove: () => {},
            mouseup: () => {},
            left: () => {},
            right: () => {},
        })
    {
        this.listeners = listeners;
    }

    setGrid(grid) {
        this.grid = grid;
    }
}

// TODO more consistent use of vector
class Position {
    constructor(u, v) {
        this.coordinates = [u, v];
    }

    static fromNormalizedCartesian(cartesian) {
        const { ceil, floor } = Math;

        const solveFor = (vector) => {
            const matrix = new Matrix(Position.base).invert();
            return matrix.multiply(vector);
        }

        const roundToCenter = (candidates) => {
            let minDistance = Infinity;
            const distances = candidates.map(candidate => {
                const candidateCartesian = candidate.toNormalizedCartesian();
                const distance = cartesian.distance(candidateCartesian);

                if (distance < minDistance) {
                    minDistance = distance;
                }
                return distance;
            })
            const positions = candidates
                .filter((_, i) => Math.abs(minDistance - distances[i]) < 0.01)
                .filter((position, i, self) => self.findIndex(other => other.equals(position)) === i);
            return positions;

        }

        const vector = solveFor(cartesian).v;
        let candidates = [
            [floor(vector[0]), floor(vector[1])],
            [floor(vector[0]), ceil(vector[1])],
            [ceil(vector[0]), ceil(vector[1])],
            [ceil(vector[0]), floor(vector[1])],
        ].map(candidate => new Position(...candidate));

        return roundToCenter(candidates);
    }

    static base = [
        [1 + Math.cos(Math.PI / 3), - (1 + Math.cos(Math.PI / 3))],
        [Math.sin(Math.PI / 3), Math.sin(Math.PI / 3)],
    ]

    toNormalizedCartesian() {
        const matrix = new Matrix(Position.base);
        return matrix.multiply(new Vector(...this.coordinates));
    }

    static *circle(radius) {
        for (let u = 0; u < radius; u++) {
            for (let v = 0; v < radius; v++) {
                for (let w = 0; w < radius; w++) {
                    if ([u, v, w].some(z => z === 0)) {
                        yield new Position(u - w, v - w);
                    }
                }
            }
        }
    }

    isNeighbor(other) {
        const cartesian = this.toNormalizedCartesian();
        const otherCartesian = other.toNormalizedCartesian();
        return Math.abs(cartesian.distance(otherCartesian) - 2 * Math.sin(Math.PI / 3)) < 0.01;
    }

    isInside(radius) {
        if (Math.sign(this.coordinates[0]) === Math.sign(this.coordinates[1])) {
            return this.coordinates.every(u => Math.abs(u) < radius);
        } else {
            return Math.abs(this.coordinates[0]) + Math.abs(this.coordinates[1]) < radius;
        }
    }


    equals(other) {
        return this.coordinates.every((v, i) => v === other.coordinates[i]);
    }

    every(predicate) {
        return this.coordinates.every(predicate);
    }

    output() {
        return [...this.coordinates];
    }
}

class Matrix {
    constructor(rows) {
        this.rows = rows;
    }

    multiply(vector) {
        return new Vector(...this.rows.map(row => vector.dotProduct(new Vector(...row))));
    }

    scale(factor) {
        return new Matrix(this.rows.map(row => row.map(u => u * factor)));
    }

    invert() {
        // assuming 2x2 matrix
        return new Matrix([
            [this.rows[1][1], - this.rows[0][1]],
            [- this.rows[1][0], this.rows[0][0]],
        ]).scale(1 / this.determinant());
    }

    determinant() {
        // assuming 2x2 matrix
        return this.rows[0][0] * this.rows[1][1] - this.rows[1][0] * this.rows[0][1];
    }

    transpose() {
        const rows = []
        for (let i = 0; i < this.rows.length; i++) {
            for (let j = 0; j < this.rows[i].length; j++) {
                if (rows.length <= j) {
                    rows.push([this.rows[i][j]]);
                } else {
                    rows[j].push(this.rows[i][j]);
                }
            }
        }

        return new Matrix(rows);
    }
}

class Vector {
    constructor(...v) {
        this.v = [...v];
    }

    add(other) {
        return new Vector(...this.v.map((x, i) => x + other.v[i]));
    }

    subtract(other) {
        return this.add(other.scale(-1));
    }

    scale(factor) {
        return new Vector(...this.v.map(x => x * factor));
    }

    dotProduct(other) {
        return this.v.reduce((sum, x, i) => sum + x * other.v[i], 0);
    }

    distance(other) {
        const diff = other.subtract(this);
        return Math.sqrt(diff.dotProduct(diff));
    }

    output() {
        return [...this.v];
    }
}

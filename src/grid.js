class Grid {
    constructor(radius, center, size, color = "#000") {
        this.radius = radius;
        this.center = center;
        this.size = size;
        this.color = color;
    }

    render(ctx) {
        for (const position of Position.circle(this.size)) {
            (new RenderedHexagon(this.getHexagon(position), this.color)).render(ctx);
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

    getPosition(cartesian) {
        const normalizedCartesian = cartesian.subtract(this.center).scale(1 / this.radius);
        return Position.fromNormalizedCartesian(normalizedCartesian);
    }

    *traceToPositions(trace) {
        let currentPosition = new Position(0, 0, 0);
        for (const cartesian of trace) {
            const position = this.getPosition(cartesian);
            if (currentPosition.equals(position)) continue;
            currentPosition = position;
            yield position;
        }
    }

    // TODO
    isInside(position) {
        return position.every(coordinate => coordinate < this.size);
    }

    output() {
        return { c: this.center.output(), r: this.radius, s: this.size };
    }
}

// TODO enable removing of listeners
class ReactiveGrid {
    constructor(grid, canvas) {
        this.grid = grid;
        this.canvas = canvas;
        this.mouseCoordinates = new Position(-1, -1, -1);
        this.listeners = {
            mousedown: [],
            mousemove: [],
            mouseup: [],
            left: [],
            right: [],
        };
        canvas.addEventListener("mousedown", (event) => {
            const coordinates = this.grid.getPosition(new Vector(event.offsetX, event.offsetY));
            this.listeners.mousedown.forEach(cb => cb(coordinates))
        });
        canvas.addEventListener("mouseup", (event) => {
            const coordinates = this.grid.getPosition(new Vector(event.offsetX, event.offsetY));
            this.listeners.mouseup.forEach(cb => cb(coordinates))
        }
        )
        canvas.addEventListener("mousemove", (event) => {
            const coordinates = this.grid.getPosition(new Vector(event.offsetX, event.offsetY));
            if (!coordinates.equals(this.mouseCoordinates)) {
                this.mouseCoordinates = coordinates;
                this.listeners.mousemove.forEach(cb => cb(coordinates))
            }
        })
        window.addEventListener("keydown", (event) => {
            switch (event.code) {
                case "KeyQ": {
                    this.listeners.left.forEach(cb => cb());
                    break;
                }
                case "KeyE": {
                    this.listeners.right.forEach(cb => cb());
                    break;
                }
            }
        })
    }

    withListener(eventName, callback) {
        if (!eventName in this.listeners) return;
        this.listeners[eventName].push(callback);
        return this;
    }

    render(ctx) {
        this.grid.render(ctx);
    }

    output() {
        return this.grid.output();
    }
}

// TODO more consistent use of vector
class Position {
    constructor(u, v, w) {
        const cartesian = new Matrix(Position.axes()).transpose().multiply(new Vector(u, v, w));

        const { baseIndex, vector } = Position.solveFor(cartesian);
        vector.splice(baseIndex, 0, 0);
        this.coordinates = vector.map(x => Math.round(x));
    }

    static fromNormalizedCartesian(cartesian) {
        const { ceil, floor } = Math;

        const { baseIndex, vector } = Position.solveFor(cartesian);
        let candidates = [
            [floor(vector[0]), floor(vector[1])],
            [floor(vector[0]), ceil(vector[1])],
            [ceil(vector[0]), ceil(vector[1])],
            [ceil(vector[0]), floor(vector[1])],
        ];

        candidates.forEach(v => v.splice(baseIndex, 0, 0));

        let minDistance = Infinity;
        let position;
        for (const candidate of candidates) {

            const candidatePosition = new Position(...candidate);
            const candidateCartesian = candidatePosition.toNormalizedCartesian();
            const distance = cartesian.distance(candidateCartesian);

            if (distance < minDistance) {
                minDistance = distance;
                position = candidatePosition;
            }
        }
        return position;
    }

    static solveFor(cartesian) {
        for (let i = 0; i < 3; i++) {
            const base = Position.axes().filter((_, j) => i !== j);
            const matrix = new Matrix(base).transpose().invert();
            const vector = matrix.multiply(cartesian);
            if (vector.v.every(x => x >= 0)) return { baseIndex: i, vector: vector.v };
        }
    }

    static axes() {
        const { PI, sin, cos } = Math;
        return [
            [1 + cos(PI / 3), sin(PI / 3)],
            [- (1 + cos(PI / 3)), sin(PI / 3)],
            [0, - 2 * sin(PI / 3)],
        ];
    }

    toNormalizedCartesian() {
        const { sin, cos, PI } = Math;

        const matrix = new Matrix([
            [1 + cos(PI / 3), - 1 - cos(PI / 3), 0],
            [sin(PI / 3), sin(PI / 3), - 2 * sin(PI / 3)]
        ]);

        return matrix.multiply(new Vector(...this.coordinates));
    }

    static *circle(radius) {
        for (let u = 0; u < radius; u++) {
            for (let v = 0; v < radius; v++) {
                for (let w = 0; w < radius; w++) {
                    const position = new Position(u, v, w);
                    if ([u, v, w].some(z => z === 0)) {
                        yield position;
                    }
                }
            }
        }
    }


    equals(other) {
        return this.coordinates.every((v, i) => v === other.coordinates[i]);
    }

    every(predicate) {
        return this.coordinates.every(predicate);
    }

    // TODO not always correct
    isNeighbor(other) {
        const offset = this.coordinates
            .map((_, i) => Math.abs(other.coordinates[i] - this.coordinates[i]));
        return offset.every(distance => distance <= 1) && offset.filter(distance => distance !== 0).length <= 2;
    }

    copy() {
        return new Position(...this.coordinates);
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

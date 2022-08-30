class Grid {
    constructor(radius, center, size, color = "#000") {
        this.radius = radius;
        this.center = center;
        this.size = size;
        this.color = color;
    }

    render(ctx) {
        const center = new Position(0, 0, 0);
        for (const position of center.circle(this.size)) {
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
        const normalizedCartesian = cartesian.subtract(this.center).scale(1/this.radius);
        return Position.fromNormalizedCartesian(normalizedCartesian);
    }

    isInside(position) {
        return position.every(coordinate => coordinate < this.size);
    }

    output() {
        return { c: this.center.output(), r: this.radius, s: this.size };
    }
}

// TODO create extend function to automatically provide default implementations
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

// TODO more to be done here
class Position {
    constructor(u, v, w) {
        const { PI, sin, cos } = Math;
        const axes = {
            u: { x: 1 + cos(PI / 3), y: sin(PI / 3) },
            v: { x: - (1 + cos(PI / 3)), y: sin(PI / 3) },
            w: { x: 0, y: - 2 * sin(PI / 3) },
        };

        const x = u * axes.u.x + v * axes.v.x + w * axes.w.x;
        const y = u * axes.u.y + v * axes.v.y + w * axes.w.y;

        const vectorCoordinates = (u, v) => [
            (x * v.y - y * v.x) / (u.x * v.y - u.y * v.x),
            (y * u.x - x * u.y) / (u.x * v.y - u.y * v.x)
        ];

        let c = vectorCoordinates(axes.u, axes.v);
        if (c[0] >= 0 && c[1] >= 0) {
            this.coordinates = [c[0], c[1], 0].map(n => Math.round(n));
        }

        c = vectorCoordinates(axes.u, axes.w);
        if (c[0] >= 0 && c[1] >= 0) {
            this.coordinates = [c[0], 0, c[1]].map(n => Math.round(n));
        }
        c = vectorCoordinates(axes.v, axes.w);
        if (c[0] >= 0 && c[1] >= 0) {
            this.coordinates = [0, c[0], c[1]].map(n => Math.round(n));
        }
    }

    *circle(radius) {
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

    static fromNormalizedCartesian(cartesian) {
        const { sin, cos, PI, ceil, floor } = Math;
        const [ x, y ] = cartesian.v;
        
        const vectorCoordinates = (u, v) => {
            const matrix = new Matrix([u, v]).transpose();
            return matrix.invert().multiply([x, y]);
        };
        
        const roundToCenter = (candidates) => {
            let minDistance;
            let position;
            for (const candidate of candidates) {
                const candidatePosition = new Position(...candidate);
                const candidateCartesian = candidatePosition.toNormalizedCartesian();
                const distance = cartesian.distance(candidateCartesian);
                if (minDistance === undefined || distance < minDistance) {
                    minDistance = distance;
                    position = candidatePosition;
                }
            }
            return position;
        }

        const u = [1 + cos(PI / 3), sin(PI / 3)];
        const v = [- (1 + cos(PI / 3)), sin(PI / 3)];
        const w = [0, - 2 * sin(PI / 3)];

        let c = vectorCoordinates(u, v);
        if (c[0] >= 0 && c[1] >= 0) {
            const canditates = [
                [floor(c[0]), floor(c[1]), 0],
                [floor(c[0]), ceil(c[1]), 0],
                [ceil(c[0]), ceil(c[1]), 0],
                [ceil(c[0]), floor(c[1]), 0],
            ];
            return roundToCenter(canditates);
        };

        c = vectorCoordinates(u, w);
        if (c[0] >= 0 && c[1] >= 0) {
            const canditates = [
                [floor(c[0]), 0, floor(c[1])],
                [floor(c[0]), 0, ceil(c[1])],
                [ceil(c[0]), 0, ceil(c[1])],
                [ceil(c[0]), 0, floor(c[1])],
            ];
            return roundToCenter(canditates);
        };

        c = vectorCoordinates(v, w);
        if (c[0] >= 0 && c[1] >= 0) {
            const canditates = [
                [0, floor(c[0]), floor(c[1])],
                [0, floor(c[0]), ceil(c[1])],
                [0, ceil(c[0]), ceil(c[1])],
                [0, ceil(c[0]), floor(c[1])],
            ];
            return roundToCenter(canditates);
        };
    }

    toNormalizedCartesian() {
        const { sin, cos, PI } = Math;

        const matrix = new Matrix([
            [1 + cos(PI / 3), - 1 - cos(PI / 3), 0],
            [sin(PI / 3), sin(PI / 3), - 2 * sin(PI / 3)]
        ]);

        const vector = matrix.multiply(this.coordinates);
        return new Vector(...vector);
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

// TODO make this a general vector and use in position
class Cartesian {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Cartesian(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Cartesian(this.x - other.x, this.y - other.y);
    }

    multiply(factor) {
        return new Cartesian(this.x * factor, this.y * factor);
    }

    transform(matrix) {
        const vector = matrix.multiply([this.x, this.y]);
        return new Cartesian(...vector);
    }

    distance(other) {
        return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2);
    }

    output() {
        return { x: this.x, y: this.y };
    }
}

class Matrix {
    constructor(rows) {
        this.rows = rows;
    }

    multiply(vector) {
        return this.rows.map(row => row.reduce((sum, u, i) => sum + u * vector[i], 0));
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
        return new Matrix(this.rows.map((row, i) => row.map((_, j) => this.rows[j][i])));
    }
}

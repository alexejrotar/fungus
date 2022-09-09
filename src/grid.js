class Grid {
    constructor(radius, center, size, color) {
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

    maxPositionsBetween(source, target) {
        return Math.floor(source.distance(target) / (2 * Math.cos(Math.PI / 3) * this.radius));
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

    static from({ r, c, s }) {
        return new Grid(r, new Vector(...c), s, "#777");
    }
}

class ReactiveGrid {
    constructor(canvas, grid) {
        this.grid = grid;
        this.canvas = canvas;
        this.mousePosition = undefined;
        this.setListeners();

        canvas.addEventListener("mousedown", (event) => {
            const position = this.grid.getPositions(new Vector(event.offsetX, event.offsetY))[0];
            this.listeners.mousedown(position)
        });
        canvas.addEventListener("mouseup", (event) => {
            const position = this.grid.getPositions(new Vector(event.offsetX, event.offsetY))[0];
            this.listeners.mouseup(position)
        }
        )
        canvas.addEventListener("mousemove", (event) => {
            const position = this.grid.getPositions(new Vector(event.offsetX, event.offsetY))[0];
            if (!this.mousePosition || !this.mousePosition.equals(position)) {
                this.mousePosition = position;
                this.listeners.mousemove(position)
            }
        })
        canvas.addEventListener("touchstart", (event) => {
            event.preventDefault();
            const touch = event.changedTouches[0];
            const br = event.target.getBoundingClientRect();
            const v = [
                touch.clientX - br.left,
                touch.clientY - br.top
            ]
            const position = this.grid.getPositions(new Vector(...v))[0];
            this.listeners.mousedown(position)
        });
        canvas.addEventListener("touchend", (event) => {
            event.preventDefault();
            const touch = event.changedTouches[0];
            const br = event.target.getBoundingClientRect();
            const v = [
                touch.clientX - br.left,
                touch.clientY - br.top
            ]
            const position = this.grid.getPositions(new Vector(...v))[0];
            this.listeners.mouseup(position)
        }
        )
        canvas.addEventListener("touchmove", (event) => {
            event.preventDefault();
            event.preventDefault();
            const touch = event.changedTouches[0];
            const br = event.target.getBoundingClientRect();
            const v = [
                touch.clientX - br.left,
                touch.clientY - br.top
            ]
            const position = this.grid.getPositions(new Vector(...v))[0];
            if (!this.mousePosition || !this.mousePosition.equals(position)) {
                this.mousePosition = position;
                this.listeners.mousemove(position)
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
                case "KeyD": {
                    this.listeners.special();
                    break;
                }
            }
        })
    }

    setListeners(
        listeners = {
            mousedown: () => { },
            mousemove: () => { },
            mouseup: () => { },
            left: () => { },
            right: () => { },
            special: () => { },
        }) {
        this.listeners = listeners;
    }

    setGrid(grid) {
        this.grid = grid;
    }
}

class Position {
    constructor(u, v) {
        this.u = u;
        this.v = v;
        if (!Position.base) {
            Position.base = [
                [1 + Math.cos(Math.PI / 3), - (1 + Math.cos(Math.PI / 3))],
                [Math.sin(Math.PI / 3), Math.sin(Math.PI / 3)],
            ]
        }
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

    static fromNormalizedCartesian(cartesian) {
        const matrix = new Matrix(Position.base).invert();
        const vector = matrix.multiply(cartesian);
        let candidates = vector.rounded().map(candidate => new Position(...candidate));

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

    toNormalizedCartesian() {
        const matrix = new Matrix(Position.base);
        return matrix.multiply(new Vector(this.u, this.v));
    }

    isInside(radius) {
        if (Math.sign(this.u) === Math.sign(this.v)) {
            return Math.abs(this.u) < radius && Math.abs(this.v) < radius;
        } else {
            return Math.abs(this.u) + Math.abs(this.v) < radius;
        }
    }

    equals(other) {
        return this.u === other.u && this.v === other.v;
    }

    output() {
        return [this.u, this.v];
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
}

class Vector {
    constructor(...v) {
        this.v = v;
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

    rounded() {
        // assuming 2 vector
        const { ceil, floor } = Math;
        const v = this.v;
        return [
            [floor(v[0]), floor(v[1])],
            [floor(v[0]), ceil(v[1])],
            [ceil(v[0]), ceil(v[1])],
            [ceil(v[0]), floor(v[1])],
        ];
    }

    output() {
        return [...this.v];
    }
}

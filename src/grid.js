// TODO make sure, positions are always valid
class Grid {
    constructor(radius, centerX, centerY, size, color = "#000") {
        this.radius = radius;
        this.centerX = centerX;
        this.centerY = centerY;
        this.size = size;
        this.color = color;
    }

    // TODO
    render(ctx) {
        (new RenderedHexagon(this.getHexagon(new Position(0, 0, 0)), this.color)).render(ctx);
        for (let u = 0; u < this.size; u++) {
            for (let v = 1; v < this.size; v++) {
                (new RenderedHexagon(this.getHexagon(new Position(u, v, 0)), this.color)).render(ctx);
            }
        }
        for (let w = 0; w < this.size; w++) {
            for (let u = 1; u < this.size; u++) {
                (new RenderedHexagon(this.getHexagon(new Position(u, 0, w)), this.color)).render(ctx);
            }
        }
        for (let v = 0; v < this.size; v++) {
            for (let w = 1; w < this.size; w++) {
                (new RenderedHexagon(this.getHexagon(new Position(0, v, w)), this.color)).render(ctx);
            }
        }
    }

    getHexagon(position) {
        const cartesian = this.getCartesian(position);
        return new Hexagon(this.radius, cartesian.x, cartesian.y);
    }

    // TODO
    getCartesian(position) {
        const { sin, cos, PI } = Math;
        const r = this.radius;
        const v = position.coordinates;

        const cartesian = {
            x: this.centerX,
            y: this.centerY - v[2] * 2 * r * sin(PI / 3),
        };
        cartesian.x += (v[0] - v[1]) * (r + r * cos(PI / 3));
        cartesian.y += (v[0] + v[1]) * r * sin(PI / 3);

        return cartesian;
    }

    // TODO
    getPosition(x, y) {
        const r = this.radius;
        const { sin, cos, PI } = Math;
        x -= this.centerX;
        y -= this.centerY;

        const vectorCoordinates = (u, v) => ({
            a: (x * v.y - y * v.x) / (u.x * v.y - u.y * v.x),
            b: (y * u.x - x * u.y) / (u.x * v.y - u.y * v.x)
        });

        const u = {
            x: r + r * cos(PI / 3),
            y: r * sin(PI / 3),
        };
        const v = {
            x: - u.x,
            y: u.y,
        };
        const w = {
            x: 0,
            y: - 2 * r * sin(PI / 3),
        };

        let c = vectorCoordinates(u, v);
        if (c.a >= 0 && c.b >= 0) return new Position(...([c.a, c.b, 0].map(n => Math.round(n))));

        c = vectorCoordinates(u, w);
        if (c.a >= 0 && c.b >= 0) return new Position(...([c.a, 0, c.b].map(n => Math.round(n))));

        c = vectorCoordinates(v, w);
        if (c.a >= 0 && c.b >= 0) return new Position(...([0, c.a, c.b].map(n => Math.round(n))));
    }

    isInside(position) {
        return position.every(coordinate => coordinate < this.size);
    }
}

// TODO handle clicking outside of grid
// TODO create extend function to automatically provide default implementations
// TODO enable removing of listeners
class ReactiveGrid {
    constructor(grid, canvas) {
        this.grid = grid;
        this.canvas = canvas;
        this.mouseCoordinates = new Position(-1, -1, -1);
        this.mousedownListeners = [];
        this.mouseupListeners = [];
        this.mousemoveListeners = [];
        canvas.addEventListener("mousedown", (event) => {
            const coordinates = this.grid.getPosition(event.offsetX, event.offsetY);
            this.mousedownListeners.forEach(cb => cb(coordinates))
        });
        canvas.addEventListener("mouseup", (event) => {
            const coordinates = this.grid.getPosition(event.offsetX, event.offsetY);
            this.mouseupListeners.forEach(cb => cb(coordinates))
        }
        )
        canvas.addEventListener("mousemove", (event) => {
            const coordinates = this.grid.getPosition(event.offsetX, event.offsetY);
            if (!coordinates.equals(this.mouseCoordinates)) {
                this.mouseCoordinates = coordinates;
                this.mousemoveListeners.forEach(cb => cb(coordinates))
            }
        })
    }

    withMousedownListener(callback) {
        this.mousedownListeners.push(callback);
        return this;
    }
    withMouseupListener(callback) {
        this.mouseupListeners.push(callback);
        return this;
    }
    withMousemoveListener(callback) {
        this.mousemoveListeners.push(callback);
        return this;
    }

    getHexagon(position) {
        return this.grid.getHexagon(position);
    }

    getCartesian(position) {
        return this.grid.getCartesian(position);
    }

    getPosition(x, y) {
        return this.grid.getPosition(x, y);
    }

    render(ctx) {
        this.grid.render(ctx);
    }

    isInside(position) {
        return this.grid.isInside(position);
    }
}

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

    equals(other) {
        return this.coordinates.every((v, i) => v === other.coordinates[i]);
    }

    every(predicate) {
        return this.coordinates.every(predicate);
    }

    add(other) {
        const coordinates = this.coordinates.map((v, i) => v + other.coordinates[i]);
        return new Position(...coordinates);
    }

    subtract(other) {
        const coordinates = this.coordinates.map((v, i) => v - other.coordinates[i]);
        return new Position(...coordinates);
    }

    copy() {
        return new Position(...this.coordinates);
    }
}
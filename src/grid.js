// TODO fix calculation of positions
class Grid {
    constructor(radius, center, size, color = "#000") {
        this.radius = radius;
        this.center = center;
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
        return new Hexagon(this.radius, cartesian);
    }

    // TODO
    getCartesian(position) {
        const { sin, cos, PI } = Math;
        const r = this.radius;
        const v = position.coordinates;

        const cartesian = this.center
            .add(new Cartesian(0, -v[2] * 2 * r * sin(PI / 3)))
            .add(new Cartesian((v[0] - v[1]) * (r + r * cos(PI / 3)), (v[0] + v[1]) * r * sin(PI / 3)));

        return cartesian;
    }

    // TODO
    getPosition(cartesian) {
        const r = this.radius;
        const { sin, cos, PI, floor, ceil } = Math;
        cartesian = cartesian.subtract(this.center);

        const vectorCoordinates = (u, v) => ({
            a: (cartesian.x * v.y - cartesian.y * v.x) / (u.x * v.y - u.y * v.x),
            b: (cartesian.y * u.x - cartesian.x * u.y) / (u.x * v.y - u.y * v.x)
        });

        const roundToCenter = (candidates) => {
            let minDistance;
            let position;
            for (const candidate of candidates) {
                const candidatePosition = new Position(...candidate);
                const candidateCartesian = this.getCartesian(candidatePosition).subtract(this.center);
                const distance = cartesian.distance(candidateCartesian);
                if (minDistance === undefined || distance < minDistance) {
                    minDistance = distance;
                    position = candidatePosition;
                }
            }
            return position;
        }

        const u = new Cartesian(r + r * cos(PI / 3), r * sin(PI / 3));
        const v = new Cartesian(- (r + r * cos(PI / 3)), r * sin(PI / 3));
        const w = new Cartesian(0, - 2 * r * sin(PI / 3));

        let c = vectorCoordinates(u, v);
        if (c.a >= 0 && c.b >= 0) {
            const canditates = [
                [floor(c.a), floor(c.b), 0],
                [floor(c.a), ceil(c.b), 0],
                [ceil(c.a), ceil(c.b), 0],
                [ceil(c.a), floor(c.b), 0],
            ];
            return roundToCenter(canditates);
        };

        c = vectorCoordinates(u, w);
        if (c.a >= 0 && c.b >= 0) {
            const canditates = [
                [floor(c.a), 0, floor(c.b)],
                [floor(c.a), 0, ceil(c.b)],
                [ceil(c.a), 0, ceil(c.b)],
                [ceil(c.a), 0, floor(c.b)],
            ];
            return roundToCenter(canditates);
        };

        c = vectorCoordinates(v, w);
        if (c.a >= 0 && c.b >= 0) {
            const canditates = [
                [0, floor(c.a), floor(c.b)],
                [0, floor(c.a), ceil(c.b)],
                [0, ceil(c.a), ceil(c.b)],
                [0, ceil(c.a), floor(c.b)],
            ];
            return roundToCenter(canditates);
        };
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
            const coordinates = this.grid.getPosition(new Cartesian(event.offsetX, event.offsetY));
            this.listeners.mousedown.forEach(cb => cb(coordinates))
        });
        canvas.addEventListener("mouseup", (event) => {
            const coordinates = this.grid.getPosition(new Cartesian(event.offsetX, event.offsetY));
            this.listeners.mouseup.forEach(cb => cb(coordinates))
        }
        )
        canvas.addEventListener("mousemove", (event) => {
            const coordinates = this.grid.getPosition(new Cartesian(event.offsetX, event.offsetY));
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

    distance(other) {
        return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2);
    }

    output() {
        return { x: this.x, y: this.y };
    }
}
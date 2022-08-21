class Grid {
    constructor(radius, corner, color = "#000") {
        this.radius = radius;
        this.corner = corner;
        this.color = color;
    }

    isInside(position) {
        return position.greaterEqual(new Position(0, 0)) && this.corner.greaterEqual(position.add(new Position(1, 1)));
    }

    getHexagon(position) {
        const { x, y } = this.getCartesianCoordinates(position);
        return new Hexagon(this.radius, x, y);
    }

    getCartesianCoordinates(position) {
        const { sin, cos, PI } = Math;
        const r = this.radius;
        const x = r + position.col * (r + r * cos(PI / 3));
        const y = position.row * 2 * r * sin(PI / 3) + r + (position.col % 2) * r * sin(PI / 3);
        return { x, y };
    }

    getPosition(x, y) {
        let minDistance;
        let position = new Position(0, 0);

        for (const pos of this.corner.positionsBelow()) {
            let point = this.getCartesianCoordinates(pos);
            let distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);

            if (!minDistance || distance < minDistance) {
                minDistance = distance;
                position = pos;
            }
        }
        return position;
    }

    render(ctx) {
        for (const position of this.corner.positionsBelow()) {
            new RenderedHexagon(this.getHexagon(position), this.color).render(ctx);
        }
    }

}

// TODO handle clicking outside of grid
// TODO create extend function to automatically provide default implementations
// TODO enable removing of listeners
class ReactiveGrid {
    constructor(grid, canvas) {
        this.grid = grid;
        this.canvas = canvas;
        this.mouseCoordinates = new Position(-1, -1);
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
            if (this.mouseCoordinates.row !== coordinates.row || this.mouseCoordinates.col !== coordinates.col) {
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

    getCartesianCoordinates(position) {
        return this.grid.getCartesianCoordinates(position);
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
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    equals(other) {
        return this.row === other.row && this.col === other.col;
    }

    greaterEqual(other) {
        return this.row >= other.row && this.col >= other.col;
    }

    add(other) {
        return new Position(this.row + other.row, this.col + other.col);
    }

    subtract(other) {
        return new Position(this.row - other.row, this.col - other.col);
    }

    *positionsBelow() {
        for (let row = 0; row < this.row; row++) {
            for (let col = 0; col < this.col; col++) {
                yield new Position(row, col);
            }
        }
    }

    copy() {
        return new Position(this.row, this.col);
    }
}
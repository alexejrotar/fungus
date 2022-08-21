class Grid {
    constructor(radius, corner, color = "#000") {
        this.radius = radius;
        this.corner = corner;
        this.color = color;
    }

    isInside(gridPosition) {
        return gridPosition.greaterEqual(new GridPosition(0, 0)) && this.corner.greaterEqual(gridPosition.add(new GridPosition(1, 1)));
    }

    getHexagon(gridPosition) {
        const { x, y } = this.getCartesianCoordinates(gridPosition);
        return new Hexagon(this.radius, x, y);
    }

    getCartesianCoordinates(gridPosition) {
        const { sin, cos, PI } = Math;
        const r = this.radius;
        const x = r + gridPosition.col * (r + r * cos(PI / 3));
        const y = gridPosition.row * 2 * r * sin(PI / 3) + r + (gridPosition.col % 2) * r * sin(PI / 3);
        return { x, y };
    }

    getGridCoordinates(x, y) {
        let minDistance;
        let gridPosition = new GridPosition(0, 0);

        for (let row = 0; row < this.corner.row; row++) {
            for (let col = 0; col < this.corner.col; col++) {
                let point = this.getCartesianCoordinates(new GridPosition(row, col));
                let distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);

                if (!minDistance || distance < minDistance) {
                    minDistance = distance;
                    gridPosition = new GridPosition(row, col);
                }
            }
        }
        return gridPosition;
    }

    render(ctx) {
        for (let row = 0; row < this.corner.row; row++) {
            for (let col = 0; col < this.corner.col; col++) {
                new RenderedHexagon(this.getHexagon(new GridPosition(row, col)), this.color).render(ctx);
            }
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
        this.mouseCoordinates = new GridPosition(-1, -1);
        this.mousedownListeners = [];
        this.mouseupListeners = [];
        this.mousemoveListeners = [];
        canvas.addEventListener("mousedown", (event) => {
            const coordinates = this.grid.getGridCoordinates(event.offsetX, event.offsetY);
            this.mousedownListeners.forEach(cb => cb(coordinates))
        });
        canvas.addEventListener("mouseup", (event) => {
            const coordinates = this.grid.getGridCoordinates(event.offsetX, event.offsetY);
            this.mouseupListeners.forEach(cb => cb(coordinates))
        }
        )
        canvas.addEventListener("mousemove", (event) => {
            const coordinates = this.grid.getGridCoordinates(event.offsetX, event.offsetY);
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

    getHexagon(gridPosition) {
        return this.grid.getHexagon(gridPosition);
    }

    getCartesianCoordinates(gridPosition) {
        return this.grid.getCartesianCoordinates(gridPosition);
    }

    getGridCoordinates(x, y) {
        return this.grid.getGridCoordinates(x, y);
    }

    render(ctx) {
        this.grid.render(ctx);
    }

    isInside(gridPosition) {
        return this.grid.isInside(gridPosition);
    }
}

class GridPosition {
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
        return new GridPosition(this.row + other.row, this.col + other.col);
    }

    subtract(other) {
        return new GridPosition(this.row - other.row, this.col - other.col);
    }
}
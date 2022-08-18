class Grid {
    constructor(radius, rows, cols) {
        this.radius = radius;
        this.rows = rows;
        this.cols = cols;
    }

    getHexagon(row, col) {
        const { x, y } = this.getCartesianCoordinates(row, col);
        return new Hexagon(this.radius, x, y);
    }

    getCartesianCoordinates(row, col) {
        const { sin, cos, PI } = Math;
        const r = this.radius;
        const x = r + col * (r + r * cos(PI / 3));
        const y = row * 2 * r * sin(PI / 3) + r + (col % 2) * r * sin(PI / 3);
        return { x, y };
    }

    getGridCoordinates(x, y) {
        let minDistance;
        let row = 0;
        let col = 0;

        for (let currentRow = 0; currentRow < this.rows; currentRow++) {
            for (let currentCol = 0; currentCol < this.cols; currentCol++) {
                let point = this.getCartesianCoordinates(currentRow, currentCol);
                let distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
                if (!minDistance || distance < minDistance) {
                    minDistance = distance;
                    row = currentRow;
                    col = currentCol;
                }
            }
        }
        return { row, col };
    }

    getHexagons() {
        const hexagons = [];
        for (let row = 0; row < this.rows; row ++) {
            for (let col = 0; col < this.cols; col++) {
                hexagons.push(this.getHexagon(row, col));
            }
        }
        return hexagons;
    }

}

class RenderedGrid {
    constructor(grid) {
        this.grid = grid;
    }

    getHexagon(row, col) {
        return this.grid.getHexagon(row, col);
    }

    getCartesianCoordinates(row, col) {
        return this.grid.getCartesianCoordinates(row, col);
    }

    getGridCoordinates(x, y) {
        return this.grid.getGridCoordinates(x, y);
    }

    render(ctx) {
        return this.getHexagons().forEach(hexagon => hexagon.render(ctx));
    }

    getHexagons() {
        return this.grid.getHexagons().map(hexagon => new RenderedHexagon(hexagon));
    }
}

class ColoredGrid {
    constructor(renderedGrid, color) {
        this.grid = renderedGrid;
        this.color = color;
    }

    getHexagon(row, col) {
        return this.grid.getHexagon(row, col);
    }

    getCartesianCoordinates(row, col) {
        return this.grid.getCartesianCoordinates(row, col);
    }

    getGridCoordinates(x, y) {
        return this.grid.getGridCoordinates(x, y);
    }

    getHexagons() {
        return this.grid.getHexagons().map(hexagon => new ColoredHexagon(hexagon, this.color));
    }

    render(ctx) {
        this.getHexagons().forEach(hexagon => hexagon.render(ctx));
    }
}

// TODO handle clicking outside of grid
class ReactiveGrid {
    constructor(renderedGrid, canvas) {
        this.grid = renderedGrid;
        this.canvas = canvas;
        this.listeners = [];
        this.mousedownListeners = [];
        this.mouseupListeners = [];
        this.mousemoveListeners = [];
        canvas.addEventListener("mousedown", (event) => 
            this.mousedownListeners.forEach(cb => 
                cb(this.grid.getGridCoordinates(event.offsetX, event.offsetY))))
        canvas.addEventListener("mouseup", (event) => 
            this.mouseupListeners.forEach(cb => 
                cb(this.grid.getGridCoordinates(event.offsetX, event.offsetY))))
        canvas.addEventListener("mousemove", (event) => 
            this.mousemoveListeners.forEach(cb => 
                cb(this.grid.getGridCoordinates(event.offsetX, event.offsetY))))
    }

    withMousedownListener(callback) {
        const newGrid = new ReactiveGrid(this.grid, this.canvas);
        newGrid.mousedownListeners = [...this.mousedownListeners, callback];
        newGrid.mouseupListeners = this.mouseupListeners;
        newGrid.mousemoveListeners = this.mousemoveListeners;
        return newGrid;
    }
    withMouseupListener(callback) {
        const newGrid = new ReactiveGrid(this.grid, this.canvas);
        newGrid.mousedownListeners = this.mousedownListeners;
        newGrid.mouseupListeners = [...this.mouseupListeners, callback];
        newGrid.mousemoveListeners = this.mousemoveListeners;
        return newGrid;
    }
    withMousemoveListener(callback) {
        const newGrid = new ReactiveGrid(this.grid, this.canvas);
        newGrid.mousedownListeners = this.mousedownListeners;
        newGrid.mouseupListeners = this.mouseupListeners;
        newGrid.mousemoveListeners = [...this.mousemoveListeners, callback];
        return newGrid;
    }

    getHexagon(row, col) {
        return this.grid.getHexagon(row, col);
    }

    getCartesianCoordinates(row, col) {
        return this.grid.getCartesianCoordinates(row, col);
    }

    getGridCoordinates(x, y) {
        return this.grid.getGridCoordinates(x, y);
    }

    getHexagons() {
        return this.grid.getHexagons().map(hexagon => new ColoredHexagon(hexagon, this.color));
    }
    render(ctx) {
        this.grid.render(ctx);
    }
}
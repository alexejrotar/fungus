class ClickHandler {
    constructor(canvas, points, molecules) {
        this.canvas = canvas;
        this.molecules = molecules;
        this.points = points;
        canvas.addEventListener("click", (event) => this.onclick(event));
    }

    onclick(event) {
        const { row, col } = this.getGridCoordinates(event.offsetX, event.offsetY);
        console.log(`row: ${row}, col: ${col}`);
        for (const molecule of this.molecules) {
            if (molecule.shape.find(part => part.row == row && part.col == col)) {
                console.log(molecule);
                return;
            }
        }
    }

    getGridCoordinates(x, y) {
        let minDistance;
        let row = 0;
        let col = 0;

        for (const point of this.points) {
            let distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
            if (!minDistance || distance < minDistance) {
                minDistance = distance;
                row = point.row;
                col = point.col;
            }
        }
        return { row, col };
    }
}
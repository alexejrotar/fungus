class Grid {
    static getGridPoints(radius, numRows, numCols) {
        const points = [];
        const { sin, cos, PI } = Math;

        for (let row = 0; row <= numRows; row++) {
            for (let col = 0; col <= numCols; col++) {
                const x = radius + col * (radius + radius * cos(PI / 3));
                const y = row * 2 * radius * sin(PI / 3) + radius + (col % 2) * radius * sin(PI / 3);
                points.push({x, y, row, col});
            }
        }
        return points;
    }
}
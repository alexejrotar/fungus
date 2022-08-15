class Renderer {
    constructor(ctx, radius) {
        this.ctx = ctx;
        this.radius = radius;
    }

    hexagon(row, column, color = "#000") {
        const ctx = this.ctx;
        const { sin, cos, PI } = Math;
        const r = this.radius;

        const x = r + column * (r + r * cos(PI / 3));
        const y = row * 2 * r * sin(PI / 3) + r + (column % 2) * r * sin(PI / 3);

        ctx.strokeStyle = color;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(x + r * cos(i * PI / 3), y + r * sin(i * PI / 3));
        }
        ctx.closePath();
        ctx.stroke();
    }

    grid(numRows, numCols, color = "#000") {
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                this.hexagon(row, col, color);
            }
        }
    }
}
class Renderer {
    constructor(ctx, radius) {
        this.ctx = ctx;
        this.radius = radius;
    }

    hexagon(row, column, color = "#000", sides = [0, 1, 2, 3, 4, 5]) {
        const ctx = this.ctx;
        const { sin, cos, PI } = Math;
        const r = this.radius;

        const x = r + column * (r + r * cos(PI / 3));
        const y = row * 2 * r * sin(PI / 3) + r + (column % 2) * r * sin(PI / 3);

        ctx.strokeStyle = color;

        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
            const xPos = x + r * cos(i * PI / 3);
            const yPos = y + r * sin(i * PI / 3);
            if (!sides.includes(i - 1)) {
                ctx.moveTo(xPos, yPos);
            } else {
                ctx.lineTo(xPos, yPos);
            }
        }
        ctx.stroke();
    }

    grid(numRows, numCols, color = "#000") {
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                this.hexagon(row, col, color);
            }
        }
    }

    molecule(molecule) {
        for (const part of molecule.shape) {
            this.hexagon(
                part.row + molecule.position.row,
                part.col + molecule.position.col,
                "#000",
                part.sides
            );
        }
    }
}
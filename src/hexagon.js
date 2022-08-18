class Hexagon {
    constructor(radius, x, y) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    getSides() {
        const sides = [];
        for (let i = 0; i < 6; i++) {
            const source = { x: this.getX(i), y: this.getY(i) };
            const target = { x: this.getX(i + 1), y: this.getY(i + 1) };
            sides.push([source, target]);
        }
        return sides;
    }

    getX(index) {
        return this.x + this.radius * Math.cos(index * Math.PI / 3);
    }

    getY(index) {
        return this.y + this.radius * Math.sin(index * Math.PI / 3);
    }
}

class RenderedHexagon {
    constructor(hexagon) {
        this.hexagon = hexagon;
    }

    getSides() {
        return this.hexagon.getSides();
    }

    render(ctx) {
        const sides = this.getSides();
        ctx.beginPath();
        for (const side of sides) {
            ctx.moveTo(side[0].x, side[0].y);
            ctx.lineTo(side[1].x, side[1].y);
        }
        ctx.stroke();
    }
}

class ColoredHexagon {
    constructor(hexagon, color) {
        this.hexagon = hexagon;
        this.color = color;
    }

    render(ctx) {
        ctx.save();
        ctx.strokeStyle = this.color;
        this.hexagon.render(ctx);
        ctx.restore();
    }

    getSides() {
        return this.hexagon.getSides();
    }
}

class PartialHexagon {
    constructor(hexagon, points) {
        this.hexagon = hexagon;
        this.points = points;
    }

    getSides() {
        return this.hexagon.getSides().filter((_, i) => this.points.includes(i));
    }
}
class Hexagon {
    constructor(radius, x, y) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    getSides() {
        const sides = [];
        for (let i = 0; i < 6; i++) {
            const source = this.getCartesian(i);
            const target = this.getCartesian(i + 1);
            sides.push([source, target]);
        }
        return sides;
    }


    getCartesian(index) {
        const x = this.x + this.radius * Math.cos(index * Math.PI / 3);
        const y = this.y + this.radius * Math.sin(index * Math.PI / 3);
        return { x, y };

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

class RenderedHexagon {
    constructor(hexagon, color = "#000") {
        this.hexagon = hexagon;
        this.color = color;
    }

    render(ctx) {
        const sides = this.hexagon.getSides();
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        for (const side of sides) {
            ctx.moveTo(side[0].x, side[0].y);
            ctx.lineTo(side[1].x, side[1].y);
        }
        ctx.stroke();
        ctx.restore();
    }
}
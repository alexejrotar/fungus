class Hexagon {
    constructor(radius, cartesian) {
        this.cartesian = cartesian;
        this.radius = radius;
    }

    getSides() {
        const sides = [];
        for (let i = 0; i < 6; i++) {
            const source = this.getCartesian(i);
            const target = this.getCartesian(i + 1);
            sides.push([source, target]);
        }
        return { visible: sides, all: sides };
    }


    getCartesian(index) {
        const cartesian = this.cartesian
            .add(new Cartesian(
                this.radius * Math.cos(index * Math.PI / 3),
                this.radius * Math.sin(index * Math.PI / 3)
            ))
            .add(new Cartesian(
                Math.random() * 4 - 2,
                Math.random() * 4 - 2));
        return cartesian;

    }
}

class PartialHexagon {
    constructor(hexagon, points) {
        this.hexagon = hexagon;
        this.points = points;
    }

    getSides() {
        const sides = this.hexagon.getSides();

        // TODO not quite happy with this..
        return {
            all: sides.all,
            visible: sides.visible
                .filter((_, i) => this.points.includes(i)),
        };
    }
}

class RenderedHexagon {
    constructor(hexagon, color = "#000", fill = false) {
        this.hexagon = hexagon;
        this.color = color;
        this.fill = fill;
    }

    render(ctx) {
        const sides = this.hexagon.getSides();
        ctx.save();

        ctx.strokeStyle = this.color;
        ctx.beginPath();
        for (const side of sides.visible) {
            ctx.moveTo(side[0].x, side[0].y);
            ctx.lineTo(side[1].x, side[1].y);
        }
        ctx.stroke();

        if (this.fill) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.moveTo(sides.all[0][0].x, sides.all[0][0].y);
            for (const side of sides.all) {
                ctx.lineTo(side[1].x, side[1].y);
            }
            ctx.fill();
        }

        ctx.restore();
    }
}
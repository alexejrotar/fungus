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
        return sides;
    }


    getCartesian(index) {
        const cartesian = this.cartesian
            .add(new Vector(
                this.radius * Math.cos(index * Math.PI / 3),
                this.radius * Math.sin(index * Math.PI / 3)
            ))
            // .add(new Vector(
            //     Math.random() * 2 - 1,
            //     Math.random() * 2 - 1));
        return cartesian;

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
        ctx.moveTo(sides[0][0].v[0], sides[0][0].v[1]);
        for (const side of sides) {
            ctx.lineTo(side[1].v[0], side[1].v[1]);
        }
        ctx.stroke();

        if (this.fill) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.2;
            ctx.fill();
        }

        ctx.restore();
    }
}
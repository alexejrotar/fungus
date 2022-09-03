class Hint {
    constructor(position, expire, getHexagon) {
        this.position = position;
        this.expire = expire;
        this.getHexagon = getHexagon;
        this.fade = 10;
    }

    render(ctx) {
        if (this.fade === 0) {
            this.expire(this);
            return;
        }
        (new RenderedHexagon(this.getHexagon(this.position), "white", this.fade / 10)).render(ctx);
        this.fade--;
    }
}
class Hint {
    constructor(hexagon, expire) {
        this.hexagon = hexagon;
        this.expire = expire;
        this.fade = 10;
    }

    render() {
        if (this.fade === 0) {
            this.expire(this);
            return;
        }
        (new RenderedHexagon(this.hexagon, "white", this.fade / 10)).render();
        this.fade--;
    }
}
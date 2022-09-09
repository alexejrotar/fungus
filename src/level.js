class Level {
    constructor(molecules, completed = () => { }) {
        this.molecules = molecules;
        this.hints = [];
        this.completed = completed;
        reactive.setListeners({
            mousedown: position => this.handleMousedown(position),
            mousemove: position => this.handleMousemove(position),
            mouseup: position => this.handleMouseup(position),
            left: this.handleLeft.bind(this),
            right: this.handleRight.bind(this),
        })
    }

    isOccupied(molecules, position) {
        return molecules.some(molecule => molecule.isAt(position));
    }

    dissovle(molecule) {
        this.molecules = this.molecules.filter(other => other !== molecule);
        if (this.molecules.length === 0) this.completed();
    }

    hintAt(position) {
        this.hints.push(new Hint(grid.getHexagon(position), this.expireHint.bind(this)));
    }

    expireHint(hint) {
        this.hints = this.hints.filter(other => hint !== other);
    }

    render() {
        ctx.save();
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        grid.render();
        this.molecules.forEach(molecule => molecule.render());
        this.hints.forEach(hint => hint.render());
    }

    handleMousedown(position) {
        this.molecules.forEach(molecule => molecule.mousedown(position));
    }

    handleMousemove(position) {
        this.molecules.forEach(molecule => molecule.mousemoved(
            position,
            this.dissovle.bind(this),
            this.isOccupied.bind(this, this.molecules.filter(other => other !== molecule)),
            this.hintAt.bind(this),
        ));
    }

    handleMouseup(_) {
        this.molecules.forEach(molecule => molecule.mouseup());
    }

    handleLeft() {
        this.molecules.forEach(molecule => molecule.left(
            this.dissovle.bind(this),
            this.isOccupied.bind(this, this.molecules.filter(other => other !== molecule)),
            this.hintAt.bind(this),
        ));
    }

    handleRight() {
        this.molecules.forEach(molecule => molecule.right(
            this.dissovle.bind(this),
            this.isOccupied.bind(this, this.molecules.filter(other => other !== molecule)),
            this.hintAt.bind(this),
        ));
    }
}
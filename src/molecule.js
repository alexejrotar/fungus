class Molecule {
    constructor(shape, position, rotation) {
        this.shape = shape;
        this.position = position;
        this.rotation = rotation;
    }

    static variant1(row = 0, col = 0) {
        const shape = [{
            row: 0,
            col: 0,
        }, {
            row: 1,
            col: 0,
            sides: [0, 5]
        }, {
            row: 2,
            col: 0,
        }, {
            row: 0,
            col: 1,
            sides: [4, 5]
        }];
        return new Molecule(shape, { row, col }, 0);
    }
}
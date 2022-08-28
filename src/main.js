function startGame() {
    const canvas = document.getElementById("canvas");
    const game = new Game([
        {
            g: { r: 20, c: { x: 500, y: 500 }, s: 10, },
            m: [
                { c: "#2ab", s: [[0, 0, 0], [0, 0, 1]] }
            ]
        },
        {
            g: { r: 15, c: { x: 500, y: 500 }, s: 15, },
            m: [
                { c: "#2ab", s: [[0, 0, 3], [0, 0, 2], [0, 1, 2]] }
            ]
        }
    ], canvas);
    game.start();
}
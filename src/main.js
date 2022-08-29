function startGame() {
    const canvas = document.getElementById("canvas");
    const game = new Game([
        {"g":{"c":{"x":500,"y":500},"r":20,"s":15},"m":[{"c":"#2ab","s":[[1,1,0],[2,2,0],[3,3,0],[4,4,0],[5,5,0],[6,6,0],[7,7,0]]}]},
        {
            g: { r: 15, c: { x: 500, y: 500 }, s: 15, },
            m: [
                { c: "#2ab", s: [[0, 0, 3], [0, 0, 2], [0, 1, 2]] }
            ]
        }
    ], canvas);
    game.start();
}
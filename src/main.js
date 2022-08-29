function startGame() {
    const canvas = document.getElementById("canvas");
    const game = new Game([
        {"g":{"c":{"x":500,"y":500},"r":20,"s":15},"m":[{"c":"#2ab","s":[[0,1,2],[0,1,1],[0,1,0],[1,2,0],[2,3,0],[3,4,0],[4,5,0],[3,5,0],[2,5,0],[1,5,0],[0,5,0],[0,6,1],[0,7,2],[0,6,2],[0,5,2],[0,4,2],[0,5,3],[0,6,4],[0,7,5]]},{"c":"#2ab","s":[[0,4,1],[0,3,1],[0,2,1],[0,3,2],[0,4,3],[0,5,4],[0,6,5],[0,5,5],[0,4,5]]}]},
        {
            g: { r: 15, c: { x: 500, y: 500 }, s: 15, },
            m: [
                { c: "#2ab", s: [[0, 0, 3], [0, 0, 2], [0, 1, 2]] }
            ]
        }
    ], canvas);
    game.start();
}
function startGame() {
    const canvas = document.getElementById("canvas");
    const introWrapper = document.getElementById("intro");
    let game;

    const b64 = new URLSearchParams(window.location.search).get("description");
    if (b64) {
        const json = window.atob(b64);
        const description = JSON.parse(json);
        game = new Game([{ "t": "blub", ...description }], canvas, introWrapper);
    } else {

        game = new Game(
            [
                {
                    "t": "welcome to fungus",
                    "g": { "c": [500, 500], "r": 15, "s": 15 }, "m": [{ "c": "rgb(200, 187, 226)", "s": [[0, 1, 5], [0, 0, 4], [1, 0, 5], [2, 0, 5], [3, 0, 5], [4, 0, 5], [5, 0, 5], [4, 0, 4], [3, 0, 3], [2, 0, 2], [1, 0, 1], [0, 0, 1]] }, { "c": "rgb(244, 253, 241)", "s": [[1, 3, 0], [1, 2, 0], [2, 2, 0], [3, 2, 0]] }, { "c": "rgb(205, 105, 149)", "s": [[0, 4, 6], [0, 4, 7], [0, 3, 7], [0, 2, 6], [0, 2, 7], [0, 1, 6], [0, 0, 5]] }, { "c": "rgb(162, 211, 158)", "s": [[2, 0, 4], [3, 0, 4], [2, 0, 3], [1, 0, 2]] }, { "c": "rgb(185, 209, 183)", "s": [[0, 2, 4], [0, 1, 4], [0, 0, 3], [1, 0, 3], [0, 0, 2], [0, 1, 2], [0, 2, 2], [0, 1, 1], [0, 0, 0], [1, 0, 0], [2, 0, 1], [3, 0, 2], [4, 0, 3], [5, 0, 4], [6, 0, 4], [7, 0, 4]] }, { "c": "rgb(153, 100, 167)", "s": [[0, 1, 3], [0, 2, 3], [0, 3, 3], [0, 3, 2], [0, 2, 1], [0, 1, 0]] }, { "c": "rgb(135, 200, 204)", "s": [[0, 4, 3], [0, 4, 4], [0, 3, 4], [0, 3, 5], [0, 4, 5], [0, 5, 6], [0, 6, 6]] }]
                },
                {
                    "t": "Another intro",
                    "g": { "c": [500, 500], "r": 15, "s": 15 }, "m": [{ "c": "rgb(228, 238, 109)", "s": [[0, 0, 2]] }, { "c": "rgb(222, 166, 109)", "s": [[2, 0, 2], [1, 0, 1], [0, 0, 1], [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 2, 4], [0, 1, 4], [0, 0, 4], [1, 0, 4]] }, { "c": "rgb(146, 184, 190)", "s": [[0, 1, 3], [0, 0, 3], [1, 0, 3], [2, 0, 3], [2, 0, 4], [2, 0, 5], [2, 0, 6], [2, 0, 7], [2, 0, 8], [2, 0, 9], [2, 0, 10], [1, 0, 9], [0, 0, 8], [0, 1, 8], [0, 2, 8], [0, 2, 7]] }, { "c": "rgb(143, 253, 134)", "s": [[1, 0, 5], [1, 0, 6], [1, 0, 7], [1, 0, 8], [0, 0, 7], [0, 1, 7], [0, 1, 6], [0, 2, 6], [0, 3, 6], [0, 4, 6], [0, 5, 6], [0, 6, 6], [0, 5, 5], [0, 4, 4], [0, 3, 3], [0, 2, 2]] }]
                }
            ],
            canvas,
            introWrapper);
    }

    game.start();
}
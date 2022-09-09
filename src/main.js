let game;

function startGame() {
  const canvas = document.getElementById("canvas");
  const introWrapper = document.getElementById("intro");
  const grid = new Grid(15, new Vector(500, 500), 15, "#777");

  const b64 = new URLSearchParams(window.location.search).get("level");
  if (b64) {
    const json = window.atob(b64);
    const description = JSON.parse(json);
    game = new Game(grid, [description], canvas, introWrapper);
  } else {
    game = new Game(grid, levelCollection, canvas, introWrapper);
  }

  game.start();
}

function translateLevel() {
  const b64 = new URLSearchParams(window.location.search).get("level");
  const json = window.atob(b64);
  const desc = JSON.parse(json);
  const m = desc.m.map(({ c, s }) => ({
    c,
    s: s.map(p => [p[0] - p[2], p[1] - p[2]])
  }));
  console.log(JSON.stringify({ m }));
}
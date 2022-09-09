let game;
let canvas;
let ctx;
let introBox;
let grid;
let reactive;

function startGame() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  introBox = document.getElementById("intro");
  grid = new Grid(15, new Vector(canvas.width/2, canvas.height/2), 15, "#777");
  reactive = new ReactiveGrid();

  const b64 = new URLSearchParams(window.location.search).get("level");
  if (b64) {
    const json = window.atob(b64);
    const description = JSON.parse(json);
    game = new Game([description]);
  } else {
    game = new Game(levelCollection);
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
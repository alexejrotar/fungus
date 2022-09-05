function startGame() {
  const canvas = document.getElementById("canvas");
  const introWrapper = document.getElementById("intro");
  let game;

  const b64 = new URLSearchParams(window.location.search).get("description");
  if (b64) {
    const json = window.atob(b64);
    const description = JSON.parse(json);
    game = new Game([{ t: "blub", ...description }], canvas, introWrapper);
  } else {
    game = new Game(levelCollection, canvas, introWrapper);
  }

  game.start();
  initializeMusic();
}
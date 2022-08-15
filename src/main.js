function startGame() {
    console.log("starting game...");
    const ctx = document.getElementById("canvas").getContext("2d");

    ctx.fillStyle = "green";
    ctx.fillRect(10, 10, 50, 50);
}
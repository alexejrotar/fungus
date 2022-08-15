const WIDTH = 1600;
const HEIGHT = 800;

function startGame() {
    const canvas = document.getElementById("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#522";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = null;

    const renderer = new Renderer(ctx, 50);
    renderer.grid(8, 20, "#ddd");
}
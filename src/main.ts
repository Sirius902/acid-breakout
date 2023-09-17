import { GameLoop } from "./game_loop";
import GameContext from "./GameContext";
import { Vector3 } from "./lib/cuon-matrix-cse160";
import Particle from "./Particle";
import { clamp } from "./util";

let gameLoop: GameLoop;
let ctx: GameContext;

function init() {
  const canvas = document.getElementById("game");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.log("Failed to retrieve the <canvas> element");
    return;
  }

  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to retrieve canvas context");
    return;
  }

  gameLoop = new GameLoop(resetGame, (loopCtx) => {
    ctx.time = loopCtx.time;
    ctx.dt = loopCtx.dt;
    ctx.gameplayFrames = loopCtx.gameplayFrames;

    gameFrame();
  });
  ctx = new GameContext(canvas, gl);
  addEventListeners();
  gameLoop.start();
}

function resetGame(): void {
  const { gl, canvas } = ctx;

  ctx.mousePosition = [canvas.width / 2, 0.0];
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.uniform2f(ctx.uResolution, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  ctx.reset();

  ctx.particles.push(
    new Particle(
      new Vector3([canvas.width / 2, canvas.height / 2, 0.0]),
      [0.0, 1.0, 0.0],
      new Vector3([0.0, 0.0, 0.0]),
    ),
  );
}

function gameFrame(): void {
  const { gl } = ctx;

  for (let i = 0; i < ctx.particles.length; i++) {
    const particle = ctx.particles[i];
    if (particle.shouldDelete(ctx)) {
      ctx.particles.splice(i--, 1);
      continue;
    }
    particle.update(ctx);
  }
  ctx.paddle.update(ctx);
  ctx.strip.draw(ctx);
  ctx.strip.update(ctx);

  gl.clear(gl.COLOR_BUFFER_BIT);

  for (const particle of ctx.particles) {
    particle.draw(ctx);
  }
  ctx.paddle.draw(ctx);
  ctx.strip.draw(ctx);

  ctx.gameplayFrames += 1;
}

function addEventListeners(): void {
  const { canvas } = ctx;

  const fullscreenButton = document.getElementById("fullscreen-button")!;
  fullscreenButton.addEventListener("click", () => {
    canvas.requestFullscreen();
  });

  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    ctx.mousePosition = [
      e.offsetX / rect.width * canvas.width,
      e.offsetY / rect.height * canvas.height,
    ];

    if (document.fullscreenElement === canvas) {
      if (rect.width > rect.height) {
        ctx.mousePosition[0] = (e.offsetX - ((rect.width - rect.height) / 2)) / rect.height * canvas.width;
        ctx.mousePosition[0] = clamp(ctx.mousePosition[0], 0, canvas.width);
      } else {
        ctx.mousePosition[1] = (e.offsetY - ((rect.height - rect.width) / 2)) / rect.width * canvas.height;
        ctx.mousePosition[1] = clamp(ctx.mousePosition[1], 0, canvas.height);
      }
    }
  });

  const resetButton = document.getElementById("reset-button")!;
  resetButton.addEventListener("click", () => {
    gameLoop.stop();
    gameLoop.start();
  });
}

init();

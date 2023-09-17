import { drawRect } from "./draw";
import GameContext from "./GameContext";
import { Vector3 } from "./lib/cuon-matrix-cse160";
import { clamp } from "./util";

export default class Paddle {
  pos: Vector3;
  readonly size: [number, number];

  constructor(ctx: GameContext) {
    const { canvas } = ctx;
    this.pos = new Vector3([canvas.width / 2, 0.95 * canvas.height, 0.0]);
    this.size = [0.45 / 2 * canvas.width, 0.05 / 2 * canvas.height];
  }

  draw(ctx: GameContext): void {
    const { gl } = ctx;

    gl.uniform1i(ctx.uRainbow, 1);
    gl.uniform1i(ctx.uUseSampler, 0);
    gl.uniform1f(ctx.uTime, ctx.time);
    drawRect(ctx, this.pos, this.size);
  }

  update(ctx: GameContext): void {
    const { canvas } = ctx;
    this.pos.elements[0] = clamp(ctx.mousePosition[0] - (this.size[0] / 2), 0, canvas.width - this.size[0]);
  }
}

import GameContext from "./GameContext";
import { Vector3 } from "./lib/cuon-matrix-cse160";
import { clamp, glCoord, randomInRange, rectContains } from "./util";

const trailInterval: number = 3;

export default class Particle {
  isBall: boolean = false;
  posHistory: Float32Array[];
  readonly gravity: number = 1.0 / 60.0;

  constructor(
    public pos: Vector3,
    public color: readonly [number, number, number],
    public vel: Vector3,
  ) {
    this.pos = pos;
    this.posHistory = [];
  }

  static initialVelocity(): Vector3 {
    return new Vector3([randomInRange(-1.0, 1.0), 0.0, 0.0]);
  }

  draw(ctx: GameContext): void {
    const { gl, canvas } = ctx;

    if (this.posHistory.length > 0) {
      const vertices = new Float32Array((this.posHistory.length - 1) * 2);
      const colors = new Float32Array((this.posHistory.length - 1) * 4);

      let a = 1.0;
      for (let i = this.posHistory.length - 1; i >= 0; i--) {
        const x = glCoord(this.posHistory[i][0], canvas.width);
        const y = -glCoord(this.posHistory[i][1], canvas.height);

        vertices[(i * 2) + 0] = x;
        vertices[(i * 2) + 1] = y;

        colors[(i * 4) + 0] = a * this.color[0];
        colors[(i * 4) + 1] = a * this.color[1];
        colors[(i * 4) + 2] = a * this.color[2];
        colors[(i * 4) + 3] =
          this.isBall || (i % trailInterval === (trailInterval - 1) - (ctx.gameplayFrames % trailInterval)) ? 1.0 : 0.0;
        a -= 1.0 / this.posHistory.length;
      }

      const vertexBuffer = gl.createBuffer();
      if (!vertexBuffer) {
        console.log("Failed to create the buffer object");
        return;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(ctx.aPosition, 2, gl.FLOAT, false, 2 * 4, 0);
      gl.enableVertexAttribArray(ctx.aPosition);

      const colorBuffer = gl.createBuffer();
      if (!colorBuffer) {
        console.log("Failed to create the buffer object");
        return;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(ctx.aColor, 4, gl.FLOAT, false, 4 * 4, 0);
      gl.enableVertexAttribArray(ctx.aColor);

      gl.uniform1i(ctx.uRainbow, 0);
      gl.uniform1i(ctx.uUseSampler, 0);

      if (this.isBall) {
        gl.drawArrays(gl.LINE_STRIP, 0, Math.floor(vertices.length / 2));
      } else {
        gl.drawArrays(gl.POINTS, 0, Math.floor(vertices.length / 2));
      }

      gl.deleteBuffer(colorBuffer);
      gl.deleteBuffer(vertexBuffer);
      gl.disableVertexAttribArray(ctx.aColor);
      gl.disableVertexAttribArray(ctx.aPosition);
    }
  }

  update(ctx: GameContext): void {
    const { canvas } = ctx;
    if (this.posHistory.length > 60) {
      this.posHistory.splice(0, 1);
    }

    if (!this.isBall) {
      this.vel.elements[1] += this.gravity * ctx.dt;
    }

    const vel = new Vector3().set(this.vel).mul(ctx.dt);
    this.pos.add(vel);

    if (this.isBall) {
      this.pos.elements[0] = clamp(this.pos.elements[0], 0, canvas.width - 1);
      this.pos.elements[1] = Math.max(this.pos.elements[1], 0);

      if (this.pos.elements[0] === 0 || this.pos.elements[0] === canvas.width - 1) {
        this.vel.elements[0] *= -1;
      }

      if (this.pos.elements[1] === 0) {
        this.vel.elements[1] *= -1;
      }
    }

    if (rectContains(ctx.paddle.pos, ctx.paddle.size, this.pos) && this.vel.elements[1] > 0) {
      this.vel.elements[0] = (this.pos.elements[0] - (ctx.paddle.pos.elements[0] + (ctx.paddle.size[0] / 2)))
        / (ctx.paddle.size[0] / 4);
      this.vel.elements[1] *= -1;
      const mag = 2 * Math.sqrt(2);
      this.vel.normalize().mul(mag);
      this.isBall = true;
    }

    this.posHistory.push(this.pos.elements.slice(0, 2));
  }

  shouldDelete(ctx: GameContext): boolean {
    const offScreen = (p: Float32Array): boolean => p[1] > ctx.canvas.height || p[0] < 0 || p[0] > ctx.canvas.width;
    return offScreen(this.pos.elements) && this.posHistory.every((p) => offScreen(p));
  }
}

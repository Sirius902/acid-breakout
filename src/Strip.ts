import { drawRect } from "./draw";
import GameContext from "./GameContext";
import { Vector3 } from "./lib/cuon-matrix-cse160";
import Particle from "./Particle";
import { rectContains } from "./util";

export default class Strip {
  pos: Vector3;
  readonly size: [number, number];

  pixels: Uint8Array;
  rowColors: Uint8Array | null = null;

  constructor(ctx: GameContext) {
    const { canvas } = ctx;
    this.pos = new Vector3([0, 0, 0]);
    this.size = [Math.floor(canvas.width), Math.floor(canvas.height / 4)];
    this.pixels = new Uint8Array(Array(this.size[0] * this.size[1]).fill(255));
  }

  update(ctx: GameContext): void {
    const { gl } = ctx;

    for (const particle of ctx.particles) {
      if (particle.isBall && rectContains(this.pos, this.size, particle.pos)) {
        if (!this.rowColors) {
          this.rowColors = new Uint8Array(gl.drawingBufferWidth * 4);
          gl.readPixels(0, this.size[0] - this.size[1], this.size[0], 1, gl.RGBA, gl.UNSIGNED_BYTE, this.rowColors);
        }

        const x = Math.floor(particle.pos.elements[0]);
        const y = Math.floor(particle.pos.elements[1]);
        const i = (y * this.size[0]) + x;
        if (this.pixels[i] !== 0) {
          this.pixels[i] = 0;

          particle.vel.elements[1] *= -1;
          const color = [
            this.rowColors[x * 4 + 0] / 255,
            this.rowColors[x * 4 + 1] / 255,
            this.rowColors[x * 4 + 2] / 255,
          ] as const;
          ctx.particles.push(
            new Particle(
              new Vector3([x, y, 0.0]),
              color,
              Particle.initialVelocity(),
            ),
          );
        }
      }
    }
  }

  draw(ctx: GameContext): void {
    const { gl } = ctx;
    const [w, h] = this.size;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, w, h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, this.pixels);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(ctx.uSampler, 0);

    const texCoords = gl.createBuffer();
    if (!texCoords) {
      throw new Error("Failed to create the buffer object");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoords);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0]), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(ctx.aTexCoord, 2, gl.FLOAT, false, 2 * 4, 0);
    gl.enableVertexAttribArray(ctx.aTexCoord);

    gl.uniform1i(ctx.uRainbow, 1);
    gl.uniform1i(ctx.uUseSampler, 1);
    gl.uniform1f(ctx.uTime, 0.0);
    drawRect(ctx, new Vector3([0.0, 0.0, 0.0]), [w, h]);

    gl.deleteBuffer(texCoords);
    gl.deleteTexture(texture);
    gl.disableVertexAttribArray(ctx.aTexCoord);
    gl.disableVertexAttribArray(ctx.aPosition);
  }
}

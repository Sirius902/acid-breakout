import GameContext from "./GameContext";
import { Vector3 } from "./lib/cuon-matrix-cse160";
import { glCoord } from "./util";

export function drawRect(ctx: GameContext, pos: Vector3, size: [number, number]): void {
  const { gl, canvas } = ctx;

  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  {
    const w = 2 * size[0] / canvas.width;
    const h = 2 * size[1] / canvas.height;
    const x = glCoord(pos.elements[0], canvas.width);
    const y = -glCoord(pos.elements[1], canvas.height);

    const bl = [x, y - h];
    const br = [x + w, y - h];
    const tl = [x, y];
    const tr = [x + w, y];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...bl, ...br, ...tr, ...tr, ...tl, ...bl]), gl.DYNAMIC_DRAW);
  }
  gl.vertexAttribPointer(ctx.aPosition, 2, gl.FLOAT, false, 2 * 4, 0);
  gl.enableVertexAttribArray(ctx.aPosition);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.deleteBuffer(vertexBuffer);
  gl.disableVertexAttribArray(ctx.aPosition);
}

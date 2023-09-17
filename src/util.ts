import { Vector3 } from "./lib/cuon-matrix-cse160";

export const clamp = (x: number, min: number, max: number): number => Math.max(Math.min(x, max), min);

export const glCoord = (coord: number, max: number): number => (2 * coord / max) - 1;

export const randomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;

export function rectContains(p1: Vector3, s1: [number, number], point: Vector3): boolean {
  const [x1, y1] = p1.elements;
  const [w, h] = s1;
  const x2 = x1 + w;
  const y2 = y1 + h;

  const [px, py] = point.elements;

  return px > x1 && px < x2 && py > y1 && py < y2;
}

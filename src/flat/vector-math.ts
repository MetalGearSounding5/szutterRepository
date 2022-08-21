import { Vector } from './vector';

export const dot = (a: Vector, b: Vector): number => {
  return a.x * b.x + a.y * b.y;
}

export const cross = (a: Vector, b: Vector): number => {
  return a.x * b.y - a.y * b.x;
}

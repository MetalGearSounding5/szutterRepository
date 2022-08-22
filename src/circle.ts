import { Point } from './flat/point';
import { Poly } from './collision-detector';
import { Vector } from './flat/vector';

export class Circle {

  public constructor(public position: Point, public velocity: Vector, public readonly radius: number) {}

  public draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.strokeStyle = '#ff0000';
    context.fillStyle = '#ff000050';
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    context.closePath();
  }

}

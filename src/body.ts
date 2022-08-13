import { Point, TimeStamp } from '../main';
import { GRAVITATIONAL_FORCE, SOFTENING_FACTOR } from './engine';

export class Body {
  public mass = 0;
  public velocity: Point = { x: 0, y: 0 };
  public constructor(public position: Point, public radius: number, public color: string = '#00ff00') {
    this.mass = 4 / 3 * Math.PI * Math.pow(radius, 3);
  }

  public draw(context: CanvasRenderingContext2D) {
    const body = (
      radius: number,
      position: Point
    ): void => {
      context.beginPath();
      context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
    }

    context.filter = 'none';
    context.strokeStyle = this.color;
    context.lineWidth = 1;
    context.fillStyle = `${this.color}50`;
    body(this.radius, this.position);
  }

  public update(now: TimeStamp, diff: TimeStamp, bodies: IterableIterator<Body>, borders: Point) {
    const sofFac = Math.pow(SOFTENING_FACTOR, 2);
    const vector: Point = {x: 0, y: 0};
    for (const body of bodies) {
      if (this === body) continue;
      const distanceVector: Point = { x: this.position.x - body.position.x, y: this.position.y - body.position.y };
      const vecNorm = Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2));
      const vecNormSqr = Math.pow(vecNorm, 2);
      const denominator = Math.pow((vecNormSqr + sofFac), 3/2);

      vector.x += body.mass * distanceVector.x / denominator;
      vector.y += body.mass * distanceVector.y / denominator;
    }
    vector.x *= -GRAVITATIONAL_FORCE;
    vector.y *= -GRAVITATIONAL_FORCE;

    this.velocity.x += vector.x * diff;
    this.velocity.y += vector.y * diff;

    this.position.x += this.velocity.x * diff;
    this.position.y += this.velocity.y * diff;

    // if (this.position.x <= 0 || this.position.x >= borders.x) {
    //   this.velocity.x *= -1;
    //   this.position.x = this.position.x <= 0 ? 1 : borders.x - 1;
    // }
    //
    // if (this.position.y <= 0 || this.position.y >= borders.y) {
    //   this.velocity.y *= -1;
    //   this.position.y = this.position.y <= 0 ? 1 : borders.y - 1;
    // }
  }
}

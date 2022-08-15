import { Entity } from './entity';
import { Point, Poly } from './collision-detector';

export class Asteroid extends Entity {
  public readonly hitbox: Poly;
  private readonly angles: number[];


  public constructor(position: Point, public readonly size: number, private readonly edges: number) {
    super(position, new Point(0, 0));
    this.angles = this.generateRandomAngles(edges);
    this.hitbox = this.generatePointsFromAngles(this.angles);
  }

  public draw(context: CanvasRenderingContext2D): void {
    const [first, ...rest] = this.hitbox;

    context.beginPath();
    context.moveTo(first.x, first.y);

    for (const next of rest) {
      context.lineTo(next.x, next.y);
    }

    context.closePath();

    context.strokeStyle = 'yellow';
    context.stroke();
  }

  public update(now: number, diff: number): void {

  }

  private rotatePoint(point: Point, angle: number): Point {
    const translatedPoint = new Point(point.x - this.position.x, point.y - this.position.y);

    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    return new Point(translatedPoint.x * cos - translatedPoint.y * sin + this.position.x, translatedPoint.y * cos + translatedPoint.x * sin + this.position.y);
  }

  private drawAngles(context: CanvasRenderingContext2D) {
    context.beginPath();
    const startingPoint = new Point(this.position.x, this.position.y - 10);
    context.arc(startingPoint.x, startingPoint.y, 2,0, 2 * Math.PI);
    for (const angle of this.angles) {
      const newPoint = this.rotatePoint(startingPoint, angle);
      console.log(newPoint);
    }
    context.fill();
  }

  private generateRandomAngles(edges: number): number[] { // FIXME:
    const minAngle = Math.floor(2 * Math.PI / edges);
    const maxAngle = Math.floor(2 * Math.PI / edges * 2);
    let sumOfAngles = 0;
    let angles = [];
    
    for (let i = 0; i < edges - 1; i++) {
      const newAngle = (Math.random() * (maxAngle - minAngle)) + minAngle;
      sumOfAngles += newAngle;
      angles.push(newAngle);
    }

    angles.push(2 * Math.PI - sumOfAngles);
    return angles;
  }
  
  private generatePointsFromAngles(angles: number[]): Point[] { // FIXME:
    const startingPoint = new Point(this.position.x, this.position.y - this.size);
    const startingAngle = Math.random() * Math.PI * 2;
    
    let points = [];    
    const startingRotatedPoint = this.rotatePoint(startingPoint, startingAngle);
    points.push(startingRotatedPoint);
    
    function *enumerate<T>(enumerable: T[]): Generator<[number, T]> {
      let i = 0;
      for (const v of enumerable) {
        yield [i++, v];
      }
    }
    
    for (const [i, angle] of enumerate(angles)) {
      points.push(this.rotatePoint(points[i], angle));
    }

    return points;
  }  
}

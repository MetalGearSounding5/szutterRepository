import { Entity } from './entity';
import { Point, Poly } from './collision-detector';

export class Asteroid extends Entity {
  public readonly hitbox: Poly;

  public constructor(position: Point, public readonly size = 0) {
    super(position, new Point(0, 0));
    this.hitbox = this.generatePointsFromAngles(this.generateRandomAngles(7));
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

  private generateRandomAngles(edges: number): number[] { // FIXME:
    const minAngle = Math.floor(2 * Math.PI / edges / 4);
    const maxAngle = Math.floor(2 * Math.PI / edges * 1.25);
    let sumOfAngles = 0;
    let angles = [];
    
    for (let i = 0; i < edges - 1; i++) {
      const newAngle = (Math.random() * (maxAngle - minAngle)) + minAngle; // (minAngle, 2 * Math.PI - sumOfAngles)
      sumOfAngles += newAngle;
      angles.push(newAngle);
    }

    angles.push(2 * Math.PI - sumOfAngles);
    return angles;
  }
  
  private generatePointsFromAngles(angles: number[]): Point[] { // FIXME:
    const startingPoint = new Point(this.position.x, this.position.y - this.size);
    const startingAngle = Math.random() * Math.PI * 2;
    
    const rotatePoint = (point: Point, angle: number) => {
      const translatedPoint = new Point(point.x - this.position.x, point.y - this.position.y);
      
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      
      return new Point(point.x * cos - point.y * sin + this.position.x, point.y * cos + point.x * sin + this.position.y);
    }
    
    let points = [];    
    const startingRotatedPoint = rotatePoint(startingPoint, startingAngle);
    points.push(startingRotatedPoint);
    
    function *enumerate<T>(enumerable: T[]): Generator<[number, T]> {
      let i = 0;
      for (const v of enumerable) {
        yield [i++, v];
      }
    }
    
    for (const [i, angle] of enumerate(angles)) {
      points.push(rotatePoint(points[i], angle));
    }

    return points;
  }  
}

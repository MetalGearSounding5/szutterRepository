import { Entity } from './entity';
import { Point, Poly } from './collision-detector';

export class Asteroid extends Entity {
  public readonly relativeHitbox: Poly;
  private readonly angles: number[];
  public color = 'yellow';

  public constructor(position: Point, public readonly size: number, private readonly edges: number) {
    super(position, new Point(0, 0));
    this.angles = this.generateRandomAngles();
    this.relativeHitbox = this.generateRelativePointsFromAngles(this.angles);

    this.velocity.x = Math.random();
    this.velocity.y = Math.random();
  }

  public draw(context: CanvasRenderingContext2D): void {
    const [first, ...rest] = this.materialisedHitbox;

    context.beginPath();
    context.moveTo(first.x, first.y);

    for (const next of rest) {
      context.lineTo(next.x, next.y);
    }

    context.closePath();

    context.strokeStyle = this.color;
    context.stroke();

    if (!window.debugMode) return;

    context.strokeStyle = 'red';
    context.fillStyle = 'red';
    context.beginPath();
    context.arc(this.position.x, this.position.y, 2, 0, 2 * Math.PI);
    context.closePath();
    context.stroke();
    context.fill();

    context.strokeStyle = 'rebeccapurple';
    context.fillStyle = 'rebeccapurple';

    for (const point of this.materialisedHitbox) {
      context.beginPath();
      context.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      context.closePath();
      context.stroke();
      context.fill();
    }
  }

  private rotatePoint(point: Point, angle: number): Point {
    const translatedPoint = new Point(point.x, point.y);

    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    return new Point(translatedPoint.x * cos - translatedPoint.y * sin, translatedPoint.y * cos + translatedPoint.x * sin);
  }

  private generateRandomAngles(): number[] {
    const maxAngle = 2 * Math.PI / this.edges * 2;
    const minAngle = maxAngle * 0.1;
    let sumOfAngles = 0;
    let angles: number[] = [];
    
    for (let i = 0; i < Math.floor(this.edges / 2); i++) {
      const newAngle = (Math.random() * (maxAngle - minAngle)) + minAngle;
      const complementaryAngle = maxAngle - newAngle;

      sumOfAngles += newAngle + complementaryAngle;

      angles.push(newAngle);
      angles.push(complementaryAngle);
   }

    if (this.edges % 2 == 1) {
      angles.push(2 * Math.PI - sumOfAngles);
    }

    const shuffle = () => {
      let currentIndex = angles.length,  randomIndex;
      while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [angles[currentIndex], angles[randomIndex]] = [angles[randomIndex], angles[currentIndex]];
      }
    };

    shuffle();
    return angles;
  }
  
  private generateRelativePointsFromAngles(angles: number[]): Point[] {
    const startingPoint = new Point(0, -this.size);
    const startingAngle = Math.random() * Math.PI * 2;

    let points = [];
    const startingRotatedPoint = this.rotatePoint(startingPoint, startingAngle);
    points.push(startingRotatedPoint);

    console.log(startingPoint)

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

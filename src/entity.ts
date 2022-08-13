import { Point, TimeStamp } from '../main';

export class Entity {
  private hits = 0;
  private slowness = 5;
  private direction = 1;

  constructor(public position: Point) { }

  public update(now: TimeStamp, diff: TimeStamp): void {
    if (this.position.x >= window.innerWidth) {
      this.direction = -1;
      this.hits++;
    } else if (this.position.x <= 0) {
      this.direction = 1;
      this.hits++;
    }

    // artificial cpu stress
    // for (let i = 0; i < Math.random() * 1_000_000_000; i++) {}

    const accelerationX = (this.direction * diff) / this.slowness;
    this.position.x += accelerationX;
  }

  public draw(context: CanvasRenderingContext2D): void {
    const height = 200;
    const width = 130;
    const color = '#ff0000';

    const triangle = (
      height: number,
      width: number,
      position: Point
    ): void => {
      context.beginPath();
      context.moveTo(position.x, position.y - ( height / 2 ) );
      context.lineTo(position.x - ( width / 2 ),position.y + ( height / 2 ) );
      context.lineTo(position.x + ( width / 2 ), position.y + ( height / 2 ) );
      context.closePath();

      context.fill();
      context.stroke();
    }

    //draws blur behind the ship
    context.lineWidth = 0;
    context.filter = "blur(100px)";
    context.fillStyle = `${color}50`;
    triangle(height * 1.5, width * 2, this.position);

    //draws the ship
    context.lineWidth = 5;
    context.filter = "none";
    context.fillStyle = `rgba(255, 90, 0, 0.31)`;
    context.strokeStyle = `rgba(255, 90, 0, 0.93)`;
    triangle(height * -0.2, width * 0.5, {
      x: this.position.x ,
      y: this.position.y + height * 0.6
    } );

    //draws the acceleration triangle
    context.fillStyle = `${color}50`;
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.filter = "none";
    triangle(height, width, this.position);
  }
}

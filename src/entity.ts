import { Point } from '../main';

export class Entity {
  private hits = 0;
  private slowness = 5;
  private direction = 1;

  constructor(public position: Point) { }

  public update(now: DOMHighResTimeStamp, diff: DOMHighResTimeStamp): void {
    if (this.position.x >= window.innerWidth) {
      this.direction = -1;
      this.hits++;
    } else if (this.position.x <= 0) {
      this.direction = 1;
      this.hits++;
    }

    const accelerationX = (this.direction * diff) / this.slowness;
    this.position.x += accelerationX;
  }

  public draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = 'green';

    context.strokeRect(this.position.x - 10, this.position.y - 10, 20, 20);
    context.fillRect(this.position.x - 10, this.position.y - 10, 20, 20);

    context.fillStyle = 'black';
    context.font = 'bold 16px Arial';
    context.fillText(`Hits: ${this.hits}`, this.position.x + 15, this.position.y + 30);
  }
}

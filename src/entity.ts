import { Point } from './main';

export class Entity {
  public position: Point = {x: 0, y: 0};

  constructor(other: Entity) {
    Object.assign(this, other);
  }


  public draw(context: CanvasRenderingContext2D): void {
    context.strokeRect(this.position.x - 10, this.position.y - 10, 20, 20);
    context.fillRect(this.position.x - 10, this.position.y - 10, 20, 20);
  
    context.fillStyle = 'green';
  }
}


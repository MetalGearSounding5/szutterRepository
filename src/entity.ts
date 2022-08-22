import { Poly } from './collision-detector';
import { TimeStamp } from '../main';
import { Vector } from './flat/vector';
import { Point } from './flat/point';

export abstract class Entity {
  public abstract readonly relativeHitbox: Poly;
  public materialisedHitbox: Poly = [];
  public debug = false;
  protected constructor(
    public readonly position: Point,
    public readonly velocity: Vector
  ) { }
  public abstract draw(context: CanvasRenderingContext2D): void;
  public update(now: TimeStamp, diff: TimeStamp): void {
    this.materialisedHitbox = this.relativeHitbox.map(({x, y}) => new Point(x + this.position.x, y + this.position.y));
  };
}

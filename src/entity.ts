import { Point, Poly } from './collision-detector';
import { TimeStamp, Vector } from '../main';

export abstract class Entity {
  public abstract readonly hitbox: Poly;
  protected constructor(
    public readonly position: Point,
    public readonly velocity: Vector
  ) { }
  public abstract draw(context: CanvasRenderingContext2D): void;
  public abstract update(now: TimeStamp, diff: TimeStamp): void;
}

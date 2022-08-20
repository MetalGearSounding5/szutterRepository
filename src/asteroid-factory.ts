import { Asteroid } from './asteroid';
import { Point } from './collision-detector';

export class AsteroidFactory {
  public static makeCommonAsteroid(position: Point, size: number, edges: number) {
    return new Asteroid(position, size, edges);
  }
}

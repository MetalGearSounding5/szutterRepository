/* Some functions and code modified version from http://www.jeffreythompson.org/collision-detection */

import { Vector } from './flat/vector';
import { Point } from './flat/point';
import { Circle } from './circle';
import { dot } from './flat/vector-math';

export class Rect {
  constructor(public readonly topLeft: Point, public readonly size: Vector) { }
}

export class Line {
  constructor(public readonly first: Point, public readonly second: Point) { }
}

export class Ellipse {

}

export type Poly = Point[];

export class CollisionDetector {
  public static rectRect(first: Rect, second: Rect): boolean {
    const { topLeft: { x: x1, y: y1 }, size: { x: w1, y: h1} } = first;
    const { topLeft: { x: x2, y: y2 }, size: { x: w2, y: h2 } } = second;
    
    return (
      x1 + w1 >= x2 && // r1 right edge past r2 left
      x1 <= x2 + w2 && // r1 left edge past r2 right
      y1 + h1 >= y2 && // r1 top edge past r2 bottom
      y1 <= y2 + h2    // r1 bottom edge past r2 top
    );

  }

  public static rectCircle(first: Rect, second: Circle): boolean {
    const { topLeft: { x: rx, y: ry }, size: { x: rw, y: rh }} = first;
    const { position: { x: cx, y: cy }, radius: cr } = second;


    const closestEdgeX = cx < rx ? rx : rx + rw;
    const closestEdgeY = cy < ry ? ry : ry + rh;

    const distance = this.distanceBetweenPoints(second.position, { x: closestEdgeX, y: closestEdgeY });

    return distance <= second.radius;
  }

  public static circleCircle(first: Circle, second: Circle): boolean {
    return this.distanceBetweenPoints(first.position, second.position) <= first.radius + second.radius;
  }

  public static pointCircle(first: Point, second: Circle): boolean {
    return this.distanceBetweenPoints(first, second.position) <= second.radius;
  }

  public static pointEllipse(first: Point, second: Ellipse): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static pointRect(point: Point, rect: Rect): boolean {
    const { x: pointX, y: pointY } = point;
    const { topLeft: { x, y }, size: { x: xW, y: yW }} = rect;

    return (
      pointX >= x &&      // right of the left edge AND
      pointX <= x + xW && // left of the right edge AND
      pointY >= y &&      // below the top AND
      pointY <= y + yW    // above the bottom
    );
  }

  /**
   *
   * @param point
   * @param line
   * @param buffer since floats are so minutely accurate, add a little buffer zone that will give collision, higher === less precision
   */
  public static pointLine(point: Point, line: Readonly<Line>, buffer = 0.1): boolean {
    const d1 = this.distanceBetweenPoints(point, line.first);
    const d2 = this.distanceBetweenPoints(point, line.second);

    // get the length of the line
    const lineLen = this.distanceBetweenPoints(line.first, line.second);


    // If the two distances are equal to the line's length, the point is on the line!
    // Note we use the buffer here to give a range, rather than one # 👍
    return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer;
  }

  public static lineCircle(line: Readonly<Line>, circle: Readonly<Circle>, callback?: (distance: number) => void): boolean {
    // If line begins or ends inside circle
    // if (this.pointCircle(line.first, circle)) {
    //   !!callback && callback(this.distanceBetweenPoints(line.first, circle.position));
    //   return true;
    // }
    //
    // if (this.pointCircle(line.second, circle)) {
    //   !!callback && callback(this.distanceBetweenPoints(line.second, circle.position));
    //   return true;
    // }

    // Get length of the line
    const len = this.distanceBetweenPoints(line.first, line.second);

    // Get dot product of the line and circle
    const vec1 = new Vector(circle.position.x - line.first.x, circle.position.y - line.first.y);
    const vec2 = new Vector(line.second.x - line.first.x, line.second.y - line.first.y);
    const dotProduct = dot(vec1, vec2) / Math.pow(len, 2);

    // Find the closest point on the line
    const closest = new Point(
      line.first.x + (dotProduct * (line.second.x - line.first.x)),
      line.first.y + (dotProduct * (line.second.y - line.first.y))
    );

    // Is this point actually on the line segment?
    // If so keep going, but if not, return false
    const onSegment = this.pointLine(closest, line);
    if (!onSegment) return false;

    // Get distance to the closest point
    const distance = this.distanceBetweenPoints(closest, circle.position);
    const collide = distance <= circle.radius;

    if (!collide) {
      return false;
    }

    !!callback && callback(Math.abs(distance - circle.radius));

    return true;
  }

  public static lineLine<T extends Point | boolean>(first: Line, second: Line, calculateIntersection = false): T {
    const { first: { x: x1, y: y1 }, second: { x: x2, y: y2 } } = first;
    const { first: { x: x3, y: y3 }, second: { x: x4, y: y4 } } = second;

    // Calculate the distance to intersection point
    const uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    const uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    // If uA and uB are not between 0-1, lines are not colliding
    if (
      uA < 0 || uA > 1 ||
      uB < 0 || uB > 1
    ) return false as T;

    if (!calculateIntersection) {
      return true as T;
    }

    // Calc the point where the lines meet
    return new Point(
      x1 + (uA * (x2 - x1)),
      y1 + (uA * (y2 - y1))
    ) as T;
  }

  public static lineRect(): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static pointPoly(point: Point, poly: Poly): boolean {
    let collision = false;
    for (let current = 0, next = 1; current < poly.length; current++, next++) {
      // Get next vertex in list, if we've hit the end, wrap around to 0
      next %= poly.length;

      const vc = poly[current];
      const vn = poly[next];

      if ((
        (vc.y >= point.y && vn.y < point.y) ||
        (vc.y < point.y && vn.y >= point.y)
      ) && point.x < (vn.x - vc.x) * (point.y - vc.y) / (vn.y - vc.y) + vc.x) {
        collision = !collision;
      }
    }
    return collision;
  }

  public static circlePoly(): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static rectPoly(): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static linePoly(line: Line, poly: Poly): boolean {
    for (let current = 0, next = 1; current < poly.length; current++, next++) {
      next %= poly.length;
      const edge = new Line(poly[current], poly[next]);
      if (this.lineLine(line, edge)) return true;
    }
    return false;
  }

  public static polyPoly(first: Poly, second: Poly, interior = false): boolean {
    for (let current = 0, next = 1; current < first.length; current++, next++) {
      // Get next vertex in list, if we've hit the end, wrap around to 0
      next %= first.length;

      const edge = new Line(first[current], first[next]);

      // Use these two points (a line) to compare to the other polygon's vertices using polyLine()
      const collision = this.linePoly(edge, second);
      if (collision) return true;

      // Check if the first polygon is INSIDE the second and the other way
      if (!interior) return false;

      if (this.pointPoly(second[0], first)) return true;
      if (this.pointPoly(first[0], second)) return true;
    }

    return false;
  }

  public static pointTriangle(): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static pointPoint(): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static pointArc(): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static distanceBetweenPoints(first: Point, second: Point): number {
    return Math.sqrt(Math.pow(first.x - second.x, 2) + Math.pow(first.y - second.y, 2));
  }
}

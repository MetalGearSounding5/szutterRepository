/* Some functions and code modified version from http://www.jeffreythompson.org/collision-detection */

export class Point {
  constructor(public readonly x: number, public readonly y: number) { }
}

export class Rect {
  constructor(public readonly topLeft: Point, public readonly size: Point) { }
}

export class Line {
  constructor(public readonly first: Point, public readonly second: Point) { }
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

  public static rectCircle(): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static circleCircle(): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static pointCircle(): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static pointEllipse(): boolean {
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

  public static pointLine(): boolean {
    return true; // FIXME: TODO: Implement.
  }

  public static lineCircle(): boolean {
    return true; // FIXME: TODO: Implement.
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
    return true; // FIXME: TODO: Implement.
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
}

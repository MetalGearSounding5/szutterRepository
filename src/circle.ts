import { Point } from './flat/point';
import { Poly } from './collision-detector';
import { Vector } from './flat/vector';
import { TimeStamp } from '../main';

export class Circle {
  public readonly velocity_cap: number;

  public constructor(public position: Point, public velocity: Vector, public readonly radius: number) {
    this.velocity_cap = radius;
    this.normalizeVelocity();
  }

  public calculateForces(): Vector {
    // calculate forces and sum them up
    return new Vector(0, 0);
  }

  public acceleration(): Vector {
    const resultantForce = this.calculateForces();
    return resultantForce.multiply(1 / this.radius); // F = m * a (N2) => a = F / m
  }

  public normalizeVelocity(): void {
    if (this.velocity.x > this.velocity_cap) {
      this.velocity.x = this.velocity_cap;
    } else if (this.velocity.x < -this.velocity_cap) {
      this.velocity.x = -this.velocity_cap;
    }

    if (this.velocity.y > this.velocity_cap) {
      this.velocity.y = this.velocity_cap;
    } else if (this.velocity.y < -this.velocity_cap) {
      this.velocity.y = -this.velocity_cap;
    }
  }

  public move(dt: TimeStamp): void {
    // Euler
    this.velocity = this.velocity.add(this.acceleration());
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // RK4
    // const initialPosition = this.position;
    // const initialVelocity = this.velocity;
    // const initialAcceleration = this.acceleration();
    //
    // const position2 = new Point(
    //   initialPosition.x + (initialVelocity.x * dt / 2),
    //   initialPosition.y + (initialVelocity.y * dt / 2)
    // );
    // const velocity2 = initialVelocity.add(initialAcceleration.multiply(dt / 2));
    // const acceleration2 = this.acceleration(); // acceleration for new position and velocity, in future pass pos2 and vel2 as parameters
    //
    // const position3 = new Point(
    //   position2.x + (velocity2.x * dt / 2),
    //   position2.y + (velocity2.y * dt / 2)
    // );
    // const velocity3 = velocity2.add(acceleration2.multiply(dt / 2));
    // const acceleration3 = this.acceleration();
    //
    // const position4 = new Point(
    //   position3.x + (velocity3.x * dt),
    //   position3.y + (velocity3.y * dt)
    // );
    // const velocity4 = velocity3.add(acceleration3.multiply(dt));
    // const acceleration4 = this.acceleration();
    //
    // const velocitySum = initialVelocity.add(velocity2.multiply(2)).add(velocity3.multiply(2)).add(velocity4);
    // const accelerationSum = initialAcceleration.add(acceleration2.multiply(2)).add(acceleration3.multiply(2)).add(acceleration4);
    //
    // this.position = new Point (
    //   initialPosition.x + (velocitySum.x * dt / 6),
    //   initialPosition.y + (velocitySum.y * dt / 6)
    // );
    // this.velocity = initialVelocity.add(accelerationSum.multiply(dt / 6));
  }

  public draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.strokeStyle = '#ff0000';
    context.fillStyle = '#ff000050';
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    context.closePath();
  }

}

import { EnemyShip } from './enemy-ship';
import { TimeStampMonitor } from './time-stamp-monitor';
import { Class, TimeStamp } from '../main';
import { CollisionDetector, Line } from './collision-detector';
import { Entity } from './entity';
import { Asteroid } from './asteroid';
import { ModuleNamespace } from 'vite/types/hot';
import { AsteroidFactory } from './asteroid-factory';
import { InputManager } from './input-manager';
import { Circle } from './circle';
import { Vector } from './flat/vector';
import { Point } from './flat/point';
import { dot } from './flat/vector-math';

export class Engine {
  protected readonly entities = new Map<string, Entity>();
  public requestAnimationFrameId?: number;
  private readonly inputManager = new InputManager();
  private monitor = new TimeStampMonitor(this.inputManager, this.entities);

  constructor(private readonly context: CanvasRenderingContext2D) {
    // this.entities.set('enemy-ship-0', new EnemyShip(new Point(context.canvas.width / 2, context.canvas.height / 2)));
    this.entitiesMock();
    // this.entities.set('ball-0', new Circle(
    //   new Point(context.canvas.width / 2 - 100, context.canvas.height / 2),
    //   new Vector(-50, 0),
    //   100
    // ) as unknown as Entity);

    // this.entities.set('ball-1', new Circle(
    //   new Point(context.canvas.width / 2 + 100, context.canvas.height / 2),
    //   new Vector(50, 0),
    //   10
    // ) as unknown as Entity);
    import.meta.hot && this.handleHmr();
    this.loop();
  }

  private entitiesMock(): void {
    const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

    for (let i = 0; i < 15; i++) {
      this.entities.set(`circle-${i}`, new Circle(
        new Point(rnd(50, window.innerWidth - 50), rnd(50, window.innerHeight - 50)),
        new Vector(rnd(0, 100), rnd(0, 100)),
        rnd(5, 100)
      ) as unknown as Entity);
    }
  }

  private update(now: TimeStamp, diff: TimeStamp): void {
    window.debugMode && this.monitor.update(now, diff);
    const dt = diff / 1000;
    console.log(dt);
    const materializedEntities = Array.from(this.entities.values()) as unknown as Circle[];

    // move entity
    for (const entity of materializedEntities) {
      entity.move(dt);
    }

    // check boundaries collisions
    const leftUpperCorner = new Point(0, 0);
    const leftLowerCorner = new Point(0, this.context.canvas.height);
    const rightUpperCorner = new Point(this.context.canvas.width, 0);
    const rightLowerCorner = new Point(this.context.canvas.width, this.context.canvas.height);

    const leftBoundary = new Line(leftUpperCorner, leftLowerCorner);
    const downBoundary = new Line(leftLowerCorner, rightLowerCorner);
    const rightBoundary = new Line(rightLowerCorner, rightUpperCorner);
    const upBoundary = new Line(rightUpperCorner, leftUpperCorner);

    for (const entity of materializedEntities) {
      if (CollisionDetector.lineCircle(leftBoundary, entity)) { // left
        entity.position.x = leftBoundary.first.x + entity.radius;
        entity.velocity.x *= -1;
      }

      if (CollisionDetector.lineCircle(downBoundary, entity)) { // down
        entity.position.y = downBoundary.first.y - entity.radius;
        entity.velocity.y *= -1;
      }

      if (CollisionDetector.lineCircle(rightBoundary, entity)) { // right
        entity.position.x = rightBoundary.first.x - entity.radius;
        entity.velocity.x *= -1;
      }

      if (CollisionDetector.lineCircle(upBoundary, entity)) { // up
        entity.position.y = upBoundary.first.y + entity.radius;
        entity.velocity.y *= -1;
      }
    }

    // check pair-wise entity collisions
    for (let i = 0; i < materializedEntities.length - 1; i++) {
      const first = materializedEntities[i];

      for (let j = i + 1; j < materializedEntities.length; j++) {
        const second = materializedEntities[j];

        const c1 = first;
        const c2 = second;

        if (!CollisionDetector.circleCircle(c1, c2)) {
          continue;
        }

        const normal = Vector.normalize(new Vector(c2.position.x - c1.position.x, c2.position.y - c1.position.y));
        const relativeVelocity = c1.velocity.add(c2.velocity.reverse());
        const speed = dot(relativeVelocity, normal);
        if (speed < 0) {
          break;
        }
        const impulse = 2 * speed / (c1.mass + c2.mass);

        // update velocity
        c1.velocity = normal.multiply(impulse * c2.mass).reverse();
        c2.velocity = normal.multiply(impulse * c1.mass);
      }
    }

    // normalize velocity
    for (const entity of materializedEntities) {
      entity.normalizeVelocity();
    }

    for (const entity of this.entities.values()) {
      entity.update?.(now, diff);
    }
  }

  private draw(): void {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    for (const entity of this.entities.values()) {
      entity.draw(this.context);
    }

    window.debugMode && this.monitor.draw(this.context);
  }

  private loop(now: TimeStamp = performance.now(), diff: TimeStamp = 0): void {
    this.update(now, diff);
    this.draw();

    this.requestAnimationFrameId = requestAnimationFrame(time => this.loop(time, time - now));
  }

  private handleHmr() {
    // import.meta.hot!.accept - accepts only plain string literals, so we cannot execute it inside loops
    const hmrEntity = (targetClass: Class<unknown>) => {
      const className = Object.create(targetClass).name; // Cached className
      return (module?: ModuleNamespace) => {
        for (const [entityId, entity] of this.entities) {
          if (entity.constructor.name !== className) continue;
          this.entities.set(entityId, Object.create(module![className].prototype, Object.getOwnPropertyDescriptors(entity)));
        }
      }
    }

    import.meta.hot!.accept('./enemy-ship', hmrEntity(EnemyShip));
    import.meta.hot!.accept('./asteroid', hmrEntity(Asteroid));
    import.meta.hot!.accept('./time-stamp-monitor', module =>
      this.monitor = Object.assign(new module!.TimeStampMonitor(), this.monitor));
  }
}

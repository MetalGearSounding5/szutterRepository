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

const VELOCITY_CAP = window.innerWidth / 100;

export class Engine {
  protected readonly entities = new Map<string, Entity>();
  public requestAnimationFrameId?: number;
  private readonly inputManager = new InputManager();
  private monitor = new TimeStampMonitor(this.inputManager, this.entities);

  constructor(private readonly context: CanvasRenderingContext2D) {
    // this.entities.set('enemy-ship-0', new EnemyShip(new Point(context.canvas.width / 2, context.canvas.height / 2)));
    this.entitiesMock();
    this.entities.set('ball-0', new Circle(
      new Point(context.canvas.width / 2 - 100, context.canvas.height / 2),
      new Vector(-10, 0),
      100
    ) as unknown as Entity);

    this.entities.set('ball-1', new Circle(
      new Point(context.canvas.width / 2 + 100, context.canvas.height / 2),
      new Vector(10, 0),
      10
    ) as unknown as Entity);
    import.meta.hot && this.handleHmr();
    this.loop();
  }

  private entitiesMock(): void {
    const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

    for (let i = 0; i < 10; i++) {
      this.entities.set(`circle-${i}`, new Circle(
        new Point(rnd(50, window.innerWidth - 50), rnd(50, window.innerHeight - 50)),
        new Vector(rnd(0, 5), rnd(0, 5)),
        rnd(5, 80)
      ) as unknown as Entity);
    }
  }

  private update(now: TimeStamp, diff: TimeStamp): void {
    window.debugMode && this.monitor.update(now, diff);

    const leftUpperCorner = new Point(0, 0);
    const leftLowerCorner = new Point(0, this.context.canvas.height);
    const rightUpperCorner = new Point(this.context.canvas.width, 0);
    const rightLowerCorner = new Point(this.context.canvas.width, this.context.canvas.height);
    const materializedEntities = Array.from(this.entities.values()) as unknown as Circle[];

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
        const depth = c1.radius + c2.radius - CollisionDetector.distanceBetweenPoints(c1.position, c2.position);

        const total = c1.radius + c2.radius;
        const prop1 = c1.radius / total;
        const prop2 = c2.radius / total;

        c1.velocity = c1.velocity.add(normal.multiply(-depth / 2).multiply(prop2));
        c2.velocity = c2.velocity.add(normal.multiply(depth / 2).multiply(prop1));
      }
    }

    const cW = this.context.canvas.width;
    const cH = this.context.canvas.height;

    // movement
    for (const entity of materializedEntities) {
      if (entity.velocity.x > VELOCITY_CAP || Number.isNaN(entity.velocity.x)) {
        entity.velocity.x = VELOCITY_CAP;
      }

      if (entity.velocity.y > VELOCITY_CAP || Number.isNaN(entity.velocity.y)) {
        entity.velocity.y = VELOCITY_CAP;
      }

      entity.position.x += entity.velocity.x;
      entity.position.y += entity.velocity.y;

      CollisionDetector.lineCircle(new Line(leftUpperCorner, leftLowerCorner), entity, distance => { // Left
        entity.position.x += distance;
        entity.velocity.x *= -1;
      });

      if (entity.position.x - entity.radius < 0) {
        entity.position.x = entity.radius;
      }

      CollisionDetector.lineCircle(new Line(leftLowerCorner, rightLowerCorner), entity, distance => { // Bottom
        entity.position.y -= distance;
        entity.velocity.y *= -1;
      });

      if (entity.position.y + entity.radius > cH) {
        entity.position.y = cH - entity.radius;
      }

      CollisionDetector.lineCircle(new Line(rightLowerCorner, rightUpperCorner), entity, distance => { // Right
        entity.position.x -= distance;
        entity.velocity.x *= -1;
      });

      if (entity.position.x + entity.radius > cW) {
        entity.position.x = cW - entity.radius;
      }


      CollisionDetector.lineCircle(new Line(rightUpperCorner, leftUpperCorner), entity, distance => { // Top
        entity.position.y += distance;
        entity.velocity.y *= -1;
      });

      if (entity.position.y - entity.radius < 0) {
        entity.position.y = entity.radius;
      }
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

import { EnemyShip } from './enemy-ship';
import { TimeStampMonitor } from './time-stamp-monitor';
import { Class, TimeStamp } from '../main';
import { CollisionDetector, Line, Point } from './collision-detector';
import { Entity } from './entity';
import { Asteroid } from './asteroid';
import { ModuleNamespace } from 'vite/types/hot';
import { AsteroidFactory } from './asteroid-factory';

export class Engine {
  protected readonly entities = new Map<string, Entity>();
  public requestAnimationFrameId?: number;
  private monitor = new TimeStampMonitor();

  constructor(private readonly context: CanvasRenderingContext2D) {
    // this.entities.set('enemy-ship-0', new EnemyShip(new Point(context.canvas.width / 2, context.canvas.height / 2)));
    this.entitiesMock();
    import.meta.hot && this.handleHmr();
    this.loop();
  }

  private entitiesMock(): void {
    const rnd = (min: number, max: number) => Math.random() * max + min;

    for (let i = 0; i < 150; i++) {
      this.entities.set(`asteroid-${i}`,
        AsteroidFactory.makeCommonAsteroid(
          new Point(rnd(0, window.innerWidth), rnd(0, window.innerHeight)),
          rnd(50, 100),
          rnd(5, 14))
      );
    }
  }

  private update(now: TimeStamp, diff: TimeStamp): void {
    window.debugMode && this.monitor.update(now, diff);

    for (const asteroid of this.entities.values()) {
      (asteroid as Asteroid).color = 'yellow';
    }

    // kolizja
    for (const entity of this.entities.values()) {
      for (const otherEntity of this.entities.values()) {
        if (entity === otherEntity) continue;

        const a1: Asteroid = entity as Asteroid;
        const a2: Asteroid = otherEntity as Asteroid;

        if (CollisionDetector.polyPoly(entity.materialisedHitbox, otherEntity.materialisedHitbox, true)) {
          a1.color = 'red';
          a2.color = 'red';
        }
      }
    }

    // movement
    for (const entity of this.entities.values()) {
      const leftUpperCorner = new Point(0, 0);
      const leftLowerCorner = new Point(0, this.context.canvas.height);
      const rightUpperCorner = new Point(this.context.canvas.width, 0);
      const rightLowerCorner = new Point(this.context.canvas.width, this.context.canvas.height);

      // tu

      if (CollisionDetector.linePoly(new Line(leftUpperCorner, leftLowerCorner), entity.materialisedHitbox)) {
        entity.velocity.x *= -1;
        console.log('left');
      }

      if (CollisionDetector.linePoly(new Line(leftLowerCorner, rightLowerCorner), entity.materialisedHitbox)) {
        entity.velocity.y *= -1;
        console.log('bottom');
      }

      if (CollisionDetector.linePoly(new Line(rightLowerCorner, rightUpperCorner), entity.materialisedHitbox)) {
        entity.velocity.x *= -1;
        console.log('right');
      }

      if (CollisionDetector.linePoly(new Line(rightUpperCorner, leftUpperCorner), entity.materialisedHitbox)) {
        entity.velocity.y *= -1;
        console.log('top');
      }

      entity.position.x += entity.velocity.x * diff * 0.5;
      entity.position.y += entity.velocity.y * diff * 0.5;
    }


    for (const entity of this.entities.values()) {
      entity.update(now, diff);
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

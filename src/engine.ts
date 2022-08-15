import { EnemyShip } from './enemy-ship';
import { TimeStampMonitor } from './time-stamp-monitor';
import { Class, TimeStamp } from '../main';
import { Point } from './collision-detector';
import { Entity } from './entity';
import { Asteroid } from './asteroid';
import { ModuleNamespace } from 'vite/types/hot';

export class Engine {
  protected readonly entities = new Map<string, Entity>();
  public requestAnimationFrameId?: number;
  private monitor = new TimeStampMonitor();

  constructor(private readonly context: CanvasRenderingContext2D) {
    this.entities.set('enemy-ship-0', new EnemyShip(new Point(context.canvas.width / 2, context.canvas.height / 2)));
    this.entities.set('asteroid-0', new Asteroid(new Point(context.canvas.width / 2, context.canvas.height / 2)));
    import.meta.hot && this.handleHmr();
    this.loop();
  }

  private update(now: TimeStamp, diff: TimeStamp): void {
    window.debugMode && this.monitor.update(now, diff);
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
    // import.meta.hot!.accept - accepts only plain string literals so we cannot execute it inside loops
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

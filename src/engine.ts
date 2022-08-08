import { Entity } from './entity';
import { TimeStampMonitor } from './time-stamp-monitor';
import { TimeStamp } from '../main';

export class Engine {
  protected readonly entities = new Map<string, Entity>();
  public requestAnimationFrameId?: number;
  private monitor = new TimeStampMonitor();

  constructor(private readonly context: CanvasRenderingContext2D) {
    this.entities.set('square-0', new Entity({x: context.canvas.width / 2, y: context.canvas.height / 2}));
    this.handleHmr();
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
    if (!import.meta.hot) return;

    import.meta.hot.accept('./entity', module => {
      for (const [entityId, entity] of this.entities) {
        // This way we can filter only target entities
        // if (!(entity instanceof Entity)) continue;

        this.entities.set(entityId, Object.assign(new module!.Entity(entity.position), entity));
      }
    })

    import.meta.hot.accept('./time-stamp-monitor', module => {
      this.monitor = Object.assign(new module!.TimeStampMonitor(), this.monitor);
    })
  }
}

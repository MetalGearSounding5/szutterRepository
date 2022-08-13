import { TimeStampMonitor } from './time-stamp-monitor';
import { TimeStamp } from '../main';
import { Body } from './body';

export const GRAVITATIONAL_FORCE = 0.000001;
export const SOFTENING_FACTOR = 12;

export class Engine {
  protected readonly entities = new Map<string, Body>();
  public requestAnimationFrameId?: number;
  private monitor = new TimeStampMonitor();

  constructor(private readonly context: CanvasRenderingContext2D) {
    for (let i = 0; i < 500; i++) {
      const x = context.canvas.width * Math.random();
      const y = context.canvas.height * Math.random();
      const color = '#' + Math.floor((Math.random()*0xffffff)).toString(16);

      this.entities.set(`body-${i}`, new Body({x: x, y: y}, Math.random() * 10, color));
    }
    this.handleHmr();
    this.loop();
  }

  private update(now: TimeStamp, diff: TimeStamp): void {
    window.debugMode && this.monitor.update(now, diff);
    for (const entity of this.entities.values()) {
      entity.update(now, diff, this.entities.values(), {x: this.context.canvas.width, y: this.context.canvas.height});
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

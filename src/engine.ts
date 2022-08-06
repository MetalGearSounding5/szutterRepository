import { Entity } from './entity';

export class Engine {
  protected readonly entities = new Map<string, Entity>();
  public requestAnimationFrameId?: number;

  constructor(private readonly context: CanvasRenderingContext2D) {
    this.entities.set('square-0', new Entity({ x: context.canvas.width / 2, y: context.canvas.height / 2 }));
    this.handleHmr();
    this.loop();
  }

  private update(now: DOMHighResTimeStamp, diff: DOMHighResTimeStamp): void {
    for (const entity of this.entities.values()) {
      entity.update(now, diff);
    }
  }

  private draw(): void {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    for (const entity of this.entities.values()) {
      entity.draw(this.context);
    }
  }

  private loop(now: DOMHighResTimeStamp = performance.now(), diff: DOMHighResTimeStamp = 0): void {
    const previousSecond = Math.trunc((now - diff) / 1000);
    const currentSecond = Math.trunc(now / 1000);

    if (previousSecond !== currentSecond && currentSecond % 5 === 0) {
      console.debug(`Time: ${now}, Frame Time: ${diff.toFixed(3)}, Entities Count: ${this.entities.size}.`);
    }

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
  }
}

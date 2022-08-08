import { TimeStamp } from "../main";

export class TimeStampMonitor {
  private readonly buffer = new Map<TimeStamp, TimeStamp>();

  public constructor(private readonly period= 5) {}

  public get averageFrameTime(): number {
    return Array.from(this.buffer.values())
      .reduce((average, current, _, { length }) => average + current / length, 0);
  }

  public update(now: TimeStamp, diff: TimeStamp) {
    const previousSecond = Math.trunc((now - diff) / 1000);
    const currentSecond = Math.trunc(now / 1000);

    this.buffer.set(now, diff);
    if (previousSecond !== currentSecond && currentSecond % this.period === 0) {
      console.debug(`Time: ${now}, Average Frame Time: ${this.averageFrameTime.toFixed(3)}`);

      const dataNotToRemove = Array.from(this.buffer.entries()).slice(-window.desiredFramesPerSecond);
      this.buffer.clear();
      dataNotToRemove.forEach(([k, v]) => this.buffer.set(k, v));
    }
  }

  public draw(context: CanvasRenderingContext2D): void {
    const frameTimes = Array.from(this.buffer.values()).slice(-window.desiredFramesPerSecond);

    for (let i = 0; i < frameTimes.length; i++) {
      const fps = 1000 / frameTimes[i];

      const amplitude = 1 - (window.desiredFramesPerSecond - fps) / window.desiredFramesPerSecond;

      context.fillStyle = amplitude > 0.9 ? 'lime' : amplitude > 0.5 ? 'orange' : 'red';
      context.fillRect(i * 5 + 5, 40, 3, - amplitude * 20);
    }

    context.fillStyle = '#00000070';
    context.fillRect(5, 40, 100, 35);

    context.fillStyle = 'white';
    context.font = "bold 12px Arial";
    context.fillText(`FPS: ${(1000 / frameTimes.at(-1)!).toFixed(2)}`, 5, 55);
    context.fillText(`AVG FPS: ${this.averageFrameTime.toFixed(2)}`, 5, 70);
  }
}

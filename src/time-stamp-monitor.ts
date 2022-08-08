import { TimeStamp } from '../main';

export class TimeStampMonitor {
  private readonly frameBarHeight = 20;
  private readonly frameBarWidth = 3;
  private readonly frameGraphMargin = 5;
  private buffer: TimeStamp[] = [];

  public constructor(private readonly period = 5) {}

  public get averageFrameTime(): number {
    return Array.from(this.buffer.values())
      .reduce((average, current, _, {length}) => average + current / length, 0);
  }

  public update(now: TimeStamp, diff: TimeStamp) {
    const previousSecond = Math.trunc((now - diff) / 1000);
    const currentSecond = Math.trunc(now / 1000);

    this.buffer.push(diff);
    if (previousSecond !== currentSecond && currentSecond % this.period === 0) {
      console.debug(`Time: ${now}, Average Frame Time: ${this.averageFrameTime.toFixed(3)}`);

      this.buffer = this.buffer.slice(-window.desiredFramesPerSecond);
    }
  }

  public draw(context: CanvasRenderingContext2D): void {
    const frameTimes = this.buffer.slice(-window.desiredFramesPerSecond);

    let totalFramesPerSecond = 0;
    for (let i = 0; i < frameTimes.length; i++) {
      const fps = 1000 / frameTimes[i];
      totalFramesPerSecond += fps;

      const amplitude = 1 - (window.desiredFramesPerSecond - fps) / window.desiredFramesPerSecond;
      context.fillStyle = amplitude > 0.9 ? 'lime' : amplitude > 0.5 ? 'orange' : 'red';
      context.fillRect(
        i * this.frameGraphMargin + this.frameGraphMargin,
        this.frameBarHeight + this.frameGraphMargin,
        this.frameBarWidth, -amplitude * this.frameBarHeight
      );
    }

    const averageFramePerSecond = totalFramesPerSecond / frameTimes.length;
    const fontSize = 12;
    const text = `AVG FPS: ${averageFramePerSecond.toFixed(2)}`;
    context.font = `bold ${fontSize}px system-ui`;

    const {width: textWidth, fontBoundingBoxAscent: textHeight} = context.measureText(text);
    context.fillStyle = '#00000070';
    context.fillRect(this.frameGraphMargin, this.frameGraphMargin + this.frameBarHeight, textWidth, textHeight);

    context.fillStyle = 'white';
    context.fillText(text,
      this.frameGraphMargin,
      this.frameGraphMargin + this.frameBarHeight + this.frameGraphMargin + fontSize / 2
    );
  }
}

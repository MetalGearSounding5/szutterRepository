import { TimeStamp } from '../main';
import { InputManager } from './input-manager';
import { Entity } from './entity';
import { CollisionDetector, Rect } from './collision-detector';
import { Vector } from './flat/vector';
import { Circle } from './circle';
import { Point } from './flat/point';

export class TimeStampMonitor {
  private readonly frameBarHeight = 20;
  private readonly frameBarWidth = 3;
  private readonly frameGraphMargin = 5;
  private buffer: TimeStamp[] = [];
  private entitiesUnderPointer: Map<string, Entity> = new Map<string, Entity>();
  private countOfEntitiesOnScreen: number = 0;

  public constructor(
    private readonly inputManager: InputManager,
    private readonly entities: Map<string, Entity>,
    private readonly period = 5
  ) {}

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

    this.entitiesUnderPointer.clear();
    this.countOfEntitiesOnScreen = 0;

    for (let entity of this.entities.values()) {
      entity.debug = false;
    }

    const previousMilliSecond = Math.trunc((now - diff) / 10);
    const currentMilliSecond = Math.trunc(now / 10);

    for (const [id, entity] of this.entities) {
      // if (!entity.materialisedHitbox) continue;

      // if (!CollisionDetector.pointPoly(this.inputManager.currentPointerPosition, entity.materialisedHitbox)) {
      //   continue;
      // }
      if (CollisionDetector.pointRect(entity.position, new Rect(new Point(0,0), new Vector(window.innerWidth, window.innerHeight)))) {
        this.countOfEntitiesOnScreen++;
      }

      if (!CollisionDetector.pointCircle(this.inputManager.currentPointerPosition, entity as unknown as Circle)) {
        continue;
      }

      entity.debug = true;
      this.entitiesUnderPointer.set(id, entity);

      if (this.inputManager.pointerDown) {
        entity.position.x = this.inputManager.currentPointerPosition.x;
        entity.position.y = this.inputManager.currentPointerPosition.y;
      }

      if (previousMilliSecond !== currentMilliSecond && currentMilliSecond % 10 !== 0) {
        continue;
      }

      if (this.inputManager.getKeyState('Equal')) {
        entity.velocity.x += 0.5;
        // entity.velocity.y += 0.5;
      }

      if (this.inputManager.getKeyState('Minus')) {
        entity.velocity.x -= 0.5;
        // entity.velocity.y -= 0.5;

        if (entity.velocity.x <= 0) {
          entity.velocity.x = 0;
        }

        if (entity.velocity.y <= 0) {
          // entity.velocity.y = 0;
        }
      }
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

    context.fillText(`Entities on the screen: ${this.countOfEntitiesOnScreen}`, this.frameGraphMargin,
      this.frameGraphMargin + this.frameBarHeight + fontSize * 2);

    context.fillText(`Entities under pointer (${this.entitiesUnderPointer.size}):`,
      this.frameGraphMargin,
      this.frameGraphMargin + this.frameBarHeight + fontSize * 3);

    let i = 4;
    for (const [id, entity] of this.entitiesUnderPointer) {

      context.fillText(`#${id}`,
        this.frameGraphMargin,
        this.frameGraphMargin + this.frameBarHeight + fontSize * i);

      i++;
    }
  }
}

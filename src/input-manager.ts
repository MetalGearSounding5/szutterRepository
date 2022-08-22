import { Point } from './flat/point';
export class InputManager {
  #pointerDown = false;
  #currentPointerPosition = new Point(0, 0);
  #keyboardStates = new Map<string, boolean>();

  constructor() {
    const canvas = document.getElementById('canvas')!;
    canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    canvas.addEventListener('pointerup', this.onPointerUp.bind(this));
    canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  public get pointerDown(): boolean {
    return this.#pointerDown;
  }

  public get currentPointerPosition(): Readonly<Point> {
    return this.#currentPointerPosition;
  }

  public getKeyState(code: string): boolean {
    return !!this.#keyboardStates.get(code);
  }

  private onPointerDown(event: PointerEvent): void {
    this.#pointerDown = true;
    this.#currentPointerPosition = new Point(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio);
  }

  private onPointerUp(event: PointerEvent): void {
    this.#pointerDown = false;
    this.#currentPointerPosition = new Point(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio);
  }

  private onPointerMove(event: PointerEvent): void {
    this.#currentPointerPosition = new Point(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio);
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.#keyboardStates.set(event.code, true);
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.#keyboardStates.set(event.code, false);
  }
}

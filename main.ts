/// <reference types="vite/client" />
import { Engine } from './src/engine';
import { prepareContext } from './src/prepare-context';

export type Point = { x: number, y: number };

const context = prepareContext();
const engine = new Engine(context);

if (import.meta.hot) {
  let currentHotEngine = engine;
  import.meta.hot.accept('./src/engine', module => {
    cancelAnimationFrame(currentHotEngine.requestAnimationFrameId!);
    currentHotEngine = Object.assign(new module!.Engine(context), currentHotEngine);
  });
}

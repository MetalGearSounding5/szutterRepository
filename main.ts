/// <reference types="vite/client" />
import { Engine } from './src/engine';
import { prepareContext } from './src/prepare-context';
import { calculateDesiredFramesPerSecond } from './src/get-refresh-rate';

export type Point = { x: number, y: number };
export type TimeStamp = DOMHighResTimeStamp;

declare global {
  interface Window {
    desiredFramesPerSecond: number;
    debugMode: boolean
  }
}

window.addEventListener('keydown', ({code}) => {
    if (code !== 'F9') return;
    window.debugMode = !window.debugMode;
});

window.desiredFramesPerSecond = await calculateDesiredFramesPerSecond();
const context = prepareContext();
const engine = new Engine(context);

if (import.meta.hot) {
  let currentHotEngine = engine;
  import.meta.hot.accept('./src/engine', module => {
    cancelAnimationFrame(currentHotEngine.requestAnimationFrameId!);
    currentHotEngine = Object.assign(new module!.Engine(context), currentHotEngine);
  });
}

import { Engine } from './src/engine';
import { prepareContext } from './src/prepare-context';
import { calculateDesiredFramesPerSecond } from './src/get-refresh-rate';
import { webgpuTest } from './src/webgpu-test';
import { Point } from './src/collision-detector';
import { ViteHotContext } from 'vite/types/hot';

export type TimeStamp = DOMHighResTimeStamp;
export interface Class<T> { new(...args: never[]): T; }

declare global {
  interface Window {
    desiredFramesPerSecond: number;
    debugMode: boolean
  }

  interface ImportMeta {
    readonly hot?: ViteHotContext
  }
}

window.debugMode = true;
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

await webgpuTest();

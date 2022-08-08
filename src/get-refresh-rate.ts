import { TimeStamp } from '../main';

export const calculateDesiredFramesPerSecond = async(): Promise<number> => {
  let totalFrameTime = 0;

  let frameCount = 0;
  while (totalFrameTime < 500) {
    totalFrameTime += await getFrameTime();
    frameCount++;
  }

  const fps = 1000 / (totalFrameTime / frameCount);
  const refreshRates = [30, 60, 75, 90, 120, 144, 240];

  return refreshRates
    .reduce((closest, current) => {
      if (Math.abs(closest - fps) > Math.abs(current - fps)) {
        return current;
      } else {
        return closest;
      }
    }, 0);
}

const getFrameTime = async(): Promise<TimeStamp> => {
  const then = performance.now();
  const now: TimeStamp = await new Promise(r => requestAnimationFrame(r));

  return now - then;
}

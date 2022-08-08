import { TimeStamp } from '../main';

export const calculateDesiredFramesPerSecond = async(): Promise<number> => {
  const frameTimes: number[] = [];
  let totalFrameTime = 0;

  while (totalFrameTime < 500) {
    const currentFrameTime = await getFrameTime();

    frameTimes.push(currentFrameTime);
    totalFrameTime += currentFrameTime;
  }

  const averageFrameTime = totalFrameTime / frameTimes.length;
  const filteredFrameTimes = frameTimes
    .filter(frameTime => Math.abs(averageFrameTime - frameTime) < averageFrameTime / 2);

  totalFrameTime = 0;
  for (const frameTime of filteredFrameTimes) {
    totalFrameTime += frameTime;
  }

  const averageFilteredFrameTime = totalFrameTime / filteredFrameTimes.length;

  const framesPerSecond = 1000 / averageFilteredFrameTime;
  const refreshRates = [30, 60, 75, 90, 120, 144, 240];

  return refreshRates
    .reduce((closest, current) => Math.abs(closest - framesPerSecond) > Math.abs(current - framesPerSecond) ? current : closest, 0);
}

const getFrameTime = async(): Promise<TimeStamp> => {
  const then: TimeStamp = performance.now();
  const now: TimeStamp = await new Promise(r => requestAnimationFrame(r));

  return now - then;
}

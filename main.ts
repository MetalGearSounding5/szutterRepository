/// <reference types="vite/client" />
// import { Engine } from './src/engine';
import { prepareContext } from './src/prepare-context';
// import { calculateDesiredFramesPerSecond } from './src/get-refresh-rate';
// import { webgpuTest } from './src/webgpu-test';
//

import { CollisionDetector, Line, Point, Poly, Rect } from './src/collision-detector';

const context = prepareContext();
const draw = (poly: Poly, color = 'white') => {
  context.beginPath();
  context.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) {
    context.lineTo(poly[i].x, poly[i].y);
  }
  context.closePath();
  context.strokeStyle = color;
  context.stroke();
};

const first: Poly = [
  new Point(40, 40),
  new Point(80, 30),
  new Point(90, 70),
  new Point(70, 100),
  new Point(30, 120),
  new Point(60, 70),
];

draw(first);

const second: Poly = [
  new Point(90, 40),
  new Point(91, 60),
  new Point(120, 70),

];

draw(second, CollisionDetector.polyPoly(first, second, true) ? 'red' : 'green');



// const upperLeft = new Point(10, 20);
// const dimension = new Point(30, 40);
// const rect = new Rect(upperLeft, dimension);
//
// const upperLeft2 = new Point(20, 15);
// const dimension2 = new Point(10, 10);
// const rect2 = new Rect(upperLeft2, dimension2);

// console.log(CollisionDetector.rectRect(rect, rect2));
// console.log(CollisionDetector.pointRect(upperLeft2, rect2));

// const line1 = new Line(new Point(0, 0), new Point(10, 0));
// const line2 = new Line(new Point(0, -5), new Point(10, 5));

// const point: Point = CollisionDetector.lineLine(line1, line2, true);
// const result = CollisionDetector.lineLine(line1, line2);

// console.log();


// CollisionDetector.collideRectRect({upperLeft, dimension});

// export type Point = { x: number, y: number };
// export type TimeStamp = DOMHighResTimeStamp;
//
// declare global {
//   interface Window {
//     desiredFramesPerSecond: number;
//     debugMode: boolean
//   }
// }
//
// window.addEventListener('keydown', ({code}) => {
//     if (code !== 'F9') return;
//     window.debugMode = !window.debugMode;
// });
//
// window.desiredFramesPerSecond = await calculateDesiredFramesPerSecond();
// const context = prepareContext();
// const engine = new Engine(context);
//
// if (import.meta.hot) {
//   let currentHotEngine = engine;
//   import.meta.hot.accept('./src/engine', module => {
//     cancelAnimationFrame(currentHotEngine.requestAnimationFrameId!);
//     currentHotEngine = Object.assign(new module!.Engine(context), currentHotEngine);
//   });
// }
//
// await webgpuTest();

import { Entity } from './entity';
import './style.scss'

export type Point = { x: number, y: number };

export const store = {
  Entity
};


import.meta.hot!.accept(['./entity'], ([newA]) => {
  console.log(newA!.Entity);

  entity = new newA!.Entity(entity);
  
  // store.Entity = newA!.Entity;
})

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d')!;

window.onresize = () => {
  const { innerWidth, innerHeight } = window;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

const { innerWidth, innerHeight } = window;
window.onresize(null as unknown as CanvasRenderingContext2D as any);

let entity = new Entity({} as any);
entity.position.x = innerWidth / 2;
entity.position.y = innerHeight / 2;

let accelerateX = 1;



let frame = 0;
const loop = () => {
  frame++;
  context.clearRect(0, 0, canvas.width, canvas.height);


  entity.position.x += accelerateX;

  if (entity.position.x >= innerWidth || entity.position.x <= 0) {
    accelerateX *= -1;
  }

  entity.draw(context);


  requestAnimationFrame(loop.bind(this));
}

loop();





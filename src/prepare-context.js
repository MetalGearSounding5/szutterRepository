export const prepareContext = () => {
  const canvas = document.getElementById('canvas');

  const fitCanvasToInnerWindow = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  }

  window.onresize = fitCanvasToInnerWindow;
  fitCanvasToInnerWindow();

  return canvas.getContext('2d');
}

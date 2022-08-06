export const prepareContext = () => {
  const canvas = document.getElementById('canvas');

  const fitCanvasToInnerWindow = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.onresize = fitCanvasToInnerWindow;
  fitCanvasToInnerWindow();

  return canvas.getContext('2d');
}

import { canvas, events, time, debug, options } from './index.js';

const sketch = {
  name: location.pathname.split("/").slice(1, -1).join("-"),
  setup: (
    setup,
    canvasOptions
  ) => {
    sketch.setup = () => {
      options.init()
      const canvasSize = options.get("canvas-size") ?? `${canvas.configuration.width}x${canvas.configuration.height}`;
      const [width, height] = canvasSize.split('x').map(Number);

      canvas.create({
        width: canvasSize === 'fill' ? windowWidth : width,
        height: canvasSize === 'fill' ? windowHeight : height,
        ...canvasOptions
      });
      
      events.toggleNoLoopOnSingleClick();
      events.toggleCanvasRecordingOnKey();
      events.pauseOnSpaceKeyPressed();
      events.toggleFPSCounterOnKeyPressed();
      events.extendCanvasOnFullScreen();
      events.extendCanvasOnResize();
      events.toggleFullScreenOnDoubleClick();

      noStroke();

      setup?.();
    };
  },
  draw: (draw) => {
    sketch.draw = () => {
      debug.fps();
      pixelDensity(options.get("pixel-density"));
      frameRate(options.get("framerate"));
      noSmooth();
      draw?.(time.seconds() * options.get("time-speed"));
    };
  },
};

export default sketch;

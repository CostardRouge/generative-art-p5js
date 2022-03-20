import { canvas, events, time, debug, options, presets } from './index.js';

const sketch = {
  name: location.pathname.split("/").slice(1, -1).join("-"),
  setup: (
    setup,
    canvasOptions
  ) => {
    sketch.setup = () => {
      canvas.create(canvasOptions || presets.PORTRAIT.DEFAULT);
      
      events.toggleNoLoopOnSingleClick();
      events.toggleCanvasRecordingOnKey();
      events.pauseOnSpaceKeyPressed();
      events.toggleFPSCounterOnKeyPressed();
      events.extendCanvasOnFullScreen();
      events.extendCanvasOnResize();
      events.toggleFullScreenOnDoubleClick();

      noStroke();

      options.init()

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

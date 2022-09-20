import { canvas, events, time, debug, options } from './index.js';

const sketch = {
  name: location.pathname.split("/").slice(1, -1).join("-"),
  setup: (
    setup,
    canvasOptions
  ) => {
    sketch.setup = () => {
      options.init();

      const canvasSize = (
        (new URLSearchParams(document.location.search)).get('size')     ??
        options.get("canvas-size")                                      ??
        `${canvas.configuration.width}x${canvas.configuration.height}`
      );
      const [width, height] = canvasSize.split('x').map(Number);

      canvas.create({
        width: canvasSize === 'fill' ? windowWidth : width,
        height: canvasSize === 'fill' ? windowHeight : height,
        ...canvasOptions
      });

      frameRate(options.get("framerate"));
      options.get("smooth-pixel") ? smooth() : noSmooth();
      
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
      
      let t = time.seconds() * options.get("time-speed");
      //t = (frameCount-1)/options.get("framerate");

      const center = createVector(width / 2, height / 2);

      draw?.(t * options.get("time-speed"), center);
    };
  },
};

window.setup = () => {
  events.handle("pre-setup");

  sketch.setup();

  events.handle("post-setup");
}
window.draw = () => {
  events.handle("pre-draw");

  sketch.draw();

  events.handle("post-draw");
}

export default sketch;

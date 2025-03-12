import { events, debug, options, animation } from './index.js';
import engines from './engine/index.js';

const sketch = {
  name: location.pathname.split("/").slice(1, -1).join("-"),
  engine: undefined,
  setup: (
    setupEngineFunction,
    sketchOptions = {
      engine: "p5js",
      animation: {
        framerate: 60,
        duration: 10
      }
    }
  ) => {
    // persist sketchOptions
    sketch.sketchOptions = sketchOptions

    // options system
    options.init( );

    // canvas size
    const [canvasWidth, canvasHeight] = sketch.getDefaultCanvasSize();

    // engine system
    const { engine = "p5js", ...engineOptions } = sketchOptions;

    sketch.engine = engines[ engine ].init( {
      size: {
        width: canvasWidth,
        height: canvasHeight
      },
      ...engineOptions
    }, setupEngineFunction );

    // sketch events
    events.toggleNoLoopOnSingleClick();
    events.toggleCanvasRecordingOnKey();
    events.pauseOnSpaceKeyPressed();
    events.toggleFPSCounterOnKeyPressed();
    events.toggleFullScreenOnDoubleClick();
    events.extendCanvasOnResize();
  },
  getDefaultCanvasSize: (value) => {
    const canvasSize = (
      value                                                           ??
      (new URLSearchParams(document.location.search)).get('size')     ??
      options.get("canvas-size")
    );

    if ('fill' === canvasSize) {
      return [window.innerWidth, window.innerHeight];
    }

    return canvasSize.split('x').map(Number);
  },
  draw: (drawFunction) => {
    events.register("pre-draw", debug.fps);
    events.register("pre-draw", animation.incrementTime);
    events.register("draw", drawFunction);
  },
};

export default sketch;

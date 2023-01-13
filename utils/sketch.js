import { events, debug, options } from './index.js';
import { p5js, threejs } from './engine/index.js';

const engines = {
  p5js,
  threejs
};

const sketch = {
  name: location.pathname.split("/").slice(1, -1).join("-"),
  engine: undefined,
  setup: (
    setupEngineFunction,
    sketchOptions = { engine: "p5js"}
  ) => {
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
  getDefaultCanvasSize: (value) =>{
    const canvasSize = (
      value                                                           ??
      (new URLSearchParams(document.location.search)).get('size')     ??
      options.get("canvas-size")
    );

    return canvasSize.split('x').map(Number);
  },
  draw: (drawFunction) => {
    events.register("pre-draw", debug.fps);
    events.register("draw", drawFunction);
  },
};


export default sketch;

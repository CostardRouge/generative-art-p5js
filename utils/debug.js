import { time, string, sketch } from './index.js';
import options from './options.js';

const debug = {
  options: {
    fps: {
      frequency: 15,
      log: false,
      display: true
    },
    print: {
      frequency: 60
    },
  },
  //debugGraphics: undefined,
  DOMElements: {
    fpsCounter: undefined,
    canvasOverlay: undefined
  },
  // createDebugGraphics: () => {
  //   debug.debugGraphics = createGraphics(48, 32, P2D);
  // },
  toggleFPSCounter: () => {
    debug.options.fps.display = !debug.options.fps.display;
    options.set( 'show-fps', debug.options.fps.display );
  },
  fps: () => {
    debug.options.fps.display = options.get( 'show-fps');

    const { fps: { frequency, log, display } } = debug.options;

    debug.lastFrameRate = debug.lastFrameRate === undefined ? 0 : debug.lastFrameRate;

    time.every(frequency, () => {
      debug.lastFrameRate = frameRate();

      if (log === true) {
        console.log(frameRate());
      }
    });

    if (display === true) {
      if (debug.DOMElements.fpsCounter === undefined) {
        //debug.createDebugGraphics();
        debug.DOMElements.fpsCounter = createElement(
          "fps-counter",
          String(ceil(debug.lastFrameRate))
        );
      }

      debug.DOMElements.fpsCounter.elt.innerHTML = String(ceil(debug.lastFrameRate));

      // debug.debugGraphics.clear();

      // string.write(
      //   String(ceil(debug.lastFrameRate)),
      //   18,
      //   16,
      //   18,
      //   text.defaultFont,
      //   debug.debugGraphics
      // );

      // image(debug.debugGraphics, 0, 0);
    } else {
      if (debug.DOMElements.fpsCounter !== undefined) {
        debug.DOMElements.fpsCounter.elt.remove();
        debug.DOMElements.fpsCounter = undefined;
      }
    }
  },
  print: function (what, printOptions = {}) {
    const { frequency } = { ...debug.options.print, ...printOptions };

    time.every(frequency, () => {
      console.log(what);
    });
  },
  lines: function () {
    stroke(255);
    line(width / 2, 0, width / 2, height);
    line(0, height / 2, width, height / 2);

    stroke(255, 64);
    line(mouseX, 0, mouseX, height);
    line(0, mouseY, width, mouseY);
  },
  webgl: function() {
    if (!sketch.camera) {
      return;
    }

    if (debug.DOMElements.canvasOverlay === undefined) {
      debug.DOMElements.canvasOverlay = document.createElement("canvas-overlay" );

      document
        .querySelector("main")
        .appendChild( debug.DOMElements.canvasOverlay )
    }

    const camera = sketch.camera;
  
    debug.DOMElements.canvasOverlay.innerHTML = `camera
      eyeX: ${camera.eyeX}<br>
      eyeY: ${camera.eyeY}<br>
      eyeZ: ${camera.eyeZ}<br><br>

      centerX: ${camera.centerX}<br>
      centerY: ${camera.centerY}<br>
      centerZ: ${camera.centerZ}<br><br>

      upX: ${camera.upX}<br>
      upY: ${camera.upY}<br>
      upZ: ${camera.upZ}<br><br>
    `;
  }
  
};

export default debug;

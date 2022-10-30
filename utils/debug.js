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
    canvasOverlay: undefined
  },
  // createDebugGraphics: () => {
  //   debug.debugGraphics = createGraphics(48, 32, P2D);
  // },
  toggleFPSCounter: () => {
    debug.options.fps.display = !debug.options.fps.display;
    options.set( 'show-fps', debug.options.fps.display );
  },
  createElement: ( targetQuerySelector, tagName, contentCreator, remove ) => {
    if (true === remove) {
      if (undefined === debug.DOMElements[tagName]) {
        return;
      }

      debug.DOMElements[tagName].remove();
      debug.DOMElements[tagName] = undefined;
      return;
    }

    if (debug.DOMElements[tagName] === undefined) {
      debug.DOMElements[tagName] = document.createElement( tagName );

      document
        .querySelector(targetQuerySelector)
        .appendChild( debug.DOMElements[tagName] )
    }

    debug.DOMElements[tagName].innerHTML = contentCreator();
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

    debug.createElement( "body", "fps-counter", () => ceil(debug.lastFrameRate), !display)
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
    const createContent = () => {
      const camera = sketch.camera;

      return `camera
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

    debug.createElement( "main", "canvas-overlay", createContent, !sketch.camera)
  }
};

export default debug;

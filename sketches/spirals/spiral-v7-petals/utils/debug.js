import { time, string, sketch } from './index.js';
import options from './options.js';

const debug = {
  frameRate: 0,
  frameRateCount: 0,
  countDeltaTime: 0,
  options: {
    fps: {
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

    const { fps: { log, display } } = debug.options;

    debug.createElement( "body", "fps-counter", () => Math.ceil(debug.frameRate), !display);

    if ( !display ) {
      return;
    }

    const currentTime = new Date();

    if ( ( currentTime - debug.countDeltaTime ) > 1000 ) {
      debug.frameRate = debug.frameRateCount;
      debug.frameRateCount = 0;
      debug.countDeltaTime = new Date();

      if (log === true) {
        console.log(debug.frameRate);
      }
    }
    else {
      debug.frameRateCount += 1;
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
    const createContent = () => {
      const camera = sketch?.engine?.camera;

      if (!camera) {
        return
      }

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

    debug.createElement( "main", "canvas-overlay", createContent, sketch?.engine?.camera)
  }
};

export default debug;

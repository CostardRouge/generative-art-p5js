import { time } from './index.js';
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
  debugDOMelement: undefined,
  // createDebugGraphics: () => {
  //   debug.debugGraphics = createGraphics(48, 32, P2D);
  // },
  toggleFPSCounter: () => {
    debug.options.fps.display = !debug.options.fps.display;
    options.set( 'show-fps', debug.options.fps.display );
  },
  fps: () => {
    debug.options.fps.display = options.get( 'show-fps', debug.options.fps.display );

    const { fps: { frequency, log, display } } = debug.options;

    debug.lastFrameRate = debug.lastFrameRate === undefined ? 0 : debug.lastFrameRate;

    time.every(frequency, () => {
      debug.lastFrameRate = frameRate();

      if (log === true) {
        console.log(frameRate());
      }
    });

    if (display === true) {
      if (debug.debugDOMelement === undefined) {
        //debug.createDebugGraphics();
        debug.debugDOMelement = createElement(
          "fps-counter",
          String(ceil(debug.lastFrameRate))
        );
      }

      debug.debugDOMelement.elt.innerHTML = String(ceil(debug.lastFrameRate));

      // debug.debugGraphics.clear();

      // text.write(
      //   String(ceil(debug.lastFrameRate)),
      //   18,
      //   16,
      //   18,
      //   text.defaultFont,
      //   debug.debugGraphics
      // );

      // image(debug.debugGraphics, 0, 0);
    } else {
      if (debug.debugDOMelement !== undefined) {
        debug.debugDOMelement.elt.remove();
        debug.debugDOMelement = undefined;
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
  }
};

export default debug;

import time from './time.js';
import text from './text.js';
import debug from './debug.js';
import sketch from './sketch.js';
import canvas from './canvas.js';
import colors from './colors.js';
import events from './events.js';
import mappers from './mappers.js';
import options from './options.js';
import recorder from './recorder.js';
import converters from './converters.js';

const shapes = [];

// grid
// shapes instances
// canvases instances
// relation coordinates
// easing

window.preload = () => {
  text.defaultFont = loadFont(
    gitHubPagesPathHack("/assets/fonts/roboto-mono.ttf")
  );
}

export {
  text,
  time,
  debug,
  sketch,
  colors,
  canvas,
  shapes,
  events,
  mappers,
  options,
  recorder,
  converters
};

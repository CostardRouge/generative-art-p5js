import time from './time.js';
import audio from './audio.js';
import debug from './debug.js';
import string from './string.js';
import easing from './easing.js';
import sketch from './sketch.js';
import canvas from './canvas.js';
import colors from './colors.js';
import events from './events.js';
import mappers from './mappers.js';
import options from './options.js';
import recorder from './recorder.js';
import animation from './animation.js';
import iterators from './iterators.js';
import converters from './converters.js';

const shapes = [];


const midi = {
  on: {
    note: function() {

    }
  }
};


// midi.on("C3", console.log)
// midi.map("C", 3, 5, 10, 9)


// grid
// shapes instances
// canvases instances
// relation coordinates

export {
  time,
  audio,
  debug,
  string,
  easing,
  sketch,
  colors,
  canvas,
  shapes,
  events,
  mappers,
  options,
  recorder,
  animation,
  iterators,
  converters
};

const shapes = [];
const utils = {
  __VERSION: 1,
};

// presets
utils.presets = {
  FILL: {
    size: "FILL",
  },
  SQUARE: {
    HD: {
      width: 1080,
      height: 1080,
    },
    RETINA: {
      width: 2048,
      height: 2048,
    },
  },
  IPHONE_12: {
    PORTRAIT: {
      width: 1170,
      height: 2532,
    },
    LANDSCAPE: {
      width: 2532,
      height: 1170,
    },
  },
};

// mappers
utils.mappers = {
  circularMap: function (index, length, min, max) {
    return map(abs((index % length) - length / 2), 0, length / 2, max, min);
  },
  circularIndex: function (index, values) {
    const valuesIndex = floor(index % values.length);
    return values[valuesIndex];
  },
  circularValueOn: function (index, scale, values) {
    return values[ceil(circularMap(index, scale, 0, values.length - 1))];
  },
};

// time
utils.time = {
  seconds: function () {
    return frameCount / 60;
  },
  every: function (second, callback) {
    return frameCount % second === 0 && callback();
  },
};

// converters
utils.converters = {
  polar: {
    get: function (func, size, angle, coefficient = 1) {
      return size * func(angle * coefficient);
    },
    vector: function (angle, sizeX, sizeY = sizeX) {
      return createVector(
        this.get(sin, sizeX, angle),
        this.get(cos, sizeY, angle)
      );
    },
  },
};

function preload() {
  utils.text.defaultFont = loadFont("assets/fonts/roboto-mono.ttf");
}

// text
utils.text = {
  defaultFont: undefined,
  bounds: function (font, str, x, y, size) {
    return font.textBounds(str, x, y, size);
  },
  write: function (
    str,
    x,
    y,
    size = 18,
    font = utils.text.defaultFont,
    graphics = utils.canvas.main
  ) {
    const bbox = this.bounds(font, str, x, y, size);

    graphics.fill(55);
    graphics.textSize(size);
    graphics.textFont?.(font);
    graphics.text(str, x - bbox.w / 2, y + bbox.h / 2);
  },
};

// debug
utils.debug = {
  defaultOptions: {
    fps: {
      frequency: 15,
      log: false,
      display: true,
    },
    print: {
      frequency: 60,
    },
  },
  //debugGraphics: undefined,
  debugDOMelement: undefined,
  // createDebugGraphics: () => {
  //   utils.debug.debugGraphics = createGraphics(48, 32, P2D);
  // },
  fps: function (fpsOptions = {}) {
    const { frequency, log, display } = {
      ...this.defaultOptions.fps,
      //...fpsOptions,
    };

    this.lastFrameRate =
      this.lastFrameRate === undefined ? 0 : this.lastFrameRate;

    utils.time.every(frequency, () => {
      this.lastFrameRate = frameRate();
    });

    if (log === true) {
      utils.time.every(frequency, () => {
        console.log(frameRate());
      });
    }

    if (display === true) {
      if (this.debugDOMelement === undefined) {
        //utils.debug.createDebugGraphics();
        this.debugDOMelement = createElement(
          "fps-counter",
          String(ceil(this.lastFrameRate))
        );
      }

      this.debugDOMelement.elt.innerHTML = String(ceil(this.lastFrameRate));

      // utils.debug.debugGraphics.clear();

      // utils.text.write(
      //   String(ceil(this.lastFrameRate)),
      //   18,
      //   16,
      //   18,
      //   utils.text.defaultFont,
      //   utils.debug.debugGraphics
      // );

      // image(utils.debug.debugGraphics, 0, 0);
    } else {
      if (this.debugDOMelement !== undefined) {
        this.debugDOMelement.elt.remove();
        this.debugDOMelement = undefined;
      }
    }
  },
  print: function (what, printOptions = {}) {
    const { frequency } = { ...this.defaultOptions.print, ...printOptions };

    utils.time.every(frequency, () => {
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
};

// canvas setup
utils.canvas = {
  main: undefined,
  configuration: {
    type: "p2d",
    width: 1080,
    height: 1080,
  },
  create: function (options = {}) {
    const { size } = options;

    this.configuration = {
      ...this.configuration,
      ...options,
    };

    if (size === "FILL") {
      this.configuration.width = windowWidth;
      this.configuration.height = windowHeight;
    }

    const { width, height, ratio, type } = this.configuration;

    this.main = createCanvas(width, ratio ? width / ratio : height, type);

    return this.main;
  },
  resize: function (
    width = this.configuration.width,
    height = this.configuration.width
  ) {
    resizeCanvas(width, height);
  },
  fullscreen: function (extend) {
    fullscreen(!fullscreen());
  },
};

// common events
utils.events = {
  lastEventId: 0,
  registeredEvents: {},
  handle: function (eventName) {
    if (!utils.events.registeredEvents[eventName]) {
      return;
    }

    for (const eventId in utils.events.registeredEvents[eventName]) {
      utils.events.registeredEvents[eventName][eventId]();
    }
  },
  register: function (eventName, eventFunction) {
    const eventId = "event_id_" + utils.events.lastEventId;

    if (!this.registeredEvents[eventName]) {
      this.registeredEvents[eventName] = {};
    }

    this.registeredEvents[eventName][eventId] = eventFunction;
    this.lastEventId++;

    return () => {
      delete this.registeredEvents[eventName][eventId];
    };
  },

  toggleNoLoopOnSingleClick: function (mouseButtonKey = LEFT) {
    let stop = false;

    this.register("mousePressed", function () {
      stop = !stop;

      if (mouseButton !== mouseButtonKey) {
        return;
      }

      if (stop) {
        noLoop();
      } else {
        loop();
      }
    });
  },
  pauseOnSpaceKeyPressed: function () {
    let stop = false;

    this.register("keyTyped", function () {
      if (key !== " ") {
        return;
      }

      stop = !stop;

      if (stop) {
        noLoop();
      } else {
        loop();
      }
    });
  },
  fullScreenOnDoubleClick: function () {
    this.register("doubleClicked", utils.canvas.fullscreen);
  },
  extendCanvasOnFullScreen: function () {
    this.register("windowResized", () => {
      if (fullscreen()) {
        utils.canvas.resize(windowWidth, windowHeight);
      } else {
        utils.canvas.resize();
      }

      shapes.forEach((shape) => shape.onWindowResized?.());
    });
  },
  extendCanvasOnResize: function () {
    this.register("windowResized", () => {
      utils.canvas.resize(windowWidth, windowHeight);

      shapes.forEach((shape) => shape.onWindowResized?.());
    });
  },
  toggleCanvasRecordingOnKey: function (pressedKey = "r") {
    utils.events.register("keyTyped", function () {
      if (key !== pressedKey) {
        return;
      }

      if (utils.recorder.recording) {
        utils.recorder.stop();
      } else {
        utils.recorder.start();
      }
    });
  },
  toggleFPSCounter: function (pressedKey = "f") {
    utils.events.register("keyTyped", function () {
      if (key !== pressedKey) {
        return;
      }

      utils.debug.defaultOptions.fps.display =
        !utils.debug.defaultOptions.fps.display;

        return false
    });
  },
};

function keyTyped() {
  utils.events.handle("keyTyped");
}
function keyPressed() {
  utils.events.handle("keyPressed");
}
function mousePressed() {
  utils.events.handle("mousePressed");
}
function doubleClicked() {
  utils.events.handle("doubleClicked");
}
function windowResized() {
  utils.events.handle("windowResized");
}

// grid
// shapes instances
// canvases instances
// relation coordonates
// easing

// recorder
utils.recorder = {
  recording: false,
  recordingIconDOMEelement: undefined,
  capturer: new CCapture({
    format: "png",
    quality: "best",
    framerate: 60,
    verbose: true,
    name: location.pathname.split("/").slice(1, -1).join("-"),
    // format: "gif",
    // workersPath: "libraries/",
  }),
  start: () => {
    utils.recorder.recording = true;
    document.body.classList.add("recording");

    utils.recorder.capturer.start();
  },
  stop: () => {
    utils.recorder.recording = false;
    document.body.classList.remove("recording");

    utils.recorder.capturer.stop();
    utils.recorder.capturer.save();
  },
  render: () => {
    requestAnimationFrame(utils.recorder.render);

    if (false === this.recording) return;
    if (undefined === utils.canvas.main) return;

    utils.recorder.capturer.capture(utils.canvas.main.elt);
  },
};

utils.recorder.render();

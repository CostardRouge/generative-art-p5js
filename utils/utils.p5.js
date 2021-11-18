const shapes = [];
const utils = {
  __VERSION: 1,
};

// mappers
utils.mappers = {
  circularMap: function (index, length, min, max) {
    return map(abs((index % length) - length / 2), 0, length / 2, max, min);
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
  write: function (str, x, y, size = 18, font = this.defaultFont) {
    const bbox = this.bounds(font, str, x, y, size);

    fill(255);
    stroke(0);
    textSize(size);
    textFont(font);

    text(str, x - bbox.w / 2, y + bbox.h / 2);
  },
};

// debug
utils.debug = {
  defaultOptions: {
    fps: {
      frequency: 15,
      log: false,
      text: true,
    },
    print: {
      frequency: 60,
    },
  },
  fps: function (fpsOptions = {}) {
    const { frequency, log, text } = {
      ...this.defaultOptions.fps,
      ...fpsOptions,
    };

    if (log === true) {
      if (frameCount % frequency === 0) {
        console.log(frameRate());
      }
    }

    if (text === true) {
      this.lastFrameRate =
        this.lastFrameRate === undefined ? 0 : this.lastFrameRate;

      if (frameCount % frequency == 0) {
        this.lastFrameRate = frameRate();
      }

      utils.text.write(String(ceil(this.lastFrameRate)), 22, 15);
    }
  },
  print: function (what, printOptions = {}) {
    const { frequency } = { ...this.defaultOptions.print, ...printOptions };

    if (frameCount % frequency === 0) {
      console.log(what);
    }
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

// comon events
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

  toggleNoLoopOnSingleClick: function () {
    let stop = false;

    this.register("mousePressed", function () {
      stop = !stop;

      if (stop) {
        noLoop();
      } else {
        loop();
      }
    });
  },
  fullScreenOnDoubleClick: function (extend) {
    this.register("doubleClicked", utils.canvas.fullscreen);
  },
  extendCanvasOnFullScreen: function (extend) {
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
};

function mousePressed() {
  utils.events.handle("mousePressed");
}
function doubleClicked() {
  utils.events.handle("doubleClicked");
}
function windowResized() {
  utils.events.handle("windowResized");
}

// full screen

// grip

// shapes instances
// canvases instances

// relation coordonates

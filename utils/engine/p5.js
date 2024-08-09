import { events, options, time } from "../index.js";

const p5js = {
  camera: undefined,
  canvas: undefined,
  favoriteColors: {
    purple: undefined
  },
  init: (sketchOptions, setupEngineFunction) => {
    // scripts
    p5js.loadScripts();

    // global functions
    p5js.attachGlobalFunctions();

    // setup (using events)
    p5js.setup(sketchOptions, setupEngineFunction);

    return p5js;
  },
  getCanvasElement: () => p5js.canvas.elt,
  getFrameCount: () => frameCount,
  loadScripts: async () => {
    await loadScript("libraries/p5.min.js");
    await loadScript("libraries/p5.sound.min.js");
  },
  attachGlobalFunctions: () => {
    window.setup = () => {
      events.handle("pre-setup");
      events.handle("setup");
      events.handle("post-setup");
    };
    window.draw = () => {
      const _time = time.seconds() * options.get("time-speed");

      events.handle("pre-draw");
      events.handle("draw", _time, p5js.getCanvasCenter(), p5js.favoriteColors.purple);
      events.handle("post-draw");
    };
    window.keyTyped = () => {
      events.handle("engine-on-key-typed");
    };
    window.keyPressed = () => {
      events.handle("engine-key-pressed");
    };
    window.mousePressed = () => {
      events.handle("engine-mouse-pressed");
    };
    window.mouseDragged = () => {
      events.handle("engine-mouse-dragged");
    };
    window.mouseReleased = () => {
      events.handle("engine-mouse-released");
    };
    window.doubleClicked = () => {
      events.handle("engine-window-double-click");
    };
    window.windowResized = () => {
      events.handle("engine-window-resized");
    };
    window.preload = () => {
      console.log("PRELOAD");
      
      events.handle("engine-window-preload");
    };
  },
  setup: (sketchOptions, setupEngineFunction) => {
    events.register("pre-setup", () => {
       // init favorite colors
      p5js.favoriteColors.purple = color(128, 128, 255)

      // canvas creation
      const {
        type = "p2d",
        size: { width, height, ratio },
      } = sketchOptions;

      p5js.canvas = createCanvas(width, ratio ? width / ratio : height, type);

      if ("webgl" === type) {
        p5js.camera = createCamera();
        setCamera(p5js.camera);
      }

      // applying options
      frameRate(options.get("framerate"));
      options.get("smooth-pixel") ? smooth() : noSmooth();

      // registering events
      Object.entries(p5js.eventHandlers).forEach(
        ([eventName, eventHandler]) => {
          events.register(eventName, eventHandler);
        }
      );

      p5js.canvas.doubleClicked(() => {
        events.handle("engine-canvas-double-clicked");
      });

      p5js.canvas.mousePressed(() => {
        events.handle("engine-canvas-mouse-pressed");
      });
    });

    events.register("setup", () => {
      noStroke();
      setupEngineFunction?.(p5js.getCanvasCenter());
    });
  },
  getCanvasCenter: () => {
    if (p5js.canvas.isP3D) {
      return createVector(0, 0);
    }

    return createVector(width / 2, height / 2);
  },
  eventHandlers: {
    "engine-toggle-loop": function () {
      this.stop = this.stop ?? false;
      this.stop = !this.stop;

      if (this.stop) {
        noLoop();
      } else {
        loop();
      }
    },
    "engine-get-key-typed": () => key,
    "engine-toggle-fullscreen": () => fullscreen(!fullscreen()),
    "engine-fill-screen": () =>
      events.handle("engine-resize-canvas", windowWidth, windowHeight),
    "engine-resize-canvas": (canvasWidth, canvasHeight) =>
      p5js.canvas.resize(canvasWidth, canvasHeight),
    "engine-fullscreen-toggle": () => fullscreen(!fullscreen()),
    "engine-pause": () => noLoop(),
    "engine-resume": () => loop(),
    "engine-redraw": () => redraw(),
    "engine-canvas-save": (name, type) => saveCanvas(p5js.canvas, name, type),
    "engine-smooth-pixel-change": (checked) =>
      checked ? smooth() : noSmooth(),
    "engine-framerate-change": (value) => frameRate(value),
  },
};

export default p5js;

import { events, options, time } from "../index.js"

const p5js = {
    camera: undefined,
    canvas: undefined,
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
        await loadScript("libraries/p5.min.js")
        await loadScript("libraries/p5.sound.min.js")
    },
    attachGlobalFunctions: () => {
        window.setup = () => {
            events.handle("pre-setup");
            events.handle("setup");
            events.handle("post-setup");
        }
        window.draw = () => {
            const _time = time.seconds() * options.get("time-speed");
            const center = createVector(width / 2, height / 2);

            events.handle("pre-draw");
            events.handle("draw", _time, center);
            events.handle("post-draw");
        }
        window.keyTyped = () => {
            events.handle("engine-on-key-typed");
        }
        window.keyPressed = () => {
            events.handle("engine-key-pressed");
        }
        window.mousePressed = () => {
            events.handle("engine-mouse-pressed");
        }
        window.mouseDragged = () => {
            events.handle("engine-mouse-dragged");
        }
        window.mouseReleased = () => {
            events.handle("engine-mouse-released");
        }
        window.doubleClicked = () => {
            events.handle("engine-window-double-click");
        }
        window.windowResized = () => {
            events.handle("engine-window-resized");
        }
        window.preload = () => {
            events.handle("engine-window-preload");
        }
    },
    setup: (sketchOptions, setupEngineFunction) => {
        events.register("pre-setup", () => {
            // canvas creation
            const { type = "p2d", size: { width, height, ratio } } = sketchOptions;

            p5js.canvas = createCanvas(width, ratio ? width / ratio : height, type);

            if ( 'webgl' === type ) {
                p5js.camera = createCamera();
            }

            // applying options
            frameRate(options.get("framerate"));
            options.get("smooth-pixel") ? smooth() : noSmooth();

            // registering events
            Object.entries( p5js.eventHandlers ).forEach( ([eventName, eventHandler]) => {
                events.register(eventName, eventHandler)
            } );

            p5js.canvas.doubleClicked( () => {
                events.handle("engine-canvas-double-clicked");
            } );
        })

        events.register("setup", () => {
            noStroke();
            setupEngineFunction?.(createVector(width / 2, height / 2));
        })
    },
    eventHandlers: {
        "engine-toggle-loop": function() {
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
        "engine-fill-screen": () => p5js.canvas.resize(windowWidth, windowHeight),
        "engine-resize-canvas": ( canvasWidth, canvasHeight ) => resizeCanvas(canvasWidth, canvasHeight),
        "engine-fullscreen-toggle": ( ) => fullscreen(!fullscreen()),
        "engine-pause": () => noLoop(),
        "engine-resume": () => loop(),
        "engine-redraw": () => redraw(),
        "engine-canvas-save": (name, type) => saveCanvas( p5js.canvas, name, type ),
        "engine-smooth-pixel-change": (checked) => checked ? smooth() : noSmooth(),
        "engine-framerate-change": value => frameRate(value)
    }
}

export default p5js;

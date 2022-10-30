import { events, options, time, debug } from "../index.js"

const threejs = {
    container: undefined,
    uniforms: {},
    renderer: undefined,
    camera: undefined,
    scene: undefined,
    clock: undefined,
    running: false,
    init: async(sketchOptions, setupEngineFunction) => {
        // scripts
        window.THREE = await import('../../libraries/three.module.js')

        // setup
        threejs.setup(sketchOptions, setupEngineFunction);

        // start
        setupEngineFunction?.(threejs);
        events.handle("engine-resume");

        return threejs;
    },
    getCanvasElement: () => threejs.renderer.domElement,
    getFrameCount: () => frameCount,
    setup: (sketchOptions) => {
        threejs.container = document.createElement("div")

        threejs.camera = new THREE.Camera();
        threejs.scene = new THREE.Scene();
        threejs.clock = new THREE.Clock();

        const { size: { width, height, ratio } } = sketchOptions;

        threejs.renderer = new THREE.WebGLRenderer();
        threejs.renderer.setPixelRatio( window.devicePixelRatio );
        threejs.renderer.setSize( width, ratio ? width / ratio : height );

        threejs.container.appendChild( threejs.renderer.domElement );
        document.body.appendChild( threejs.container );

        // registering events
        Object.entries( threejs.eventHandlers ).forEach( ([eventName, eventHandler]) => {
            events.register(eventName, eventHandler)
        } );

        window.addEventListener( 'resize', () => {
            events.handle("engine-window-resized")
        }, false );

        window.addEventListener( 'mousemove', event => {
            events.handle("engine-mouse-moved", event)
        }, false );

    },
    animate: () => {
        if ( !threejs.running ) {
            return;
        }

        requestAnimationFrame( threejs.animate );

        events.handle("engine-render");
    },
    render: () => {
        threejs.uniforms.u_time.value += threejs.clock.getDelta();
        threejs.renderer.render( threejs.scene, threejs.camera );
    },
    eventHandlers: {
        // "engine-toggle-loop": function() {
        //     this.stop = this.stop ?? false;
        //     this.stop = !this.stop;
        
        //     if (this.stop) {
        //         noLoop();
        //     } else {
        //         loop();
        //     }
        // },
        // "engine-get-key-typed": () => key,
        // "engine-toggle-fullscreen": () => fullscreen(!fullscreen()),
        "engine-fill-screen": () => {
            threejs.renderer.setSize( window.innerWidth, window.innerHeight );
        },
        "engine-resize-canvas": ( canvasWidth, canvasHeight ) => {
            threejs.renderer.setSize( canvasWidth, canvasHeight );
            threejs.uniforms.u_resolution.value.x = threejs.renderer.domElement.width;
            threejs.uniforms.u_resolution.value.y = threejs.renderer.domElement.height;
        },
        "engine-mouse-moved": (event) => {
            threejs.uniforms.u_mouse.value.x = event.pageX
            threejs.uniforms.u_mouse.value.y = event.pageY
        },
        // "engine-fullscreen-toggle": ( ) => fullscreen(!fullscreen()),
        "engine-pause": () => {
            threejs.running = false;
        },
        "engine-resume": () => {
            threejs.running = true;
            threejs.animate();
        },
        "engine-redraw": () => {
            events.handle("engine-render");
        },
        "engine-render": () => {
            //debug.fps();
            threejs.render();
        },
        // "engine-canvas-save": (name, type) => saveCanvas( p5js.canvas, name, type ),
        // "engine-smooth-pixel-change": (checked) => checked ? smooth() : noSmooth(),
        // "engine-framerate-change": value => frameRate(value)
    }
}

export default threejs;

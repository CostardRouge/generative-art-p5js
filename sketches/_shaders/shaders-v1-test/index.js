import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';
import * as THREE from './libraries/three.module.js';

// options.add( [] );
var camera, scene, renderer, clock;
var uniforms;

init();
animate();

function init() {
  const container = document.createElement("div")
  container.id = "container";

  document.body.appendChild( container );

  camera = new THREE.Camera();
  camera.position.z = 1;

  scene = new THREE.Scene();
  clock = new THREE.Clock();

  const geometry = new THREE.PlaneBufferGeometry( 2, 2 );

  uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() }
  };

  const material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      void main() {
        vec2 st = gl_FragCoord.xy/u_mouse.xy;
        gl_FragColor=vec4(abs(sin(st.x+u_time)),st.y,0.0,1.0);
      }
    `
  } );

  const mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );

  container.appendChild( renderer.domElement );

  onWindowResize();
  window.addEventListener( 'resize', onWindowResize, false );

  document.onmousemove = function(e){
    uniforms.u_mouse.value.x = e.pageX
    uniforms.u_mouse.value.y = e.pageY
  }
}

function onWindowResize( event ) {
  renderer.setSize( window.innerWidth, window.innerHeight );
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  uniforms.u_time.value += clock.getDelta();
  renderer.render( scene, camera );
}

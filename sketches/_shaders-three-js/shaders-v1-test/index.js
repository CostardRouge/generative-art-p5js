import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

sketch.setup(({ uniforms, camera, scene }) => {
  camera.position.z = 1;

  uniforms.u_time = { type: "f", value: 1.0 };
  uniforms.u_resolution = { type: "v2", value: new THREE.Vector2() };
  uniforms.u_mouse = { type: "v2", value: new THREE.Vector2() };

  const geometry = new THREE.PlaneGeometry( 2, 2 );

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
}, { engine: "threejs" });

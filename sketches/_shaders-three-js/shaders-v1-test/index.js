import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

sketch.setup( async ({ uniforms, camera, scene }) => {
  camera.position.z = 1;

  const geometry = new THREE.PlaneGeometry( 2, 2 );

  const material = new THREE.ShaderMaterial( {
    uniforms,
    vertexShader: await ((await fetch("./shader.vert")).text()),
    fragmentShader: await ((await fetch("./shader.frag")).text())
  } );

  const mesh = new THREE.Mesh( geometry, material );

  scene.add( mesh );
}, { engine: "threejs" });

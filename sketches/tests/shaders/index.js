import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

let controls = undefined;

sketch.setup( async ({ uniforms, camera, scene, renderer }) => {
  camera.position.z = 1;

  const geometry = new THREE.PlaneGeometry( 2, 2 );

  const material = new THREE.ShaderMaterial( {
    uniforms,
    vertexShader: await ((await fetch("./shader.vert")).text()),
    fragmentShader: await ((await fetch("./shader.frag")).text())
  } );

  const mesh = new THREE.Mesh( geometry, material );

  scene.add( mesh );

  const { OrbitControls } = await import('./libraries/three.OrbitControls.js');

  controls = new OrbitControls(camera, renderer.domElement );
}, { engine: "threejs" });


sketch.draw( ({scene}) => {
  controls && controls.update();
});

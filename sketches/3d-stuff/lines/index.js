import { shapes, sketch, converters, iterators, events, easing, time, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "size",
    type: 'slider',
    label: 'Size',
    min: 1,
    max: 1280,
    defaultValue: 200,
    category: 'Integers'
  },
  {
    id: "angle-step",
    type: 'slider',
    label: 'Angles step',
    min: 2,
    max: 256,
    defaultValue: 128,
    category: 'Integers'
  },
  {
    id: "phase",
    type: 'number',
    label: 'Phase',
    min: 1,
    max: 32,
    defaultValue: 6,
    category: 'Integers'
  },
  {
    id: "amplitude",
    type: 'slider',
    label: 'Amplitude',
    min: 1,
    max: 1000,
    defaultValue: 150,
    category: 'Integers'
  },
  {
    id: "orbit-control",
    type: 'switch',
    label: 'Orbit control',
    defaultValue: 150,
    category: 'Debug'
  },
] );

sketch.setup(() => {
  // let cam = createCamera();
  // give it an orthographic projection
  // cam.ortho(-width / 2, width / 2, height / 2, -height / 2, 0, 500);
}, { type: 'webgl' });

function wave(start, end, period, amplitude, fn = sin, speed = 1, phase) {
  const t = phase + time.seconds() * speed;

  beginShape();
  // stroke(255);
  strokeWeight(5);
  iterators.vector(start, end, 0.01, ( position, index ) => {
    const i = map( index, 0, 1, -PI/2, PI/2 )*period
    const z = position.z + mappers.fn(sin(i+t), -1, 1, -amplitude, amplitude, fn);

    // translate(position.x, position.y, z);
    // translate(position.y, z, position.x);
    // sphere(25);
    
    vertex(position.x, position.y, z);
  });
  endShape();
}

function gridWave(period = 3, amplitude = 10) {
  const xCount = period;
  const yCount = period;
  
  const xSize = width / xCount;
  const ySize = height / yCount;

  // strokeWeight(3)

  // stroke(
  //   128,
  //   128,
  //   255
  // );

  const offsetX = 1;
  const offsetY = 1;

  for (let x = offsetX; x <= xCount - offsetX; x++) {
    for (let y = offsetY; y <= yCount - offsetY; y++) {

      const fn = easing.easeInExpo;

      stroke('blue')
      wave(
        createVector(0, y * ySize),
        createVector(width, y * ySize),
        period,
        amplitude,
        fn,
        y % 2 == 0 ? 0 : 0, 
        y % 2 == 0 ? -PI/2 : PI/2,
      )

      stroke('red')
      wave(
        createVector(x * xSize, 0),
        createVector(x * xSize, height),
        period,
        amplitude,
        fn,
        x % 2 == 0 ? 0 : 0, 
        x % 2 == 0 ? PI/2 : -PI/2,
      )

      // stroke('red')
      stroke(255);
      //line(0, y * ySize, width, y * ySize);
      //line(x * xSize, 0, x * xSize, height);
    }
  }
}

sketch.draw((time) => {
  background(0);

  noFill();
  translate(-width / 2, -height / 2);

  gridWave(8, 100 * sin(time));
  // wave(
  //   createVector(0, height / 2),
  //   createVector(width, height / 2),
  //   10,
  //   height / 16,
  //   sin,
  //   2,
  //   0
  // )

  // wave(
  //   createVector(0, height / 3),
  //   createVector(width, height / 3),
  //   10,
  //   height / 16,
  //   sin,
  //   2,
  //   PI
  // )

  // wave(
  //   createVector(width / 2 , 0),
  //   createVector(width / 2, height),
  //   10,
  //   height / 32,
  //   cos,
  //   2
  // )

  strokeWeight(1)
  stroke(255);
  // debugMode();
  // debugMode(GRID);
  options.get("orbit-control") && orbitControl();
});

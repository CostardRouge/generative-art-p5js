import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing, animation } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 25,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 150,
    category: 'Grid'
  },
  {
    id: "grid-cell-centered",
    type: 'switch',
    label: 'Centered cell',
    defaultValue: true,
    category: 'Grid'
  },
  {
    id: "noise-detail-lod",
    type: 'number',
    label: 'Noise detail lod',
    min: 0,
    max: 32,
    defaultValue: 3,
    category: 'Noise'
  },
  {
    id: "noise-detail-falloff",
    type: 'slider',
    label: 'Noise detail falloff',
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.45,
    category: 'Noise'
  },
] );

sketch.setup();

let generalXOff = 0, generalYOff = 0, generalZOff = 0;

const easingFunctions = Object.entries(easing)

sketch.draw((time) => {
  background(0);

  const rows = options.get("grid-rows");
  const cols = options.get("grid-cols");

  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }

  const scale = ((width / cols) + (height / rows) ) /2 ;

  noiseDetail(
    options.get("noise-detail-lod"),
    options.get("noise-detail-falloff"),
  );

  const zMax = scale * 10;

  let colorFunction = mappers.circularIndex(0, [
    colors.rainbow,
    colors.purple
  ])

  let colorPrecision = animation.sequence('color-precision', time/2, [ 0.1, 0.5, 1, 2])
  let siiin = 2//animation.sequence('i', time/2, [ 2, 1, 3])

  // generalXOff += animation.sequence('vx', time/2, [ 0.01, 0.005 ])
  generalXOff = animation.sequence('vx', time/2, [ -0.4, -0.25 ])
  generalYOff = 0//animation.sequence('vy', time/2, [ -0.1, 0.2, 0.3 ])
  generalZOff = animation.sequence('vz', time/2, [ 0.25, 0.1, 0.4 ])

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/cols;
    const yOff = y/rows;
    const angle = noise(xOff+generalXOff+time/10, yOff+generalYOff, generalZOff) * (TAU*4);


    const easingFunction = mappers.circularIndex(noise(xOff+generalYOff, yOff)+time, easingFunctions)[1]

    const z = zMax * cos(angle);
    let weight = map(z, -zMax, zMax, 40, 50 );

    //colorFunction = mappers.circularIndex(noise(yOff, xOff, time)+sin(time), [colors.rainbow,colors.purple])
    //colorPrecision = mappers.circularIndex(noise(xOff+generalXOff, yOff)+time/2, [ 0.5, 1, 2])
    // colorPrecision = mappers.circularIndex(time+yOff, [ 0.25, 1.5, 0.5, 1, 2])
    // colorPrecision = mappers.circularIndex(time+yOff, [ 0.25, 0.5, 0.7, 1])
    colorPrecision = mappers.circularIndex(noise(xOff+generalYOff, yOff)+time, [ 0.25, 0.5, 0.7])

    stroke(colorFunction({
      hueOffset: 0,
      // hueIndex: map(z, -zMax, zMax, -PI, PI)*colorPrecision,
      hueIndex: mappers.fn(z, -zMax, zMax, -PI, PI)*colorPrecision,
      opacityFactor: mappers.fn(z, -zMax, zMax, 3, 1),
      // opacityFactor: map(z, -zMax, zMax, 3, 1),
      //opacityFactor: map(sin(time+angle), -1, 1, 5, 1)
    }))

    push();
    translate( cellVector.x, cellVector.y );

    strokeWeight(weight);

    translate(scale * sin(angle), scale * cos(angle) )
    point( 0, 0);

    pop();
  })
});

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
    id: "grid-columns",
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

let generalXOff, generalYOff = 0;

sketch.draw((time) => {
  background(0);

  const rows = options.get("grid-rows");
  const columns = options.get("grid-columns");

  const gridOptions = {
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height ),
    bottomRight: createVector( width, height ),
    rows,
    columns,
    centered: options.get("grid-cell-centered")
  }

  const scale = ((width / columns) + (height / rows) ) /2 ;

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
  let siiin = animation.sequence('color-precision', time/2, [ 2, 1, 3])

  // generalXOff += animation.sequence('vx', time/2, [ 0.01, 0.005 ])
  generalXOff = animation.sequence('vx', time/2, [ 0.25, 0.1, 0.4 ])
  generalYOff = animation.sequence('vy', time/3, [ -0.1, 0.2, 0.3 ])

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/columns;
    const yOff = y/rows;
    const angle = noise(xOff+generalXOff-time/5, yOff+generalYOff, time/10) * (TAU*4);

    const z = zMax * cos(angle);
    const weight = map(z, -zMax, zMax, 40, 50 );

    //colorFunction = mappers.circularIndex(noise(yOff, xOff, time)+sin(time), [colors.rainbow,colors.purple])
    //colorPrecision = mappers.circularIndex(noise(xOff+generalXOff, yOff)+time/2, [ 0.5, 1, 2])
    colorPrecision = mappers.circularIndex(time+yOff, [ 0.25, 1.5, 0.5, 1, 2])

    stroke(colorFunction({
      hueOffset: 0,
      hueIndex: map(z, -zMax, zMax, -PI, PI)*colorPrecision,
      opacityFactor: map(z, -zMax, zMax, 3, 1),
      //opacityFactor: map(sin(time+angle), -1, 1, 5, 1)
    }))

    push();
    translate( cellVector.x, cellVector.y );

    strokeWeight(weight);

    translate(scale * sin(angle), scale * cos(angle)*siiin )
    point( 0, 0);

    pop();
  })
});

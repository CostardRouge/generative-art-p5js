import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing, animation } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 80,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 30,
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

  const colorFunction = mappers.circularIndex(0, [
    colors.rainbow,
    colors.purple
  ])

  const colorPrecision = animation.sequence('color-precision', time/2, [ 0.1, 0.5, 1, 2])

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const angle = noise(x/cols-frameCount/300, y/rows+time/5, time/15) * (TAU*4);

    const z = zMax * cos(angle);

    let weight = map(angle, min, TAU, 1, 20, true );
    weight = map(z, -zMax, zMax, 25, 50 );
    // weight = map(sin(time+angle*5), -1, 1, scale/3, scale)

    stroke(colorFunction({
      hueOffset: 0,
      hueIndex: map(z, -zMax, zMax, -PI, PI)*colorPrecision,
      opacityFactor: map(z, -zMax, zMax, 3, 1),
      // opacityFactor: map(sin(time+angle), -1, 1, 3, 1)
    }))

    push();
    translate( cellVector.x, cellVector.y );

    strokeWeight(scale);

    translate(scale * sin(angle), scale * cos(angle)*2 )
    point( 0, 0);

    pop();
  })
});

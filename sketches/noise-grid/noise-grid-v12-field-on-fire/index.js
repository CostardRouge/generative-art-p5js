import { events, sketch, converters, audio, grid, animation, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 75,
    category: 'Grid'
  },
  {
    id: "grid-columns",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 40,
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
    defaultValue: 6,
    category: 'Noise'
  },
  {
    id: "noise-detail-falloff",
    type: 'slider',
    label: 'Noise detail falloff',
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.6,
    category: 'Noise'
  },
] );

sketch.setup();


sketch.draw((time,center) => {
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
  const scale = (width / columns)//-2;
  const zMax = scale * 10;

  noiseDetail(
    options.get("noise-detail-lod"),
    options.get("noise-detail-falloff"),
  );

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    push();
    translate( cellVector.x, cellVector.y );

    const angle = noise(x/columns+time/4, y/rows+time/8, time/20) * (TAU*4);
    const weight = scale//map(center.dist(cellVector), 0, width, 0, scale, true )

    const distance = cellVector.dist(center);

    const z = zMax * cos(angle)
    const w = mappers.fn(sin(1*time+angle), -1, 1, -width/2, width/2, Object.entries(easing)[4][1] )

    stroke( colors.rainbow({
      hueOffset: time,
      hueIndex: map(z, -zMax, zMax, -PI, PI )*2,
      opacityFactor: mappers.fn(distance, 0, w, 10, 1, Object.entries(easing)[4][1] ),
    }))

    strokeWeight(weight);
    point( 0, 0);
    pop();
  })
});

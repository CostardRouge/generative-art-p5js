import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 150,
    defaultValue: 60,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 150,
    defaultValue: 60,
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
    id: "grid-multiply-over-time",
    type: 'switch',
    label: 'Multiply size over time',
    defaultValue: false,
    category: 'Grid'
  },
  {
    id: "grid-multiply-over-time-min",
    label: 'Multiplier min',
    type: 'slider',
    min: 1,
    max: 10,
    defaultValue: 2,
    category: 'Grid'
  },
  {
    id: "grid-multiply-over-time-max",
    label: 'Multiplier max',
    type: 'slider',
    min: 1,
    max: 10,
    defaultValue: 4,
    category: 'Grid'
  },
] );

let direction = undefined;

sketch.setup((center) => {
  direction = center;
}, { type: 'webgl' });

let min = Math.PI, max =0;

sketch.draw((time, center) => {
  direction.add(0, 0.005)

  rotateX(degrees(-70))
  rotateZ(map(sin(time), -1, 1, -PI, PI)/8)

  translate(
    -width /2,
    -height / 2
  )

  background(0);

  const n = options.get("grid-multiply-over-time") ? mappers.fn(
    sin(time/2),
    -1,
    1,
    options.get("grid-multiply-over-time-min"),
    options.get("grid-multiply-over-time-max"),
    easing.easeInBounce
    ) : 1;
  const rows = options.get("grid-rows")*n;
  const cols = options.get("grid-cols")*n;

  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }

  const scale = (width / cols);

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const angle = noise(x/cols+direction.x, y/rows+direction.y) * (TAU*4);
    const weight = mappers.fn(angle, 0, TAU, 1, 20 );

    const z = scale * cos(angle) * 5;

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    const up = map(sin(time), -1, 1, 1, 10);
    const down = map(sin(time), -1, 1, 10, 1);
    
    stroke(colors.rainbow({
      hueOffset: 0,
      // hueIndex: mappers.fn(angle, min, max, -TAU, TAU ),
      hueIndex: map(z, -scale * 5, scale * 5, -PI, PI),

      // opacityFactor: 1.5,
      opacityFactor: map(z, -scale * 5, scale * 5, down, up)
    }))

    push();
    translate( cellVector.x, cellVector.y );

    strokeWeight(weight);
    translate(scale * sin(angle), scale * cos(angle), z )
    point( 0, 0);

    pop();
  })

  // console.log({
  //   max, min
  // });

  orbitControl();
});

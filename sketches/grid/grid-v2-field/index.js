import { events, sketch, converters, audio, grid, animation, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 40,
    defaultValue: 16,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 40,
    defaultValue: 9,
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
    defaultValue: true,
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

sketch.setup();

let min = Math.PI, max =Math.PI;

sketch.draw((time) => {
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
  const z = frameCount/300//mappers.fn(sin(time), -1, 1, 3, 3.5)
  const scale = (width / cols);

  // noiseDetail(2, 4, 1);
  // noiseSeed()

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const angle = noise(x/cols, y/rows+time/5, z) * (TAU*4);
    const vector = p5.Vector.fromAngle(angle);
    const cellScale = map(angle, min, max, scale, scale*4, true  )
    const weight = 20//map(angle, min, max, 1, 20, true )

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    strokeWeight(weight);
    stroke(255);
    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
      opacityFactor: 1.5,
      opacityFactor: map(angle, min, max, 2, 1 ),
      // min: map(angle, min, max, 360, 0, true ),
      // max: map(angle, min, max, 225, 360, true )
    }))

    push();
    translate( cellVector.x, cellVector.y );
    rotate(vector.heading())
    point( 0, 0);
    line( 0, 0, cellScale, 0);
    pop();
  })

  console.log({
    max, min
  });
});

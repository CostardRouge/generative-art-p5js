import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 260,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 16,
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

sketch.setup();

events.register("post-setup", () => {
  //audio.capture.setup(0.2, 2048)
});

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

  const scale = (width / cols);
  const zMax = scale * 15;

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/cols;
    const yOff = y/rows;
    const angle = noise(xOff, yOff+time/8, time/10) * (TAU*4);
    const z = zMax * cos(angle);

    const weight = map(z, -zMax, zMax, 25, 50 );
    const colorFunction = mappers.circularIndex(xOff+yOff+time, [colors.rainbow,colors.purple])

    stroke(colorFunction({
      hueOffset: 0,
      hueIndex: map(z, -zMax, zMax, -PI, PI)*2,
      opacityFactor: map(z, -zMax, zMax, 3, 1),
      // opacityFactor: map(sin(time+angle*2), -1, 1, 3, 1)
    }))

    push();

    translate( cellVector.x, cellVector.y );
    translate(scale * sin(angle), scale * cos(angle) )
    strokeWeight(weight);
    point( 0, 0);

    pop();
  })
});

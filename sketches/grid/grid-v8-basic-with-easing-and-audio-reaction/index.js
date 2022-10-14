import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Cols',
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
  audio.capture.setup(0.9, 2048)
});

let min = Math.PI, max = 0;

let audioActivity = 0;
let bassActivity = 0;

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

  const audioEnergyAverage = audio.capture.energy.average("smooth");
  const bassAverage = audio.capture.energy.byIndex(2, "smooth");

  noiseDetail(
    8,
    // map(bassAverage, 0, 1, 0.2, 0.8, true),
    bassAverage
    //0.8
  );

  audioActivity += map(audioEnergyAverage, 0, 1, 0, 0.03, true);
  bassActivity += map(bassAverage, 0, 1, 0, 0.01, true);

  noFill();

  const easingFunctions = Object.entries( easing );

  const i = map(mouseX, 0, width, 0, easingFunctions.length);
  const [ , easingFunction ] = mappers.circularIndex( time*2, easingFunctions);

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const angle = noise(x/cols, y/rows+time/5, time/10) * (TAU*4);

    let weight = map(angle, min, TAU, 1, 10, true );
    weight = mappers.fn(angle, min, TAU, 1, 10, easingFunctions[24][1] );
    // weight = mappers.fn(angle, min, TAU, 1, 10, easingFunction );

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
      // hueIndex: mappers.fn(angle, 0, TAU, -PI/2, PI/2, easingFunction ),
      opacityFactor: 1.5,
      // opacityFactor: map(angle, min, max, 3, 1 ),
      //opacityFactor: mappers.fn(angle, 0, TAU*2, 5, 1, easingFunctions[5][1] ),
    }))

    // stroke(255)

    push();
    translate( cellVector.x, cellVector.y );
    // circle(0, 0, scale)

    strokeWeight(weight);

    // translate(scale * sin(angle), scale * cos(angle) )
    point( 0, 0);

    pop();
  })

  // console.log({
  //   max, min
  // });
});

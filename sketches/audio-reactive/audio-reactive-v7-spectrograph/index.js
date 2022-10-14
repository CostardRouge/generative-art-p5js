import { events, sketch, converters, animation, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

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

events.register("post-setup", () => {
  audio.capture.setup(0, 512)
  events.register("post-draw", audio.capture.energy.recordHistory );
  // midi.setup()
});
sketch.setup();

let min = Math.PI, max =0;
let musicActivity = 0;
let bassActivity = 0;

sketch.draw((time) => {
  background(0);

  let n = options.get("grid-multiply-over-time") ? mappers.fn(
    sin(time/2),
    -1,
    1,
    options.get("grid-multiply-over-time-min"),
    options.get("grid-multiply-over-time-max"),
    easing.easeInBounce
    ) : 1;

  // nrj = audio.capture.energy.average()

  // n = animation.sequence(
  //   "grid-cell-n",
  //   audio.capture.energy.byIndex( 1, "count"),
  //   [ 0.75, 1, 1.25 ],
  //   0.67
  // )

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

  const cellSize = ((width+height) / (cols+rows));

  const audioEnergyAverage = audio.capture.energy.average("raw");
  const bassAverage = audio.capture.energy.byIndex(2, "raw");

  musicActivity += map(audioEnergyAverage, 0, 0.5, 0, 0.01, true);
  bassActivity += map(bassAverage, 0, 1, 0, 0.01, true);

  //noStroke()
  noFill();

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    push();
    translate( cellVector.x, cellVector.y );

    const xx = floor(map(x, 0, cols - 1, 0, audio.capture.bins -1))
    const yy = floor(map(y, 0, rows - 1, 0, 59))
    const line = audio.capture.history?.spectrum[yy];
    //const lineAvg = (line?.reduce( (average, bin) => average + bin) / line?.length) / 255
    const energy = line?.[xx]//map(line?.[xx], 0, 255, 0, 1)

    const weight = map(energy, 0, 255, 1, cellSize );

    min = Math.min(min, energy);
    max = Math.max(max, energy);

    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(energy, 0, 255, -PI/2, PI/2 ),
      opacityFactor: 1.5,
      opacityFactor: map(energy, 0, 255, 3, 1 )
    }))

    strokeWeight( weight );
    point( 0, 0 );

    pop();
  })

  //audio.capture.energy.draw()
});

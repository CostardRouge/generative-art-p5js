import { events, sketch, converters, animation, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 70,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Cols',
    min: 1,
    max: 70,
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
  audio.capture.setup()
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

  let z = frameCount/300

  const scale = (width / cols);

  // noiseDetail(2, 4, 1);
  noFill();

  const audioEnergyAverage = audio.capture.energy.average("raw");
  const bassAverage = audio.capture.energy.byIndex(2, "raw");

  musicActivity += map(audioEnergyAverage, 0, 0.5, 0, 0.01, true);
  bassActivity += map(bassAverage, 0, 1, 0, 0.01, true);

  // console.log({
  //   musicActivity,
  //   bassActivity
  // });

  // console.log(audio.capture.history?.spectrum);

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    push();
    translate( cellVector.x, cellVector.y );


    const xx = round(map(x, 0, cols - 1, 0, audio.capture.bins -1))
    const yy = round(map(y, 0, cols - 1, 0, 59))

    const line = audio.capture.history?.spectrum[yy];
    const lineAvg = (line?.reduce( (average, bin) => average + bin) / line?.length) / 255
    const cell = line?.[xx]/255

    // console.log(y, cell);
    // console.log(lineAVg);

    // console.log(x);

    let angle = noise(x/cols+cell, y/rows) * (TAU);

    // console.log(angle);
    // const vector = p5.Vector.fromAngle(angle);

    const weight = map(angle, min, TAU, 1, 20, true );

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
      opacityFactor: 1.5,
      opacityFactor: map(angle, min, max, 3, 1 )
    }))

    translate(scale * sin(angle), scale * cos(angle) )


    if (angle > max/2) {
      strokeWeight(weight);
      point( 0, 0);
    }
    else {
      stroke(colors.darkBlueYellow({
        hueOffset: 0,
        hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
        // opacityFactor: 1.5,
        opacityFactor: map(angle, min, max, 3, 1 )
      }))

    stroke(lerpColor(
      colors.rainbow({
        hueOffset: 0,
        hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
        opacityFactor: 1.5,
        opacityFactor: map(angle, min, max, 3, 1 )
      }),
      colors.darkBlueYellow({
        hueOffset: 0,
        hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
        // opacityFactor: 1.5,
        opacityFactor: map(angle, min, max, 3, 1 )
      }),
      map(angle, min, max, 0, 10 )
    ));

      // strokeWeight(2)
      // circle(0, 0, weight)

      strokeWeight(weight);
      point( 0, 0);
    }
    pop();
  })

  // audio.capture.energy.draw()
});

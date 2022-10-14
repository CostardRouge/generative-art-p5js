import { events, sketch, converters, audio, grid, animation, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

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
  audio.capture.setup(0.5, 2048)
});

let min = Math.PI, max =Math.PI;

let audioActivity = 0;
let bassActivity = 0;

sketch.draw((time,center) => {
  background(0);

  // translate( center )

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
  const cellSize = (width / cols)-0;

  // noiseDetail(1.1, 0.5, 1);
  // noFill()

  strokeWeight(2);

  const audioEnergyAverage = audio.capture.energy.average("smooth");
  const bassAverage = audio.capture.energy.byIndex(1, "smooth");

  noiseDetail(
    6,
    map(bassAverage, 0, 1, 0.2, 0.8, true),
    // bassAverage
    //0.8
  );

  audioActivity += map(audioEnergyAverage, 0, 1, 0, 0.03, true);
  bassActivity += map(bassAverage, 0, 1, 0, 0.01, true);


  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const distance = cellVector.dist(center);
    // const weight = map(distance, 0, width, 0, scale, true );


    const angle = noise(x/cols+time/6, y/rows+time/3, time/10) * (TAU*4);
    const weight = map(angle, min, max, 0, cellSize, true );

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    const w = mappers.fn(sin(2*time+angle), -1, 1, 0, width, Object.entries(easing)[10][1] )

    // strokeWeight(weight);
    // const hash = angle//String(angle).hashCode();

    // if (!cache[hash]) {
    //   cache[hash] = colors.rainbow({
    //     hueOffset: 0,
    //     hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
    //     // opacityFactor: map(angle, min, max, 3, 1 ),
    //     opacityFactor: mappers.fn(distance, 0, width/3, 15, 1, Object.entries(easing)[2][1] ),
    //   })
    // }

    // fill(cache[hash])

    push();
    translate( cellVector );

    stroke( colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
      opacityFactor: map(angle, min, max, 3, 1 ),
      // opacityFactor: mappers.fn(distance, 0, w, 100, 1, Object.entries(easing)[10][1] ),
    }))

    // strokeWeight(map(distance, 0, w, 0, 4));
    // strokeWeight(mappers.fn(distance, 0, w, 0, cellSize, Object.entries(easing)[2][1] ));
    // rect( 0, 0, cellSize);
    strokeWeight(weight);

    //translate(cellSize * sin(angle/4), cellSize * cos(angle/4) )
    point( 0, 0);
    // point(0, 0, )
    pop();
  })

  // console.log({
  //   max, min
  // });
});

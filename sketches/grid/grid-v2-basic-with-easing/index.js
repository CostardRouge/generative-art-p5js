import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 80,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Cols',
    min: 1,
    max: 200,
    defaultValue: 50,
    category: 'Grid'
  },
  {
    id: "grid-cell-centered",
    type: 'switch',
    label: 'Centered cell',
    defaultValue: true,
    category: 'Grid'
  }
] );

let min = Math.PI, max = 0;
let xOff = 0, yOff = 0, zOff = 0;

sketch.setup();

sketch.draw((time) => {
  background(0);

  xOff = map(sin(time), -1, 1, 0, 1)/2
  yOff = map(cos(time*2), -1, 1, 0, 1)/2
  zOff = map(cos(time/2), -1, 1, 0, 1)/2

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

  const cellSize = ((width+height) / (rows+cols))/2;

  noFill();

  const easingFunctions = Object.entries( easing );

  const i = map(mouseX, 0, width, 0, easingFunctions.length);
  const [ , easingFunction ] = mappers.circularIndex( time*2, easingFunctions);

  noiseDetail(
    4
  )

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    // const angle = noise(x/cols+time/6, y/rows+time/5, time/8) * (TAU*4);
    const angle = noise(x/cols+xOff, y/rows+yOff, zOff) * (TAU*4);
    
    let weight = map(angle, min, TAU, 1, 10, true );
    weight = mappers.fn(angle, min, TAU, 1, cellSize, easingFunctions[24][1] );
    //weight = mappers.fn(angle, min, TAU, 1, 10, easingFunction );

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
      // hueIndex: mappers.fn(angle, 0, TAU, -PI/2, PI/2, easingFunction ),
      opacityFactor: 1.5,
      // opacityFactor: map(angle, min, max, 2, 1 ),
      //opacityFactor: mappers.fn(angle, 0, TAU*2, 5, 1, easingFunctions[5][1] ),
    }))

    push();
    translate( cellVector.x, cellVector.y );
    // circle(0, 0, scale)

    strokeWeight(weight);

    translate(cellSize * sin(angle), cellSize * cos(angle) )
    point( 0, 0);

    pop();
  })

  // console.log({
  //   max, min
  // });
});

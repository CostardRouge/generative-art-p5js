import { events, sketch, converters, audio, grid, animation, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 100,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-columns",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 100,
    defaultValue: 40,
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

sketch.setup();

let min = Math.PI, max = Math.PI;

sketch.draw((time, center) => {
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
  const z = frameCount/300//mappers.fn(sin(time), -1, 1, 3, 3.5)
  const scale = (width / columns);

  // noiseDetail(2, 4);
  // noiseSeed()

  const cursor = createVector(mouseX, mouseY);

  const easingFunctions = Object.entries(easing);

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const angle = noise(x/columns, y/rows+time/8, z) * (TAU*4);
    // const vector = p5.Vector.fromAngle(angle);
    const cellScale = map(angle, min, max, scale, scale*4, true )

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    push();
    translate( cellVector.x, cellVector.y );
    // point( 0, 0);

    noFill()
    // strokeWeight(1)
    // stroke('red')
    // circle(0, 0, scale)

    // push()

    // const closeToCursor = mappers.fn(cellVector.dist(cursor), 0, 250, 1, 0, easingFunctions[9][1]);

    strokeWeight(15);
    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: mappers.fn(angle, min, max, -PI/2, PI/2, easingFunctions[20][1] ),
      opacityFactor: 1.5,
      // opacityFactor: map(angle, min, max, 3, 1 )
      // opacityFactor: mappers.fn(cellVector.dist(cursor), 0, 250, 1, 10, easingFunctions[9][1])
    }))

    rotate(angle)
    // line( 0, 0, closeToCursor*cellScale, 0);

    const length = map(sin(time+angle), -1, 1, 5, 50);

    line( 0, 0, length, 0);
    pop();
  })

  // console.log({
  //   max, min
  // });
});

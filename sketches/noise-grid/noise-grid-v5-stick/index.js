import { events, sketch, converters, audio, grid, animation, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 40,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-columns",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 40,
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

let min = Math.PI, max =Math.PI;

sketch.draw((time) => {
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

  // noiseDetail(2, 4, 1);
  // noiseSeed()

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const angle = noise(x/columns, y/rows+time/8, z) * (TAU*4);
    // const vector = p5.Vector.fromAngle(angle);
    const cellScale = map(angle, min, max, scale, scale*2, true )
    const weight = 20
    0//map(angle, min, max, 1, 20, true )

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

    strokeWeight(10);
    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
      opacityFactor: 1.5,
      opacityFactor: map(angle, min, max, 3, 1 )
    }))

    // beginShape(LINES)
    // iterators.vector(
    //   createVector(0, 0),
    //   createVector(cellScale, 0),
    //   1/2, (position, index) => {
    //     translate(position.x, position.y)

    //     const _angle = noise((position.x)/columns, (position.y)/rows+time/8, z) * (PI);
    //     const vector = p5.Vector.fromAngle(_angle)//.limit(35)

    //     rotate(vector.heading())

    //     point(0, 0)


    //     // vector.mult(createVector(0, 0), 1)

    //     // point(position.x, position.y)

    //     // vertex(0, 0)
    //   }
    // )

    // endShape(CLOSE)
    rotate(angle)
    line( 0, 0, cellScale, 0);
    // pop()

    pop();
  })
});

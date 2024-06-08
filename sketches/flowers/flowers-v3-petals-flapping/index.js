import { shapes, sketch, iterators, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

sketch.setup( );

const easingFunctions = Object.entries(easing)

function cross(options) {
  const {
    position = createVector(0, 0),
    sides = 2,
    borderColor= color(255),
    borderWidth = 1,
    backgroundColor = color(0),
    size,
    recursive = false,
    depth = 3
  } = options;

  const maximumDepth = depth <= 0;

  push();
  translate(position)
  beginShape()

  stroke(borderColor)
  strokeWeight(borderWidth)
  fill(backgroundColor)

  const step = PI / sides;
  for (let i = 0; i < sides; i++) {
    if (recursive && maximumDepth === false) {
      const angle = TAU / sides * i;
      const _size = size / (sides)

      cross({
        ...options,
        position: createVector( size * cos(angle), size * sin(angle) ),
        size: _size,
        depth: depth -2
      })
    }
    else {
      rotate(step);
      line( -size, 0, size, 0 );
    }
  }
  endShape()
  pop();
}

function drawBackgroundPattern(time, columns = 30, rows = 50) {
  const gridOptions = {
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height ),
    bottomRight: createVector( width, height ),
    rows,
    columns,
    centered: true
  }

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/columns;
    const yOff = y/rows;

    cross({
      position: cellVector,
      sides: mappers.circularIndex(time/2+noise(yOff + time, xOff), [ 0, 1, 2, 4]),
      borderColor: colors.purple({
        hueOffset: time+noise(yOff + time, xOff + time),
        hueIndex: map(x, 0, columns-1, -PI, PI)*2,
        opacityFactor: 3.5
      }),
      borderWidth: 3,
      size: 10
    })
  })
}

sketch.draw( (time, center) => {
  background(0);

  drawBackgroundPattern(time, 20, 25);

  const boundary = 250;
  // const start = createVector( width/2, boundary );
  // const end = createVector( width/2, height - boundary );

  const switchAngleSpeed = time/3;

  let start = animation.sequence( "start", switchAngleSpeed, [
    createVector( boundary, boundary ),
    createVector( width/2, height/4 ),
    createVector( width-boundary, boundary ),
    ],
    0.1,
    p5.Vector.lerp
    )
  let end = animation.sequence( "end", switchAngleSpeed, [
      createVector( width-boundary, height-boundary ),
      createVector( width/2, height- boundary ),
      createVector( boundary, height- boundary ),
    ], 
    0.1,
    p5.Vector.lerp
  )

  const speed = time;

  iterators.vector(start, end, 1 / 384 , ( vector, lerpIndex) => {
    // const easingFunction = mappers.circularIndex(speed+lerpIndex, easingFunctions)[1]

    const sides = 1//animation.sequence("amt", speed+lerpIndex, [ 2, 3, 4, 5, 4, 3 ]);
    // const times = mappers.circularIndex(speed, [ 1, 3, 5 ]);
    const times = animation.sequence("times", speed/3, [ 1, 3, 5 ], 0.0001);
    const borderWidth = mappers.fn(sides, 2, 5, 70, 20);
    const maxSize = mappers.fn(sides, 2, 5, 150, 250);
    const sizeRatio = mappers.fn(lerpIndex, 0, 1, -PI, PI)*times;
    let crossSize = mappers.fn(cos(sizeRatio), -1, 1, maxSize, 1 )
    crossSize = mappers.fn(cos(sizeRatio), -1, 1, 1, maxSize)//*sin(lerpIndex+time)

    const coco = colors.rainbow({
      hueOffset: speed,
      hueIndex: mappers.fn(lerpIndex, 0, 1, -PI, PI)*4,
      opacityFactor: mappers.fn(cos(sizeRatio+time), -1, 1, 5, 1)
    })

    push()
    translate(vector)
    rotate(-speed/2)
    // rotate(mappers.fn(lerpIndex, 0, 1, 0, PI*2))
    rotate(mappers.fn(sin(lerpIndex+time), -1, 1, 0, PI*2))

    //rotate(mappers.fn(lerpIndex, 0, 1, 0, PI))

    cross({
      // position: vector,
      sides,
      borderColor: coco,
      borderWidth,
      size: crossSize,
      depth: 1,
      recursive: true
    })
    pop()
  })
});

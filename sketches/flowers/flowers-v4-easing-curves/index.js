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

function drawBackgroundPattern(time, cols = 30, rows = 50) {
  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols,
    centered: true
  }

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/cols;
    const yOff = y/rows;

    cross({
      position: cellVector,
      sides: mappers.circularIndex(time/2+noise(yOff + time, xOff), [ 0, 1, 2, 4]),
      borderColor: colors.purple({
        hueOffset: time+noise(yOff + time, xOff + time),
        hueIndex: map(x, 0, cols-1, -PI, PI),
        opacityFactor: 3.5
      }),
      borderWidth: 3,
      size: 15
    })
  })
}

sketch.draw( (time, center) => {
  background(0);

  drawBackgroundPattern(time, 7, 12);

  const boundary = 250;
  // const start = createVector( width/2, boundary );
  // const end = createVector( width/2, height - boundary );

  let start = animation.sequence( "start", time/2, [
    createVector( boundary, boundary ),
    createVector( width-boundary, boundary ),
    // createVector( width/2, height/4 ),
    ],
    0.1,
    p5.Vector.lerp
  )
  let end = animation.sequence( "end", time/2, [
      createVector( width-boundary, height-boundary ),
      createVector( boundary, height- boundary ),
      // createVector( width/2, height- boundary )
    ], 
    0.1,
    p5.Vector.lerp
  )

  const speed = time;

  iterators.vector(start, end, 1 / 256 , ( vector, lerpIndex) => {
    const easingFunction = mappers.circularIndex(speed+lerpIndex, easingFunctions)[1]

    const sides = 1//animation.sequence("amt", speed+lerpIndex, [ 2, 3, 4, 5, 4, 3 ]);
    const times = 1;
    const borderWidth = mappers.fn(sides, 2, 5, 70, 20);
    const maxSize = mappers.fn(sides, 2, 5, 150, 250);
    const sizeRatio = mappers.fn(lerpIndex, 0, 1, -PI, PI, easingFunction)*times;
    let crossSize = mappers.fn(cos(sizeRatio), -1, 1, maxSize, 1 )
    crossSize = mappers.fn(cos(sizeRatio), -1, 1, 1, maxSize)

    const coco = colors.rainbow({
      hueOffset: speed,
      hueIndex: mappers.fn(lerpIndex, 0, 1, -PI, PI)*4,
      opacityFactor: mappers.fn(cos(sizeRatio+time), -1, 1, 5, 1)
    })

    push()
    // translate(vector)
    // rotate(-speed/2)
    // rotate(mappers.fn(lerpIndex, 0, 1, 0, PI*2))
    // rotate(mappers.fn(sin(lerpIndex+time), -1, 1, 0, PI*2))

    cross({
      position: vector,
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

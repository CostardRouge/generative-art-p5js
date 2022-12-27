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
    depth = 3,
    onShapeDraw,
    prepareRecursionOptions,
  } = options;

  const maximumDepth = depth <= 0;

  push();
  translate(position)

  const isBorderColorFunction = typeof borderColor === 'function';

  !isBorderColorFunction && stroke(borderColor)
  
  strokeWeight(borderWidth)
  fill(backgroundColor)

  const step = PI / sides;
  for (let i = 0; i < sides; i++) {
    if (recursive && maximumDepth === false) {
      const angle = TAU / sides * i;
      const _size = size / (sides)

      isBorderColorFunction && stroke(borderColor(i))
    
      cross({
        ...options,
        position: createVector( size * cos(angle), size * sin(angle) ),
        size: _size,
        depth: depth -1,
        ...prepareRecursionOptions?.(i, depth)
      })
    }
    else {
      onShapeDraw?.(i)
      rotate(step);
      line( -size, 0, size, 0 );
    }
  }
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

    const innerAngle = mappers.circularIndex(time+xOff+yOff, [ PI, PI/2]);

    cross({
      position: cellVector,
      sides: mappers.circularIndex(time/2+noise(yOff + time, xOff), [ 0, 2, 4]),
      borderColor: colors.purple({
        hueOffset: time+noise(yOff + time, xOff + time),
        hueIndex: map(x, 0, cols-1, -PI, PI),
        opacityFactor: 3.5
      }),
      borderWidth: 3,
      size: 20,
      depth: 3,
      angle: innerAngle,
      recursive: true
    })
  })
}

sketch.draw( (time, center) => {
  background(0);

  drawBackgroundPattern(time, 7, 12);

  const boundary = 150;

  let start = animation.sequence( "start", time/2, [
    createVector( boundary, boundary ),
      createVector( width-boundary, boundary ),
      createVector( width/2, boundary ),
    ],
    0.1,
    p5.Vector.lerp
  )
  let end = animation.sequence( "end", time/2, [
      createVector( width-boundary, height-boundary ),
      createVector( boundary, height- boundary ),
      createVector( width/2, height- boundary )
    ], 
    0.1,
    p5.Vector.lerp
  )

  const speed = time;

  iterators.vector(start, end, 1 / 256, ( vector, lerpIndex) => {
    const easingFunction = mappers.circularIndex(speed+lerpIndex, easingFunctions)[1]

    let sides = animation.sequence("amt", speed+lerpIndex, [ 2, 3, 4, 5, 4, 3 ]);
    //sides = mappers.fn(sin(time+lerpIndex), -1, 1, 2, 5, easingFunction)

    const borderWidth = mappers.fn(sides, 2, 6, 70, 20);
    const maxSize = mappers.fn(sides, 2, 6, 150, 250);
    const sizeRatio = mappers.fn(lerpIndex, 0, 1, -PI, PI)*-1;
    const crossSize = mappers.fn(cos(sizeRatio), -1, 1, 1, maxSize )

    const times = mappers.circularIndex(speed+lerpIndex, [ 0, 1, 3, 5 ]);

    push()
    translate(vector)
    // rotate(-speed)

    // rotate(mappers.fn(lerpIndex, 0, 1, 0, PI*3))
    // rotate(mappers.fn(lerpIndex, 0, 1, 0, PI))

    cross({
      // position: vector,
      sides,
      borderColor: index => (
        colors.rainbow({
          hueOffset: speed,
          hueIndex: mappers.fn(lerpIndex, 0, 1, -PI, PI)*4,
          opacityFactor: mappers.fn(cos(sizeRatio+time*2), -1, 1, 5, 1)
        })
      ),
      borderWidth,
      size: crossSize,
      depth: 1,
      recursive: true,
      prepareRecursionOptions: (index) => ({
        borderWidth: 50,
        sides: 2,
        recursive: 0,
        size: 1,
      }),
      onShapeDraw: (index) => {
        rotate(mappers.fn(lerpIndex, 0, 1, 0, PI))
      }
    })
    pop()
  })
});

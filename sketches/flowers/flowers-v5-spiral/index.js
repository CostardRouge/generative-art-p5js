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
    draw,
    angle = 0,
    prepareRecursionOptions,
  } = options;

  const maximumDepth = depth <= 0;

  push();
  translate(position)
  rotate(angle)

  const isBorderColorFunction = typeof borderColor === 'function';

  !isBorderColorFunction && stroke(borderColor)
  
  strokeWeight(borderWidth)
  fill(backgroundColor)

  const step = PI / sides;
  for (let i = 0; i < sides; i++) {
    if (recursive && maximumDepth === false) {
      const angle = TAU / sides * i;
      const _size = size / (sides)

      isBorderColorFunction && stroke(borderColor(i+1))
    
      cross({
        ...options,
        position: createVector( size * cos(angle), size * sin(angle) ),
        size: _size,
        depth: depth -1,
        ...prepareRecursionOptions?.(i, depth)
      })
    }
    else {
      draw?.(i, step, options);
    }
  }
  pop();
}

function flower(size, step) {
  const incrementStep = TAU / step;

  for (let angle = 0; angle < TAU; angle += incrementStep) {
    const position = createVector(
      size * sin(angle),
      size * cos(angle)
    )
  
    const nextPosition = createVector(
      size * sin(angle+incrementStep),
      size * cos(angle+incrementStep)
    )

    const middlePosition = createVector(
      size * sin(angle+incrementStep/2),
      size * cos(angle+incrementStep/2)
    )

    const innerSize = position.dist(nextPosition)

    circle(middlePosition.x, middlePosition.y, innerSize)
  }
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
    const innerAngle = mappers.circularIndex(time+xOff+yOff, [-PI/4, PI/2]);

    cross({
      position: cellVector,
      sides: 4,//mappers.circularIndex(time/2+noise(yOff + time, xOff), [ 2, 4]),
      borderColor: colors.purple({
        hueOffset: time+noise(yOff + time, xOff + time),
        hueIndex: map(x, 0, cols-1, -PI, PI),
        opacityFactor: 3.5
      }),
      borderWidth: 3,
      size: 20,
      depth: 2,
      angle: innerAngle,
      recursive: true,
      draw: (i, step, { size}) => {
        rotate(step);
        line( -size, 0, size, 0 );
      }
    })
  })
}

sketch.draw( (time, center) => {
  background(0);
  drawBackgroundPattern(time, 7, 12);

  const boundary = 150;

  const speed = time;

  // const easingFunction = mappers.circularIndex(time, easingFunctions)[1]
  // const easingFunction2 = mappers.circularIndex(time, easingFunctions)[1]

  let start = animation.sequence( "start", speed/2, [
    createVector( boundary, boundary ),
      createVector( width-boundary, boundary ),
      createVector( width/2, boundary ),
    ],
    0.1,
    p5.Vector.lerp
  )
  let end = animation.sequence( "end", speed/2, [
    createVector( width-boundary, height-boundary ),
    createVector( boundary, height- boundary ),
    createVector( width/2, height- boundary )
  ], 
    0.1,
    p5.Vector.lerp
  )

  start = animation.ease([
      createVector( boundary, boundary ),
      createVector( width-boundary, boundary ),
      createVector( width/2, boundary ),
    ],
    time/4,
    1,
    easing.easeOutBounce,
    p5.Vector.lerp
  )

  end = animation.ease([
      createVector( width-boundary, height-boundary ),
      createVector( boundary, height- boundary ),
      createVector( width/2, height- boundary )
    ],
    time/4,
    1,
    easing.easeOutBounce,
    p5.Vector.lerp
  )

  iterators.vector(start, end, 1 / 192 , ( vector, lerpIndex) => {
    const easingFunction = mappers.circularIndex(speed+lerpIndex, easingFunctions)[1]

    const sides = 3//animation.sequence("sides", speed+lerpIndex, [ 2, 1, 3, 4, 2,, 1,  3 ]);
    const sizeRatio = mappers.fn(lerpIndex, 0, 1, -PI, PI);
    const crossSize = mappers.fn(cos(sizeRatio), -1, 1, 1, 220 )

    push()
    translate(vector)
    rotate(-speed/2)

    cross({
      sides,
      borderColor: index => {
        const colorFunction = mappers.circularIndex(speed+lerpIndex+index/50, [colors.rainbow,colors.white ])

        return colorFunction({
          hueOffset: speed,
          hueIndex: mappers.fn(lerpIndex, 0, 1, -PI, PI)*4,
          opacityFactor: mappers.fn(cos(sizeRatio), -1, 1, 3, 1)
        })
      },
      size: crossSize,
      depth: 1,
      recursive: 1,
      prepareRecursionOptions: (index) => ({
        borderWidth: 2,
        sides: 1,
      }),
      draw: (index, step, {size}) => {
        rotate(mappers.fn(lerpIndex, 0, 1, 0, PI))
        rotate(-time+lerpIndex*10);

        let amt = animation.ease([ 2, 4, 6], time/5+index, 1, easing.easeInOutElastic)

        flower(size, amt )
      }
    })
    pop()
  })
});

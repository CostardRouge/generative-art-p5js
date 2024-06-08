import { shapes, options, sketch, iterators, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

sketch.setup( );

options.add( [
  {
    id: "total-time",
    type: 'slider',
    label: 'Total time',
    min: 1,
    max: 50,
    step: 0.1,
    defaultValue: 1,
    category: 'Motion blur'
  }
] );

function cross(options) {
  const {
    position = createVector(0, 0),
    sides = 2,
    borderColor,
    borderWidth = 1,
    backgroundColor,
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

  borderColor && !isBorderColorFunction && stroke(borderColor)
  
  strokeWeight(borderWidth)
  backgroundColor && fill(backgroundColor)

  const step = PI / sides;
  for (let i = 0; i < sides; i++) {
    if (recursive && maximumDepth === false) {
      const angle = TAU / sides * i;

      borderColor && isBorderColorFunction && stroke(borderColor(i))
    
      cross({
        ...options,
        position: createVector( size * cos(angle), size * sin(angle) ),
        size: size / (sides),
        depth: depth -1,
        ...prepareRecursionOptions?.(i, depth, position)
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
    const innerAngle = mappers.circularIndex(time+xOff+yOff, [-PI/4, PI/2]);

    // colors.purple({
    //   hueOffset: time+noise(yOff + time, xOff + time),
    //   hueIndex: map(x, 0, columns-1, -PI, PI),
    //   opacityFactor: 3.5
    // })

    cross({
      position: cellVector,
      sides: 4,//mappers.circularIndex(time/2+noise(yOff + time, xOff), [ 2, 4]),
      borderColor: color(128, 255, 255),
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

  const [startBoundary, endBoundary] = [500, 50]
  const speed = time;

  // let start = animation.sequence( "start", speed/2, [
  //   createVector( startBoundary, startBoundary ),
  //     createVector( width-startBoundary, startBoundary ),
  //     createVector( width/2, startBoundary ),
  //   ],
  //   0.1,
  //   p5.Vector.lerp
  // )
  // let end = animation.sequence( "end", speed/2, [
  //   createVector( width-endBoundary, height-endBoundary ),
  //   createVector( endBoundary, height- endBoundary ),
  //   createVector( width/2, height- endBoundary )
  // ], 
  //   0.1,
  //   p5.Vector.lerp
  // )

  // start = animation.ease({
  //   values: [
  //     createVector( startBoundary, startBoundary ),
  //     createVector( width-startBoundary, startBoundary ),
  //     //createVector( width/2, startBoundary ),
  //   ],
  //   currentTime: time/4,
  //   duration: 1,
  //   easingFn: easing.easeOutExpo,
  //   lerpFn: p5.Vector.lerp,
  // })

  // end = animation.ease({
  //   values: [
  //     // createVector( width-endBoundary, height-endBoundary ),
  //     // createVector( endBoundary, height- endBoundary ),
  //     createVector( width/2, height- endBoundary )
  //   ],
  //   currentTime: time/4,
  //   duration: 1,
  //   easingFn: easing.easeOutExpo,
  //   lerpFn: p5.Vector.lerp,
  // })

  const start = createVector( width/2, startBoundary );
  const end = createVector( width/2, height- endBoundary )

  iterators.vector(start, end, 1 / 288, ( vector, lerpIndex) => {
    const sides = 5
    const baseSpacing = 0//map(sin(lerpIndex+time*2), -1, 1, 0.1, 0.2)
    const peakSpacing = map(cos(lerpIndex*5+time*2), -1, 1, 0.5, 1.5)
    const stemMiddle = animation.ease({
      values: [ 1, 1.5 ],
      currentTime: speed/4+lerpIndex,
      duration: 1,
      easingFn: easing.easeInOutElastic,
    })
    const sizeRatio = mappers.fn(lerpIndex, -0, stemMiddle, peakSpacing, baseSpacing, easing.easeInOutExpo) 
    const size = sizeRatio * 250

    push()
    translate(
      vector.x+ 100 * sin(time+lerpIndex*4),
      vector.y
    )
    rotate(-speed*3/4)

    const colorFunction = mappers.circularIndex(speed+lerpIndex/5, [
      colors.green,
      colors.rainbow,
      colors.purpleSimple
    ])

    const coco = colorFunction({
      hueOffset: speed,
      hueIndex: mappers.fn(lerpIndex, 0, 1, -PI, PI, )*4,
      opacityFactor: mappers.fn(cos(sizeRatio), -1, 1, 3, 1, easing.easeInOutExpo)
    })

    const { levels: [ r, g, b] } = coco;

    cross({
      sides,
      size,
      borderColor: coco,
      backgroundColor: color(r-150, g-150, b-10),
      depth: 1,
      recursive: 1,
      prepareRecursionOptions: (index, depth, position) => ({
        borderWidth: 2,
        sides: 1
      }),
      draw: (index, step, {size}) => {
        rotate(mappers.fn(lerpIndex, 0, 1, 0, PI))
        rotate(-time+lerpIndex*5);

        const amt = animation.ease({
          values: [ 2, 4, 6, 8 ],
          currentTime: speed+lerpIndex,
          duration: 1,
          easingFn: easing.easeInOutElastic,
        })

        flower(size, amt )
      }
    })
    pop()
  })
});

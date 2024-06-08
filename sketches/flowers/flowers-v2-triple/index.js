import { shapes, sketch, iterators, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

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

    // push()
    // translate(cellVector)
    // rotate(-time/2)

    cross({
      position: cellVector,
      sides: mappers.circularIndex(time/2+noise(yOff + time, xOff), [ 0, 2, 3, 4]),
      borderColor: colors.rainbow({
        hueOffset: time+noise(yOff + time, xOff + time),
        hueIndex: map(x, 0, columns-1, -PI, PI),
        // hueIndex: map(noise(yOff, xOff), 0, 1, -PI, PI),
        opacityFactor: 4//map(noise(yOff, xOff), 0, 1, 1, 15)
      }),
      borderWidth: 3,
      size: 30,
      recursive: true,
      depth: 1
    })

    // pop()
  })
}

let clickCount = 0;

sketch.setup(() => {
  events.register("engine-mouse-pressed", () => {
    console.log(clickCount++);
  });
});

sketch.draw( (time, center) => {
  background(0);

  drawBackgroundPattern(time, 6, 10);


  const boundary = 250;
  // const start = createVector( width/2, boundary );
  // const end = createVector( width/2, height - boundary );


  const index = time/2

  let start = animation.sequence( "start", index, [
    createVector( boundary, boundary ),
    createVector( width-boundary, boundary ),
    createVector( width/2, height/4 ),
    ],
    0.1,
    p5.Vector.lerp
    )
  let end = animation.sequence( "end", index, [
      createVector( width-boundary, height-boundary ),
      createVector( boundary, height- boundary ),
      createVector( width/2, height- boundary )
    ], 
    0.1,
    p5.Vector.lerp
  )

  const speed = time;

  iterators.vector(start, end, 1 / 512  , ( vector, lerpIndex) => {
    //const easingFunction = mappers.circularIndex(speed+lerpIndex, easingFunctions)[1]

    const sides = animation.sequence("amt", speed+lerpIndex, [ 2, 3, 4, 5, 4, 3 ]);
    const times = 3//mappers.circularIndex(speed+lerpIndex, [ 1, 3, 5 ]);
    const borderWidth = mappers.fn(sides, 2, 5, 80, 20);
    const maxSize = mappers.fn(sides, 2, 5, 150, 250);
    const sizeRatio = mappers.fn(lerpIndex, 0, 1, -PI, PI)*times;
    let crossSize = mappers.fn(cos(sizeRatio), -1, 1, maxSize, 1 )
    crossSize = mappers.fn(cos(sizeRatio), -1, 1, 1, maxSize)

    push()
    translate(vector)
    rotate(-speed/2)
    rotate( mappers.circularIndex(lerpIndex*times, [ 0, 180 ]))
    //rotate(mappers.fn(lerpIndex, 0, 1, 0, PI)*mappers.circularIndex(lerpIndex*times, [-1, 1 ]))

    cross({
      // position: vector,
      sides,
      borderColor: (index) => (
        colors.rainbow({
          //hueOffset: speed+index,
          hueIndex: mappers.fn(lerpIndex, 0, 1, -PI, PI)*4,
          //opacityFactor: mappers.fn(cos(sizeRatio), -1, 1, 4, 1.2),
          //opacityFactor: mappers.fn(lerpIndex, 0, 1, 5, 1.1),
          opacityFactor: mappers.fn(sin(2*time+lerpIndex*15+index/50), -1, 1, 5, 1.1)
        })
      ),
      borderWidth,
      size: crossSize,
      depth: 1,
      recursive: true
    })
    pop()
  })

  //drawBackgroundPattern(time/2, 6, 10);

  
});

import { options, shapes, sketch, iterators, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

options.add( [
  {
    id: "noise-detail-lod",
    type: 'number',
    label: 'Noise detail lod',
    min: 0,
    max: 32,
    defaultValue: 3,
    category: 'Noise'
  },
  {
    id: "noise-detail-falloff",
    type: 'slider',
    label: 'Noise detail falloff',
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.45,
    category: 'Noise'
  },
] );

sketch.setup( );

const easingFunctions = Object.entries(easing)

function arrow(options) {
  const {
    position = createVector(0, 0),
    borderColor= color(255),
    borderWidth = 1,
    backgroundColor = color(0),
    size,
    angle = 0,
  } = options;

  push();
  translate(position)
  rotate(angle)

  stroke(borderColor)
  strokeWeight(borderWidth)
  fill(backgroundColor)

  line( -size, 0, size, 0 );
  line( size, 0, size/2, size/2 );
  line( size, 0, size/2, -size/2 );
  pop()
}

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

function drawBackgroundPattern(time, cols = 30, rows = 50, center) {
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
    const angle = noise(yOff + time/5, xOff + time/2)*TAU;

    arrow({
      angle: angle,
      position: cellVector,
      borderColor: colors.rainbow({
        hueOffset: 0,
        // hueIndex: map(angle, 0, TAU, -PI, PI)*4,
        hueIndex: map(center.dist(cellVector), 0, 500, -PI,  PI, true),
        opacityFactor: map(center.dist(cellVector), 0, 500, 1, 5, true)
      }),
      borderWidth: 2,
      size: 20
    })

    // const shapeIndex = mappers.circularIndex(time/2+noise(yOff + time, xOff), [ 0, 1, 2, 4])


    //   sides: 

    // cross({
    //   position: cellVector,
    //   sides: mappers.circularIndex(time/2+noise(yOff + time, xOff), [ 0, 1, 2, 4]),
    //   borderColor: colors.purple({
    //     hueOffset: time+noise(yOff + time, xOff + time),
    //     hueIndex: map(x, 0, cols-1, -PI, PI)*2,
    //     opacityFactor: 3.5
    //   }),
    //   borderWidth: 3,
    //   size: 10
    // })
  })
}

const visor = ( position, size, color, weight = 3 ) => {
  stroke(color)
  strokeWeight(weight)
  noFill()

  line(0, position.y, width, position.y)
  line(position.x, 0, position.x, height)

  push();
  translate(position)
  rect(-size/2, -size/2, size, size)
  pop()
}

sketch.draw( (time, center) => {
  background(0);

  drawBackgroundPattern(time, 10, 15, center);

  const boundary = 250;
  const start = createVector( width/2, boundary );
  const end = createVector( width/2, height - boundary );

  const switchAngleSpeed = time/3;

  // let start = animation.sequence( "start", switchAngleSpeed, [
  //     createVector( boundary, boundary ),
  //     createVector( width/2, height/4 ),
  //     createVector( width-boundary, boundary ),
  //   ],
  //   0.1,
  //   p5.Vector.lerp
  // )
  // let end = animation.sequence( "end", switchAngleSpeed, [
  //   createVector( width-boundary, height-boundary ),
  //     createVector( width/2, height- boundary ),
  //     createVector( boundary, height- boundary ),
  //   ], 
  //   0.1,
  //   p5.Vector.lerp
  // )

  // start = p5.Vector.lerp(
  //   // createVector( boundary, boundary ),
  //   createVector( width-boundary, boundary ),
  //   createVector( width-boundary, boundary ),
  //   map(sin(time+time), -1, 1, 0, 1)
  // )

  // end = p5.Vector.lerp(
  //   createVector( boundary, height- boundary ),
  //   createVector( width-boundary, height-boundary ),
  //   map(sin(time), -1, 1, 0, 1)
  // )

  const speed = time;

  noiseDetail(
    options.get("noise-detail-lod"),
    options.get("noise-detail-falloff"),
  );

  iterators.vector(start, end, 1 / (128*5) , ( vector, lerpIndex, isFirst, isLast) => {
    const easingFunction = mappers.circularIndex(speed+lerpIndex, easingFunctions)[1]

    const sides = 1//animation.sequence("amt", speed+lerpIndex, [ 2, 3, 4, 5, 4, 3 ]);
    // const times = mappers.circularIndex(speed, [ 1, 3, 5 ]);
    const times = 1//animation.sequence("times", speed/3, [ 1, 3, 5 ], 0.0001);
    const borderWidth = 40//mappers.fn(sides, 2, 5, 70, 20);
    const maxSize = mappers.fn(sides, 2, 5, 150, 250);
    const sizeRatio = mappers.fn(lerpIndex, 0, 1, -PI, PI)*times;
    let crossSize = mappers.fn(cos(sizeRatio), -1, 1, maxSize, 1 )
    crossSize = mappers.fn(cos(sizeRatio+time), -1, 1, 1, maxSize)//*sin(lerpIndex+time)
    crossSize = maxSize

    const angle = noise(lerpIndex+time/4)*TAU;

    const colorFunction = isLast ? colors.purple : colors.rainbow

    const coco = colorFunction({
      hueOffset: 0,
      // hueIndex: mappers.fn(lerpIndex, 0, 1, -PI, PI)*4,
      hueIndex: mappers.fn(sin(angle), -1, 1, -PI, PI)*4,
      opacityFactor: mappers.fn(cos(angle), -1, 1, 2, 1)
    })

    if (isLast) {
      //visor(vector, 40, color(128,128,255), 3)
    }

    push()
    translate(vector)
    // rotate(speed)
    rotate(mappers.fn(lerpIndex, 0, 1, 0, PI*2))
    rotate(angle)
    // rotate(mappers.fn(sin(0+0+time), -1, 1, -PI, PI, ))
    rotate(mappers.fn(sin(angle), -1, 1, -PI, PI, ))

    //rotate(mappers.fn(lerpIndex, 0, 1, 0, PI))

    arrow({
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

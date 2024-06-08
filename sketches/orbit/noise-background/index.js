import { shapes, sketch, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

sketch.setup( );

const easingFunctions = Object.entries(easing)

function cross_old({x, y}, size, amount = 2) {
  push();
  translate(x, y)
  const step = PI / amount;
  for (let i = 0; i < amount; i++) {
    rotate(step * 1)
    line( -size, 0, size, 0 )
  }
  pop();
}

function cross(options) {
  const {
    position = createVector(0, 0),
    sides,
    borderColor,
    borderWidth,
    backgroundColor,
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
      rotate(step * 1)
      line( -size, 0, size, 0 )

      // point(-size, 0, size, 0)
    }
  }
  endShape()
  pop();
}

function polygon({
  position,
  sides,
  borderColor,
  borderWidth,
  backgroundColor,
  size
}) {
  push();
  translate(position)
  beginShape()

  stroke(borderColor)
  strokeWeight(borderWidth)
  fill(backgroundColor)

  const step = TAU / sides;
  for (let i = 0; i < sides; i++) {
    const angle = step * i;

    vertex( size * cos(angle), size * sin(angle) )
  }
  endShape(CLOSE)
  pop();
}

sketch.draw( (time, center) => {
  background(0);

  const sides = animation.sequence("rows", time/1.3, [2, 3, 4, 5])
  const depth = 2//animation.sequence("depth", time, [1, 2, 3, 4, 5])

  // polygon({
  //   position: center,
  //   sides,//: 4,
  //   borderColor: color(255),
  //   borderWidth: 10,
  //   backgroundColor: color(0),
  //   size: 150
  // })

  // polygon({
  //   position: center,
  //   sides,//: 4,
  //   borderColor: color(255),
  //   borderWidth: 10,
  //   backgroundColor: color(0),
  //   size: 150
  // })

  // cross({
  //   position: center,
  //   sides,
  //   borderColor: color(255),
  //   borderWidth: 4,
  //   backgroundColor: color(0),
  //   size: 200,
  //   depth,
  //   recursive: true
  // })

  // return
  const rows = 15//animation.sequence("rows", time, [50, 75])
  const columns = 10//animation.sequence("columns", time, [75, 20])

  const gridOptions = {
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height ),
    bottomRight: createVector( width, height ),
    rows,
    columns,
    centered: true
  }

  strokeWeight(2)

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/columns;
    const yOff = y/rows;
    // const amt = mappers.circularIndex(time+yOff-xOff, [ 1, 2, 3, 4, 3, 2, 1]);
    const amt = mappers.circularIndex(time+noise(yOff + time/5,xOff, time), [ 3, 4, 5, 6, 5]);
    const ww = mappers.circularIndex(time+yOff-xOff, [ 1, 2, 3, 4, 3, 2, 1])*4;

    let colorFunction = mappers.circularIndex(
      time+noise(yOff,xOff + time/5, time),
      Object.values( colors )
      // [colors.rainbow,colors.purple]
    )
    // colorFunction = colors.rainbow;

    const cooo = colorFunction({
      hueOffset: time+sin(y+time),
      hueIndex: map(x, 0, columns-1, -PI, PI),
      // opacityFactor: 1
    });

    stroke(cooo)
    // strokeWeight(ww)
    // cross_old(cellVector, 10, amt)

    push()
    translate(cellVector);
    // rotate(time/5+x)

    cross({
      // position: cellVector,
      sides: amt,
      sides: animation.sequence("kl"+x+"-"+y, time+noise(yOff + time, xOff), [ 3, 4, 5, 6]),
      borderColor: cooo,
      borderWidth: 2,
      backgroundColor: color(0),
      size: 25,
      depth: 2,
      // recursive: true
    })

    pop()

  })
});

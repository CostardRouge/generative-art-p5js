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

sketch.draw( (time, center) => {
  background(0);

  const columnsmns = 30;
  const rows = 50;
  const gridOptions = {
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height ),
    bottomRight: createVector( width, height ),
    rows,
    columnsmns,
    centered: true
  }

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/columnsmns;
    const yOff = y/rows;

    cross({
      position: cellVector,
      sides: mappers.circularIndex(time+noise(yOff + time, xOff), [ 0, 1, 2, 3, 4, 3, 2, 1]),
      // sides: animation.sequence(y, time+yOff-xOff, [ 0, 1, 2, 3, 4, 3, 2, 1]),
      // sides: animation.sequence("kl"+x+"-"+y, time+noise(yOff + time, xOff), [ 3, 4, 5, 6]),
      borderColor: colors.purple({
        hueOffset: time+sin(y+time),
        hueIndex: map(x, 0, columnsmns-1, -PI, PI),
        opacityFactor: 4.5
      }),
      borderWidth: 2,
      size: 25
    })
  })

  const boundary = 75;
  const start = createVector( width/2, boundary );
  const end = createVector( width/2, height - boundary );

  iterators.vector(start, end, 1 / 512, ( vector, lerpIndex) => {
    const easingFunction = mappers.circularIndex(lerpIndex+time, easingFunctions)[1]

    let colorFunction = mappers.circularIndex(
      time+lerpIndex,
      // Object.values( colors )
      [colors.rainbow,colors.purple]
    )
    //colorFunction = colors.rainbow;

    const s = mappers.fn(lerpIndex, 0, 1, -PI, PI, easingFunction);
    const ss = mappers.fn(cos(s), -1, 1, 1, 250)
    const amt = animation.sequence("amt", time+lerpIndex, [ 1, 2, 3, 6, 9]);

    const cooo = colorFunction({
      hueOffset: time,
      hueIndex: mappers.fn(lerpIndex, 0, 1, -PI, PI)*4,
      opacityFactor: map(cos(s), -1, 1, 3, 1)
    })

    push()
    translate(vector)
    rotate(time/5+mappers.fn(lerpIndex, 0, 1, 0, PI))

    cross({
      // position: vector,
      sides: amt,
      borderColor: cooo,
      borderWidth: 75,
      size: ss,
    })
    pop()
  })
});

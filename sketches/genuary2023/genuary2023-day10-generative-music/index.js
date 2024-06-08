import { shapes, midi, options, sketch, iterators, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

sketch.setup( );

events.register("post-setup", () => {
  midi.setup()
});

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
    const innerAngle = mappers.circularIndex(-time+xOff/2-yOff/2, [-PI/4, PI/2]);
    const borderColor = mappers.circularIndex(time+xOff/2+yOff/2, [
      color(255, 128, 128),
      color(128, 255, 128),
      color(128, 128, 255)
    ]);

    cross({
      position: cellVector,
      sides: 4,//mappers.circularIndex(time/2+noise(yOff + time, xOff), [ 2, 4]),
      borderColor,
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
  drawBackgroundPattern(time, 9, 13);


});

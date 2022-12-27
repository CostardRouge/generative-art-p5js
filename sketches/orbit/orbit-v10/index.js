import { shapes, sketch, iterators, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl' });

const dot = (position, color, size) => {
  strokeWeight(size)
  stroke(color);
  point(position.x, position.y)
}

const easingFunctions = Object.entries(easing)

const trace = (tracer, fn =sin, steps=10) => {
  for (let i=0; i<1;i += 1/steps) {
    tracer(fn(i), fn)
  }
}

const test = (time) => {
  const easingFunctionIndex = map(mouseX, 0, width, 0, easingFunctions.length-1, true)

  const easingFunction = easingFunctions[floor(easingFunctionIndex)][1]

  const start = createVector(50, height-50)
  const end = createVector(width-50, height-50)

  const positionIndex = mappers.fn(sin(time), -1, 1, 0, 1, easingFunction)
  const position = p5.Vector.lerp(start, end, positionIndex);

  const h = (height-50*2)*positionIndex

  const heightIndex = mappers.fn(positionIndex, 0, 1, -PI, PI, easingFunction);
  const curveHeight = mappers.fn(cos(heightIndex), -1, 1, 0, h )

  position.add(0, -curveHeight)

  dot(position, 'red', 50) 

  beginShape()
  trace( ( index, fn) => {
    const position = p5.Vector.lerp(start, end, index);
    const heightIndex = mappers.fn(index, 0, 1, -PI, PI, fn);

    const h = (height-50*2)*index
    const curveHeight = mappers.fn(cos(heightIndex), -1, 1, 0, h )

    position.add(0, -curveHeight);

    vertex(position.x, position.y)
  },
  easingFunction,
  100
  )
  stroke(128, 128, 255);
  strokeWeight(10)
  endShape()
}

sketch.draw( (time, center) => {
  background(0);

  stroke(128, 128, 255);
  noFill()
  // fill(128, 128, 255);
  strokeWeight(10)

  //return test(time);
  // translate(center);

  const size = 200;
  const step = 16;
  const incrementStep = TAU / step;

  rotateY(time)
  rotateX(time)
  rotateZ(time)

  beginShape()
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

    // dot(position, 'red', 50)
    // dot(nextPosition, 'blue', 10)

    const innerSize = position.dist(nextPosition)

    circle(middlePosition.x, middlePosition.y, innerSize)


  //  push()
  //  translate(middlePosition);
  // //  rotate(map(angle, 0, TAU, 0, PI)/4)
  //  rotate(map(mouseX, 0, width, 0, TAU))
  //  arc(
  //   0, 0,
  //   innerSize, innerSize,
  //   0,
  //   PI,
  //   CHORD
  // )
  //  pop()

    // ark(angle, angle+incrementStep, middlePosition, innerSize, 36 )

    vertex(
      position.x,
      position.y,
    )
  }

  // strokeWeight(10)
  // stroke(128, 128, 255);
  // fill(128, 128, 255);

  // endShape(CLOSE)
});

import { shapes, sketch, iterators, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

// sketch.setup( undefined, { type: 'webgl' });
sketch.setup();

function draw_circle({
  size, count = 60, color = 255, start = 0, end = TAU
}) {
  const step = end / count;

  beginShape()
  for (let angle = start; angle < end+step; angle += step) {
    vertex(
      sin(angle) * size,
      cos(angle) * size
    )
  }
  noFill()
  stroke(color)
  endShape()
}

sketch.draw( (time, center) => {
  background(0)

  strokeWeight(10)

  push()
  translate(center)
  draw_circle({
    size: width/4,
  })

  const start = animation.ease({
    values: [ 0, 0, TAU],
    currentTime: time/2,
    duration: 1,
    // easingFn: easing.easeInOutSine
  })

  const end = animation.ease({
    values: [ 0, TAU, TAU ],
    currentTime: time/2,
    duration: 1,
    // easingFn: easing.easeInOutSine
  })

  // const start = mappers.circularIndex( time, [ 0, PI, TAU ] )

  draw_circle({
    size: width/4,
    color: "red",
    start,
    end,
    count: 100


    // start: 0,
    // end: (time % 1) * TAU

    // start: easing.easeInOutExpo(time % 1) * TAU,
    // end: easing.easeInOutExpo(time % 1) * TAU,
    // end: TAU,
    // end,
    // start
  })

  pop()

  return 

  const w = width / 4;
  const h = height / 4;
  const m = 200

  const progression = map(mouseX, 0, width, 0, 1, 1);

  const vectors = [
    createVector( m, m ),
    createVector( width-m, m ),
    createVector( width-m, height-m ),
    createVector( m, height-m )
  ]

  beginShape()
  vectors.forEach( vector => {
    drawPoint(vector, "red")

    vertex(vector.x, vector.y)
  })

  noFill()
  stroke(255)
  endShape(CLOSE)



  orbitControl()
});


function drawPoint(position, color, weight = 20) {
  push()
  stroke(color)
  strokeWeight(weight)
  translate(position)
  point(0, 0)
  pop()
}

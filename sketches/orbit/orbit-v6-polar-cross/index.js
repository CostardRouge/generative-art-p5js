import { shapes, sketch, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

sketch.setup( );

const easingFunctions = Object.entries(easing)

function cross({x, y}, size, amount = 2) {
  push();
  translate(x, y)
  const step = PI / amount;
  for (let i = 0; i < amount; i++) {
    rotate(step * 1)
    line( -size, 0, size, 0 )
  }
  pop();
}

sketch.draw( (time, center) => {
  background(0);

  const columnsmns = 20;
  const rows = 20;
  const gridOptions = {
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height ),
    bottomRight: createVector( width, height ),
    rows,
    columnsmns,
    centered: true
  }

  strokeWeight(2)

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/columnsmns;
    const yOff = y/rows;
    const amt = mappers.circularIndex(time+yOff-xOff, [ 0, 1, 2, 3, 4, 3, 2, 1]);

    cross(cellVector, 10, amt)
  })

  translate(center);

  const lerpStep = 1 / 512;
  const H = height / 4;
  const W = width / 4;

  for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
    const easingFunction = mappers.circularIndex(lerpIndex+time, easingFunctions)[1]
    const angle = mappers.fn(lerpIndex, 0, 1, -PI, PI);
    let opacityFactor = mappers.fn(lerpIndex, 0, 1, 5, 1, easingFunction);
    // opacityFactor = mappers.fn(sin(2*time+angle*2), -1, 1, 10, 1);

    let colorFunction = mappers.circularIndex(
      time+lerpIndex,
      Object.values( colors )
      // [colors.rainbow,colors.purple]
    )
    colorFunction = colors.rainbow;

    stroke(colorFunction({
      hueOffset: time,
      hueIndex: map(lerpIndex, 0, 1, -PI, PI)*4,
      opacityFactor
    }))

    let x = map(sin(angle+time*2), -1, 1, -W, W);
    let y = map(cos(time/2+angle), -1, 1, -H, H);
    const s = mappers.fn(lerpIndex, 0, 1, 250, 1, easingFunction);
    const amt = animation.sequence("amt", time+lerpIndex, [ 1, 2, 3, 6, 9]);

    // x = constrain( x, -W+s/2, W-s/2)
    // y = constrain( y, -H+s/2, H-s/2)

    strokeWeight(mappers.fn(lerpIndex, 0, 1, 100, 50));

    push()
    translate(x, y)
    rotate(time/5+mappers.fn(lerpIndex, 0, 1, 0, PI, easingFunction))
    cross({x:0, y:0}, s, amt)

    // stroke(255)
    // point(x, y)
    pop()
  }
});

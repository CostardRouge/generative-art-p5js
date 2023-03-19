import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});
// sketch.setup();

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
}

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  return cache.store( `${text}-text-points`, () => {
    const textPoints = font.textToPoints(text, position.x, position.y, size, {
      sampleFactor, simplifyThreshold
    });

    const xMin = textPoints.reduce((a, {x}) => Math.min(a, x), Infinity);
    const xMax = textPoints.reduce((a, {x}) => Math.max(a, x), -Infinity);
    const xCenter = (xMax/2)+(xMin/2)

    const yMin = textPoints.reduce((a, {y}) => Math.min(a, y), Infinity);
    const yMax = textPoints.reduce((a, {y}) => Math.max(a, y), -Infinity);
    const yCenter = (yMax/2)+(yMin/2)

    return textPoints.map( ({x, y}) => {
      const testPointVector = createVector(x, y);

      testPointVector.add((position.x-xCenter),(position.y-yCenter))

      return testPointVector;
    })
  });
}

function drawGrid(xCount, yCount){
  const xSize = width / xCount;
  const ySize = height / yCount;

  rectMode(CENTER);
  strokeWeight(1)
  stroke(255)
  fill(255)

  const offset = 0;

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      hl(y * ySize)
      vl(x * xSize)
    }
  }
}

function drawPoints(points, begin, end = CLOSE) {
  // points.forEach( ({x, y}) => {
  //   point(x, y)
  // })

  beginShape(begin)
  points.forEach( ({x, y}) => {
    vertex(x, y)
  })
  endShape(end)
}

function lerpPoints(from, to, amount, fn) {
  // return to.map( (point, index) => {
  //   const targetIndex = ~~map(index, 0, to.length-1, 0, from.length-1, true);

  //   return p5.Vector.lerp( to[index], from[targetIndex], amount )
  // })

  return from.map( (point, index) => {

    //const fromIndex = map(index, 0, 1, 0, from.length-1);
    const targetIndex = ~~map(index, 0, from.length-1, 0, to.length-1, true);

    return p5.Vector.lerp( from[index], to[targetIndex], amount )

    // mappers.fn()

    // const { x, y } = animation.ease({
    //   values: [ from[index], to[targetIndex] ],
    //   currentTime: speed,
    //   duration: duration,
    //   easingFn: easing.easeInOutExpo,
    //   // easingFn: easing.easeInOutElastic,
    //   lerpFn: p5.Vector.lerp,
    //   startIndex: 0,
    //   endIndex: 1
    // })
  })
}

sketch.draw( (time) => {
  background(0);
  noFill()

  // translate(0, 0, -250)
  // translate(0, height /2)
  // rotateY(time*2)
  // rotateX(time)

  // drawGrid(2, 1)

  const speed = 0//time;
  const word = "abc"
  const size = 1000;
  const font = string.fonts.serif;

  const sampleFactor = 0.2;
  const simplifyThreshold = 0;

  const points = getTextPoints({
    text: mappers.circularIndex(speed, word),
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const points2 = getTextPoints({
    text: mappers.circularIndex(speed+1, word),
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  strokeWeight(3)

  const distance = 500;
  const from = createVector(0, 0, distance/2)
  const to = createVector(0, 0, -distance/2)
  const count = 60;

  for (let n = 0; n < count; n += 1) {
    const amount = n / count;
    const position = p5.Vector.lerp( from, to, amount );
    
    stroke(colors.rainbow({
      hueOffset: -time,
      hueIndex: amount*20,// +map(amount, 0, 1, -PI, PI),
      //opacityFactor: map(n, 0, count, 1, 5)
    }))

    push()
    translate(position)

    drawPoints(
      lerpPoints(points, points2, amount ),
      POINTS
    )

    pop()
  }

  orbitControl();
});

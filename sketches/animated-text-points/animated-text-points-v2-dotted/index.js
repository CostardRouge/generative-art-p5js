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
  const fontFamily = font.font?.names?.fontFamily?.en;
  const textPointsCacheKey = cache.key(
    "text-points",
    fontFamily,
    text,
    size,
    sampleFactor,
    simplifyThreshold
  )

  return cache.store( textPointsCacheKey, () => {
    const textPoints = font.textToPoints(text, position.x, position.y, size, {
      sampleFactor, simplifyThreshold
    });

    const xMin = textPoints.reduce((a, {x}) => Math.min(a, x), Infinity);
    const xMax = textPoints.reduce((a, {x}) => Math.max(a, x), -Infinity);
    const xCenter = (xMax/2)+(xMin/2)

    const yMin = textPoints.reduce((a, {y}) => Math.min(a, y), Infinity);
    const yMax = textPoints.reduce((a, {y}) => Math.max(a, y), -Infinity);
    const yCenter = (yMax/2)+(yMin/2)

    return ([
      textPoints.map( ({x, y}) => {
        const testPointVector = createVector(x, y);
  
        testPointVector.add((position.x-xCenter),(position.y-yCenter))
  
        return testPointVector;
      }),
      [
        xMin-xCenter,
        yMin-yCenter,
        xMax-xMin,
        yMax-yMin,
      ]
    ])
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
    const targetIndex = ~~map(index, 0, from.length-1, 0, to.length-1, true);

    return p5.Vector.lerp( from[index], to[targetIndex], amount )
  })
}

const word = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))

sketch.draw( (time) => {
  background(0);
  noFill()
  // rotateX(time)
  rotateY(time)
  // rotateZ(time)

  const speed = time*3;
  const size = (width+height)/3;
  const font = string.fonts.sans;

  const sampleFactor = 0.05;
  const simplifyThreshold = 0;

  const points = string.getTextPoints({
    text: mappers.circularIndex(speed, word),
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const points2 = string.getTextPoints({
    text: mappers.circularIndex(speed+1, word),
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  strokeWeight(4)

  const distance = 500//map(b, 0, 1, 1, 500)//500;
  const from = createVector(0, 0, distance/2)
  const to = createVector(0, 0, -distance/2)
  const count = 150//map(b, 0, 1, 1, 30)//30;

  for (let n = 0; n < count; n += 1) {
    const progression = n / count;
    // const position = p5.Vector.lerp( from, to, progression );
    const position = p5.Vector.lerp( from, to, easing.easeInOutQuad(progression) );
    
    // stroke(colors.rainbow({
    //   hueOffset: -time,
    //   hueIndex: map(progression, 0, 1, -PI, PI),
    //   //opacityFactor: map(n, 0, count, 1, 5)
    // }))

    push()
    translate(position)

    const finalPoints = lerpPoints(points, points2, progression );  
    finalPoints.forEach( ({x, y}) => {

      stroke(colors.rainbow({
        hueOffset: -time,
        // hueIndex: map(progression, 0, 1, -PI, PI),
        hueIndex: map(noise(x/width+progression, y/height+progression, progression), 0, 1, -PI/2, PI/2)*6,
        // opacityFactor: map(n, 0, count, 1, 5)
      }))
      point(x, y)
    })

    drawPoints(
      finalPoints,
      POINTS
    )

    pop()
  }

  orbitControl();
});

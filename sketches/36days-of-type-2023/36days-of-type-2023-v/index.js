import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

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

sketch.draw( (time) => {
  background(0);
  noFill()

  const word = "vV"
  const size = (width+height)/3;
  const font = string.fonts.serif;

  const sampleFactor = 0.5;
  const simplifyThreshold = 0;

  const [firstLetterPoints] = getTextPoints({
    text: mappers.circularIndex(0, word),
    position: createVector(0, 0),
    size: size*0.75,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const [nextLetterPoints] = getTextPoints({
    text: mappers.circularIndex(1, word),
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  strokeWeight(4)

  const distance = width/2
  const from = createVector(0, 0, distance/2)
  const to = createVector(0, 0, -distance/2)
  const count = 75

  push()
  rotateY(time/4)
  //rotateZ(time/4)
  stroke(16, 16, 64)
  sphere(size*5, 4)
  pop()

  push()
  rotateY(-time/4)
  //rotateZ(-time/4)
  stroke(64, 16, 16)
  sphere(size*5, 4)
  pop()

  rotateY(time)
  // rotateZ(time/2)
  // rotateZ(mappers.fn(cos(time), -1, 1, -PI, PI)/9)

  for (let n = 0; n < count; n += 1) {
    const progression = n / count;
    const position = p5.Vector.lerp( from, to, progression );

    push()
    const angle = time/2+((n/count)*abs(sin(time)));

    rotateY(angle)
    translate(position)

    // const points = lerpPoints(firstLetterPoints, nextLetterPoints, progression )

    // points.forEach( ({x, y}, index) => {
    //   const xSign = sin(time);
    //   const ySign = cos(-time);

    //   const hue = noise(
    //     x/(width),
    //     y/(height),
    //     progression+time/2
    //   )
      
    //   // const hueOpacitySpeed = -time*6;
    //   const darkness = map(progression, 0, 1, 20, 3)

    //   stroke( colors.rainbow({
    //     hueOffset: time,
    //     hueIndex: map(hue, 0, 1, -PI, PI)*4,
    //     // hueIndex: map(progression, 0, 1, -PI, PI)*4,
    //     opacityFactor: map(
    //       // sin(
    //       //   //(xSign*(x/(width/4))+ySign*(y/(height/40)))
    //       //   +hueOpacitySpeed
    //       //   +progression
    //       // ),
    //       sin(3.1*time+progression*5),
    //       -1,
    //       1,
    //       darkness,
    //       1
    //     ),
    //   }))

    //   //point( x, y  )
    // })

    const hue = noise(progression+time )

    stroke(colors.rainbow({
      hueIndex: map(hue, 0, 1, -PI, PI)*6,
      opacityFactor: map(
        sin(3.1*time+progression*5),
        -1,
        1,
        map(progression, 0, 1, 50, 3),
        1
        )
    }))

    drawPoints(
      lerpPoints(firstLetterPoints, nextLetterPoints, progression ),
      POINTS
    )

    pop()
  }

  orbitControl();
});

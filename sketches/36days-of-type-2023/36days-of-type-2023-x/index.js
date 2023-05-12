import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

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

  const word = "xX"
  const size = (width+height)/4;
  const font = string.fonts.multicoloure;
  // const font = string.fonts.serif;

  const sampleFactor = 0.1;
  const simplifyThreshold = 0;

  const [firstLetterPoints] = getTextPoints({
    text: mappers.circularIndex(0, word),
    position: createVector(0, 0),
    size: size*0.7,
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

  push()
  // rotateY(time/4)
  // rotateZ(time/4)
  rotateX(time/4)
  stroke(16, 16, 128)
  sphere(size*5, 4)
  pop()

  push()
  // rotateY(-time/4)
  rotateX(-time/4)
  stroke(128, 16, 16)
  sphere(size*5, 4)
  pop()

  rotateY(PI/2)

  const W = width /4;
  const H = height /4;
  const from = createVector(0, -H, 0)
  const to = createVector(0, H, 0)
  const middle = p5.Vector.lerp( from, to, 0.5 );

  const count = 50;
  const angleStart = 0;
  const angleStop = TAU/2////-0.1//*3/4//*2;
  const angleStep = angleStop/count;

  strokeWeight(3)

  for (let angle = angleStart; angle < angleStop; angle+=angleStep) {
    const progression = angle/angleStop

    const position = createVector(
      middle.x + sin(angle) * H,
      middle.y + cos(angle) * H
    )

    push()
    rotateY(mappers.fn(cos(time*0.75+progression), -1, 1, -PI, PI, easing.easeInOutExpo)/5)

    translate(position.x, position.y)

    rotateY(PI/2)
    rotateX(angle)
    rotateZ(time+angle)

    const opacitySpeed = 6*time
    const opacityCount = 3

    stroke(colors.rainbow({
      hueOffset: time,
      hueIndex: map(progression, 0, 1, -PI, PI)*4,
      opacityFactor: map(
        sin(progression*opacityCount+opacitySpeed),
        -1,
        1,
        map(cos(progression*opacityCount-opacitySpeed), -1, 1, 1, 25),
        1
      )

    }))

    drawPoints(
      lerpPoints(firstLetterPoints, nextLetterPoints, progression ),
      // LINES
    )

    // const points = lerpPoints(firstLetterPoints, nextLetterPoints, progression )

    // points.forEach( ({x, y}, index) => {
    //   const xSign = sin(time);
    //   const ySign = cos(-time);

    //   const hue = noise(
    //     x/(width/4),
    //     y/(height/6),
    //     progression+time/2
    //   )
      
    //   const hueOpacitySpeed = -time*6;
    //   // const darkness = map(z, 0, depthSteps, 20, 3)
    //   const darkness = map(progression, 0, 1, 20, 3)

    //   stroke( colors.rainbow({
    //     hueOffset: time,
    //     hueIndex: map(hue, 0, 1, -PI, PI)*4,
    //     // hueIndex: map(progression, 0, 1, -PI, PI)*4,
    //     opacityFactor: map(
    //       sin(
    //         (xSign*(x/(width/4))+ySign*(y/(height/40)))
    //         +hueOpacitySpeed
    //         +progression
    //       ),
    //       -1,
    //       1,
    //       darkness,
    //       1
    //     ),
    //   }))

    //   point( x, y  )
    // })

    pop()
  }

  orbitControl();

  // for (let n = 0; n <= count; n += 1) {
  //   const progression = n / count;
  //   // const position = p5.Vector.lerp( from, to, progression );
  //   const polarProgression = map(progression, 0, 1, -PI/2, PI/2)
  //   const angle = polarProgression

  //   const elevation = mappers.fn(
  //     cos(polarProgression),
  //     -1, 1,
  //     0, 500,
  //     // easing.easeInQuad
  //   )

  //   push()

  //   translate(middle)


  //   const position = middle.copy()
    
  //   position.rotate(time)

  //   translate(position)
  //   // translate(0, 0, elevation)
  //   // rotateY(angle)
  //   // rotateX(PI/2 )
  //   // rotateX(angle)

  //   // const points = lerpPoints(firstLetterPoints, nextLetterPoints, progression )

  //   // points.forEach( ({x, y}, index) => {
  //   //   const xSign = sin(time);
  //   //   const ySign = cos(-time);

  //   //   const hue = noise(
  //   //     x/(width/4),
  //   //     y/(height/6),
  //   //     progression+time/2
  //   //   )
      
  //   //   const hueOpacitySpeed = -time*6;
  //   //   // const darkness = map(z, 0, depthSteps, 20, 3)
  //   //   const darkness = map(progression, 0, 1, 20, 3)

  //   //   stroke( colors.rainbow({
  //   //     hueOffset: time,
  //   //     hueIndex: map(hue, 0, 1, -PI, PI)*4,
  //   //     // hueIndex: map(progression, 0, 1, -PI, PI)*4,
  //   //     opacityFactor: map(
  //   //       sin(
  //   //         (xSign*(x/(width/4))+ySign*(y/(height/40)))
  //   //         +hueOpacitySpeed
  //   //         +progression
  //   //       ),
  //   //       -1,
  //   //       1,
  //   //       darkness,
  //   //       1
  //   //     ),
  //   //   }))

  //   //   point( x, y  )
  //   // })

  //   stroke("blue")

  //   // normalMaterial()
  //   // plane(150, 150)

  //   pop()
  // }
});

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

function drawPoints(points, begin, end = CLOSE, scale = 1) {
  beginShape(begin)
  points.forEach( ({x, y}) => {
    vertex(x * scale, y*scale)
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

  const word = "wW"
  const size = (width+height)/4;
  const font = string.fonts.openSans;

  const sampleFactor = 0.1;
  const simplifyThreshold = 0;

  const [firstLetterPoints] = getTextPoints({
    text: mappers.circularIndex(0, word),
    position: createVector(0, 0),
    size: size*0.8,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const [nextLetterPoints] = getTextPoints({
    text: mappers.circularIndex(1, word),
    position: createVector(0, 0),
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const scale = mappers.fn(
    sin(time),
    -1, 1,
    5, 10,
    easing.easeInOutExpo
  )

  push()
  rotateY(time/4)
  rotateZ(time/4)
  stroke(16, 16, 96)
  sphere(size*scale, 4)
  pop()

  push()
  rotateY(-time/4)
  rotateZ(-time/4)
  stroke(96, 16, 16)
  sphere(size*scale, 4)
  pop()

  

  // rotateX(-PI/4)

  // rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/6)

  // rotateZ(PI)
  const t = time/4
  // rotateX(t)
  // rotateY(t)
  // rotateZ(t)

  // rotateX(PI)
  rotateY(PI/2)

  const W = width /4;
  const H = height /4;
  const from = createVector(0, -H, 0)
  const to = createVector(0, H, 0)
  // const from = createVector(-W*cos(time), -H*sin(time), 0)
  // const to = createVector(W*cos(time), H*sin(time), 0)
  const middle = p5.Vector.lerp( from, to, 0.5 );

  const count = 50;
  const angleStart = 0;
  const angleStop = PI//*2;
  const angleStep = angleStop/count;

  strokeWeight(5)

  for (let angle = angleStart; angle < angleStop; angle+=angleStep) {
    const progression = angle/angleStop

    const position = createVector(
      middle.x + sin(angle) * H,
      middle.y + cos(angle) * H
    )

    // position.add(p5.Vector.lerp( from, to, progression ));

    push()
    translate(position.x, position.y)

    rotateY(PI/2)
    rotateX(angle)

    rotateZ(time+angle/2)
    // rotateX(time+angle/5)

    const hue = noise(progression+time )

    stroke(colors.rainbow({
      hueIndex: map(hue, 0, 1, -PI, PI)*8,
      opacityFactor: map(
        sin(3.1*time+progression*5),
        -1,
        1,
        map(progression, 0, 1, 50, 3),
        1
      )
    }))

    const scale = mappers.fn(
      sin(time+angle),
      -1, 1,
      0.5, 1,
      easing.easeInOutExpo
    )

    drawPoints(
      lerpPoints(firstLetterPoints, nextLetterPoints, progression ),
      LINES,
      CLOSE,
      scale
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

  rotateY(PI)

 

  // translate(0, 0, scale*200)

  // for (let n = 0; n <= count; n += 1) {
  //   const progression = n / count;
  //   const position = p5.Vector.lerp( from, to, progression );
  //   const polarProgression = map(progression, 0, 1, -PI/2, PI/2)
  //   const angle = polarProgression

  //   const elevation = mappers.fn(
  //     cos(polarProgression),
  //     -1, 1,
  //     0, 500,
  //     easing.easeInQuart
  //   )

  //   push()
  //   translate(position)
  //   translate(0, 0, elevation)

  //   const hue = noise(progression+time )

  //   stroke(colors.rainbow({
  //     hueIndex: map(hue, 0, 1, -PI, PI)*4,
  //     opacityFactor: map(
  //       sin(time+progression*5),
  //       -1,
  //       1,
  //       map(progression, 0, 1, 25, 3),
  //       1
  //     )
  //   }))

  //   drawPoints(
  //     lerpPoints(firstLetterPoints, nextLetterPoints, progression ),
  //     POINTS,
  //     CLOSE,
  //     scale
  //   )

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

  //   // stroke("blue")
  //   // plane(150, 150)

  //   pop()
  // }

  return orbitControl();
});

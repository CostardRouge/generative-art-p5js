import { sketch, string, mappers, iterators, easing, animation, colors, cache, grid } from './utils/index.js';

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

const pattern = (weight = 3, columns = 7, time) => {
  background(0);

  stroke(255)
  strokeWeight(weight)
  noFill()

  const columnSize = width / columns
  const halfColumnSize = (columnSize /2 )
  const columnPadding = weight + halfColumnSize;
  const precision = 0.01;

  for (let i = 0; i < columns; i++) {
    const x = ( i * columnSize ) + halfColumnSize;
    const top = createVector( x, -200);
    const bottom = createVector(x, height+200);

    if (i > columns-1) {
      stroke(128,128,255)
    }
    else {
      stroke(255)
    }

    beginShape()
    iterators.vector(top, bottom, precision, ( position, lerpIndex ) => {
      const driftBound = (halfColumnSize + columnPadding) * sin(time + i);
      const driftX = map( easing.easeInOutBack((lerpIndex) % 1), 0, 1, -driftBound, driftBound);

      vertex( position.x + driftX, position.y );
    });
    endShape()
  }
}

sketch.draw( (time, center) => {
  background(0);
  noFill()

  const size = (width+height)/8;
  const font = string.fonts.martian;

  const sampleFactor = 0.05;
  const simplifyThreshold = 0;

  const [firstLetterPoints] = getTextPoints({
    text: "zero",
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  push()
  translate(-center.x, -center.y)
  pattern(3, 0, time)
  pop()

  // rotateY(PI/2)
  // rotateY(-time)
  // rotateX(-time)

  rotateY(
    animation.ease({
      values: [ 0, PI/2 ],
      currentTime: time/2,
      duration: 1,
      easingFn: easing.easeInOutCubic
    })
  )

  rotateX(
    animation.ease({
      values: [ 0, PI/2,  ],
      currentTime: time/2,
      duration: 1,
      easingFn: easing.easeInOutCubic
    })
  )

  const W = width /4;
  const H = height /4;
  const from = createVector(0, -H, 0)
  const to = createVector(0, H, 0)
  const middle = p5.Vector.lerp( from, to, 0.5 );

  const count = 100;
  const angleStart = 0;
  const angleStop = TAU
  const angleStep = angleStop/count;

  strokeWeight(4)

  for (let angle = angleStart; angle < angleStop; angle+=angleStep) {
    const progression = angle/angleStop

    const position = createVector(
      middle.x + sin(angle) * H,
      middle.y + cos(angle) * H
    )

    push()
    //rotateY(mappers.fn(cos(time*0.75+progression), -1, 1, -PI, PI, easing.easeInOutExpo)/5)

    translate(position.x, position.y)

    rotateY(PI/2)
    rotateX(angle)
    rotateZ(time+angle*2)

    const opacitySpeed = time
    const opacityCount = 3

    // const hue = noise( progression+time )

    // stroke(colors.rainbow({
    //   hueOffset: time,
    //   // hueIndex: map(progression, 0, 1, -PI, PI)*4,
    //   hueIndex: map(hue, 0, 1, -PI, PI)*4,
    //   // opacityFactor: map(
    //   //   sin(progression*opacityCount+opacitySpeed),
    //   //   -1,
    //   //   1,
    //   //   map(cos(progression*opacityCount-opacitySpeed), -1, 1, 1, 25),
    //   //   1
    //   // )

    // }))

    // drawPoints( firstLetterPoints,
    //   POINTS
    //   // LINES
    // )

    // const points = lerpPoints(firstLetterPoints, nextLetterPoints, progression )

    firstLetterPoints.forEach( ({x, y}, index) => {
      const xSign = sin(time);
      const ySign = cos(-time);

      const hue = noise(
        x/(width/4),
        y/(height/6),
        progression+time/2
      )
      
      const hueOpacitySpeed = -time*3;
      // const darkness = map(z, 0, depthSteps, 20, 3)
      const darkness = 25//map(progression, 0, 1, 20, 3)

      stroke( colors.rainbow({
        hueOffset: 0,
        hueIndex: map(hue, 0, 1, -PI, PI)*4,
        // hueIndex: map(progression, 0, 1, -PI, PI)*4,
        opacityFactor: map(
          sin(
            +(xSign*(x/(width/4))+ySign*(y/(height/40)))
            +index/50
            +hueOpacitySpeed
            +progression
          ),
          -1,
          1,
          darkness,
          1
        ),
      }))

      point( x, y  )
    })

    pop()
  }

  orbitControl();
});

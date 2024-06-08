import { sketch, string, mappers, easing, events, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

function flower(size, step, keepSize, fn) {
  const incrementStep = TAU / step;

  for (let angle = 0; angle <= TAU; angle += incrementStep) {
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

    const innerSize = keepSize ? size/1.2 : position.dist(nextPosition)

    fn(angle)
    circle(middlePosition.x, middlePosition.y, innerSize)

    // translate(middlePosition.x, middlePosition.y, )
    // sphere(innerSize/2)
  }
}

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
}

function drawGridCell(_x, _y, w, h, cols, rows, drawer) {
  const xSize = w / cols;
  const ySize = h / rows;

  for (let x = 0; x <= cols; x++) {
    for (let y = 0; y <= rows; y++) {
      drawer?.(_x + x*xSize, _y + y*ySize, xSize, ySize)
    }
  }
}

function ikks( x, y , size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

function cross( x, y , size) {
  line(x, y -size/2, x, y +size/2)
  line(x + size/2, y, x - size/2, y)
}


function drawGrid(cols, time, center) {
  //cols = 10
  const rows = cols*height/width;

  const gridOptions = {
    startLeft: createVector( -width, -height/2 ),
    startRight: createVector( width, -height/2 ),
    endLeft: createVector( -width, height/2 ),
    endRight: createVector( width, height/2 ),
    rows,
    cols,
    centered: true
  }

  const W = width/2 / cols;
  const H = height/2 / rows;

  noFill()
  strokeWeight(2)

  const xSign = sin(-time/2);
  const ySign = cos(time/2);

  center.add( -width/2, -height/2 )

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = 2//noise(xSign*x/cols+time, ySign*y/rows)*2;
    const colorIntensity = 64
    //  map(
    //   center.dist(cellVector),
    //   0,
    //   map(sin(time*5), -1, 1, 0, (height+width)/2),
    //   0,
    //   128
    // );

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {
        const n0 = x+y//0//noise(x/w, y/h, time)
        const n1 = mappers.circularIndex(time*3+n0, [0.5, 1]);

        if (n1 > 0.5) {
          // fill(0)
          stroke(colorIntensity, 16, 16)
          // stroke(32, 32, 64)

          // circle(x, y, w)
          circle(x, y, w/2)
          rect(x-7.5, y-7.5, 15)
          // circle(x, y, w, h )
        }
        else {
          stroke(16, 16, colorIntensity)
          // stroke(128, 16, 16)

          cross(x, y, 15)
          // ikks(x, y, 15)


          // rect(x, y, w, h )
        }

      }
    )
  })
}

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  return cache.store( text, () => {
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
  }, true);
}

sketch.draw( (time, center) => {
  background(0);

  push()
  // rotateZ(-PI/4)
  rotateZ(mappers.circularIndex(time/4, [-PI/4, PI/4]))
  drawGrid(4, time/2, center)
  // drawGrid(4, time/2)
  pop()

  const size = (width)/2;
  const font = string.fonts.serif;

  const sampleFactor = 1//mappers.circularIndex(time, [0.5, 0.1, 0.25]);
  const simplifyThreshold = 0//mappers.circularIndex(time*5, [0.001, 0]);

  const currentLetterPoints = getTextPoints({
    text: "u",
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const nextLetterPoints = getTextPoints({
    text: "U",
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  strokeWeight(3)
  noFill()

  for (let i = 0; i < currentLetterPoints.length; i++) {
    const progression = map(i, 0, currentLetterPoints.length-1, 0, 1);
    const targetIndex = ~~map(i, 0, currentLetterPoints.length-1, 0, nextLetterPoints.length-1, true);

    // const { x, y } = animation.ease({
    //   values: [ currentLetterPoints[i], nextLetterPoints[targetIndex] ],
    //   currentTime: time,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo,
    //   // easingFn: easing.easeInOutElastic,
    //   lerpFn: p5.Vector.lerp,
    //   startIndex: 0,
    //   endIndex: 1
    // })

    const { x, y } = currentLetterPoints[i]

    const colorFunction = mappers.circularIndex(time/3+progression, [
      colors.rainbow,
      colors.purple
    ]);

    const amount = mappers.circularIndex(time/2+progression, [, 2, 3, 5, 7]);

    push()
    translate(
      x*2,
      y*2
    )
    rotate(time+progression);
    rotate(progression*TAU*2);
  
    const size = mappers.circularIndex(time/4+progression, [0, 40]);
    const keepSize = mappers.circularIndex(time/2+progression, [true, false]);

    stroke(colorFunction({
      hueIndex: mappers.fn(progression, 0, 1, -PI, PI)*2,
      opacityFactor: mappers.fn(
        sin(progression*50+time*4),
        -1,
        1,
        mappers.fn(cos(progression*50+time*2), -1, 1, 5, 1
        ),
        1,
        easing.easeInSine
      ),
    }))

    if ( size ) {
      flower(size, amount, keepSize, (index) => {
      
      })
    }

    pop()
  }

  orbitControl()
});

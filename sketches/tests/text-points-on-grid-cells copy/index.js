import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
}

function flower(size, step, keepSize) {
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

    const innerSize = keepSize ? size : position.dist(nextPosition)

    circle(middlePosition.x, middlePosition.y, innerSize)
  }
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
  }, 0);
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

function drawPoints(points) {
  points.forEach( ({x, y}) => {
    point(x, y)
  })
}

function lerpPoints(from, to, amount, fn) {
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

  translate(0, 0, -1500)
  // rotateY(time*2)
  //rotateY(time)

  //drawGrid(2, 1)

  const speed = time*2;
  const word = "*text-points-on-grid-cells"
  const size = 1000;
  const font = string.fonts.serif;
  const currentLetter = mappers.circularIndex(speed, word)

  const sampleFactor = 0.05;
  const simplifyThreshold = 0;

  const p1 = createVector(-width, 0)

  const points = getTextPoints({
    text: "a",
    position: p1,
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const p2 = createVector(width, 0)

  const points2 = getTextPoints({
    text: "z",
    position: p2,
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  // stroke(255)
  // drawPoints(points)

  strokeWeight(1/1.5)

  for (let i = 0; i < 1; i += 0.01) {
    const n = map(i, 0, 1, -PI/2, PI/2)
    const u = mappers.fn(cos(n+time), -1, 1, 0, 1, easing.easeInSine)

    push()
    //rotateY(map(i, 0, 1, PI, -PI))
    //rotateX(map(i, 0, 1, PI, -PI))

    //rotateZ(map(i, 0, 1, -PI, PI))
    translate(0, 0, u * 1500)

    stroke(colors.rainbow({
      hueOffset: time,
      hueIndex: map(i, 0, 1, -PI, PI)*2,
      //opacityFactor: map(z, -scale * 5, scale * 5, down, up)
    }))

    drawPoints(lerpPoints(points, points2, i))
    pop()
  }

  // stroke(255)
  // drawPoints(points2)

  const cols = 30
  const rows = 50;

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2 ),
    rows,
    cols,
    centered: true
  }
  
  // grid.draw(gridOptions, (cellVector, { x, y }) => {
  //   const alpha = cache.store(`${x}-${y}-${currentLetter}-alpha`, () => {
  //     return points.reduce( ( result, point ) => {
  //       if (255 <= result) {
  //         return result;
  //       }

  //       return Math.max(
  //         result,
  //         ~~map(point.dist(cellVector), 0, 40, 255, 0, true)
  //       );
  //     }, 0);
  //   });

  //   if (!alpha) {
  //     return;
  //   }

  //   fill(128, 128, 255, alpha)
  //   circle(cellVector.x, cellVector.y, 20)
  // })

orbitControl();
});

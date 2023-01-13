import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

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

function drawBackgroundPattern(time, cols = 30, rows = 50) {
  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2 ),
    rows,
    cols,
    centered: true
  }

  const points = cache.get( `${window.currentLetter}-text-points`);

  if (!points) {
    return;
  }

  grid.draw(gridOptions, (cellVector, { x, y }) => {
    const alpha = cache.store(`${x}-${y}-${window.currentLetter}-alpha`, () => {
      return points.reduce( ( result, point ) => {
        if (255 <= result) {
          return result;
        }

        return Math.max(
          result,
          ~~map(point.dist(cellVector), 0, 40, 255, 0, true)
        );
      }, 0);
    });

    if (!alpha) {
      return;
    }

    fill(128, 128, 255, alpha)
    circle(cellVector.x, cellVector.y, 20)
  })
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
  }, true);
}

sketch.draw( (time, center) => {
  background(0);

  push()
    //noFill( )
    //stroke(64, 64, 128)
    //strokeWeight(2)
    //translate(0, 0, -50)
    drawBackgroundPattern(time, 38, 58);
  pop()

  const speed = time*2;
  const duration = 1;
  const word = "*text-points-on-grid-cells"//["1 - un", "2 - deux", "3 - trois"];//["22", "2-", "2 3"]//
  const size = 1000;
  const font = string.fonts.serif;
  const currentLetter = mappers.circularIndex(speed, word)
  const nextLetter = mappers.circularIndex(speed+1, word)

  const sampleFactor = 0.1;
  const simplifyThreshold = 0;

  const currentLetterPoints = getTextPoints({
    text: currentLetter,
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })
  const nextLetterPoints = getTextPoints({
    text: nextLetter,
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  window.currentLetter = currentLetter;

  return orbitControl();

  for (let i = 0; i < currentLetterPoints.length; i++) {
    const progression = map(i, 0, currentLetterPoints.length-1, 0, 1);
    const targetIndex = ~~map(i, 0, currentLetterPoints.length-1, 0, nextLetterPoints.length-1, true);

    const { x, y } = animation.ease({
      values: [ currentLetterPoints[i], nextLetterPoints[targetIndex] ],
      currentTime: speed,
      duration: duration,
      easingFn: easing.easeInOutExpo,
      easingFn: easing.easeInOutElastic,
      lerpFn: p5.Vector.lerp,
      startIndex: 0,
      endIndex: 1
    })

    const p = map(progression, 0, 1, -PI / 2, PI /2)*10

    fill(colors.rainbow({
      hueOffset: 0,
      hueIndex: mappers.fn(progression, 0, 1, -PI, PI),
      opacityFactor: 1.5,
      opacityFactor: map(sin(p), -1, 1, 3, 1)
    }))

    push()
    translate(x, y)
    //rotate(-time+progression*100*sin(time+progression));
    rotate(-time-progression*100);
    flower(30, 3)
    pop()
  }

  orbitControl()
});

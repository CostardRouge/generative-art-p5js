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

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/cols;
    const yOff = y/rows;
    const amt = mappers.circularIndex(time+yOff+xOff, "1234567890");

    push()
    translate(cellVector)
    if (~~amt === 1) {
      circle(0, 0, 20)
    } else if (~~amt) {
      flower(15, ~~amt)
    }
    pop()
  })
}

sketch.draw( (time, center) => {
  background(0);

  push()
    noFill( )
    stroke(64, 64, 128)
    strokeWeight(2)
    translate(0, 0, -50)
    drawBackgroundPattern(time, 10, 15);
  pop()

  const speed = time//2;
  const duration = 1;
  const word = "1234567890"//["1 - un", "2 - deux", "3 - trois"];//["22", "2-", "2 3"]//
  const size = 1000;
  const font = string.fonts.serif;
  const currentLetter = mappers.circularIndex(speed, word)
  const nextLetter = mappers.circularIndex(speed+1  , word)

  const sampleFactor = 0.5
  const simplifyThreshold = 0
  const cacheTextPoints = true;

  const currentLetterPoints = cache.store( currentLetter, () => {
    const box = font.textBounds(currentLetter, 0, 0, size);

    return (
      font.textToPoints(currentLetter, -box.w/2, box.h/2, size, {
        sampleFactor, simplifyThreshold
      })
    )
  }, cacheTextPoints)

  const nextLetterPoints = cache.store(nextLetter, () => {
    const box = font.textBounds(currentLetter, 0, 0, size);

    return (
      font.textToPoints(nextLetter, -box.w/2, box.h/2, size, {
        sampleFactor, simplifyThreshold
      })
    )
  }, cacheTextPoints)

  for (let i = 0; i < currentLetterPoints.length; i++) {
    const progression = map(i, 0, currentLetterPoints.length-1, 0, 1);
    const targetIndex = ~~map(i, 0, currentLetterPoints.length-1, 0, nextLetterPoints.length-1, true);

    const { x, y, alpha } = animation.ease({
      values: [ currentLetterPoints[i], nextLetterPoints[targetIndex] ],
      currentTime: speed,
      duration: duration,
      easingFn: easing.easeInOutExpo,
      // easingFn: easing.easeInOutElastic,
      lerpFn: ( a, b, amt ) => {
        const result = {};

        for (const property in a) {
          result[ property ] = lerp(a?.[property], b?.[property], amt);
        }

        return result;
      },
      startIndex: 0,
      endIndex: 1
    })

    const p = map(progression, 0, 1, -PI / 2, PI /2)*10

    fill(colors.rainbow({
      hueOffset: 0,
      hueIndex: mappers.fn(progression, 0, 1, -PI, PI),
      opacityFactor: 1.5,//mappers.fn(alpha, 0, 255, 3, 1)
      opacityFactor: map(sin(p), -1, 1, 3, 1)
    }))

    push()
    translate(x, y)
    // rotate(-time+progression*30*sin(time));
    rotate(progression*70);
    flower(30, 3)
    pop()
  }

  orbitControl()
});

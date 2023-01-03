import { sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl', size: {
  width: 1280, height: 960
} });
// sketch.setup( );

const easingFunctions = Object.entries(easing)

function flower(size, step) {
  const incrementStep = TAU / step;

  for (let angle = 0; angle < TAU; angle += incrementStep) {
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

    const innerSize = position.dist(nextPosition)

    circle(middlePosition.x, middlePosition.y, innerSize)
  }
}

function drawBackgroundPattern(time, cols = 30, rows = 50) {
  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols,
    centered: true
  }

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/cols;
    const yOff = y/rows;
    const innerAngle = mappers.circularIndex(time+xOff+yOff, [-PI/4, PI/2]);

    cross({
      position: cellVector,
      sides: 4,//mappers.circularIndex(time/2+noise(yOff + time, xOff), [ 2, 4]),
      borderColor: colors.purple({
        hueOffset: time+noise(yOff + time, xOff + time),
        hueIndex: map(x, 0, cols-1, -PI, PI),
        opacityFactor: 3.5
      }),
      borderWidth: 3,
      size: 20,
      depth: 2,
      angle: innerAngle,
      recursive: true,
      draw: (i, step, { size}) => {
        rotate(step);
        line( -size, 0, size, 0 );
      }
    })
  })
}

sketch.draw( (time, center) => {
  background(0);
  // translate(center);
2.0
  const speed = time//2;
  const duration = 1;
  const word = "123456789"//["1 - un", "2 - deux", "3 - trois"];//["22", "2-", "2 3"]//
  const size = 900;
  const font = string.fonts.serif;
  const currentLetter = mappers.circularIndex(speed, word)
  const nextLetter = mappers.circularIndex(speed+1  , word)

  const sampleFactor = 0.5
  const simplifyThreshold = 0
  const cacheTextPoints = true;

  const currentLetterPoints = cache.store( currentLetter, () => (
    font.textToPoints(currentLetter, -250, size/3, size, {
      sampleFactor, simplifyThreshold
    })
  ), cacheTextPoints)

  const nextLetterPoints = cache.store(nextLetter, () => (
    font.textToPoints(nextLetter, -250, size/3, size, {
      sampleFactor, simplifyThreshold
    })
  ), cacheTextPoints)

  // noFill()
  // strokeWeight(1);
  // stroke(128, 128, 255)
  // noStroke()
  // beginShape(POINTS);

  for (let i = 0; i < currentLetterPoints.length; i++) {
    const progression = map(i, 0, currentLetterPoints.length-1, 0, 1);
    const targetIndex = ~~map(i, 0, currentLetterPoints.length-1, 0, nextLetterPoints.length-1, true);

    const { x, y, alpha } = animation.ease({
      values: [ currentLetterPoints[i], nextLetterPoints[targetIndex] ],
      currentTime: speed,
      duration: duration,
      easingFn: easing.easeInOutExpo,
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

    fill(colors.rainbow({
      hueOffset: speed,
      hueIndex: mappers.fn(progression, 0, 1, -PI, PI),
      opacityFactor: 1.5,//mappers.fn(alpha, 0, 255, 3, 1)
      opacityFactor: map(sin(time+progression*50), -1, 1, 3, 1)
    }))
    // noFill()

    // if ((progression*100) % 10 === 0) {
    //   stroke(128, 128, 255)
    // }
    // else {
    //   noStroke()
    // }

    // stroke(128, 128, 255)
    // circle(x, y, 50);

    push()
    translate(x, y)
    //rotate(-time+progression*30*sin(time));
    rotate(-time+progression*50);
    flower(25, 3)
    pop()

  }

  orbitControl()

  // fill(128, 128, 255)
  // endShape();
});

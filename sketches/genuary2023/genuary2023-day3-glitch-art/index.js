import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

// sketch.setup( undefined);
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

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
}



function drawBackgroundPattern(time, columns = 30, rows = 50) {
  const gridOptions = {
    topLeft: createVector( -width/2, -height/2 ),
    topRight: createVector( width/2, -height/2 ),
    bottomLeft: createVector( -width/2, height/2 ),
    bottomRight: createVector( width/2, height/2 ),
    rows,
    columns,
    centered: true
  }

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/columns;
    const yOff = y/rows;
    const amt = mappers.circularIndex(time/2+noise(yOff+time, xOff+time), [0, 2, 5, 3]);

    const xx = mappers.circularIndex(xOff+time, [1, -3, 5])
    const yy = mappers.circularIndex(yOff+time, [1, 3])
    const zz = mappers.circularIndex(time/2+noise(x, y+time), [-50, 0])


    push()
    translate(cellVector.x+xx, cellVector.y+yy, zz)

    if (~~amt === 1) {
      line(0, 20)
    } else if (~~amt) {
      flower(15, ~~amt)
    }
    pop()
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

    // stroke('white')
    // vl(position.x)
    // hl(position.y)

    // stroke('red')
    // vl(xCenter+(position.x-xCenter))
    // hl(yCenter+(position.y-yCenter))

    // stroke('green')
    // vl(xMin)
    // vl(xMax)

    // stroke('blue')
    // hl(yMin)
    // hl(yMax)

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
    noFill( )
    stroke(64, 64, 128)
    strokeWeight(2)
    drawBackgroundPattern(time, 10, 15);
  pop()

  const speed = time//2;
  const duration = 1;
  const word = "%+#$@!^*";
  const size = 1250;
  const font = string.fonts.serif;
  const currentLetter = mappers.circularIndex(speed, word)
  const nextLetter = mappers.circularIndex(speed+1, word)

  const sampleFactor = 0.25//mappers.circularIndex(time, [0.5, 0.1, 0.25]);
  const simplifyThreshold = 0//mappers.circularIndex(time*5, [0.001, 0]);

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

  for (let i = 0; i < currentLetterPoints.length; i++) {
    const progression = map(i, 0, currentLetterPoints.length-1, 0, 1);
    const targetIndex = ~~map(i, 0, currentLetterPoints.length-1, 0, nextLetterPoints.length-1, true);

    const { x, y } = animation.ease({
      values: [ currentLetterPoints[i], nextLetterPoints[targetIndex] ],
      currentTime: speed,
      duration: duration,
      easingFn: easing.easeInOutExpo,
      // easingFn: easing.easeInOutElastic,
      lerpFn: p5.Vector.lerp,
      startIndex: 0,
      endIndex: 1
    })

    const p = map(progression, 0, 1, -PI / 2, PI /2)*10

    const colorFunction = mappers.circularIndex(time+progression*noise(x), [
      colors.rainbow,
      colors.purple,
      colors.black
    ]);

    fill(colorFunction({
      hueOffset: 0,
      hueIndex: mappers.fn(progression, 0, 1, -PI, PI),
      opacityFactor: 1.5,//mappers.fn(alpha, 0, 255, 3, 1)
      opacityFactor: map(sin(p), -1, 1, 3, 1)
    }))
    
    const amt = mappers.circularIndex(time*2*noise(x,y, time), [2,2, 2.1]);

    push()
    rotateX(0.05)
    translate(x, y)
    rotate(-time+progression*70);
    flower(40, amt)
    pop()
  }

  orbitControl()
});

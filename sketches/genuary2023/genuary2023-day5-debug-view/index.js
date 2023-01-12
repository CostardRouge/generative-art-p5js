import { debug, sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

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

    // translate(middlePosition.x, middlePosition.y, )
    // sphere(innerSize/2)
  }
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

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
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

  // string.write(`${frameCount}`, width / 2 - 60, height / 2 - 60, {
  //   //showBox: true,
  //   font: string.fonts.sans,
  //   center: true,
  //   size: 48,
  //   stroke: 255,//color(128, 128, 255),
  //   fill: color(255),
  // })

  const speed = time//2;
  const duration = 1;
  const word = "÷æ«$©…ø†¥ø&%+#$@!*";
  const size = 1250;
  const font = string.fonts.serif;
  const currentLetter = mappers.circularIndex(speed, word)
  const nextLetter = mappers.circularIndex(speed+1, word)

  const sampleFactor = 0.25//mappers.circularIndex(time, [0.5, 0.1, 0.25]);
  const simplifyThreshold = 0//mappers.circularIndex(time*5, [0.001, 0]);

  // string.write(`${nextLetter}`, 0, height / 2 - 60, {
  //   //showBox: true,
  //   font: string.fonts.serif,
  //   center: true,
  //   size: 48,
  //   stroke: color(128, 128, 255),
  //   fill: color(255),
  // })

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

  stroke(0, 0, 255)
  strokeWeight(3)

  translate(0, 0, mappers.fn(sin(time/2), -1, 1, 0, -500, easing.easeInOutElastic))
  rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutExpo)/8)
  rotateX(mappers.fn(cos(time/2), -1, 1, -PI, PI, easing.easeInOutQuart)/8)


  push()
  translate(-center.x, -center.y)
  //debug.lines()
  pop()

  push()
  translate(-center.x, -center.y, -120)
  drawGrid(10, 10)
  pop()

  for (let i = 0; i < currentLetterPoints.length; i++) {
    const progression = map(i, 0, currentLetterPoints.length-1, 0, 1);
    const targetIndex = ~~map(i, 0, currentLetterPoints.length-1, 0, nextLetterPoints.length-1, true);

    const { x, y } = animation.ease({
      values: [ currentLetterPoints[i], nextLetterPoints[targetIndex] ],
      currentTime: speed,
      duration: duration,
      // easingFn: easing.easeInOutExpo,
      easingFn: easing.easeInOutElastic,
      lerpFn: p5.Vector.lerp,
      startIndex: 0,
      endIndex: 1
    })


    const colorFunction = mappers.circularIndex(time, [
      colors.rainbow,
      //colors.purple,
      colors.black
    ]);

    fill(colorFunction({
      hueOffset: time,
      hueIndex: mappers.fn(progression, 0, 1, -PI, PI)*16,
      opacityFactor: 1.5
    }))


    // fill(255)
    
    let amt = mappers.circularIndex(-time+progression, [2, 3, 5]);
    //amt = 2//mappers.circularIndex(time/2+progression, [,7]);
    const size = 50//mappers.circularIndex(time/4+progression, [20, 30]);

    const z = map(sin(map(progression, 0, 1, -PI, PI)), -1, 1, 0, -500)

    push()
    translate(x*1.5, y*1.5, z)
    rotate(-time*2+progression*100);
    //rotate(progression*100);
    // rotate(i*1);
    flower(size, amt)
    pop()
  }

  orbitControl()
});

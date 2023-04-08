import { sketch, string, mappers, easing, events, colors, cache, grid } from './utils/index.js';

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

function drawGrid(xCount, yCount){
  let drawn = false;

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

      // if (drawn) {
      //   continue;
      // }
      // if ( mouseX > x * xSize && mouseX < (x + 1) * xSize &&
      //      mouseY > y * ySize && mouseY < (y + 1) * ySize ) {
      //       strokeWeight(0)
      //   rect(( x + 1/2 ) * (xSize), ( y + 1/2) * ySize, xSize-8, ySize-8);
      //   drawn = true;
      // }
    }
  }
}

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
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
    const amt = mappers.circularIndex(time+xOff, [0, 2, 5, 3]);

    push()
    translate(cellVector.x, cellVector.y, -50)

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
    translate(-center.x, -center.y, -120)
    //drawGrid(10, 10)
  pop()

  // push()
  //   noFill( )
  //   stroke(64, 64, 128)
  //   strokeWeight(2)
  //   drawBackgroundPattern(time, 10, 15);
  // pop()

  const speed = time//2;
  const duration = 1;
  const word = "*"//"÷æ«$©®…ø†¥ø&%+#$@!*";
  const size = 1000;
  const font = string.fonts.sans;
  const currentLetter = mappers.circularIndex(speed, word)
  const nextLetter = mappers.circularIndex(speed+1, word)

  const sampleFactor = 0.75 //mappers.circularIndex(time, [0.5, 0.1, 0.25]);
  const simplifyThreshold = 0//mappers.circularIndex(time*5, [0.001, 0]);

  const currentLetterPoints = getTextPoints({
    text: currentLetter,
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  // const nextLetterPoints = getTextPoints({
  //   text: nextLetter,
  //   position: createVector(0, 0),
  //   size,
  //   font,
  //   sampleFactor,
  //   simplifyThreshold
  // })

  // stroke(255, 0, 255)
  strokeWeight(3)
  noFill()

  for (let i = 0; i < currentLetterPoints.length; i++) {
    const progression = map(i, 0, currentLetterPoints.length-1, 0, 1);
    // const targetIndex = ~~map(i, 0, currentLetterPoints.length-1, 0, nextLetterPoints.length-1, true);

    // const { x, y } = animation.ease({
    //   values: [ currentLetterPoints[i], nextLetterPoints[targetIndex] ],
    //   currentTime: speed,
    //   duration: duration,
    //   easingFn: easing.easeInOutExpo,
    //   // easingFn: easing.easeInOutElastic,
    //   lerpFn: p5.Vector.lerp,
    //   startIndex: 0,
    //   endIndex: 1
    // })

    const { x, y } = currentLetterPoints[i]

    let colorFunction = mappers.circularIndex(time/4+progression, [
      //colors.rainbow,
      colors.test
    ]);

    if (i == currentLetterPoints.length-1) {
      //colorFunction = colors.rainbow;
    }

    //let amt = mappers.circularIndex(time/2+progression, [, 2, 3, 5, 7]);
    //amt = mappers.circularIndex(time/6+progression, [,5]);

    push()
    translate(
      x*2,
      y*2
    )
    rotate(-time+progression);
    //rotate(time+progression*TAU*5);
  
    const size = mappers.circularIndex(time/4+progression, [0, 50]);
    const keepSize = false//mappers.circularIndex(time/4+progression, [true, false]);

    stroke(colorFunction({
      //hueOffset: time,
      hueIndex: mappers.fn(progression, 0, 1, -PI, PI, easing.easeInCubic),
      //hueIndex: mappers.fn(index, 0, TAU, -PI, PI),
      // opacityFactor: map(sin(-progression*50+time*2), -1, 1, 3, 1),
      opacityFactor: mappers.fn(
        sin(progression*50+time*4),
        -1,
        1,
        mappers.fn(cos(progression*50+time*2), -1, 1, 5, 1, easing.easeInCubic),
        1,
        easing.easeInSine
      ),
    }))
    flower(size, 3, keepSize, (index) => {
      
    })
    pop()
  }

  orbitControl()
});

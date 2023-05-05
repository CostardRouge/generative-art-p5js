import { sketch, audio, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

// events.register("post-setup", () => {
//   audio.capture.setup()
//   // midi.setup()
// });

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

function lerpPoints(from, to, amount, fn) {
  return to.map( (point, index) => {
    const targetIndex = ~~map(index, 0, to.length-1, 0, from.length-1, true);

    return p5.Vector.lerp( to[index], from[targetIndex], amount )
  })

  // return from.map( (point, index) => {
  //   const fromIndex = map(index, 0, 1, 0, from.length-1);
  //   const targetIndex = ~~map(index, 0, from.length-1, 0, to.length-1, true);

  //   return p5.Vector.lerp( from[index], to[targetIndex], amount )
  // })
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

function drawGrid(cols, time) {
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

  rotate(PI/2)

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(xSign*x/cols+time/4, ySign*y/rows, time/4)*4;

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {
        stroke(16, 16, 64)
        rect(x-w/2, y-h/2, w, h )
        // circle(x, y, w, h )

        stroke(128, 16, 16)

        const n = noise(x/w, y/h, time);

        if (n > 0.5) {
          // fill(0)
          // circle(x, y, 15)
          rect(x-7.5, y-7.5, 15)
        }
        else {
          ikks(x, y, 15)
          cross(x, y, 15)
        }

      }
    )
  })
}

function drawPoints(points, begin, end = CLOSE) {
  beginShape(begin)
  points.forEach( ({x, y}) => {
    vertex(x, y)
  })
  endShape(end)
}

sketch.draw( (time, center) => {
  background(0);

  const xSign = sin(time);
  const ySign = cos(-time);
  const n = mappers.fn(cos(ySign+time), -1, 1, 2, 6, easing.easeInOutQuart)

  push()
  // rotateZ(time/4)
  drawGrid(n, time)
  pop()

  

  // rotateY(mappers.fn(sin(xSign+time), -1, 1, -PI, PI, easing.easeInOutQuart)/24)
  // rotateX(mappers.fn(cos(ySign+time), -1, 1, -PI, PI, easing.easeInOutQuart)/24)

  // mappers.fn(cos(ySign+time), -1, 1, -PI, PI, easing.easeInOutQuart)

  const size = (width)/2;
  // const sampleFactor = 1/20;
  const sampleFactor = 1/mappers.fn(n, 2, 6, 20, 50);
  const simplifyThreshold = 0;
  const font = string.fonts.martian;

  const [ firstLetterPoints ] = getTextPoints({
    text: "s",
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const [ nextLetterPoints ] = getTextPoints({
    text: "S",
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const depthSteps = 50//*3;
  const depthGap = 500;
  const depthStart = createVector(
    0,
    0,
    0,
    -depthGap/2
  );

  const depthEndY = animation.ease({
    values: [ -1, -0.5, 0, 0.5, 1 ],
    currentTime: time/2,
    duration: 1,
    easingFn: easing.easeInOutExpo
  })

  const depthEnd = createVector(
    sin(time*2) * width /6,
    cos(time/2) * height /6,
    // depthEndY * height /4,
    depthGap/2
  );

  for (let z = 0; z < depthSteps; z++) {
    const depthProgression = z/depthSteps;

    push()
    translate(p5.Vector.lerp( depthEnd, depthStart, z/depthSteps))
    strokeWeight(map(depthProgression, 0, 1, 40, 20))

    const points = lerpPoints(firstLetterPoints, nextLetterPoints, depthProgression )
    const darkness = map(z, 0, depthSteps, 10, 3)

    rotateZ(cos(time+z/(depthSteps/3.33))/2)

    points.forEach( ({x, y}, index) => {
      const hueOpacitySpeed = -time*6;

      const hue = noise(
        index/50+time/2,
        z/depthSteps-time/2
      )
      
      stroke( colors.rainbow({
        hueOffset: time,
        hueIndex: map(hue, 0, 1, -PI, PI)*4,
        opacityFactor: map(
          sin(
            +hueOpacitySpeed
            +index/20
            +z/20
            // +n
          ),
          -1,
          1,
          darkness,
          1
        ),
      }))

      const scale = mappers.fn(sin(time+(z/(depthSteps/2.5))*2), -1, 1, 1, 2, easing.easeInQuart)

      point( 
        x * scale,
        y * scale
      )
    })

    pop();
  }

  orbitControl();
});

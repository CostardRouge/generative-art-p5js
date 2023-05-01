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

  const W = width / cols;
  const H = height / rows;

  noFill()
  strokeWeight(2)

  const xSign = sin(-time/2);
  const ySign = cos(time/2);

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(xSign*x/cols+time, ySign*y/rows)*2;

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {
       

        const innerSize = 15;

        stroke(128, 16, 16)

        // triangle(
        //   // x-innerSize/2, y+innerSize/2,
        //   mouseX, mouseY,
        //   x, y+innerSize/2,
        //   x+innerSize/2, y+innerSize/2
        // )

        stroke(128, 16, 16)

        const n = noise(x/w, y/h, time);

        if (n > 0.5) {
          // fill(0)
          // circle(x, y, 15)
          // rect(x-7.5, y-7.5, 15)
          circle(x, y, w, h )
        }
        else {
          // ikks(x, y, 15)
          // cross(x, y, 15)
          stroke(16, 16, 64)
          rect(x, y, w, h )

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
  const n = mappers.fn(cos(time), -1, 1, 0, 1, easing.easeInOutExpo)

  push()
  rotateZ(PI/4)
  drawGrid(map(n, 0, 1, 6, 12), time/2)
  pop()

  // return;

  rotateY(mappers.fn(sin(xSign+time), -1, 1, -PI, PI, easing.easeInOutQuart)/24)
  rotateX(mappers.fn(cos(ySign+time), -1, 1, -PI, PI, easing.easeInOutQuart)/24)

  const size = (width)/2;
  const sampleFactor = map(n, 0, 1, 1, 0.1);
  const simplifyThreshold = 0;
  const font = string.fonts.serif;

  const [ firstLetterPoints ] = getTextPoints({
    text: "T",
    position: createVector(0, 0),
    size:size/2,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const [ nextLetterPoints ] = getTextPoints({
    text: "T",
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const depthGap = 500;
  const depthEnd = createVector( 0, 0, depthGap/2 )

  noFill()
  strokeWeight(3)

  const W = width/3// * sin(time);
  const H = height/3// * cos(time);

  const targets = [
    animation.ease({
      values: [ 
        createVector( 0, 0, 0 ),
        createVector( -W, -H, 0 ),
      ],
      currentTime: time,//+pointIndex/250,
      duration: 1,
      lerpFn: p5.Vector.lerp,
      easingFn: easing.easeInOutQuint
    }),
    animation.ease({
      values: [ 
        createVector( 0, 0, -depthGap/2 ),
        createVector(W, H, -depthGap/2 ),
      ],
      currentTime: time/2,//+pointIndex/150,
      duration: 1,
      lerpFn: p5.Vector.lerp,
      easingFn: easing.easeInOutExpo
    }),
    animation.ease({
      values: [ 
        createVector( 0, 0, -depthGap/2 ),
        createVector( W, -H, -depthGap/2 ),
      ],
      currentTime: time/3,//+pointIndex/100,
      duration: 1,
      lerpFn: p5.Vector.lerp,
      easingFn: easing.easeInOutExpo
    }),
    animation.ease({
      values: [ 
        createVector( 0, 0, -depthGap/2 ),
        createVector( -W, H, -depthGap/2 ),
      ],
      currentTime: time/4,//+pointIndex/50,
      duration: 1,
      lerpFn: p5.Vector.lerp,
      easingFn: easing.easeInOutExpo
    })
  ]

  translate(0, 0, depthGap/2 )

  targets.forEach( ( { x, y, z }, targetIndex ) => {
    const targetsProgression = targetIndex/targets.length;


    firstLetterPoints.forEach( (point, pointIndex ) => {
      const nextPointIndex = ~~map(pointIndex, 0, firstLetterPoints.length-1, 0, nextLetterPoints.length-1, true);
      const nextPointPosition = nextLetterPoints[nextPointIndex]
  
      const pointProgression = pointIndex/firstLetterPoints.length;
      beginShape()

      vertex(
        point.x+x,
        point.y+y,
        z
      )

      vertex(
        nextPointPosition.x+depthEnd.x,
        nextPointPosition.y+depthEnd.y,
        depthEnd.z
      )

      const hue = pointProgression + targetsProgression;
      const tint = colors.rainbow({
        hueOffset: time+targetsProgression,
        hueIndex: map(pointProgression, 0, 1, -PI, PI),
        opacityFactor: 1.5,
        // opacityFactor: map(
        //   sin(
        //     +time
        //     +pointProgression*50
        //     //+targetsProgression
        //   ),
        //   -1,
        //   1,
        //   2,
        //   1
        // ),
      })
      // tint.setAlpha(pointProgression*255)
      tint.setAlpha( map(
        sin(
          +time*3
          // +pointProgression*50
          +targetsProgression*500
        ),
        -1,
        1,
        128,
        255
      ) )
      stroke( tint )
      endShape()
    })



  })

  orbitControl();
});

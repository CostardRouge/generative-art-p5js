import { sketch, audio, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

const easingFunctions = Object.entries( easing );



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
      ],
      textPointsCacheKey
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

function drawGridCell(_x, _y, w, h, columns, rows, drawer) {
  const xSize = w / columns;
  const ySize = h / rows;

  for (let x = 0; x <= columns; x++) {
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

function drawGrid(columns, time) {
  const rows = columns*height/width;

  const gridOptions = {
    topLeft: createVector( -width, -height ),
    topRight: createVector( width, -height ),
    bottomLeft: createVector( -width, height ),
    bottomRight: createVector( width, height),
    rows,
    columns,
    centered: true
  }

  const W = width*2 / columns;
  const H = height*2 / rows;

  noFill()
  strokeWeight(2)

  const xSign = sin(-time/2);
  const ySign = cos(time/2);

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(xSign*x/columns+time, ySign*y/rows)*4;

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {
        stroke(16, 16, 64)
        rect(x, y, w, h )

        stroke(128, 16, 16)

        const n = noise(x/w, y/h, time);

        if (n > 0.5) {
          // fill(0)
          // circle(x, y, 15)
          rect(x-7.5, y-7.5, 15)
        }
        else {
          // ikks(x, y, 15)
          cross(x, y, 20)
        }

      }
    )
  })
}

const alphaPoints = {

}

function getAlphaFromMask({ position, maskPoints, maskId, distance = 0.025, alphaRange = [0, 255]}) {
  const { x, y } = position;

  const normalizedPosition = createVector(
    map(position.x, -width /2, width/2, 0, 1),
    map(position.y, -height /2, height/2, 0, 1)
  );

  const alpha = cache.store(`${x}-${y}-${maskId}-alpha`, () => {
    const [ minAlpha, maxAlpha ] = alphaRange;

    return maskPoints.reduce( ( result, pointPosition ) => {
      if (255 <= result) {
        return result;
      }

      const normalizedPointPosition = createVector(
        map(pointPosition.x, -width /2, width/2, 0, 1),
        map(pointPosition.y, -height /2, height/2, 0, 1)
      );

      return Math.max(
        result,
        ~~map(normalizedPointPosition.dist(normalizedPosition), 0, distance, maxAlpha, minAlpha, true)
      );
    }, 0);
  });

  return alpha;
}

function createGridAlphaPoints(gridOptions, maskPoints, cacheKey) {
  return cache.store( `alpha-points-${cacheKey}`, () => {
    const points = [];

    grid.draw(gridOptions, position => {
      const alpha = getAlphaFromMask({
        position,
        maskPoints,
        maskId: cacheKey
      })

      if ( alpha ) {
        points.push({
          position,
          alpha
        })
      }
    });
  
    return points
  } );
}

function rotateVector(vector, center, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return ([
    (cosine * (vector.x - center.x)) + (sine * (vector.y - center.y)) + center.x,
    (cosine * (vector.y - center.y)) - (sine * (vector.x - center.x)) + center.y
  ]);
}

sketch.draw( (time, center) => {
  background(0);

  push()
  rotate(time/4)
  drawGrid(6, time/2)
  pop()

  const size = (width)/2;
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  push()
  strokeWeight(3)

  const columns = 200;
  const rows = columns*height/width;

  const gridOptions = {
    topLeft: createVector( -width/2, -height/2 ),
    topRight: createVector( width/2, -height/2 ),
    bottomLeft: createVector( -width/2, height/2 ),
    bottomRight: createVector( width/2, height/2),
    rows,
    columns,
    centered: true
  }

  const [ firstLetterPoints,, firstLetterPointsCacheKey ] = getTextPoints({
    text: "m",
    position: createVector(0, 0),
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const [ nextLetterPoints,, nextLetterPointsCacheKey ] = getTextPoints({
    text: "M",
    position: createVector(0, 0),
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const letterProgression = animation.ease({
    values: [ 0, 1 ],
    currentTime: time/3,
    duration: 1,
    easingFn: easing.easeInOutExpo,
    // easingFn: easing.easeInOutQuart,
    easingFn: easing.easeInOutElastic,
  })

  // const points = lerpPoints(firstLetterPoints, nextLetterPoints, letterProgression )

  push()

  const n = map(sin(time), -1, 1, 2, 4)

  // rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutQuart)/12)
  // rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/8)

  const alphaMasks = {
    [firstLetterPointsCacheKey]: createGridAlphaPoints(gridOptions, firstLetterPoints, firstLetterPointsCacheKey),
    [nextLetterPointsCacheKey]: createGridAlphaPoints(gridOptions, nextLetterPoints, nextLetterPointsCacheKey),
  }

  alphaMasks[firstLetterPointsCacheKey].forEach( ( { position, alpha } ) => {
    const angle = noise(position.x/columns+time, position.y/rows) * TAU;
    const [ rotatedX, rotatedY ] = rotateVector(
      position,
      center,//.div(2),
      time+angle/10
    );

    const [,easingFunction] = mappers.circularIndex(2, easingFunctions)
    const d = mappers.fn(alpha, 0, 255, 0, 70, easingFunction)

    const hue = noise(
      // position.x/columns,
      // position.y/rows,
      rotatedY/rows/2,
      rotatedX/columns/2
      //+d/10+time/2
    )

    stroke( colors.rainbow({
      // hueOffset: time,
      hueIndex: map(hue, 0, 1, -PI, PI)*n,
      opacityFactor: map(
        sin(
          time//*10
          +d/15
        ),
        -1,
        1,
        3,
        1
      ),
    }))

    push()
    // const angleX = animation.ease({
    //     values: [ PI, 0 ],
    //     currentTime: time/2,
    //     duration: 1,
    //     easingFn: easing.easeInOutExpo,
    //     easingFn: easing.easeInOutQuart
    //   })
    const angleY = animation.ease({
      values: [ 0, PI*2, 0 ],
      currentTime: time/2+position.y/rows/2+d/1000,
      duration: 1,
      easingFn: easing.easeInOutExpo,
      easingFn: easing.easeInOutQuart
    })
    // rotateX(angleX/1000)
    rotateY(angleY)

    point(position.x, position.y, d)
    pop()
  });

  return orbitControl();
});

import { sketch, audio, debug, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

const easingFunctions = Object.entries( easing );

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
  // strokeWeight(3)

  const xSign = sin(-time/2);
  const ySign = cos(time/2);

  const n = mappers.circularIndex( time*4, [1, 2, 3, 2])

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    // const n = noise(xSign*x/columns+time, ySign*y/rows)*2;

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      n,
      n,
      ( x, y, w, h ) => {
        // stroke(16, 16, 64)
        // rect(x, y, w, h )
        const n = noise(x/w, y/h, time);

        if (n > 0.5) {
          // fill(0)
          // circle(x, y, 15)
          //rect(x-7.5, y-7.5, 15)
          stroke(128, 16, 16)
        }
        else {
          // ikks(x, y, 15)
          // cross(x, y, 15)
          stroke(16, 16, 128)
        }

        circle(x, y, 15)


      }
    )
  })
}

const alphaPoints = {}

function getAlphaFromMask({ position, maskPoints, maskId, distance = 0.025, alphaRange = [0, 255]}) {
  const { x, y } = position;

  const normalizedPosition = createVector(
    map(x, -width/2, width/2, 0, 1),
    map(y, -height/2, height/2, 0, 1)
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
    grid.draw(gridOptions, position => {
      const alpha = getAlphaFromMask({
        position,
        maskPoints,
        maskId: cacheKey
      })
  
      if ( alpha ) {
        const pointKey = `${position.x}@${position.y}`;
        const point = alphaPoints[ pointKey ] ?? {}

        point[ cacheKey ] = alpha;
        alphaPoints[ pointKey ] = point
      }
    });

    return null;
  });
}

function rotateVector(vector, center, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return ([
    (cosine * (vector.x - center.x)) + (sine * (vector.y - center.y)) + center.x,
    (cosine * (vector.y - center.y)) - (sine * (vector.x - center.x)) + center.y
  ]);
}

function drawGrid1(xCount, yCount, time) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  strokeWeight(1)

  stroke(
    16,
    16,
    64
  );

  const offset = 0;
  const xx = xSize * sin(time + xSize )
  const yy = ySize * cos(time + ySize)

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      line(0, (yy + y * ySize) % height, width, (y * ySize + yy) % height);
      line((xx + x * xSize) % width, 0, (xx + x * xSize) % width, height);
    }
  }
}

sketch.draw( (time, center) => {
  background(0);

  const s = mappers.fn(cos(time/2), -1, 1, 1, 2, easing.easeInOutExpo)
  const xx = mappers.fn(s, 1, 2, 15, 150, easing.easeInOutCubic)
  const yy = mappers.fn(s, 1, 2, 15, 150,  easing.easeInOutQuad)

  push()
  rotate(time/4)
  drawGrid(6*s, time/2)
  pop()

  // push()
  // translate(-center.x, -center.y)
  // drawGrid1(3, 4, time)
  // pop()

  const size = (width)/2;
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  push()

  const columns = 150//*2;
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
    text: "O",
    position: createVector(0, 0),
    size,
    font: string.fonts.tilt,
    sampleFactor,
    simplifyThreshold
  })

  const [ nextLetterPoints,, nextLetterPointsCacheKey ] = getTextPoints({
    text: "o",
    position: createVector(0, 0),
    size,
    font: string.fonts.martian,
    sampleFactor,
    simplifyThreshold
  })

  // strokeWeight(4)

  // const n = map(sin(time), -1, 1, 2, 4)
  // rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutQuart)/12)
  // rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/8)

  createGridAlphaPoints(gridOptions, firstLetterPoints, "a")
  createGridAlphaPoints(gridOptions, nextLetterPoints, "b")

  for ( const key in alphaPoints ) {
    const a = alphaPoints[ key ][ "a" ] || 0;
    const b = alphaPoints[ key ][ "b" ] || 0;

    const easedAlpha = animation.ease({
      values: [ b, a ],
      currentTime: s-1,
      duration: 1,
      easingFn: easing.easeInOutExpo,
    })

    const depth = mappers.fn(easedAlpha, 0, 250, 0, 100, easing.easeOutQuad)

    if ( depth <= 1 ) {
      continue
    }

    const position = createVector( ...key.split("@") )
  
    const angle = noise(position.x/columns, position.y/rows, ) * TAU;
    const [ rotatedX, rotatedY ] = rotateVector(
      position,
      center.div(1),
      -time/2
      +angle
    );

    const hue = noise(
      // position.x/columns,
      // position.y/rows,
      rotatedY/rows/2,
      rotatedX/columns/2
      // +depth/150//+time/2
    )
    const tint = colors.rainbow({
      // hueOffset: time,
      hueIndex: map(hue, 0, 1, -PI, PI)*4,
      opacityFactor: map(
        sin(
          time
          +depth/15
        ),
        -1,
        1,
        3,
        1
      ),
    })

    // tint.setAlpha(map(depth, 0, 50, 0, 360))
    tint.setAlpha(easedAlpha)

    stroke( tint )

    const m = 100
    
    const zz = map(sin(
      time*5
      // +depth/200
      // +position.x/xx
      +map(s, 2, 1, position.x/15, 0)
      +map(s, 1, 2, position.y/15, 0)
      // +rotatedY/rows*8
      // +rotatedX/columns*8
    ), -1, 1, -m, m)

    point(
      position.x*s,
      position.y*s,
      depth*2+zz
    )
  }

  orbitControl();
});

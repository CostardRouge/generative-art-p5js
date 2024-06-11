import { sketch, audio, options, iterators, converters, debug, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

options.add( [
  {
    id: "background-lines-count",
    type: 'slider',
    min: 1,
    max: 1000,
    label: 'Lines count',
    defaultValue: 70,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 4,
    category: 'Background'
  },
] );

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
    topLeft: createVector( -width/2, -height/2 ),
    topRight: createVector( width/2, -height /2),
    bottomLeft: createVector( -width/2, height/2 ),
    bottomRight: createVector( width/2, height/2),
    rows,
    columns,
    centered: true
  }

  const W = width / columns;
  const H = height/ rows;

  noFill()
  strokeWeight(3)

  const xSign = sin(-time/2);
  const ySign = cos(time/2);

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(xSign*x/columns+time, ySign*y/rows)*2;

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {
        stroke(16, 16, 32)
        // rect(x, y, w, h )
        circle(x, y, w)


        const n = noise(x/w, y/h, time);

        if (n > 0.5) {
          // fill(0)
          // circle(x, y, 15)
          //rect(x-7.5, y-7.5, 15)
        }
        else {
          // 
          // cross(x, y, 15)
          stroke(128, 16, 16)
          ikks(x, y, 15)
        }

      }
    )
  })
}

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

function createGridAlphaPoints(gridOptions, maskPointsArray) {
  return cache.store( `alpha-points`, () => {
    const alphaPoints = [];

    grid.draw(gridOptions, position => {
      const alphaPoint = {};

      for ( const cacheKey in maskPointsArray ) {
        const maskPoints = maskPointsArray[ cacheKey ]

        const alpha = getAlphaFromMask({
          position,
          maskPoints,
          maskId: cacheKey
        })
    
        if ( alpha ) {
          alphaPoint[ cacheKey ] = alpha;
        }
      }

      if ( Object.keys( alphaPoint ).length > 0 ) {
        alphaPoints.push( {
          ...alphaPoint,
          position
        } );
      }
    });

    return alphaPoints;
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

const pattern = (count = 7, time, color) => {
  push()
  stroke(color);
  strokeWeight(5);
  translate(width /2, height /2 )

  const center = createVector( 0, 0 );
  const size = (width + height);

  const p = 0.1//map(sin(time*2), -1, 1, 0.1, 0.9);

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      angle,//- time,
      size * (sin(time + angle*2)),
    );

    beginShape();
    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      vertex(
        vector.x,
        vector.y
      );
    })
    endShape();
  } )
  pop()
}

sketch.draw( (time, center) => {
  background(0);

  const s = mappers.fn(cos(time/2), -1, 1, 1, 2, easing.easeInOutExpo)
  // const xx = mappers.fn(s, 1, 2, 100, 15, easing.easeInOutCubic)
  // const yy = mappers.fn(s, 1, 2, 15, 150,  easing.easeInOutQuad)

  // push()
  // //rotate(time/4)
  // drawGrid(3*s, time/2)
  // pop()

  // push()
  // translate(-center.x, -center.y)
  // stroke(
  //   16,
  //   16,
  //   128
  // );
  // drawGrid1(4, 8, time)
  // pop()

  // push()
  // translate(-center.x, -center.y)
  // stroke(
  //   128,
  //   16,
  //   16
  // );
  // drawGrid1(4, 8, -time)
  // pop()

  push()
  translate(
    -center.x,
    -center.y,
    animation.ease({
      values: [ -500, -250 ],
      currentTime: s-1,
      duration: 1,
      easingFn: easing.easeOutElastic
    })
  )
  pattern(
    animation.ease({
      values: [ 96, 128 ],
      currentTime: s-1,
      duration: 1,
      easingFn: easing.easeOutCirc
    }),
    time/4,
    color( 128, 128, 255, 40)
  );
  pop()

  const size = (width)/2;
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  const columns = 100  //*2;
  const rows = columns*height/width;
  const cellSize = width/columns

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
    text: "z",
    position: createVector(0, 0),
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const [ nextLetterPoints,, nextLetterPointsCacheKey ] = getTextPoints({
    text: "Z",
    position: createVector(0, 0),
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  // rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutQuart)/12)
  // rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/50)

  const alphaPoints = createGridAlphaPoints( gridOptions, {
    a:  firstLetterPoints,
    b:  nextLetterPoints
  })

  rotateX(
    animation.ease({
      values: [ 0, PI/9 ],
      currentTime: s-1,
      duration: 1,
      easingFn: easing.easeOutExpo
    })
  )

  rotateY(
    animation.ease({
      values: [ 0, PI*2 ],
      currentTime: s-1,
      duration: 1,
      easingFn: easing.easeInOutExpo
    })
  )

  for ( const [ index, { a, b, position } ] of alphaPoints.entries() ) {
    const easedAlpha = animation.ease({
      values: [
        a || 0,
        b || 0
      ],
      currentTime: s-1,
      duration: 1,
      easingFn: easing.easeInOutExpo,
    })

    const depth = mappers.fn(easedAlpha, 0, 255, 0, 100, easing.easeOutQuad)
    // const depth = mappers.fn(sin(easedAlpha+time), -1, 1, 0, 100, easing.easeOutQuad)

    if ( depth <= 1 ) {
      continue
    }
  
    const angle = noise(position.x/columns, position.y/rows) * TAU;
    const [ rotatedX, rotatedY ] = rotateVector(
      position,
      center.div(2),
      time/2
      +angle/4
    );

    const hue = noise(
      // position.x/columns,
      // position.y/rows,
      rotatedY/rows,
      rotatedX/columns
      +depth/150//+time/2
    )
    const tint = colors.rainbow({
      // hueOffset: time,
      hueIndex: map(hue, 0, 1, -PI, PI)*4,
      opacityFactor: 1.5,
      // opacityFactor: map(
      //   sin(
      //     time*5
      //     // +easedAlpha/2
      //     // +depth/15
      //     +rotatedY/rows
      //     +rotatedX/columns
      //     // +index/100
      //   ),
      //   -1,
      //   1,
      //   2,
      //   1
      // ),
    })

    ////tint.setAlpha(map(depth, 0, 25, 64, 360, true))

    // stroke( tint )
    // strokeWeight(1/2)
    // noFill()

    const { levels: [ red, green, blue, alpha ] } = tint;

    // tint.setAlpha(easedAlpha)
    // fill( tint )
    // noFill()
    fill( red, green, blue, 176)
    stroke( red, green, blue )

    // normalMaterial()
    // noStroke();

    push()

    const w = s*cellSize-2
    const h = s*cellSize-2
    const d = s*depth//*s

    // rotateX(mappers.fn(cos(2*time-rotatedY/rows), -1, 1, -PI, PI)/6)
    // rotateY(mappers.fn(sin(time+rotatedX/columns), -1, 1, -PI, PI)/6)

    rotateY(mappers.fn(sin(time+rotatedY/columns/2+depth/150), -1, 1, -PI, PI)/9)

    translate(
      position.x*s,
      position.y*s,
      depth/2*s
    )

    // rotateX(mappers.fn(cos(2*time-rotatedX/rows), -1, 1, -PI, PI, easing.easeInOutQuart)/6)
    // rotateY(mappers.fn(sin(time+rotatedY/columns), -1, 1, -PI, PI, easing.easeInOutExpo)/6)

    const rotateAngle = 0//PI/12;

    rotateX(mappers.fn(cos(2*time-rotatedY/rows), -1, 1, -rotateAngle, rotateAngle))
    rotateY(mappers.fn(sin(time+rotatedX/columns), -1, 1, -rotateAngle, rotateAngle))

    // box(w, h, -d)
    rotateX(PI/2)
    cone(w/2, depth*s, 6)

    pop()
  }

  orbitControl();
});

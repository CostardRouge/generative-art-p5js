import { sketch, audio, options, iterators, converters, debug, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

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

sketch.draw( (time, center) => {
  background(0);

  const s = mappers.fn(cos(time/2), -1, 1, 1, 2, easing.easeInOutExpo)

  const size = (width)/2;
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  const columns = 100 // *2;
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

  const [ firstLetterPoints, square, firstLetterPointsCacheKey ] = getTextPoints({
    text: "2",
    position: createVector(0, 0),
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  // const [ x, y, w, h ] = square;

  // noFill()
  // rect( x*2, y*2, w*2, h*2 )

  const alphaPoints = createGridAlphaPoints( gridOptions, {
    a: firstLetterPoints
  })

  // rotateX(
  //   animation.ease({
  //     values: [ 0, PI*2 ],
  //     currentTime: s-1,
  //     duration: 1,
  //     easingFn: easing.easeInOutExpo,
  //     // easingFn: easing.easeInOutElastic,
  //   })
  // )

  // rotateY(
  //   animation.ease({
  //     values: [ 0, PI*2 ],
  //     currentTime: s-1,
  //     duration: 1,
  //     easingFn: easing.easeInOutExpo
  //   })
  // )

  for ( const [ index, { a, position } ] of alphaPoints.entries() ) {
    const easedAlpha = a;

    const depth = mappers.fn(easedAlpha, 0, 255, 0, 100, easing.easeOutQuad)

    if ( depth <= 1 ) {
      continue
    }
  
    const angle = noise(position.x/columns, position.y/rows) * TAU;
    const [ rotatedX, rotatedY ] = rotateVector(
      position,
      center.div(2),
      time/2
      //+angle/4
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
      hueIndex: map(hue, 0, 1, -PI, PI)*3,
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

    //tint.setAlpha(map(depth, 0, 25, 64, 360, true))

    // stroke( tint )
    // strokeWeight(1/2)
    // noFill()

    const { levels: [ red, green, blue, alpha ] } = tint;

    // tint.setAlpha(easedAlpha)
    // noFill()
    fill( red, green, blue, 176)
    stroke( red, green, blue )

    push()

    const scale = 2//1.5

    const w = cellSize-2
    const h = cellSize-2
    const d = depth//*s

    // rotateX(mappers.fn(cos(2*time-rotatedY/rows), -1, 1, -PI, PI)/6)
    // rotateY(mappers.fn(sin(time+rotatedX/columns), -1, 1, -PI, PI)/6)
    // rotateY(mappers.fn(sin(time+rotatedY/columns/2+depth/150), -1, 1, -PI, PI)/9)
    let rotateAngle = PI/12;

    // rotateX(mappers.fn(cos(2*time-position.y/rows), -1, 1, -rotateAngle, rotateAngle))
    // rotateY(mappers.fn(sin(time+position.x/columns), -1, 1, -rotateAngle, rotateAngle))

    translate(
      position.x*scale,
      position.y*scale,
      //depth//2//*s
    )

    // rotateX(mappers.fn(cos(2*time-rotatedX/rows), -1, 1, -PI, PI, easing.easeInOutQuart)/6)
    // rotateY(mappers.fn(sin(time+rotatedY/columns), -1, 1, -PI, PI, easing.easeInOutExpo)/6)

    // rotateX(mappers.fn(cos(2*time-rotatedY/rows), -1, 1, -rotateAngle, rotateAngle))
    // rotateY(mappers.fn(sin(time+rotatedX/columns), -1, 1, -rotateAngle, rotateAngle))

    rotateAngle = PI/4;

    let c = mappers.fn(sin(time), -1, 1, 1, 6, easing.easeInExpo);
    c = mappers.fn(sin(time+rotatedY/rows), -1, 1, -PI, 6, easing.easeInExpo);
    // c = mappers.fn(sin(time+position.y/columns), -1, 1, -PI, PI, easing.easeOutExpo);

    rotateX(mappers.fn(cos(2*time-position.y/rows*c), -1, 1, -rotateAngle, rotateAngle))
    rotateY(mappers.fn(sin(time+position.x/columns*c), -1, 1, -rotateAngle, rotateAngle))

    // box(w, h, -d)
    box(w, h, d)

    pop()
  }

  orbitControl();
});

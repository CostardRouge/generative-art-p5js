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

  const size = (width);
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  const columns = 65//*3;
  const rows = columns*height/width;
  const cellSize = width/columns;

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
    text: "5",
    position: createVector(0, 0),
    size,
    font: string.fonts.martian,
    // font: string.fonts.sans,
    // font: string.fonts.serif,
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
  //     currentTime: time/2,
  //     duration: 1,
  //     easingFn: easing.easeInOutExpo
  //   })
  // )

  const pairedPoints = cache.store("paired-points", () => {
    const shuffledAlphaPoints = alphaPoints.sort( () => 0.5 - Math.random());

    return shuffledAlphaPoints.map( ( start, index ) => {
      const endPointIndex = ( index + 1 ) % shuffledAlphaPoints.length;
      const end = shuffledAlphaPoints?.[ endPointIndex ];
  
      return {
        start,
        end
      };
    })
  })

  // pairedPoints.forEach( ( { start, end }, index ) => {
  //   const startPosition = start?.position;
  //   const endPosition = end?.position;

  //   stroke(255)
  //   const {x, y } = animation.ease({
  //     values: [ startPosition, endPosition ],
  //     currentTime: time+index/pairedPoints.length/5,
  //     duration: 1,
  //     lerpFn: p5.Vector.lerp,
  //     easingFn: easing.easeInOutExpo,
  //   });
  //   point( x, y )
  // })

  for ( const [ index, { start, end } ] of pairedPoints.entries() ) {
    // const position = animation.ease({
    //   values: [ start?.position, start?.position, start?.position, end?.position, end?.position, end?.position ],
    //   currentTime: time/2+index/pairedPoints.length/5,
    //   duration: 1,
    //   lerpFn: p5.Vector.lerp,
    //   easingFn: easing.easeInOutBack,
    // });

    const position = start?.position

    const depth = 250//mappers.fn(start?.a, 0, 255, 0, 100, easing.easeOutQuad)

    if ( depth <= 1 ) {
      continue
    }
  
    // const angle = noise(position.x/columns, position.y/rows) * TAU;
    // const [ rotatedX, rotatedY ] = rotateVector(
    //   position,
    //   center.div(2),
    //   time/4
    //   // +angle
    // );

    const hue = noise(
      position.x/columns + (
        0
        +map(sin(time/2), -1, 1, 0, 1)*3
      ),
      position.y/rows+(
        0
        +map(cos(time/2), -1, 1, 0, 1)*3
      ),
      // rotatedY/rows,
      // rotatedX/columns
      //+depth/150+time/2
      //+mappers.fn(start?.a, 0, 255, 0, 100, easing.easeOutQuad)/150
    )
    const tint = colors.rainbow({
      // hueOffset: time,
      hueIndex: map(hue, 0, 1, -PI, PI)*2,
      opacityFactor: 1.5
    })

    const { levels: [ red, green, blue, alpha ] } = tint;

    fill( red, green, blue, 225)
    stroke( red, green, blue, 100 )

    push()

    const w = cellSize-2
    const h = cellSize-2
    const d = depth

    const values = [ 0, PI, PI*2 ]

    translate(
      position.x,
      position.y,
      depth + (
        -300
      )
    )

    const easingFn = easing.easeInOutExpo

    rotateX(
      animation.ease({
        values: [ 0, 0, PI ],
        currentTime: (
          time/2
          // +index/pairedPoints.length/5
          // +position.x/columns/50
          +position.y/rows/20
        ),
        duration: 1,
        easingFn: easing.easeInOutExpo,
        easingFn
      })
    )

    rotateY(
      animation.ease({
        values:  [ PI, 0, 0 ],
        currentTime: (
          time/2
          // +index/pairedPoints.length/5
          +position.x/columns/20
          // +position.y/rows/50
        ),
        duration: 1,
        easingFn: easing.easeInOutExpo,
        easingFn
      })
    )

    box(w, h, -d)

    pop()
  }

  orbitControl();
});

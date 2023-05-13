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

  const cols = 100/2
  const rows = cols*height/width;
  const cellSize = width/cols

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2),
    rows,
    cols,
    centered: true
  }

  const [ firstLetterPoints,, firstLetterPointsCacheKey ] = getTextPoints({
    text: "1",
    position: createVector(0, 0),
    size: size*1.5,
    font: string.fonts.martian,
    sampleFactor,
    simplifyThreshold
  })

  // const [ nextLetterPoints,, nextLetterPointsCacheKey ] = getTextPoints({
  //   text: "un",
  //   position: createVector(0, 0),
  //   size: size*0.8,
  //   font: string.fonts.martian,
  //   sampleFactor,
  //   simplifyThreshold
  // })

  // rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutQuart)/12)
  // rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/50)

  const alphaPoints = createGridAlphaPoints( gridOptions, {
    a:  firstLetterPoints,
    //b:  nextLetterPoints
  })

  // rotateX(
  //   animation.ease({
  //     values: [ 0, PI/9 ],
  //     currentTime: s-1,
  //     duration: 1,
  //     easingFn: easing.easeInOutExpo
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

  for ( const [ index, { a, b, position } ] of alphaPoints.entries() ) {
    // const easedAlpha = animation.ease({
    //   values: [
    //     a || 0,
    //     b || 0
    //   ],
    //   currentTime: 0,//s-1,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo,
    // })

    // const depth = mappers.fn(easedAlpha, 0, 255, 0, 100, easing.easeOutQuad)
    const depth = mappers.fn(a || 0, 0, 255, 0, 100, easing.easeOutQuad)

    if ( depth <= 1 ) {
      continue
    }
  
    // const angle = noise(position.x/cols, position.y/rows) * TAU;
    // const [ rotatedX, rotatedY ] = rotateVector(
    //   position,
    //   center.div(2),
    //   time/4
    //   //+angle
    // );

    push()

    const w = cellSize-2
    const h = cellSize-2
    let d = 200

    d = mappers.fn(
      noise(position.x/cols/10+position.y/rows/10+time/2),
      // noise(rotatedX/rows/5, rotatedY/rows/5),
      0, 1,
      20, 500,
      easing.easeInOutBack,
      easing.easeInOutExpo,
      easing.easeInOutCirc,
      easing.easeInOutQuad,
    )

    // d = mappers.fn(
    //   sin(index/200+position.x/cols/10+position.y/rows/10+time),
    //   -1, 1,
    //   20, 500,
    //   easing.easeInOutElastic,
    //   easing.easeInOutExpo
    // )

    const xSign = sin(-time/2);
    const ySign = cos(time)/2;

    // d = mappers.fn(
    //   sin(
    //     (xSign*(position.x/(width/10))+ySign*(position.y/(height/20)))
    //     // +(xSign*(position.x/width/10)+ySign*(position.y/height/10))
    //     +time
    //     +index/150
    //   ),
    //   -1, 1,
    //   20, 500,
    //   easing.easeInOutBack,
    //   easing.easeInOutExpo,
    //   // easing.easeInOutCirc,
    //   // easing.easeInOutQuad,
    //   )

    const hue = noise(
      position.x/cols/2,
      position.y/rows/2+time/2,
      // rotatedY/rows/2,
      // rotatedX/cols/2
      +depth/150
    )
    const tint = colors.rainbow({
      // hueOffset: time,
      hueIndex: map(hue, 0, 1, -PI, PI)*3,
      opacityFactor: 1.5,
    })

    const chance = noise( position.x/cols, position.y/rows, time/2)

    stroke( tint )

    if ( 1||chance > 0.2) {
      const { levels: [ red, green, blue, alpha ] } = tint;

      fill( red, green, blue, 210)
    }
    else {
      //noFill()
      fill(0)
    }


    // rotateX(
    //   animation.ease({
    //     values: [ 0, PI/2 ],
    //     currentTime: time+hue,
    //     duration: 1,
    //     easingFn: easing.easeInOutExpo
    //   })
    // )
    const rotateAngle = PI/6;


    // rotateX(mappers.fn(cos(time+rotatedX/rows/5), -1, 1, -rotateAngle, rotateAngle, easing.easeInOutExpo))
    // rotateY(mappers.fn(sin(time+rotatedY/cols/5), -1, 1, -rotateAngle, rotateAngle, easing.easeInOutExpo))

    

    translate(
      position.x,
      position.y,
      d/2
    )

    // rotateX(mappers.fn(cos(time+position.x/rows/5), -1, 1, -rotateAngle, rotateAngle, easing.easeInOutExpo))
    // rotateY(mappers.fn(sin(time+position.y/cols/5), -1, 1, -rotateAngle, rotateAngle, easing.easeInOutExpo))
    
    // rotateZ(mappers.fn(sin(time+position.x/rows+position.y/cols), -1, 1, -PI, PI, easing.easeInOutExpo)/2)

    box(w, h, d)

    pop()
  }

  orbitControl();
});

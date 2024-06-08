import { sketch, options, iterators, converters, debug, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

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

function createGridAlphaPoints(gridOptions, textPointsMatrix) {
  return cache.store( `alpha-points`, () => {
    const alphaPoints = [];

    grid.draw(gridOptions, position => {
      const alphaLayers = [];

      for ( const [ points, , cacheKey ] of textPointsMatrix ) {
        const alpha = getAlphaFromMask({
          position,
          maskPoints: points,
          maskId: cacheKey
        })
    
        if ( alpha ) {
          alphaLayers.push( alpha );
        }
      }

      if ( alphaLayers.length > 0 ) {
        const randomPosition = p5.Vector.random3D().mult((width+height)/2)

        alphaPoints.push( {
          position,
          randomPosition,
          layers: alphaLayers
        } );
      }
    });

    return alphaPoints;
  });
}

sketch.draw( (time, center) => {
  background(0);

  const size = (width);
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  const cols = 50//*2;
  const rows = cols*height/width;
  const cellSize = width/cols;

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2),
    rows,
    cols,
    centered: true
  }

  const fonts = [
    // string.fonts.martian,
    // string.fonts.tilt,
    // string.fonts.multicoloure,
    // string.fonts.openSans,
    // string.fonts.sans,
    string.fonts.serif
  ]

  const textPointsMatrix = fonts.map( font => (
    getTextPoints({
      text: "7",
      position: createVector(0, 0),
      size,
      font,
      sampleFactor,
      simplifyThreshold
    })
  ))

  const alphaPoints = createGridAlphaPoints(
    gridOptions,
    textPointsMatrix
  )

  const {
    x: rX,
    y: rY,
    //z: rZ
  } = animation.ease({
    values: [
      createVector(), 
      createVector(0, PI*4),
      createVector(PI*4,PI*4),
      createVector(0, PI*4),
    ],
    currentTime: time/2,
    duration: 1,
    lerpFn: p5.Vector.lerp,
    easingFn: easing.easeInOutExpo
  })

  rotateX(rX)
  rotateY(rY)

  alphaPoints.forEach( ( { layers, position, randomPosition }, index ) => {
    const switchIndex = time+(
      +index/alphaPoints.length/5
      +position.x/cols/50
      +position.y/rows/50
    )

    const movingPosition = animation.ease({
      values: [ position, randomPosition ],
      currentTime: switchIndex,
      duration: 1,
      lerpFn: p5.Vector.lerp,
      easingFn: easing.easeInOutExpo,
    });

    const hue = noise(
      position.x/cols/3 + (
        +map(sin(time), -1, 1, 0, 1)
      ),
      position.y/rows/3 + (
        +map(cos(time), -1, 1, 0, 1)
      )
    )

    const tint = colors.rainbow({
      hueOffset: time,
      hueIndex: map(hue, 0, 1, -PI, PI)*2,
      opacityFactor: 1.5
    })

    const { levels: [ red, green, blue ] } = tint;

    push()

    const w = cellSize//-2
    const h = cellSize//-2
    const d = cellSize*10

    translate(
      movingPosition.x + (
        1//50 * sin(time*2+movingPosition.x/cols+index/alphaPoints.length)
      ),
      movingPosition.y + (
        1//50 * cos(time+movingPosition.y/rows+index/alphaPoints.length)
      ),
      movingPosition.z
      // -d + (
      //   0
      //   //-300
      // )
    )

    const fillAlpha = animation.ease({
      values: [ 240, 0 ],
      currentTime: switchIndex,
      duration: 1,
      easingFn: easing.easeInOutExpo,
    });

    fill( red, green, blue, fillAlpha )
    stroke( red, green, blue, 200 )
    box(w, h, -d)

    pop()
  } );

  orbitControl();
});

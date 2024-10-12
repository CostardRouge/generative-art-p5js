import { sketch, options, iterators, converters, debug, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup(() => {
  p5.disableFriendlyErrors = true;
  // pixelDensity(1)
}, {
  type: "webgl",
  // size: {
  //   // width: 1080,
  //   // height: 1920,
  //   // ratio: 9/16
  // },
  animation: {
    framerate: 60,
    duration: 10
  }
});

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

function getAlphaFromMask({ position: { x, y }, maskPoints, distance = 0.015}) {
  const normalizedPosition = createVector(
    map(x, -width/2, width/2, 0, 1),
    map(y, -height/2, height/2, 0, 1)
  );

  return maskPoints.reduce( ( result, pointPosition ) => {
    if (true === result) {
      return result;
    }

    const normalizedPointPosition = createVector(
      map(pointPosition.x, -width /2, width/2, 0, 1),
      map(pointPosition.y, -height /2, height/2, 0, 1)
    );

    const d = normalizedPointPosition.dist(normalizedPosition);

    return Math.max(
      result,
      d > 0 && d < distance
    );
  }, 0);
}

function createGridAlphaPoints(gridOptions, textPointsMatrix) {
  return cache.store( `alpha-points-matrix`, () => {
    const alphaPoints = [];

    const { cells } = grid.create( gridOptions );

    cells.forEach( ({ center, x, y } ) => {

      const alphaLayers = [];

      for ( const [ points ] of textPointsMatrix ) {
        const alpha = getAlphaFromMask({
          position: center,
          maskPoints: points
        })

        alphaLayers.push( alpha );
      }

      alphaPoints.push( {
        position: center,
        layers: alphaLayers
      } );
    })

    return alphaPoints;
  });
}

sketch.draw( (time, center, favoriteColor) => {
  background(0);

  const size = width;
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  const columns = 30;
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

  const text = "depthd".split("")

  const textPointsMatrix = text.map( text => (
    getTextPoints({
      text,
      position: createVector(0, 0),
      size,
      font: string.fonts.martian,
      sampleFactor,
      simplifyThreshold
    })
  ))

  const alphaPoints = createGridAlphaPoints(
    gridOptions,
    textPointsMatrix
  )

  alphaPoints.forEach( ( { layers, position }, index ) => {
    const i = animation.progression*text.length

    const switchIndex = i+(
      // +index/alphaPoints.length/50
      +position.x/columns/100
      +position.y/rows/30
    )

    const layer = mappers.circularIndex(
      switchIndex,
      layers
    )

    if (!layer) {
      return;
    }

    const hue = noise(
      position.x/columns/10 + (
        +map(sin(animation.sinAngle), -1, 1, 0, 1)
      ),
      position.y/rows/10 + (
        +map(cos(animation.cosAngle), -1, 1, 0, 1)
      )
    )

    const tint = colors.rainbow({
      hueOffset: animation.time,
      hueIndex: map(hue, 0, 1, -PI, PI)*2,
      opacityFactor: 1.5
    })

    const { levels: [ red, green, blue ] } = tint;

    push()

    const w = cellSize
    const h = cellSize
    const d = animation.ease({
      values: [ cellSize*5, -cellSize*20 ],
      currentTime:switchIndex,
      easingFn: easing.easeInOutExpo,
      // easingFn: easing.easeInOutSine,
    });

    translate( position.x, position.y, d/2 )

    const fillAlpha = animation.ease({
      values: [ 200, 0 ],
      currentTime: switchIndex,
      duration: 1,
      easingFn: easing.easeInOutExpo,
    });

    fill( red, green, blue, fillAlpha )
    stroke( red, green, blue, fillAlpha/2+50 )
    box(w, h, d)

    pop()
  } );

  orbitControl();
});

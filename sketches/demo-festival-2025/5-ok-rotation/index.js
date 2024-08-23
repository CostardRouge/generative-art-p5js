import { sketch, options, iterators, converters, debug, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup(() => frameRate(25), { type: "webgl", width: 1080, height: 1920} );

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

    grid.draw(gridOptions, position => {
      const alphaLayers = [];

      for ( const [ points ] of textPointsMatrix ) {
        const alpha = getAlphaFromMask({
          position,
          maskPoints: points
        })
    
        alphaLayers.push( alpha );
      }

      alphaPoints.push( {
        position,
        layers: alphaLayers
      } );
    });

    return alphaPoints;
  });
}

sketch.draw( (time, center) => {
  background(0);

  const size = (width);
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  const columns = 50;
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

  const textPointsMatrix = "demo2025".split("").map( text => (
    getTextPoints({
      text,
      position: createVector(0, 0),
      size: size,
      font: string.fonts.martian,
      sampleFactor,
      simplifyThreshold
    })
  ))

  const alphaPoints = createGridAlphaPoints(
    gridOptions,
    textPointsMatrix
  )

  const rotationMax = TAU
  const generalAnimationTime = time

  const {
    x: rX,
    y: rY,
    //z: rZ
  } = animation.ease({
    values: [
      createVector(), 
      createVector(0, rotationMax),
      createVector(rotationMax, rotationMax),
      createVector(rotationMax),
    ],
    currentTime: generalAnimationTime,
    duration: 1,
    lerpFn: p5.Vector.lerp,
    easingFn: easing.easeInOutExpo,
    // easingFn: easing.easeInOutElastic,
    // easingFn: easing.easeInOutCirc,
  })

  rotateX(rX)
  rotateY(rY)

  // const finalPoints = alphaPoints

  alphaPoints.forEach( ( { layers, position }, index ) => {
    const layer = mappers.circularIndex(
      generalAnimationTime+1/2,
      layers
    )

    if (!layer) {
      return;
    }

    const switchIndex = generalAnimationTime*2+(
      +index/alphaPoints.length/5
      +position.x/columns/100
      +position.y/rows/100
    )

    const hue = noise(
      position.x/columns + (
        +map(sin(time), -1, 1, 0, 1)
      ),
      position.y/rows + (
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
    const d = cellSize*20

    translate( position )

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

import { sketch, options, iterators, converters, debug, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

// sketch.setup(() => {
//   p5.disableFriendlyErrors = true;
//   frameRate(25)
//   pixelDensity(1)
// }, { type: "webgl", width: 1080, height: 1920} );

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
    duration: 4
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

  const size = width;
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

  let text = "nft".split("")

  // text = "be here NOW".split(" ")

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

  const rotationMax = TAU

  // const {
  //   x: rX,
  //   y: rY,
  //   //z: rZ
  // } = animation.ease({
  //   values: [
  //     createVector(), 
  //     createVector(0, rotationMax),
  //     // createVector(rotationMax, rotationMax),
  //     // createVector(rotationMax),
  //   ],
  //   currentTime: animation.progression*t.length,
  //   lerpFn: p5.Vector.lerp,
  //   easingFn: easing.easeInOutExpo,
  //   // easingFn: easing.easeInOutElastic,
  //   // easingFn: easing.easeInOutCirc,
  // })

  // rotateX(rX)
  // rotateY(rY)

  alphaPoints.forEach( ( { layers, position }, index ) => {
    const i = animation.progression*text.length
    const layer = mappers.circularIndex(
      i+1/2,
      layers
    )

    if (!layer) {
      return;
    }

    const hue = noise(
      position.x/columns/5 + (
        +map(sin(animation.sinAngle*2), -1, 1, 0, 1)
      ),
      position.y/rows/5 + (
        +map(cos(animation.cosAngle*2), -1, 1, 0, 1)
      )
    )

    const tint = colors.rainbow({
      hueOffset: animation.time,
      hueIndex: map(hue, 0, 1, -PI, PI)*4,
      opacityFactor: 1.5
    })

    const { levels: [ red, green, blue ] } = tint;

    push()

    const edge = animation.ease({
      values: [ 0, 5 ],
      currentTime: i*2+(
        +index/alphaPoints.length/50
        +position.x/columns/100
        +position.y/rows/100
      ),
      duration: 1,
      easingFn: easing.easeInOutExpo,
    });

    const w = cellSize-edge
    const h = cellSize-edge
    const d = cellSize*20

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
      currentTime: i+(
        // +index/alphaPoints.length/10
        +position.x/columns/200
        +position.y/rows/200
      ),
      lerpFn: p5.Vector.lerp,
      easingFn: easing.easeInOutExpo,
      // easingFn: easing.easeInOutElastic,
      // easingFn: easing.easeInOutCirc,
    })
  
    rotateX(rX)
    rotateY(rY)

    translate( position )

    const fillAlpha = animation.ease({
      values: [ 200, 0 ],
      currentTime: i*2+(
        +index/alphaPoints.length/50
        +position.x/columns/100
        +position.y/rows/100
      ),
      duration: 1,
      easingFn: easing.easeInOutExpo,
    });

    fill( red, green, blue, fillAlpha )
    stroke( red, green, blue, fillAlpha/2+100 )
    box(w, h, -d)

    pop()
  } );

  orbitControl();
});

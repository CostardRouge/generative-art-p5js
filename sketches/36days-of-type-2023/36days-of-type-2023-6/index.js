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

function createGridAlphaPoints(gridOptions, maskPoints) {
  return cache.store( `alpha-points`, () => {
    const alphaPoints = [];

    grid.draw(gridOptions, position => {
      const alpha = getAlphaFromMask({
        position,
        maskPoints,
        maskId: ""
      })
      if (alpha) {
        alphaPoints.push( {
          alpha,
          position,
        } );
      }
    });

    return alphaPoints;
  });
}

function dice(size = width, render) {
  const rotations = [
    createVector(), // face
    createVector(0, HALF_PI), // right
    createVector(HALF_PI), // up
    createVector(0, -HALF_PI), // left
    createVector(0, PI), // back
    createVector(-HALF_PI), // bot
  ];

  for (let i = 0; i < rotations.length; i++) {
    const {
      x: rX,
      y: rY,
      //z: rZ
    } = rotations[ i ]

    push();
    rotateX(rX)
    rotateY(rY)
    //rotateZ(rZ)
    translate(0, 0, size/2);

    render( i, size );

    pop();
  }
}

function six(time, columns = 50, diceIndex, rotationIndex) {
  const size = (width);
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  // columns = 100*3;
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
    text: "6",
    position: createVector(0, 0),
    size,
    font: string.fonts.martian,
    // font: string.fonts.tilt,
    // font: string.fonts.multicoloure,
    // font: string.fonts.openSans,
    // font: string.fonts.sans,
    // font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const alphaPoints = createGridAlphaPoints(
    gridOptions,
    firstLetterPoints,
  )
  alphaPoints.forEach( ( { alpha: alphaData, position }, index ) => {
    if (!alphaData) {
      return;
    }

    const hue = noise(
      position.x/columns + (
        0
        +map(sin(time), -1, 1, 0, 1)*3
      ),
      position.y/rows+(
        0
        +map(cos(time), -1, 1, 0, 1)*3
      )
    )

    const tint = colors.rainbow({
      hueOffset: diceIndex,
      hueIndex: map(hue, 0, 1, -PI, PI),
      // opacityFactor: map(abs(diceIndex-rotationIndex), 0, 1, 1.5, 150, true),
      opacityFactor: map(diceIndex-rotationIndex, 0, 1, 1.5, 150, true)
      // opacityFactor: 1.5
    })

    const { levels: [ red, green, blue ] } = tint;

    push()

    const w = cellSize//-2
    const h = cellSize//-2
    const d = cellSize*4

    translate(
      position.x,
      position.y,
      // -d + (
      //   0
      //   //-300
      // )
    )

    // specularColor(red, green, blue)
    // specularMaterial(tint)
    // shininess(60);

    fill( red, green, blue, 230)
    stroke( red, green, blue, 0 )
    box(w, h, -d)

    pop()
  } );
}

sketch.draw( (time, center) => {
  background(0);

  // stroke(255)
  // noFill()

  translate(0, 0, -width/2)

  // ambientLight(192);

  // const lightPosX = mouseX - width / 2;
  // const lightPosY = mouseY - height / 2;

  // pointLight(250, 250, 250, lightPosX, lightPosY, width/2);

  const {
    x: rX,
    y: rY,
    //z: rZ
  } = animation.ease({
    values: [
      createVector(), // face
      createVector(0, -HALF_PI), // right
      createVector(-HALF_PI), // up
      createVector(0, HALF_PI), // left
      createVector(0, PI), // back
      createVector(HALF_PI), // bot
    ],
    currentTime: time,
    duration: 1,
    lerpFn: p5.Vector.lerp,
    easingFn: easing.easeInOutExpo,
    easingFn: easing.easeInOutElastic,
    easingFn: easing.easeInOutCirc,
  })

  rotateX(rX)
  rotateY(rY)

  const rIndex = animation.ease({
    values: [
      0,
      1,
      2,
      3,
      4,
      5,
    ],
    currentTime: time,
    duration: 1,
    easingFn: easing.easeInOutCirc,
  });

  dice( width, ( index, size ) => {
    // point(0, 0)
    // rect(-size/2, -size/2, size, size)
    
    six(time, 100/2, index, rIndex)
  } )

  orbitControl();
});

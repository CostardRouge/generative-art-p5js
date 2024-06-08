import { grid, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

function drawGrid(xCount, yCount, color, weight = 2, offset = 0, skipX, skipY) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  stroke(color)
  strokeWeight(weight)

  const xx = xSize;
  const yy = ySize;

  for (let x = 0; x < xCount-1; x++) {
    if (!skipX.includes(x)) {
      line((xx + x * xSize), 0, (xx + x * xSize), height);
    }
  }

  for (let y = 0; y < yCount-1; y++) {
    if (!skipY.includes(y)) {
      line(0, (yy + y * ySize), width, (y * ySize + yy));
    }
  }
}

sketch.setup( undefined, { type: "webgl" } );

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

      // return Math.max(
      //   result,
      //   ~~map(normalizedPointPosition.dist(normalizedPosition), 0, distance, maxAlpha, minAlpha, true)
      // );

      const d = normalizedPointPosition.dist(normalizedPosition);

      return Math.max(
        result,
        d > 0 && d < distance
      );
    }, 0);
  });

  return alpha;
}

function createGridAlphaPoints(gridOptions, maskPoints, cacheKey) {
  return cache.store( `alpha-points-${cacheKey}`, () => {
    const alphaPoints = [];

    grid.draw(gridOptions, position => {
      const alpha = getAlphaFromMask({
        position,
        maskPoints,
        maskId: cacheKey
      })
  
      if ( alpha ) {
        alphaPoints.push( position ) 
      }
    });

    return alphaPoints;
  });
}

function style4(text, letterSize, gridOptions, time) {
  const columns = gridOptions.columns;
  const rows = gridOptions.rows;
  const cellSize = letterSize/columns-2;

  const firstLetterPoints = string.getTextPoints({
    text,
    position: createVector(0, 0),
    size: letterSize,
    font: string.fonts.serif,
    sampleFactor: .1,
    simplifyThreshold: 0
  })

  const depth = 100;
  const alphaPoints = createGridAlphaPoints( gridOptions, firstLetterPoints, text )

  for ( const position of alphaPoints ) {
    const hue = noise(
      position.x/columns/10 + (
        0
        //+map(sin(time/2), -1, 1, 0, 1)*2
      ),
      position.y/rows/10+(
        0
        //+map(cos(time/2), -1, 1, 0, 1)*2
      ),
    )
    const tint = colors.rainbow({
      hueIndex: map(hue, 0, 1, -PI, PI)*3,
      hueIndex: map(
        (
          noise(position.x/columns/10, position.y/rows/10, time/2)*5
        ), 0, 1, -PI, PI),
      opacityFactor: 1.5,
    })

    const { levels: [ red, green, blue, alpha ] } = tint;

    fill( red, green, blue, 225)
    stroke( red, green, blue, 100 )

    push()

    const values = [
      0,
      PI,
      PI*2,
      PI*2
    ]

    rotateY(
      animation.ease({
        values,
        currentTime: (
          time/2
          +position.x/columns/20
          +position.y/rows/50
        ),
        duration: 1,
        easingFn: easing.easeInOutExpo
      })
    )

    rotateX(
      animation.ease({
        values,
        currentTime: (
          time/2
          +position.x/columns/50
          +position.y/rows/20
        ),
        duration: 1,
        easingFn: easing.easeInOutExpo
      })
    )

    translate(
      position.x,
      position.y,
      -depth
    )

    box(cellSize, cellSize, depth)

    pop()
  }
}

function style5(text, letterSize, gridOptions, time) {
  const columns = gridOptions.columns;
  const rows = gridOptions.rows;
  const cellSize = letterSize/columns-2;

  const firstLetterPoints = string.getTextPoints({
    text,
    position: createVector(0, 0),
    size: letterSize,
    font: string.fonts.martian,
    sampleFactor: .1,
    simplifyThreshold: 0
  })

  const depth = 100
  const alphaPoints = createGridAlphaPoints( gridOptions, firstLetterPoints, text )

  for ( const position of alphaPoints) {

    const hue = noise(
      position.x/columns + (
        0
        +map(sin(time/2), -1, 1, 0, 1)*3
      ),
      position.y/rows+(
        0
        +map(cos(time/2), -1, 1, 0, 1)*3
      )
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

    const d = depth

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
          +position.x/columns/20
          // +position.y/rows/50
        ),
        duration: 1,
        easingFn: easing.easeInOutExpo,
        easingFn
      })
    )

    box(cellSize, cellSize, -d)

    pop()
  }
}

function style7( text, letterSize, gridOptions, time ) {
  const columns = gridOptions.columns;
  const rows = gridOptions.rows;
  const cellSize = letterSize/columns;

  const fonts = [
    // string.fonts.martian,
    // string.fonts.tilt,
    // string.fonts.multicoloure,
    // string.fonts.openSans,
    // string.fonts.sans,
    string.fonts.serif
  ]

  const textPointsMatrix = fonts.map( font => (
    string.getTextPoints({
      text,
      position: createVector(0, 0),
      size: letterSize,
      font,
      sampleFactor: .1,
      simplifyThreshold: 0
    })
  ))

  const alphaPoints = cache.store( `alpha-points-7`, () => {
    const alphaPoints = [];

    grid.draw(gridOptions, position => {
      const alphaLayers = [];

      for ( const points of textPointsMatrix ) {
        const alpha = getAlphaFromMask({
          position,
          maskPoints: points,
          maskId: "alpha-points-7"
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
      +position.x/columns/50
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
      position.x/columns/3 + (
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
        1//50 * sin(time*2+movingPosition.x/columns+index/alphaPoints.length)
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
}

function style8(text, letterSize, gridOptions, time ) {
  const columns = gridOptions.columns;
  const rows = gridOptions.rows;
  const cellSize = letterSize/columns-2;

  const fonts = [
    string.fonts.martian,
    string.fonts.multicoloure,
    string.fonts.openSans,
    string.fonts.sans,
    string.fonts.serif
  ]

  const textPointsMatrix = fonts.map( font => (
    string.getTextPoints({
      text,
      position: createVector(0, 0),
      size: letterSize,
      font,
      sampleFactor: .1,
      simplifyThreshold: 0
    })
  ))

  const alphaPoints = cache.store( `alpha-points-matrix-style-8`, () => {
    const alphaPoints = [];

    grid.draw(gridOptions, position => {
      const alphaLayers = [];

      for ( const points of textPointsMatrix ) {
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

  const rotationMax = PI*2
  const generalAnimationTime = time/2

  const {
    x: rX,
    y: rY,
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
    // easingFn: easing.easeInOutSine
  })

  rotateX(rX)
  rotateY(rY)

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
    translate( position )

    const fillAlpha = animation.ease({
      values: [ 240, 0 ],
      currentTime: switchIndex,
      duration: 1,
      easingFn: easing.easeInOutExpo,
    });

    fill( red, green, blue, fillAlpha )
    stroke( red, green, blue, 200 )
    box(cellSize, cellSize, -100)

    pop()
  } );
}

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);
  const W = width/2;
  const H = height/2;

  push()
  translate(-W, -H)
  const columns = 2;
  const rows = 2;
  // drawGrid(columns, rows, favoriteColor, 0.5, 0, [], [])
  pop()

  const gridOptions = {
    topLeft: createVector( -width/2, -height/2 ),
    topRight: createVector( width/2, -height/2 ),
    bottomLeft: createVector( -width/2, height/2 ),
    bottomRight: createVector( width/2, height/2),
    rows: 60,
    columns: 60
  }

  const cells = [
    {
      position: createVector(-width/4, -height/4),
      letterSize: W/1.2,
      fn: style8,
      text: "2"
    },
    {
      position: createVector(width/3.5, -height/3.5),
      letterSize: W,
      fn: style4,
      text: "0"
    },
    {
      position: createVector(-width/3.5, height/3.5),
      letterSize: W,
      fn: style5,
      text: "2"
    },
    {
      position: createVector(width/4, height/4),
      letterSize: W/1.1,
      fn: style7,
      text: "4"
    }
  ]

  cells.forEach( ( {position: { x, y}, letterSize, text, fn}, index ) => {
    push()
    translate(x, y)
    fn(text, letterSize, gridOptions, time);
    pop()
  })

  orbitControl()
});



